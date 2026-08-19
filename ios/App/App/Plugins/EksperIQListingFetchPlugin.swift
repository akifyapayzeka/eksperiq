import Foundation
import WebKit
import Capacitor

// EksperIQListingFetchPlugin — loads an ilan URL in an off-screen WKWebView
// on the user's own device (the same network/IP a person browsing in
// Safari would use) and extracts page text/JSON-LD/images via JS. This
// deliberately avoids server-side fetching: sahibinden.com and arabam.com
// both reset the TCP connection outright for automated requests coming
// from datacenter IP ranges (verified directly before building this), so a
// server-side headless browser would not reliably work even before any
// Terms-of-Service question. Running the fetch from the device sidesteps
// that — it is indistinguishable from the user opening the link themselves.
//
// No stealth/anti-detection, no CAPTCHA solving, no login, no proxy — just
// a standard mobile Safari user agent, same as any other browser tab.
//
// jsName must exactly match the string passed to registerPlugin() in
// src/lib/listing-import/native-plugin.ts ("EksperIQListingFetch").
@objc(EksperIQListingFetchPlugin)
public class EksperIQListingFetchPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "EksperIQListingFetchPlugin"
    public let jsName = "EksperIQListingFetch"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "fetchListingPage", returnType: CAPPluginReturnPromise)
    ]

    @objc func fetchListingPage(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString),
              let scheme = url.scheme?.lowercased(), scheme == "https" || scheme == "http" else {
            call.reject("Geçerli bir bağlantı gönderin.")
            return
        }

        Task {
            do {
                let result = try await ListingPageFetcher.fetch(url: url)
                call.resolve(result)
            } catch {
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }
}

/// Loads a URL in an off-screen WKWebView (never added to any window/view
/// hierarchy — this is a background data fetch, not a shown browser tab)
/// and extracts page text, JSON-LD, and image URLs via a single JS
/// evaluation once the page has settled.
@MainActor
private final class ListingPageFetcher: NSObject, WKNavigationDelegate {
    private static let mobileSafariUserAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 " +
        "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
    private static let hardTimeoutSeconds: TimeInterval = 35
    private static let settleDelaySeconds: TimeInterval = 2.0

    private var continuation: CheckedContinuation<JSObject, Error>?
    private var webView: WKWebView?
    private var didResume = false
    private var timeoutWorkItem: DispatchWorkItem?

    static func fetch(url: URL) async throws -> JSObject {
        try await ListingPageFetcher().run(url: url)
    }

    private func run(url: URL) async throws -> JSObject {
        try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation

            let webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
            webView.customUserAgent = Self.mobileSafariUserAgent
            webView.navigationDelegate = self
            self.webView = webView

            let timeout = DispatchWorkItem { [weak self] in
                self?.finish(.failure(Self.makeError("İlan sayfası zaman aşımına uğradı.")))
            }
            self.timeoutWorkItem = timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + Self.hardTimeoutSeconds, execute: timeout)

            webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30))
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Listing pages keep populating content client-side after the base
        // document finishes loading — give it a moment before reading the
        // DOM, the same way a person would glance at the page for a beat.
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.settleDelaySeconds) { [weak self] in
            self?.extract()
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        finish(.failure(error))
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        finish(.failure(error))
    }

    private func extract() {
        webView?.evaluateJavaScript(Self.extractionScript) { [weak self] value, error in
            guard let self else { return }
            if let error {
                self.finish(.failure(error))
                return
            }
            guard let jsonString = value as? String else {
                self.finish(.failure(Self.makeError("İlan sayfası okunamadı.")))
                return
            }
            self.finish(.success(["pageDataJson": jsonString]))
        }
    }

    private func finish(_ outcome: Result<JSObject, Error>) {
        guard !didResume else { return }
        didResume = true
        timeoutWorkItem?.cancel()
        webView?.navigationDelegate = nil
        webView?.stopLoading()
        webView = nil

        switch outcome {
        case .success(let value):
            continuation?.resume(returning: value)
        case .failure(let error):
            continuation?.resume(throwing: error)
        }
        continuation = nil
    }

    private static func makeError(_ message: String) -> NSError {
        NSError(domain: "EksperIQListingFetch", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
    }

    private static let extractionScript = """
    (function() {
      function attr(selector, name) {
        var el = document.querySelector(selector);
        return el ? (el.getAttribute(name) || '') : '';
      }
      var jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(function(s) { return s.textContent || ''; })
        .filter(Boolean)
        .slice(0, 5);
      var images = Array.from(document.images || [])
        .map(function(img) { return img.currentSrc || img.src || ''; })
        .filter(function(src) { return src.indexOf('http') === 0; });
      var uniqueImages = Array.from(new Set(images)).slice(0, 30);
      return JSON.stringify({
        title: document.title || '',
        ogTitle: attr('meta[property="og:title"]', 'content'),
        ogDescription: attr('meta[property="og:description"]', 'content'),
        bodyText: (document.body ? document.body.innerText : '').slice(0, 20000),
        jsonLd: jsonLd,
        images: uniqueImages,
        finalUrl: window.location.href
      });
    })();
    """
}

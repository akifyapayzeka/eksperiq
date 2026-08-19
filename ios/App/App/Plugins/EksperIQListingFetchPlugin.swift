import Foundation
import UIKit
import WebKit
import UserNotifications
import Capacitor

// EksperIQListingFetchPlugin — loads an ilan URL in an off-screen WKWebView
// on the user's own device (the same network/IP a person browsing in
// Safari would use), extracts page text/JSON-LD/images via JS, then posts
// that text to our own /api/ai/listing-import endpoint to normalize it into
// vehicle form fields — all from native code. This deliberately avoids
// server-side fetching: sahibinden.com and arabam.com both reset the TCP
// connection outright for automated requests coming from datacenter IP
// ranges (verified directly before building this), so a server-side
// headless browser would not reliably work even before any Terms-of-Service
// question. Running the fetch from the device sidesteps that — it is
// indistinguishable from the user opening the link themselves.
//
// No stealth/anti-detection, no CAPTCHA solving, no login, no proxy — just
// a standard mobile Safari user agent, same as any other browser tab.
//
// Doing the AI-normalize network call natively too (not as a follow-up JS
// fetch() from the main WebView) matters for backgrounding: the whole
// operation runs as one continuous Swift async task wrapped in a
// beginBackgroundTask, so briefly backgrounding the app (locking the
// screen, switching apps) doesn't cut it off mid-flight the way a JS-side
// fetch in a backgrounded WKWebView could. This is NOT unlimited background
// execution — iOS still only grants roughly 30 seconds of extra run time,
// and a fully force-quit app cannot run anything at all (no app can, this
// is an OS-level restriction). A local notification fires when the whole
// thing finishes while the app isn't in the foreground.
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
        let source = call.getString("source") ?? ""
        let installId = call.getString("installId")

        Task {
            let backgroundTask = await BackgroundTaskGuard.begin(name: "EksperIQListingFetch")
            defer { Task { await backgroundTask.end() } }

            do {
                self.notifyListeners("progress", data: ["stage": "opening-page"])
                let pageData = try await ListingPageFetcher.fetch(url: url)
                self.notifyListeners("progress", data: ["stage": "normalizing"])
                let importOutcome = await ListingImportRequester.normalize(
                    pageData: pageData,
                    source: source,
                    installId: installId
                )
                self.notifyListeners("progress", data: ["stage": "done"])
                await NotificationHelper.notifyIfBackgrounded(
                    title: "EksperIQ",
                    body: importOutcome.succeeded
                        ? "İlan analizi tamamlandı. Sonuçları görmek için uygulamaya dönün."
                        : "İlan analizi tamamlanamadı. Uygulamaya dönüp tekrar deneyebilirsiniz."
                )
                call.resolve([
                    "pageDataJson": pageData.rawJson,
                    "importHttpStatus": importOutcome.httpStatus,
                    "importResponseJson": importOutcome.responseJson,
                ])
            } catch {
                await NotificationHelper.notifyIfBackgrounded(
                    title: "EksperIQ",
                    body: "İlan analizi tamamlanamadı. Uygulamaya dönüp tekrar deneyebilirsiniz."
                )
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }
}

/// Requests roughly 30 extra seconds of run time from iOS so an in-flight
/// fetch+analyze isn't killed the instant the app is backgrounded. This is
/// the standard, no-special-entitlement mechanism every iOS app can use for
/// "finish what you were doing" — it is not a way to run indefinitely in
/// the background, and it does nothing at all once the app is force-quit.
private actor BackgroundTaskGuard {
    private var id: UIBackgroundTaskIdentifier = .invalid

    static func begin(name: String) async -> BackgroundTaskGuard {
        let guardian = BackgroundTaskGuard()
        await guardian.start(name: name)
        return guardian
    }

    private func start(name: String) {
        id = UIApplication.shared.beginBackgroundTask(withName: name) { [weak self] in
            Task { await self?.end() }
        }
    }

    func end() {
        guard id != .invalid else { return }
        UIApplication.shared.endBackgroundTask(id)
        id = .invalid
    }
}

/// Fires a local notification when the app isn't in the foreground —
/// there's no point notifying someone who's already looking at the screen
/// mid-progress. Permission is requested lazily on first use rather than at
/// launch, so only people who actually use this feature see the prompt.
private enum NotificationHelper {
    @MainActor
    static func notifyIfBackgrounded(title: String, body: String) async {
        guard UIApplication.shared.applicationState != .active else { return }

        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        if settings.authorizationStatus == .notDetermined {
            _ = try? await center.requestAuthorization(options: [.alert, .sound])
        }

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        try? await center.add(request)
    }
}

/// POSTs the extracted page text to our own /api/ai/listing-import endpoint
/// (same request shape the client used to send via fetch()) and hands back
/// the raw HTTP status and response body for the JS layer to interpret with
/// its existing error-reason mapping.
private enum ListingImportRequester {
    struct Outcome {
        let succeeded: Bool
        let httpStatus: Int
        let responseJson: String
    }

    private static let endpoint = URL(string: "https://eksperiq.vercel.app/api/ai/listing-import")!
    private static let minBodyTextLength = 80

    static func normalize(pageData: ExtractedPageData, source: String, installId: String?) async -> Outcome {
        guard pageData.bodyText.trimmingCharacters(in: .whitespacesAndNewlines).count >= minBodyTextLength else {
            return Outcome(succeeded: false, httpStatus: 0, responseJson: "")
        }

        var request = URLRequest(url: endpoint, timeoutInterval: 20)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let installId, !installId.isEmpty {
            request.setValue(installId, forHTTPHeaderField: "X-EksperIQ-Install-Id")
        }

        let body: [String: Any] = [
            "aiProviderConsent": true,
            "source": source,
            "url": pageData.finalUrl,
            "title": pageData.title,
            "ogTitle": pageData.ogTitle,
            "ogDescription": pageData.ogDescription,
            "bodyText": pageData.bodyText,
            "jsonLd": pageData.jsonLd,
        ]
        guard let httpBody = try? JSONSerialization.data(withJSONObject: body) else {
            return Outcome(succeeded: false, httpStatus: 0, responseJson: "")
        }
        request.httpBody = httpBody

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            let text = String(data: data, encoding: .utf8) ?? ""
            return Outcome(succeeded: status == 200, httpStatus: status, responseJson: text)
        } catch {
            return Outcome(succeeded: false, httpStatus: 0, responseJson: "")
        }
    }
}

private struct ExtractedPageData {
    let title: String
    let ogTitle: String
    let ogDescription: String
    let bodyText: String
    let jsonLd: [String]
    let finalUrl: String
    /// The same fields re-serialized as JSON text, handed back to JS as-is
    /// (it already knows how to parse this shape).
    let rawJson: String
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

    private var continuation: CheckedContinuation<ExtractedPageData, Error>?
    private var webView: WKWebView?
    private var didResume = false
    private var timeoutWorkItem: DispatchWorkItem?

    static func fetch(url: URL) async throws -> ExtractedPageData {
        try await ListingPageFetcher().run(url: url)
    }

    private func run(url: URL) async throws -> ExtractedPageData {
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
            guard let jsonString = value as? String,
                  let jsonData = jsonString.data(using: .utf8),
                  let object = (try? JSONSerialization.jsonObject(with: jsonData)) as? [String: Any] else {
                self.finish(.failure(Self.makeError("İlan sayfası okunamadı.")))
                return
            }
            let pageData = ExtractedPageData(
                title: object["title"] as? String ?? "",
                ogTitle: object["ogTitle"] as? String ?? "",
                ogDescription: object["ogDescription"] as? String ?? "",
                bodyText: object["bodyText"] as? String ?? "",
                jsonLd: object["jsonLd"] as? [String] ?? [],
                finalUrl: object["finalUrl"] as? String ?? "",
                rawJson: jsonString
            )
            self.finish(.success(pageData))
        }
    }

    private func finish(_ outcome: Result<ExtractedPageData, Error>) {
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

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
            DiagnosticTrace.send("swift-task-started")
            let backgroundTask = await BackgroundTaskGuard.begin(name: "EksperIQListingFetch")
            defer { Task { await backgroundTask.end() } }

            do {
                self.notifyListeners("progress", data: ["stage": "opening-page"])
                DiagnosticTrace.send("swift-opening-page")
                let pageData = try await ListingPageFetcher.fetch(url: url)
                DiagnosticTrace.send("swift-page-fetched")
                self.notifyListeners("progress", data: ["stage": "normalizing"])
                DiagnosticTrace.send("swift-normalizing")
                let importOutcome = await ListingImportRequester.normalize(
                    pageData: pageData,
                    source: source,
                    installId: installId
                )
                self.notifyListeners("progress", data: ["stage": "done"])
                DiagnosticTrace.send("swift-done")
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
                DiagnosticTrace.send("swift-error", detail: error.localizedDescription)
                await NotificationHelper.notifyIfBackgrounded(
                    title: "EksperIQ",
                    body: "İlan analizi tamamlanamadı. Uygulamaya dönüp tekrar deneyebilirsiniz."
                )
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }
}

/// TEMPORARY: mirrors the JS-side trace() in src/lib/listing-import/import-listing.ts —
/// see that file's comment for why this exists. Fire-and-forget, best-effort,
/// never affects the real call. Delete alongside the JS side and the
/// api/debug/listing-import-trace.js endpoint once the hang is root-caused.
private enum DiagnosticTrace {
    private static let endpoint = URL(string: "https://eksperiq.vercel.app/api/debug/listing-import-trace")!

    static func send(_ step: String, detail: String? = nil) {
        var request = URLRequest(url: endpoint, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        var body: [String: Any] = ["step": step]
        if let detail { body["detail"] = String(detail.prefix(300)) }
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        let task = URLSession.shared.dataTask(with: request)
        task.resume()
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

        // Was 20s, then 55s — each time raised to chase the server's own
        // ceiling (vercel.json's api/ai/*.js maxDuration), but a client
        // timeout BELOW the server's meant a slow-but-successful response
        // got cut off mid-stream instead of ever reaching the server limit —
        // confirmed live: server maxDuration went 60->90, this stayed at 55,
        // and the very next slow response was truncated client-side ("raw="
        // empty, JS parse error) even though the server had logged a clean
        // 200. Must always stay ABOVE the server's maxDuration, not under it.
        var request = URLRequest(url: endpoint, timeoutInterval: 100)
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
    // Built from the device's real OS version rather than a hardcoded one —
    // a fixed old version string (e.g. claiming iOS 17.5 on a device that's
    // actually running a much newer OS) is itself an inconsistency that
    // fingerprinting can flag, since it doesn't match the JS engine's real
    // capabilities. Reflecting the true version is more authentic, not less.
    private static var mobileSafariUserAgent: String {
        let version = UIDevice.current.systemVersion
        let underscored = version.replacingOccurrences(of: ".", with: "_")
        return "Mozilla/5.0 (iPhone; CPU iPhone OS \(underscored) like Mac OS X) AppleWebKit/605.1.15 " +
            "(KHTML, like Gecko) Version/\(version) Mobile/15E148 Safari/604.1"
    }
    private static let hardTimeoutSeconds: TimeInterval = 35
    private static let settleDelaySeconds: TimeInterval = 2.0

    private var continuation: CheckedContinuation<ExtractedPageData, Error>?
    private var webView: WKWebView?
    private var didResume = false
    private var timeoutWorkItem: DispatchWorkItem?
    private var navigationGeneration = 0

    static func fetch(url: URL) async throws -> ExtractedPageData {
        try await ListingPageFetcher().run(url: url)
    }

    private func run(url: URL) async throws -> ExtractedPageData {
        try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation

            // A WKWebView that's sized .zero and never added to any window
            // reports anomalous values to its own JS — 0x0 viewport,
            // document.visibilityState never "visible", document.hasFocus()
            // always false, no real layout/composite pass ever runs. None
            // of that is true of the real Safari tab this is meant to
            // behave like, and it's exactly the kind of signal bot-scoring
            // systems (e.g. Cloudflare) check for. Give it the device's
            // actual screen size and attach it to the key window — shifted
            // off to the side, so nothing is ever visibly shown — instead
            // of skipping that step for our own implementation convenience.
            let screenBounds = UIScreen.main.bounds
            let webView = WKWebView(frame: screenBounds, configuration: WKWebViewConfiguration())
            webView.customUserAgent = Self.mobileSafariUserAgent
            webView.navigationDelegate = self
            self.webView = webView

            if let window = UIApplication.shared.connectedScenes
                .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
                .first {
                webView.frame = webView.frame.offsetBy(dx: screenBounds.width + 200, dy: 0)
                window.addSubview(webView)
            }

            let timeout = DispatchWorkItem { [weak self] in
                self?.finish(.failure(Self.makeError("İlan sayfası zaman aşımına uğradı.")))
            }
            self.timeoutWorkItem = timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + Self.hardTimeoutSeconds, execute: timeout)

            webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30))
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // A short-link (e.g. shbd.io) can bounce through an interstitial
        // page — a client-side JS redirect (not an HTTP 30x, which
        // WKWebView would already resolve transparently before this ever
        // fires) or a bot/security-check screen — before landing on the
        // real listing. Each such hop fires its own didFinish. Extracting
        // unconditionally on the *first* one was a race: it could read the
        // interstitial's content ("güvenlik doğrulama sayfası") instead of
        // ever reaching the listing. Debounce on navigation generation
        // instead — if another didFinish arrives before this one's settle
        // delay elapses, this stale extraction is skipped and only the
        // latest navigation ever gets read.
        navigationGeneration += 1
        let thisGeneration = navigationGeneration
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.settleDelaySeconds) { [weak self] in
            guard let self, self.navigationGeneration == thisGeneration else { return }
            self.extract()
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
        webView?.removeFromSuperview()
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

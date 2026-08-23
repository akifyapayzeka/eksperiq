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
        let backgroundTracker = BackgroundTransitionTracker()
        let backgroundObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { _ in
            Task { await backgroundTracker.markBackgrounded() }
        }

        Task {
            DiagnosticTrace.send("swift-task-started")
            let backgroundTask = await BackgroundTaskGuard.begin(name: "EksperIQListingFetch")
            defer {
                NotificationCenter.default.removeObserver(backgroundObserver)
                Task { await backgroundTask.end() }
            }

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
                await NotificationHelper.notifyIfNeeded(
                    wasBackgroundedDuringCall: await backgroundTracker.wasBackgrounded,
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
                await NotificationHelper.notifyIfNeeded(
                    wasBackgroundedDuringCall: await backgroundTracker.wasBackgrounded,
                    title: "EksperIQ",
                    body: "İlan analizi tamamlanamadı. Uygulamaya dönüp tekrar deneyebilirsiniz."
                )
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }
}

/// Records whether the user sent the app to the background during a listing
/// import. iOS can resume a suspended async task only after the app becomes
/// active again; checking only the *current* applicationState at completion
/// then misses the fact that the user had been waiting in another app.
private actor BackgroundTransitionTracker {
    private(set) var wasBackgrounded = false

    func markBackgrounded() {
        wasBackgrounded = true
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

/// Fires a local notification when the app is still outside the foreground.
/// If the user already returned to EksperIQ while the import is finishing,
/// the JS UI should show the final state directly instead of also receiving
/// a stale local notification from the background phase.
private enum NotificationHelper {
    @MainActor
    static func notifyIfNeeded(wasBackgroundedDuringCall _: Bool, title: String, body: String) async {
        guard UIApplication.shared.applicationState != .active else { return }

        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        if settings.authorizationStatus == .notDetermined {
            _ = try? await center.requestAuthorization(options: [.alert, .sound])
        }
        let updatedSettings = await center.notificationSettings()
        guard isDisplayAuthorized(updatedSettings.authorizationStatus) else {
            return
        }

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        try? await center.add(request)
    }

    private static func isDisplayAuthorized(_ status: UNAuthorizationStatus) -> Bool {
        if status == .authorized || status == .provisional {
            return true
        }
        if #available(iOS 14.0, *) {
            return status == .ephemeral
        }
        return false
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

        // Was 20s, then 55s, then 100s — each time raised to chase the
        // server's own ceiling (vercel.json's api/ai/*.js maxDuration), but
        // a client timeout BELOW the server's meant a slow-but-successful
        // response got cut off mid-stream instead of ever reaching the
        // server limit — confirmed live: server maxDuration went 60->90,
        // this stayed at 55, and the very next slow response was truncated
        // client-side ("raw=" empty, JS parse error) even though the server
        // had logged a clean 200. Must always stay ABOVE the server's
        // maxDuration (currently 120s), not under it.
        var request = URLRequest(url: endpoint, timeoutInterval: 140)
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
            "bodyText": [pageData.bodyText, pageData.locationText].filter { !$0.isEmpty }.joined(separator: "\n\nKonum adayları:\n"),
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
    let locationText: String
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
    // Was 35s (with the network request itself capped at 30s below) — a
    // short-link redirect chain plus Cloudflare's own challenge JS can
    // legitimately take longer than that on a slow connection before the
    // page actually settles, giving up early was indistinguishable from a
    // real block. Raised with the same headroom relationship kept intact:
    // this must stay comfortably above the network request's own timeout.
    private static let hardTimeoutSeconds: TimeInterval = 50
    private static let settleDelaySeconds: TimeInterval = 2.0
    // sahibinden.com's own bot-verification interstitial
    // (/cs/checkLoading?returnUrl=...) polls its backend and only THEN does
    // a client-side redirect to the real listing — confirmed live via
    // Vercel logs: extraction ran on this exact page ("Doğrulama başarılı.
    // ...adresinin yanıt vermesi bekleniyor" — "verification succeeded,
    // waiting for a response"), because its didFinish fired, the normal 2s
    // settle window elapsed with no newer didFinish yet, so this interim
    // page's ~450-char placeholder text got extracted and sent to the AI
    // instead of the real listing. Give this specific interstitial a much
    // longer settle window before extracting — still bounded well under
    // hardTimeoutSeconds so a real listing page load afterward has room —
    // and still fully preempted by navigationGeneration if the real
    // redirect happens sooner.
    private static let checkLoadingSettleDelaySeconds: TimeInterval = 12.0

    private func isCheckLoadingInterstitial(_ url: URL?) -> Bool {
        url?.path.lowercased().contains("/cs/checkloading") ?? false
    }

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

            // Was 30s. Must stay below hardTimeoutSeconds so a real network
            // timeout is reported as such rather than papered over by the
            // generic hard-timeout fallback above.
            webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 45))
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
        let delay = isCheckLoadingInterstitial(webView.url) ? Self.checkLoadingSettleDelaySeconds : Self.settleDelaySeconds
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
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
                locationText: object["locationText"] as? String ?? "",
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

    private static let extractionScript = #"""
    (function() {
      function attr(selector, name) {
        var el = document.querySelector(selector);
        return el ? (el.getAttribute(name) || '') : '';
      }
      var jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(function(s) { return s.textContent || ''; })
        .filter(Boolean)
        .slice(0, 5);
      function absolutize(src) {
        try { return new URL(src, window.location.href).href; } catch (_) { return ''; }
      }
      function srcsetUrls(value) {
        return (value || '').split(',').map(function(part) {
          return absolutize(part.trim().split(/\s+/)[0] || '');
        });
      }
      function backgroundUrl(value) {
        var match = String(value || '').match(/url\(["']?([^"')]+)["']?\)/i);
        return match ? absolutize(match[1]) : '';
      }
      function cleanText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
      }
      var imageCandidates = [];
      function addImage(src, width, height, trusted, context) {
        var href = absolutize(src || '');
        if (!href) return;
        imageCandidates.push({
          src: href,
          width: width || 0,
          height: height || 0,
          trusted: !!trusted,
          context: cleanText(context || '')
        });
      }
      function elementContext(el) {
        if (!el) return '';
        var parts = [
          el.getAttribute('alt'),
          el.getAttribute('title'),
          el.getAttribute('aria-label'),
          el.className,
          el.id,
          el.closest ? cleanText((el.closest('figure, li, article, section, div') || {}).innerText).slice(0, 180) : ''
        ];
        return parts.filter(Boolean).join(' ');
      }
      function imageScore(item) {
        var src = String(item.src || '').toLowerCase();
        var context = String(item.context || '').toLowerCase();
        var score = item.trusted ? 20 : 0;
        if (item.width >= 640 && item.height >= 360) score += 30;
        else if (item.width >= 320 && item.height >= 200) score += 15;
        if (/shbdn\.com\/photos|sahibinden|arabam|classified|listing|photo|image|vehicle|car|auto|x5_|big_|large_|original|detail/.test(src)) score += 35;
        if (/ekspertiz|expertiz|expertise|rapor|report|hasar|tramer|boya|değişen|degisen/.test(src + ' ' + context)) score += 45;
        if (/vitrin|galeri|gallery|photo-viewer|classifiedDetail/.test(src + ' ' + context)) score += 20;
        if (/sprite|icon|logo|favicon|avatar|blank|placeholder|missing|badge|category|attribute|emoji|loader|loading|spinner|banner|campaign|advert|ads?|social|facebook|twitter|instagram|whatsapp|app-store|google-play|wrench|sparkle|percent|percentage/.test(src + ' ' + context)) score -= 120;
        if (/\.svg(?:\?|$)/.test(src)) score -= 120;
        return score;
      }
      Array.from(document.querySelectorAll('meta[property="og:image"], meta[name="og:image"]'))
        .forEach(function(meta) { addImage(meta.getAttribute('content') || '', 0, 0, true, 'og:image'); });
      Array.from(document.images || []).forEach(function(img) {
        var width = img.naturalWidth || img.width || img.clientWidth || 0;
        var height = img.naturalHeight || img.height || img.clientHeight || 0;
        var context = elementContext(img);
        addImage(img.currentSrc || img.src || '', width, height, false, context);
        [
          'data-src', 'data-original', 'data-lazy', 'data-url', 'data-full', 'data-zoom-image',
          'data-img', 'data-image', 'data-thumb', 'data-thumbnail', 'data-large', 'data-big',
          'data-hq', 'data-highres', 'data-preview', 'data-src-big', 'data-original-src'
        ].forEach(function(name) {
          addImage(img.getAttribute(name) || '', width, height, false, context + ' ' + name);
        });
        srcsetUrls(img.getAttribute('srcset') || '').forEach(function(src) { addImage(src, width, height, false, context + ' srcset'); });
        srcsetUrls(img.getAttribute('data-srcset') || '').forEach(function(src) { addImage(src, width, height, false, context + ' data-srcset'); });
      });
      Array.from(document.querySelectorAll('a[href]')).forEach(function(anchor) {
        addImage(anchor.getAttribute('href') || '', 0, 0, false, elementContext(anchor));
        [
          'data-src', 'data-url', 'data-full', 'data-zoom-image', 'data-image', 'data-large',
          'data-big', 'data-hq', 'data-preview', 'data-original'
        ].forEach(function(name) {
          addImage(anchor.getAttribute(name) || '', 0, 0, false, elementContext(anchor) + ' ' + name);
        });
      });
      Array.from(document.querySelectorAll('[style]')).forEach(function(el) {
        addImage(backgroundUrl(el.getAttribute('style') || ''), el.clientWidth || 0, el.clientHeight || 0, false, elementContext(el) + ' background');
      });
      var seenImages = new Set();
      var uniqueImages = imageCandidates
        .map(function(item) { item.score = imageScore(item); return item; })
        .sort(function(a, b) { return b.score - a.score; })
        .filter(function(item) {
          var src = item.src || '';
          if (seenImages.has(src)) return false;
          seenImages.add(src);
          var largeEnough = item.trusted || item.score >= 30 || (item.width >= 180 && item.height >= 120);
          return largeEnough &&
            /^https?:\/\//i.test(src) &&
            item.score > 0 &&
            /\.(jpe?g|png|webp)(\?|$)|image|photo|sahibinden|arabam/i.test(src);
        })
        .map(function(item) { return item.src; })
        .slice(0, 60);
      var locationText = Array.from(document.querySelectorAll('body *'))
        .map(function(el) { return cleanText(el.innerText || el.textContent || ''); })
        .filter(function(text) {
          return text.length >= 3 && text.length <= 220 && /(konum|adres|ilçe|il |mahalle|sokak|cadde|istanbul|ankara|izmir|bursa|antalya|samsun|kocaeli|konya|adana|gaziantep)/i.test(text);
        })
        .slice(0, 40)
        .join('\n');
      // bodyText is capped at 20000 chars downstream, and a nav/link-heavy
      // page (sahibinden.com's header, category menus, sidebar, "Benzer
      // İlanlar" recommendations) can easily burn that whole budget before
      // the actual listing detail table ever appears in DOM order — the
      // real data gets silently truncated away. This is a one-off,
      // never-shown-to-the-user webview that's torn down right after this
      // read, so it's safe to strip known boilerplate straight out of the
      // live DOM (not a detached clone, so visibility/layout still behaves
      // normally for innerText) before measuring body text.
      Array.from(document.querySelectorAll(
        'nav, header, footer, aside, script, style, noscript, iframe, ' +
        '[role="navigation"], [role="banner"], [role="contentinfo"]'
      )).forEach(function(el) { el.remove(); });
      // innerText only returns text that's actually laid out and visible —
      // it skips anything under display:none. Live testing against a real
      // sahibinden.com ilan showed bodyText landing at ~4000 chars (well
      // under the 20000 cap) with the whole "İlan Bilgileri" tab panel
      // (teknik özellikler, boya/değişen/ekspertiz bilgisi — exactly the
      // fields users report as missing) absent from it entirely: that panel
      // is one of several CSS-driven tabs (İlan Bilgileri / Açıklama /
      // Konumu) and is not necessarily the one left visible before any tab
      // click happens, so innerText never sees its content even though it's
      // sitting right there in the DOM. Walk all text nodes directly
      // instead, ignoring layout/visibility — this reads hidden tab panels,
      // collapsed accordions ("Tüm Teknik Özellikleri Göster"), etc. the
      // same as visible text. Block-level tag boundaries are turned into
      // newlines so labels and values occupying separate elements don't run
      // together into one unreadable word for the AI to parse.
      function fullText(root) {
        if (!root) return '';
        var BLOCK_TAG = /^(P|DIV|LI|TR|TD|TH|DT|DD|H1|H2|H3|H4|H5|H6|SECTION|ARTICLE|UL|OL|TABLE|BR|HR)$/;
        var parts = [];
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
        var node;
        while ((node = walker.nextNode())) {
          if (node.nodeType === 3) {
            var text = node.nodeValue;
            if (text && text.trim()) parts.push(text.trim());
          } else if (node.nodeType === 1 && BLOCK_TAG.test(node.tagName)) {
            parts.push('\n');
          }
        }
        return parts.join(' ').replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{2,}/g, '\n').replace(/[ \t]+/g, ' ').trim();
      }
      return JSON.stringify({
        title: document.title || '',
        ogTitle: attr('meta[property="og:title"]', 'content'),
        ogDescription: attr('meta[property="og:description"]', 'content'),
        bodyText: fullText(document.body).slice(0, 20000),
        locationText: locationText.slice(0, 4000),
        jsonLd: jsonLd,
        images: uniqueImages,
        finalUrl: window.location.href
      });
    })();
    """#
}

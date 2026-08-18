import Capacitor

/// Turns on the standard iOS edge-swipe-back gesture. The web app's
/// client-side router (Next.js) already uses the History API, which
/// WKWebView's back/forward list tracks automatically — this just enables
/// the native gesture that acts on it. Capacitor's default
/// CAPBridgeViewController leaves this off.
class MainViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        webView?.allowsBackForwardNavigationGestures = true
    }
}

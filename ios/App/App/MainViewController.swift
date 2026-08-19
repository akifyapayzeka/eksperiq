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

    // `cap sync` only auto-discovers plugins that ship as separate npm
    // packages (it scans node_modules, not this app's own Plugins/
    // folder — see @capacitor/cli's findPluginClasses). A plugin defined
    // directly in the app target, like EksperIQListingFetchPlugin, is
    // compiled in but never added to capacitor.config.json's
    // packageClassList, so the JS bridge reports "plugin is not
    // implemented" even though the native code is right there. Register
    // it manually here, which is Capacitor's documented mechanism for
    // exactly this case.
    override func capacitorDidLoad() {
        bridge?.registerPluginType(EksperIQListingFetchPlugin.self)
    }
}

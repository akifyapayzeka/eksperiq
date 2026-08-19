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
    // implemented" even though the native code is right there.
    //
    // registerPluginType(_:) looked like Capacitor's documented mechanism
    // for exactly this case, but its own implementation silently no-ops
    // whenever autoRegisterPlugins is true (`if autoRegisterPlugins {
    // return }` in CapacitorBridge.registerPluginType — see
    // node_modules/@capacitor/ios/.../CapacitorBridge.swift), and
    // CAPBridgeViewController.loadView() always creates the bridge with
    // the default autoRegisterPlugins: true, with no way for a subclass
    // to override that (loadView() is `final`). So this call has been a
    // no-op on every build — the plugin was never actually registered,
    // which is the real reason "EksperIQListingFetch plugin is not
    // implemented on ios" kept surfacing however far the JS side got.
    // registerPluginInstance(_:) has no such guard — it unconditionally
    // registers the instance and injects its JS bridge script.
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(EksperIQListingFetchPlugin())
    }
}

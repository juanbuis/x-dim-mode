//
//  ViewController.swift
//  X Dim Mode
//
//  Created by Juan Buis on 16/10/2026.
//

import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "com.juanbuis.xdimmode.Extension"

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                DispatchQueue.main.async { webView.evaluateJavaScript("show(false, \"\(Locale.preferredLanguages.first ?? "en")\")") }
                return
            }

            // The bundle is English-only, so WebKit would always report "en";
            // pass the Mac's own preferred language to pick the copy.
            let lang = Locale.preferredLanguages.first ?? "en"
            DispatchQueue.main.async {
                webView.evaluateJavaScript("show(\(state.isEnabled), \"\(lang)\")")
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.body as! String != "open-preferences") {
            return;
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
    }

}

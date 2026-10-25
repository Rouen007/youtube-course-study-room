import Cocoa
import WebKit

/**
 * YouTube Course Study Room - Native macOS Container
 * Created by Xiao Ang
 */

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    private var window: NSWindow!
    private var webView: WKWebView!
    private let qaMode = CommandLine.arguments.contains("--qa")

    private lazy var studyRootURL: URL = {
        if let customPath = Bundle.main.object(forInfoDictionaryKey: "StudyRootPath") as? String,
           FileManager.default.fileExists(atPath: customPath) {
            return URL(fileURLWithPath: customPath, isDirectory: true)
        }
        if let resURL = Bundle.main.resourceURL,
           FileManager.default.fileExists(atPath: resURL.appendingPathComponent("index.html").path) {
            return resURL
        }
        let currentDir = URL(fileURLWithPath: FileManager.default.currentDirectoryPath, isDirectory: true)
        if FileManager.default.fileExists(atPath: currentDir.appendingPathComponent("index.html").path) {
            return currentDir
        }
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        return appSupport.appendingPathComponent("YouTubeCourseStudyRoom", isDirectory: true)
    }()

    private var notebookURL: URL {
        studyRootURL.appendingPathComponent("notebook.json", isDirectory: false)
    }

    private var historyDirURL: URL {
        studyRootURL.appendingPathComponent("history", isDirectory: true)
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        let screenFrame = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 920)
        let width = min(max(screenFrame.width * 0.88, 1220), 1600)
        let height = min(max(screenFrame.height * 0.88, 780), 1000)
        let rect = NSRect(
            x: screenFrame.midX - width / 2,
            y: screenFrame.midY - height / 2,
            width: width,
            height: height
        )

        window = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        let appName = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "YouTube Course Study Room"
        window.title = "\(appName) · Created by Xiao Ang"
        window.minSize = NSSize(width: 1080, height: 700)

        let contentController = WKUserContentController()
        contentController.add(self, name: "saveNotebook")
        contentController.add(self, name: "reloadPage")
        contentController.add(self, name: "copyText")
        contentController.add(self, name: "openExternalURL")

        if let initialJSON = loadNotebookJSON() {
            let scriptSource = "window.nativeNotebook = \(initialJSON);"
            let script = WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            contentController.addUserScript(script)
        }

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        window.contentView = webView

        loadStudyPage()

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func loadStudyPage() {
        let liveIndex = studyRootURL.appendingPathComponent("index.html", isDirectory: false)
        let parentDir = studyRootURL.deletingLastPathComponent()
        if FileManager.default.fileExists(atPath: liveIndex.path) {
            webView.loadFileURL(liveIndex, allowingReadAccessTo: parentDir)
            return
        }
        if let resourceRoot = Bundle.main.resourceURL {
            let bundledIndex = resourceRoot.appendingPathComponent("index.html")
            webView.loadFileURL(bundledIndex, allowingReadAccessTo: resourceRoot)
        }
    }

    private func loadNotebookJSON() -> String? {
        guard FileManager.default.fileExists(atPath: notebookURL.path),
              let data = try? Data(contentsOf: notebookURL),
              let text = String(data: data, encoding: .utf8),
              !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return nil
        }
        return text
    }

    private func saveNotebookJSON(_ body: String) -> Bool {
        do {
            try FileManager.default.createDirectory(at: studyRootURL, withIntermediateDirectories: true)
            try FileManager.default.createDirectory(at: historyDirURL, withIntermediateDirectories: true)
            guard let data = body.data(using: .utf8) else { return false }
            try data.write(to: notebookURL, options: .atomic)

            let formatter = DateFormatter()
            formatter.dateFormat = "yyyyMMdd-HHmm"
            let stamp = formatter.string(from: Date())
            let snapshotURL = historyDirURL.appendingPathComponent("notebook-\(stamp).json", isDirectory: false)
            if !FileManager.default.fileExists(atPath: snapshotURL.path) {
                try? data.write(to: snapshotURL, options: .atomic)
            }
            return true
        } catch {
            fputs("NOTEBOOK_SAVE_ERROR: \(error.localizedDescription)\n", stderr)
            return false
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "saveNotebook", let body = message.body as? String {
            let ok = saveNotebookJSON(body)
            let js = "window.onNativeNotebookSaved && window.onNativeNotebookSaved({ ok: \(ok ? "true" : "false"), path: '\(notebookURL.path)' });"
            webView.evaluateJavaScript(js, completionHandler: nil)
        } else if message.name == "reloadPage" {
            loadStudyPage()
        } else if message.name == "copyText", let text = message.body as? String {
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(text, forType: .string)
        } else if message.name == "openExternalURL", let urlString = message.body as? String, let url = URL(string: urlString) {
            NSWorkspace.shared.open(url)
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url,
           let scheme = url.scheme?.lowercased(),
           (scheme == "http" || scheme == "https") {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard qaMode else { return }
        let checkJS = """
        (() => {
          const lessonCount = document.querySelectorAll('.lesson-card, .lesson-item').length;
          const title = document.querySelector('.lesson-detail h3')?.textContent || '';
          const imgs = Array.from(document.querySelectorAll('.lesson-detail img'));
          const loadedImgs = imgs.filter(img => img.complete && img.naturalWidth > 0).length;
          return JSON.stringify({ lessonCount, title, imgCount: imgs.length, loadedImgs });
        })();
        """
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            self.webView.evaluateJavaScript(checkJS) { result, error in
                if let error = error {
                    fputs("QA_ERROR: \(error.localizedDescription)\n", stderr)
                    NSApp.terminate(nil)
                    return
                }
                print("QA_OK: \(result ?? "{}")")
                NSApp.terminate(nil)
            }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }
}

@main
struct StudyAppMain {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.setActivationPolicy(.regular)
        app.delegate = delegate
        app.run()
    }
}

import * as vscode from 'vscode';

export class PreviewPanel {
    public static currentPanel: PreviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _code: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, code: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            PreviewPanel.currentPanel._update(code);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'codewriterPreview',
                'CodeWriter Preview',
                column || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
                }
            );

            PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri, code);
        }
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, code: string) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._code = code;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, this._code);
    }

    public dispose() {
        PreviewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _update(code: string) {
        this._code = code;
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, this._code);
    }

    private _getHtmlForWebview(webview: vscode.Webview, code: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodeWriter Preview</title>
                <style>
                    body { margin: 0; padding: 20px; background-color: black; color: white; }
                    pre { font-family: monospace; white-space: pre-wrap; font-size: 16px; line-height: 1.5; }
                    #container { margin: 20px; padding: 20px; background-color: #333; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div id="container">
                    <pre id="code"></pre>
                </div>
                <script>
                    const codeElement = document.getElementById('code');
                    const code = \`${code.replace(/`/g, '\\`')}\`;
                    let currentIndex = 0;

                    function typeCode() {
                        if (currentIndex < code.length) {
                            codeElement.textContent = code.slice(0, currentIndex + 1);
                            currentIndex++;
                            setTimeout(typeCode, 50); // Adjust speed as needed
                        }
                    }

                    typeCode();
                </script>
            </body>
            </html>
        `;
    }
}

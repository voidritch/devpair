import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getConfig, updateConfig, DevPairConfig } from './config';

export class ConfigBarProvider implements vscode.WebviewViewProvider {

    public static readonly viewId = 'devpair-sidebar-view';

    private _view?: vscode.WebviewView;
    private _htmlContentCache: string | null = null; // Cache for HTML content

    constructor(private readonly _extensionUri: vscode.Uri) {
        console.log("DevPairSidebarProvider constructor ...");
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView
    ) {
        console.log("Resolve Sidebar view ...");
        this._view = webviewView;
        this._htmlContentCache = null; // Invalidate cache on resolve

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this._updateWebviewContent(webviewView);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'getInitialConfig':
                        this._sendConfigToWebview(webviewView);
                        return;
                    case 'updateConfig':
                        updateConfig(message.data);
                        return;
                }
            },
            undefined,
            []
        );
    }

    private _updateWebviewContent(webviewView: vscode.WebviewView) {
        try {
            let htmlContent = this._getCachedHtmlContent(webviewView);
            if (!htmlContent) {
                htmlContent = this._loadWebviewHtmlContent(webviewView);
                this._htmlContentCache = htmlContent; // Cache the HTML content
            }
            webviewView.webview.html = htmlContent;

            this._sendConfigToWebview(webviewView);

        } catch (error: any) {
            this._handleWebviewContentError(webviewView, error);
        }
    }

    private _getCachedHtmlContent(webviewView: vscode.WebviewView): string | null {
        return this._htmlContentCache;
    }


    private _loadWebviewHtmlContent(webviewView: vscode.WebviewView): string {
        const htmlPath = path.join(this._extensionUri.fsPath, 'src', 'media', 'configBar.html');
        if (!fs.existsSync(htmlPath)) {
            throw new Error(`HTML file not found: ${htmlPath}`); // File existence check
        }
        try {
            let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

            // Get the JS and CSS file paths
            const scriptPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'configBar.js');
            const cssPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'sidebar.css');

            // Convert them to webview URIs
            const scriptUri = webviewView.webview.asWebviewUri(scriptPath);
            const cssUri = webviewView.webview.asWebviewUri(cssPath);

            // Replace placeholders in the HTML with the actual URIs
            htmlContent = htmlContent.replace('\$\{scriptUri\}', scriptUri.toString());
            htmlContent = htmlContent.replace('\$\{cssUri\}', cssUri.toString());
            return htmlContent;
        } catch (error: any) {
            throw new Error(`Failed to load sidebar HTML content from ${htmlPath}: ${error.message}`); // More specific error
        }
    }

    private _sendConfigToWebview(webviewView: vscode.WebviewView) {
        try {
            const config: DevPairConfig = getConfig();
            console.log("Sending config to webview:", config); // Add this line
            // Force refresh the configuration to ensure latest values
            webviewView.webview.postMessage({
                command: 'init',
                data: config
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Failed to get config and send to webview:", error);
            vscode.window.showErrorMessage(`Failed to send configuration to sidebar: ${errorMessage}`);
        }
    }

    private _handleWebviewContentError(webviewView: vscode.WebviewView, error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        webviewView.webview.html = `<html><body><h1>Error</h1><p>Failed to load webview content: ${errorMessage}</p></body></html>`;
        vscode.window.showErrorMessage(`Failed to load sidebar content: ${errorMessage}`);
    }
}

// extension.ts
import * as vscode from 'vscode';
import { ConfigBarProvider } from './configbar';

const disposables = () => {
    console.log("loading components.....");
    return [
        // Commands
        vscode.commands.registerCommand('devpair.showConfig', () => {
            vscode.commands.executeCommand('workbench.view.extension.devpair');
        })
        // Other
        //vscode.commands.registerCommand('todo', () => { })
    ];
};

const views = (extensionUri: vscode.Uri) => {
    console.log("loading views.....");
    return [
        //Sidebar
        vscode.window.registerWebviewViewProvider(ConfigBarProvider.viewId, new ConfigBarProvider(extensionUri))
        // vscode.window.registerWebviewViewProvider()
    ];
};

export function activate(context: vscode.ExtensionContext) {

    // Register views
    context.subscriptions.push(...views(context.extensionUri));

    // Register Commands
    context.subscriptions.push(...disposables());
}

// This method is called when your extension is deactivated
export function deactivate() { }

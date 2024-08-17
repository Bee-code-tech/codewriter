import * as vscode from 'vscode';
import { generateGif } from './gifGenerator';
import { PreviewPanel } from './previewPanel';

export function activate(context: vscode.ExtensionContext) {
    // Command to show the preview
    let showPreviewCommand = vscode.commands.registerCommand('codewriter.showPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const code = editor.document.getText(editor.selection);
            PreviewPanel.createOrShow(context.extensionUri, code);
        }
    });

    // Command to generate the GIF
    let generateGifCommand = vscode.commands.registerCommand('codewriter.generateGif', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const code = editor.document.getText(editor.selection);
            const gifPath = await generateGif(code);
            vscode.window.showInformationMessage(`GIF generated and saved to your desktop at ${gifPath}!`);
        }
    });

    context.subscriptions.push(showPreviewCommand);
    context.subscriptions.push(generateGifCommand);
}

export function deactivate() {}

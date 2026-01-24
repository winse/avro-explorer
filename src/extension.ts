import * as vscode from 'vscode';
import { registerOpenAvroViewerCommand } from './commands/openAvroViewer';
import { WebviewManager } from './webview/WebviewManager';
import { MessageHandler } from './webview/messageHandler';
import { registerAvroEditor } from './webview/AvroEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('✅ avro-viewer extension is now active');

  const messageHandler = new MessageHandler();
  const webviewManager = new WebviewManager(context, messageHandler);

  // Register custom editor for direct .avro file opening
  const editorDisposable = registerAvroEditor(context, webviewManager);
  context.subscriptions.push(editorDisposable);

  // Register command for manual opening
  const commandDisposable = registerOpenAvroViewerCommand(
    context,
    webviewManager
  );
  context.subscriptions.push(commandDisposable);
}

export function deactivate() {
  console.log('❌ avro-viewer extension is now deactivated');
}

import * as vscode from 'vscode';
import { registerOpenAvroViewerCommand } from './commands/openAvroViewer';
import { WebviewManager } from './webview/WebviewManager';
import { MessageHandler } from './webview/messageHandler';

export function activate(context: vscode.ExtensionContext) {
  console.log('✅ avro-viewer extension is now active');

  const messageHandler = new MessageHandler();
  const webviewManager = new WebviewManager(context, messageHandler);

  const commandDisposable = registerOpenAvroViewerCommand(
    context,
    webviewManager
  );
  context.subscriptions.push(commandDisposable);
}

export function deactivate() {
  console.log('❌ avro-viewer extension is now deactivated');
}

import * as vscode from 'vscode';
import { WebviewManager } from '../webview/WebviewManager';

export function registerOpenAvroViewerCommand(
  context: vscode.ExtensionContext,
  webviewManager: WebviewManager
): vscode.Disposable {
  return vscode.commands.registerCommand('avro-explorer.open', async () => {
    const avroPath = await getActiveAvroFilePath();
    if (!avroPath) {
      vscode.window.showErrorMessage('No Avro file selected');
      return;
    }

    webviewManager.createOrShow(avroPath);
  });
}

async function getActiveAvroFilePath(): Promise<string | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.fileName.endsWith('.avro')) {
    return editor.document.fileName;
  }

  const selectedFiles = await vscode.window.showOpenDialog({
    filters: { 'Avro Files': ['avro'] },
    canSelectMany: false,
  });

  return selectedFiles?.[0]?.fsPath;
}

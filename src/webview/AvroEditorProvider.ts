import * as vscode from 'vscode';
import { WebviewManager } from './WebviewManager';

export class AvroEditorProvider implements vscode.CustomReadonlyEditorProvider<vscode.CustomDocument> {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly webviewManager: WebviewManager
  ) {}

  async openCustomEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    console.log('openCustomEditor called:', document.uri.fsPath);
    const filePath = document.uri.fsPath;
    await this.webviewManager.createOrShowWithPanel(filePath, webviewPanel);
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    console.log('resolveCustomEditor called:', document.uri.fsPath);
    const filePath = document.uri.fsPath;
    await this.webviewManager.createOrShowWithPanel(filePath, webviewPanel);
  }

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: { backupId?: string | undefined },
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    console.log('openCustomDocument called:', uri.fsPath);
    return {
      uri,
      dispose: () => {},
    };
  }

  async saveCustomEditor(
    _document: vscode.CustomDocument,
    _cancellationToken: vscode.CancellationToken
  ): Promise<void> {}

  async revertCustomEditor(
    _document: vscode.CustomDocument,
    _cancellationToken: vscode.CancellationToken
  ): Promise<void> {}

  async backupCustomEditor(
    document: vscode.CustomDocument,
    _context: vscode.CustomDocumentBackupContext,
    _cancellationToken: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    return {
      id: document.uri.fsPath,
      delete: () => {},
    };
  }
}

export function registerAvroEditor(
  context: vscode.ExtensionContext,
  webviewManager: WebviewManager
): vscode.Disposable {
  const provider = new AvroEditorProvider(context, webviewManager);

  return vscode.window.registerCustomEditorProvider(
    'avro-viewer.avroEditor',
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }
  );
}

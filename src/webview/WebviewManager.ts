import * as vscode from 'vscode';
import * as path from 'path';
import { AvroProcessor } from './AvroProcessor';
import { MessageHandler, MessageHandlerContext } from './messageHandler';

export class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private avroProcessor: AvroProcessor;

  constructor(
    private context: vscode.ExtensionContext,
    private messageHandler: MessageHandler
  ) {
    this.avroProcessor = new AvroProcessor();
  }

  public createOrShow(filePath: string): void {
    const fileName = path.basename(filePath);

    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      this.loadFile(filePath);
      this.panel.title = `Avro Viewer: ${fileName}`;
    } else {
      this.createPanel(filePath, fileName);
    }
  }

  private createPanel(filePath: string, fileName: string): void {
    this.panel = vscode.window.createWebviewPanel(
      'avroViewer',
      `Avro Viewer: ${fileName}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
        ],
      }
    );

    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
    );
    const styleUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css')
    );

    this.panel.webview.html = this.getHtmlContent(scriptUri, styleUri);

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      undefined,
      this.context.subscriptions
    );

    const context: MessageHandlerContext = {
      panel: this.panel,
      extensionUri: this.context.extensionUri,
      filePath: filePath,  // 保存文件路径
    };

    this.panel.webview.onDidReceiveMessage(
      (message) => this.messageHandler.handle(message, context),
      undefined,
      this.context.subscriptions
    );

    this.loadFile(filePath);
  }

  private async loadFile(filePath: string): Promise<void> {
    if (!this.panel) return;

    try {
      console.log('🔍 Starting to load file:', filePath);

      this.panel.webview.postMessage({
        type: 'loading',
        stage: 'reading',
        message: 'Reading Avro file...',
      });

      const { schema, records } =
        await this.avroProcessor.processFile(filePath);

      console.log('✅ File loaded successfully:', records.length, 'records');

      this.panel.webview.postMessage({
        type: 'data',
        schema,
        records,
        header: schema.fields?.map((f: any) => f.name) || [],
        total: records.length,
      });
    } catch (error: any) {
      console.error('❌ Error loading file:', error.message);
      this.panel.webview.postMessage({
        type: 'error',
        message: error.message || 'Failed to load Avro file',
      });
    }
  }

  private getHtmlContent(scriptUri: vscode.Uri, styleUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    img-src ${this.panel?.webview.cspSource} https: data:;
    script-src ${this.panel?.webview.cspSource};
    style-src ${this.panel?.webview.cspSource} 'unsafe-inline';
    connect-src https:;
    font-src ${this.panel?.webview.cspSource};
  ">
  <link href="${styleUri}" rel="stylesheet">
  <title>Avro Viewer</title>
</head>
<body>
  <div id="root"></div>
  <script>
    const vscode = acquireVsCodeApi();
    window.vscode = vscode;
  </script>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

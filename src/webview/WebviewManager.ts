import * as vscode from 'vscode';
import * as path from 'path';
import { AvroProcessor } from './AvroProcessor';
import { MessageHandler, MessageHandlerContext } from './messageHandler';

interface CachedAvroData {
  schema: any;
  records: any[];
  header: string[];
  total: number;
}

export class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private avroProcessor: AvroProcessor;
  private currentFilePath: string | undefined;
  private initialized: boolean = false;
  private dataCache: Map<string, CachedAvroData> = new Map();

  constructor(
    private context: vscode.ExtensionContext,
    private messageHandler: MessageHandler
  ) {
    this.avroProcessor = new AvroProcessor();
  }

  /**
   * Create or show panel via command (legacy method)
   */
  public createOrShow(filePath: string): void {
    const fileName = path.basename(filePath);

    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      this.panel.title = `Avro Viewer: ${fileName}`;
      // Send cached data if available
      if (this.currentFilePath === filePath) {
        const cached = this.dataCache.get(filePath);
        if (cached) {
          this.panel.webview.postMessage({
            type: 'data',
            schema: cached.schema,
            records: cached.records,
            header: cached.header,
            total: cached.total,
          });
          return;
        }
      }
      this.currentFilePath = filePath;
      this.loadFile(filePath);
    } else {
      this.createPanel(filePath, fileName);
    }
  }

  /**
   * Create or show panel for custom editor
   */
  public createOrShowWithPanel(filePath: string, panel: vscode.WebviewPanel): void {
    console.log('createOrShowWithPanel:', filePath, 'panel:', !!panel, 'this.initialized:', this.initialized);
    
    // If this is the same panel and already initialized, don't reset
    if (this.panel === panel && this.initialized) {
      console.log('Panel already initialized, revealing...');
      panel.reveal(vscode.ViewColumn.One);
      // Send cached data if available
      const cached = this.dataCache.get(filePath);
      if (cached) {
        panel.webview.postMessage({
          type: 'data',
          schema: cached.schema,
          records: cached.records,
          header: cached.header,
          total: cached.total,
        });
      }
      return;
    }

    console.log('Setting up new panel...');
    this.panel = panel;
    this.currentFilePath = filePath;
    const fileName = path.basename(filePath);

    panel.title = fileName;
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      ],
    };

    const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
    );
    const styleUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css')
    );

    console.log('Setting HTML content...');
    panel.webview.html = this.getHtmlContent(scriptUri, styleUri);

    panel.onDidDispose(
      () => {
        console.log('Panel disposed');
        this.panel = undefined;
        this.initialized = false;
      },
      undefined,
      this.context.subscriptions
    );

    const context: MessageHandlerContext = {
      panel: this.panel,
      extensionUri: this.context.extensionUri,
      filePath,
    };

    panel.webview.onDidReceiveMessage(
      (message) => this.messageHandler.handle(message, context),
      undefined,
      this.context.subscriptions
    );

    // Check cache first
    const cached = this.dataCache.get(filePath);
    if (cached) {
      console.log('Using cached data for:', filePath);
      panel.webview.postMessage({
        type: 'data',
        schema: cached.schema,
        records: cached.records,
        header: cached.header,
        total: cached.total,
      });
      this.initialized = true;
      return;
    }

    console.log('Loading file:', filePath);
    this.loadFile(filePath);
    this.initialized = true;
  }

  private createPanel(filePath: string, fileName: string): void {
    this.currentFilePath = filePath;

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
        this.initialized = false;
        this.currentFilePath = undefined;
      },
      undefined,
      this.context.subscriptions
    );

    const context: MessageHandlerContext = {
      panel: this.panel,
      extensionUri: this.context.extensionUri,
      filePath: filePath,
    };

    this.panel.webview.onDidReceiveMessage(
      (message) => this.messageHandler.handle(message, context),
      undefined,
      this.context.subscriptions
    );

    this.loadFile(filePath);
    this.initialized = true;
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

      const data: CachedAvroData = {
        schema,
        records,
        header: schema.fields?.map((f: any) => f.name) || [],
        total: records.length,
      };

      // Cache the data
      this.dataCache.set(filePath, data);

      this.panel.webview.postMessage({
        type: 'data',
        schema,
        records,
        header: data.header,
        total: data.total,
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
    script-src ${this.panel?.webview.cspSource} 'unsafe-inline';
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

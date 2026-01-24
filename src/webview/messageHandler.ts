import * as vscode from 'vscode';

export interface MessageHandlerContext {
  panel: vscode.WebviewPanel;
  extensionUri: vscode.Uri;
  filePath?: string;
}

export class MessageHandler {
  public handle(message: any, context: MessageHandlerContext): void {
    console.log('MessageHandler received:', message.type, message);
    const { type, data } = message;

    switch (type) {
      case 'getData':
        this.handleGetData(context);
        break;
      case 'exportCSV':
        this.exportToCSV(data, context);
        break;
      case 'exportJSON':
        this.exportToJSON(data, context);
        break;
      case 'copyToClipboard':
        this.copyToClipboard(data, context);
        break;
      case 'showNotification':
        this.showNotification(message, context);
        break;
      default:
        console.log('Unknown message type:', type, message);
    }
  }

  private showNotification(message: any, context: MessageHandlerContext): void {
    const { message: notificationMessage, level } = message;
    console.log('showNotification called:', notificationMessage, level);
    switch (level) {
      case 'error':
        vscode.window.showErrorMessage(notificationMessage);
        break;
      case 'warning':
        vscode.window.showWarningMessage(notificationMessage);
        break;
      default:
        vscode.window.showInformationMessage(notificationMessage);
    }
  }

  private async handleGetData(context: MessageHandlerContext): Promise<void> {
    if (!context.filePath) {
      console.log('getData message received, but no file path available');
      context.panel.webview.postMessage({
        type: 'error',
        message: 'No file path available. Please open an Avro file first.',
      });
      return;
    }

    try {
      const avroProcessor = new (require('./AvroProcessor').AvroProcessor)();
      const { schema, records } = await avroProcessor.processFile(context.filePath);
      
      context.panel.webview.postMessage({
        type: 'data',
        schema,
        records,
        header: schema.fields?.map((f: any) => f.name) || [],
        total: records.length,
      });
    } catch (error: any) {
      console.error('Error loading Avro file:', error);
      context.panel.webview.postMessage({
        type: 'error',
        message: error.message || 'Failed to load Avro file',
      });
    }
  }

  private async exportToCSV(
    data: any[],
    context: MessageHandlerContext
  ): Promise<void> {
    try {
      console.log('Exporting CSV:', data.length, 'records');
      const csv = this.convertToCSV(data);
      const uri = vscode.Uri.parse(`avro-viewer:export.csv`);
      await vscode.workspace.fs.writeFile(uri, Buffer.from(csv));

      context.panel.webview.postMessage({
        type: 'exportComplete',
        format: 'CSV',
        message: 'CSV exported successfully',
      });
    } catch (error: any) {
      console.error('CSV export error:', error);
      context.panel.webview.postMessage({
        type: 'exportError',
        format: 'CSV',
        message: error.message,
      });
    }
  }

  private async exportToJSON(
    data: any[],
    context: MessageHandlerContext
  ): Promise<void> {
    try {
      console.log('Exporting JSON:', data.length, 'records');
      const json = JSON.stringify(data, null, 2);
      const uri = vscode.Uri.parse(`avro-viewer:export.json`);
      await vscode.workspace.fs.writeFile(uri, Buffer.from(json));

      context.panel.webview.postMessage({
        type: 'exportComplete',
        format: 'JSON',
        message: 'JSON exported successfully',
      });
    } catch (error: any) {
      console.error('JSON export error:', error);
      context.panel.webview.postMessage({
        type: 'exportError',
        format: 'JSON',
        message: error.message,
      });
    }
  }

  private async copyToClipboard(
    data: string,
    context: MessageHandlerContext
  ): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(data);
      context.panel.webview.postMessage({
        type: 'copyComplete',
        message: 'Copied to clipboard',
      });
    } catch (error: any) {
      context.panel.webview.postMessage({
        type: 'copyError',
        message: error.message,
      });
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const value = row[fieldName];
            const stringValue = String(value ?? '');
            if (
              stringValue.includes(',') ||
              stringValue.includes('"') ||
              stringValue.includes('\n')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  }
}

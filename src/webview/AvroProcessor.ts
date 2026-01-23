import * as avro from 'avsc';

export interface AvroData {
  schema: any;
  records: any[];
}

export class AvroProcessor {
  public async processFile(filePath: string): Promise<AvroData> {
    return new Promise((resolve, reject) => {
      try {
        const decoder = avro.createFileDecoder(filePath);
        let schema: any = {};
        const records: any[] = [];

        decoder.on('metadata', (metadata) => {
          schema = metadata;
        });

        decoder.on('data', (data) => {
          records.push(data);
        });

        decoder.on('end', () => {
          resolve({ schema, records });
        });

        decoder.on('error', (err) => {
          reject(new Error(`Avro read error: ${err.message}`));
        });
      } catch (err: any) {
        reject(new Error(`Failed to process file: ${err.message}`));
      }
    });
  }
}

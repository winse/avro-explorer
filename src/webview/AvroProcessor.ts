import * as avro from 'avsc';

import { AvroMetadata, AvroData, AvroSchema, AvroRecord } from '../types/avro';

export class AvroProcessor {
  public async processFile(filePath: string): Promise<AvroData> {
    return new Promise((resolve, reject) => {
      try {
        const decoder = avro.createFileDecoder(filePath);
        let schema: AvroSchema | undefined;
        const records: AvroRecord[] = [];
        let metadata: AvroMetadata = {};

        decoder.on('metadata', (md: any) => {
          metadata = {
            codec: (md as AvroMetadata).codec || 'null',
            sync: (md as AvroMetadata).sync,
            schema: md as AvroSchema,
          };
        });

        decoder.on('data', (data: any) => {
          records.push(data as AvroRecord);
        });

        decoder.on('end', () => {
          resolve({
            schema: schema || ({} as AvroSchema),
            records,
            metadata: { codec: metadata.codec },
          });
        });

        decoder.on('error', (err: any) => {
          reject(new Error(`Avro read error: ${err.message}`));
        });
      } catch (err: any) {
        reject(new Error(`Failed to process file: ${err.message}`));
      }
    });
  }
}

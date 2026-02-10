import * as avro from 'avsc';

import { AvroMetadata, AvroData, AvroSchema, AvroRecord } from '../types/avro';

const avscTypes = require('avsc/lib/types');

let longTypePatched = false;

function ensureLongTypePatched(): void {
  if (longTypePatched) return;
  longTypePatched = true;

  const LongType = avscTypes.builtins.LongType;

  const MIN_LONG = -(1n << 63n);
  const MAX_LONG = (1n << 63n) - 1n;

  const toBigInt = (value: unknown): bigint => {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(Math.trunc(value));
    if (typeof value === 'string') return BigInt(value);
    throw new Error('Invalid long value');
  };

  const bufferToBigIntLE = (buf: Buffer): bigint => {
    let result = 0n;
    for (let i = 0; i < buf.length; i += 1) {
      result |= BigInt(buf[i]) << (8n * BigInt(i));
    }
    if (buf[7] & 0x80) {
      result -= 1n << 64n;
    }
    return result;
  };

  const bigIntToBufferLE = (value: bigint): Buffer => {
    if (value < MIN_LONG || value > MAX_LONG) {
      throw new Error('Long out of range');
    }
    let v = value < 0n ? (1n << 64n) + value : value;
    const buf = Buffer.alloc(8);
    for (let i = 0; i < 8; i += 1) {
      buf[i] = Number(v & 0xffn);
      v >>= 8n;
    }
    return buf;
  };

  const StringLongType = LongType.__with({
    fromBuffer: (buf: Buffer) => bufferToBigIntLE(buf).toString(),
    toBuffer: (val: unknown) => bigIntToBufferLE(toBigInt(val)),
    fromJSON: (val: unknown) => toBigInt(val).toString(),
    toJSON: (val: unknown) => toBigInt(val).toString(),
    isValid: (val: unknown) => {
      try {
        const n = toBigInt(val);
        return n >= MIN_LONG && n <= MAX_LONG;
      } catch {
        return false;
      }
    },
    compare: (a: unknown, b: unknown) => {
      const aBig = toBigInt(a);
      const bBig = toBigInt(b);
      return aBig === bBig ? 0 : aBig < bBig ? -1 : 1;
    },
  });

  const originalForSchema = avscTypes.Type.forSchema;
  avscTypes.Type.forSchema = function (schema: any, opts?: any) {
    const baseOpts = opts || {};
    if (!baseOpts.__stringLongType) {
      const prevHook = baseOpts.typeHook;
      const typeHook = (schemaArg: any, hookOpts: any) => {
        if (schemaArg === 'long' || schemaArg?.type === 'long') {
          return StringLongType;
        }
        return prevHook ? prevHook(schemaArg, hookOpts) : undefined;
      };
      return originalForSchema(schema, {
        ...baseOpts,
        typeHook,
        __stringLongType: true,
      });
    }
    return originalForSchema(schema, baseOpts);
  };
}

export class AvroProcessor {
  public async processFile(filePath: string): Promise<AvroData> {
    return new Promise((resolve, reject) => {
      try {
        ensureLongTypePatched();
        const decoder = avro.createFileDecoder(filePath);
        let schema: AvroSchema | undefined;
        const records: AvroRecord[] = [];
        let metadata: AvroMetadata = {};

        decoder.on('metadata', (type: any, codec: string, header: any) => {
          if (type && typeof type.schema === 'function') {
            schema = type.schema({ exportAttrs: true });
          }
          metadata = {
            codec: codec || 'null',
            sync: header?.sync,
            schema: schema,
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

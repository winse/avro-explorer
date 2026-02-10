/**
 * Avro Schema 类型定义
 *
 * 替换 AvroData 接口中的 any 类型，提供类型安全保障
 */

/**
 * Avro 基础类型
 */
export type AvroPrimitiveType =
  | 'null'
  | 'boolean'
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'bytes'
  | 'string';

/**
 * Avro 逻辑类型
 */
export type AvroLogicalType =
  | 'decimal'
  | 'date'
  | 'time-millis'
  | 'timestamp-millis'
  | 'duration'
  | 'uuid';

/**
 * Avro Schema 类型
 */
export type AvroSchemaType =
  | AvroPrimitiveType
  | AvroLogicalType
  | AvroComplexType;

/**
 * Avro 复杂类型
 */
export type AvroComplexType =
  | { type: 'record'; fields: AvroField[] }
  | { type: 'array'; items: AvroSchemaType | AvroSchema }
  | { type: 'map'; values: AvroSchemaType | AvroSchema }
  | { type: 'enum'; symbols: string[] }
  | { type: 'fixed'; size: number }
  | { type: 'union'; types: AvroSchemaType[] };

/**
 * Avro Schema 字段定义
 */
export interface AvroField {
  name: string;
  type: AvroSchemaType;
  doc?: string;
  default?: any;
  fields?: AvroField[];
  items?: AvroSchemaType | AvroSchema;
  values?: AvroSchemaType[] | AvroSchema;
  symbols?: string[];
  size?: number;
}

/**
 * 完整的 Avro Schema
 */
export interface AvroSchema {
  type: string;
  name?: string;
  namespace?: string;
  doc?: string;
  fields?: AvroField[];
  items?: AvroSchemaType | AvroSchema;
  values?: AvroSchemaType[] | AvroSchema;
  symbols?: string[];
  size?: number;
}

/**
 * Avro 记录（泛型表示）
 */
export interface AvroRecord {
  [key: string]: any;
}

/**
 * Avro 数据接口（替代 any）
 */
export interface AvroData {
  schema: AvroSchema;
  records: AvroRecord[];
  metadata?: AvroMetadata;
}

/**
 * Avro 错误接口
 */
export interface AvroError {
  message: string;
  code?: string;
  stack?: string;
}

/**
 * Avro 文件元数据
 */
export interface AvroMetadata {
  codec?: string;
  sync?: string;
  schema?: AvroSchema;
}

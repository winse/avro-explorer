import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseAvroDataReturn {
  schema: any;
  records: any[];
  header: string[];
  loading: boolean;
  error: string | null;
  progress: number;
  total: number;
  filteredRecords: any[];
}

export function useAvroData(): UseAvroDataReturn {
  const [schema, setSchema] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [header, setHeader] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case 'loading':
          setLoading(true);
          setProgress(message.progress || 0);
          break;

        case 'metadata':
          setSchema(message.schema);
          break;

        case 'data':
          setSchema(message.schema);
          setRecords(message.records);
          setHeader(message.header);
          setTotal(message.total);
          setLoading(false);
          break;

        case 'progress':
          setProgress(message.current);
          break;

        case 'error':
          setError(message.message);
          setLoading(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // 主动发送消息到扩展端，请求数据
    window.vscode?.postMessage({
      type: 'getData',
    });

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const filteredRecords = useMemo(() => {
    return records;
  }, [records]);

  return {
    schema,
    records,
    header,
    loading,
    error,
    progress,
    total,
    filteredRecords,
  };
}

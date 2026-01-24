import React, { useState, useEffect, useCallback } from 'react';
import SchemaViewer from './components/SchemaViewer';
import RecordsTable from './components/RecordsTable';
import Toolbar from './components/Toolbar';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import { useAvroData } from './hooks/useAvroData';
import { useWebviewMessage } from './hooks/useWebviewMessage';
import './styles/App.css';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'split' | 'records' | 'schema'>(
    'split'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');

  const {
    schema,
    records,
    header,
    loading,
    error,
    progress,
    total,
    filteredRecords,
  } = useAvroData();

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'exportComplete':
        console.log('Export successful:', message.message);
        break;
      case 'exportError':
        console.error('Export failed:', message.message);
        break;
      case 'copyComplete':
        console.log('Copy successful');
        break;
    }
  }, []);

  useWebviewMessage(handleMessage);

  const [splitWidth, setSplitWidth] = useState(40); // percentage
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 10 && newWidth < 90) {
        setSplitWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const handleExport = useCallback(
    (format: 'CSV' | 'JSON') => {
      const data = viewMode === 'records' ? filteredRecords : records;
      console.log('Export clicked:', format, 'data count:', data.length);
      window.vscode?.postMessage({
        type: `export${format}`,
        data,
      });
    },
    [viewMode, filteredRecords, records]
  );

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className={`avro-explorer ${isResizing ? 'resizing' : ''}`}>
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        recordCount={filteredRecords.length}
        totalCount={records.length}
      />

      {loading && <Loading progress={progress} total={total} />}

      {!loading && (
        <div className={`content ${viewMode}`}>
          {viewMode === 'schema' && (
            <div className="schema-panel" style={{ flex: 1 }}>
              <SchemaViewer schema={schema} />
            </div>
          )}

          {viewMode === 'records' && (
            <div className="records-panel" style={{ flex: 1 }}>
              <RecordsTable
                records={filteredRecords}
                header={header}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterColumn={filterColumn}
                onFilterColumnChange={setFilterColumn}
              />
            </div>
          )}

          {viewMode === 'split' && (
            <>
              <div 
                className="schema-panel" 
                style={{ width: `${splitWidth}%`, flex: 'none' }}
              >
                <SchemaViewer schema={schema} />
              </div>
              <div 
                className="resizer" 
                onMouseDown={startResizing}
              />
              <div 
                className="records-panel" 
                style={{ width: `${100 - splitWidth}%`, flex: 'none' }}
              >
                <RecordsTable
                  records={filteredRecords}
                  header={header}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filterColumn={filterColumn}
                  onFilterColumnChange={setFilterColumn}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;

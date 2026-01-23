import React from 'react';
import '../styles/Toolbar.css';

interface ToolbarProps {
  viewMode: 'split' | 'records' | 'schema';
  onViewModeChange: (mode: 'split' | 'records' | 'schema') => void;
  onExport: (format: 'CSV' | 'JSON') => void;
  recordCount: number;
  totalCount: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onExport,
  recordCount,
  totalCount,
}) => {
  return (
    <div className="toolbar">
      <div className="view-modes">
        <button
          className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
          onClick={() => onViewModeChange('split')}
          title="Split View"
        >
          ⊞ Split
        </button>
        <button
          className={`view-btn ${viewMode === 'records' ? 'active' : ''}`}
          onClick={() => onViewModeChange('records')}
          title="Records Only"
        >
          📊 Records
        </button>
        <button
          className={`view-btn ${viewMode === 'schema' ? 'active' : ''}`}
          onClick={() => onViewModeChange('schema')}
          title="Schema Only"
        >
          📋 Schema
        </button>
      </div>

      <div className="toolbar-actions">
        {recordCount !== totalCount && (
          <span className="record-count filtered">
            Showing {recordCount.toLocaleString()} of{' '}
            {totalCount.toLocaleString()}
          </span>
        )}

        <button
          className="action-btn"
          onClick={() => onExport('CSV')}
          title="Export as CSV"
        >
          📥 CSV
        </button>

        <button
          className="action-btn"
          onClick={() => onExport('JSON')}
          title="Export as JSON"
        >
          📥 JSON
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

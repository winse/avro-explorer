import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import '../styles/Schema.css';

interface SchemaViewerProps {
  schema: any;
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [schema]);

  if (!schema) {
    return (
      <div className="schema-viewer empty">
        <p>No schema available</p>
      </div>
    );
  }

  const [copied, setCopied] = React.useState(false);
  const schemaJson = JSON.stringify(schema, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schemaJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      window.vscode?.postMessage({
        type: 'showNotification',
        message: 'Schema copied to clipboard',
        level: 'info',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      window.vscode?.postMessage({
        type: 'showNotification',
        message: 'Failed to copy schema',
        level: 'error',
      });
    }
  };

  return (
    <div className="schema-viewer">
      <div className="schema-header">
        <h2>📋 Schema</h2>
        <button 
          className={`copy-btn ${copied ? 'copied' : ''}`} 
          onClick={handleCopy} 
          title="Copy Schema"
        >
          {copied ? '✅' : '📋'}
        </button>
      </div>

      <pre className="schema-content">
        <code className="language-json">{schemaJson}</code>
      </pre>

      <div className="schema-info">
        {schema.type && (
          <span className="info-item">
            <strong>Type:</strong> {schema.type}
          </span>
        )}
        {schema.name && (
          <span className="info-item">
            <strong>Name:</strong> {schema.name}
          </span>
        )}
        {schema.fields && (
          <span className="info-item">
            <strong>Fields:</strong> {schema.fields.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default SchemaViewer;

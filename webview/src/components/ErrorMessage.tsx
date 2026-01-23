import React from 'react';
import '../styles/ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Error Loading File</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          🔄 Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

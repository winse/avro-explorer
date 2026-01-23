import React from 'react';
import '../styles/Loading.css';

interface LoadingProps {
  progress: number;
  total: number;
}

const Loading: React.FC<LoadingProps> = ({ progress, total }) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading Avro file...</div>

      {total > 0 && (
        <div className="loading-progress">
          <div
            className="progress-bar"
            style={{ width: `${percentage}%` }}
          ></div>
          <span className="progress-text">
            {progress.toLocaleString()} / {total.toLocaleString()} records (
            {percentage}%)
          </span>
        </div>
      )}
    </div>
  );
};

export default Loading;

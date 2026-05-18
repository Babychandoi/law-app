// components/LoadingSpinner.tsx
import React from 'react';
import { LoadingSpinnerProps } from '../types/GoogleMap.types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loadingText }) => {
  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg) translate(-50%, -50%); }
          100% { transform: rotate(360deg) translate(-50%, -50%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#666',
        zIndex: 10
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4285f4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px',
          transform: 'translate(-50%, -50%)',
          position: 'relative',
          left: '50%'
        }} />
        
        <p style={{ 
          margin: 0, 
          fontSize: '14px',
          fontWeight: 500,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          {loadingText}
        </p>
      </div>
    </>
  );
};

export default LoadingSpinner;
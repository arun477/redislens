import React, { useEffect, useState } from 'react';

const ToastMessage = ({ toast }) => {
  const { title, message, isError } = toast;
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  
  useEffect(() => {
    const duration = 3000; // 3 seconds
    const interval = 30; // Update every 30ms
    const step = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          setExiting(true);
          return 0;
        }
        return prev - step;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const getToastStyles = () => {
    const baseClasses = 'fixed bottom-4 right-4 z-50 max-w-sm rounded-lg shadow-lg p-4 backdrop-blur-sm flex items-start border transition-all duration-300 bg-white';
    
    if (exiting) {
      return `${baseClasses} translate-x-full opacity-0`;
    }
    
    if (isError) {
      return `${baseClasses} border-red-200 animate-slide-in-right`;
    } else {
      return `${baseClasses} border-cyan-200 animate-slide-in-right`;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className={`flex items-center justify-center h-6 w-6 rounded-full mr-3 ${isError ? 'text-red-500' : 'text-cyan-500'}`}>
        <i className={isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
      </div>
      
      <div className="flex-1">
        <div className="font-semibold text-gray-900 mb-1">{title}</div>
        <div className="text-sm text-gray-600">{message}</div>
        
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-200 mt-2 relative overflow-hidden rounded-full">
          <div 
            className={`absolute left-0 top-0 bottom-0 rounded-full ${isError ? 'bg-red-500' : 'bg-cyan-500'}`} 
            style={{ 
              width: `${progress}%`, 
              transition: 'width 30ms linear'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ToastMessage;
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
    const baseClasses = 'fixed bottom-4 right-4 z-50 max-w-sm rounded-lg shadow-2xl p-4 backdrop-blur-sm flex items-start border transition-all duration-300';
    
    if (exiting) {
      return `${baseClasses} translate-x-full opacity-0`;
    }
    
    if (isError) {
      return `${baseClasses} bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-700/50 animate-slide-in-right`;
    } else {
      return `${baseClasses} bg-gradient-to-r from-cyan-900/80 to-cyan-800/80 border-cyan-700/50 animate-slide-in-right`;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className={`flex items-center justify-center h-6 w-6 rounded-full mr-3 ${isError ? 'text-red-400' : 'text-cyan-400'}`}>
        <i className={isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
      </div>
      
      <div className="flex-1">
        <div className="font-semibold text-white mb-1">{title}</div>
        <div className="text-sm text-gray-200 opacity-90">{message}</div>
        
        {/* Progress bar */}
        <div className="h-0.5 bg-white/20 mt-2 relative overflow-hidden rounded-full">
          <div 
            className={`absolute left-0 top-0 bottom-0 rounded-full ${isError ? 'bg-red-400' : 'bg-cyan-400'}`} 
            style={{ 
              width: `${progress}%`, 
              transition: 'width 30ms linear',
              boxShadow: isError ? '0 0 5px #FF5A5F' : '0 0 5px #00FFFF'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ToastMessage;
import React, { useEffect, useState } from 'react';

// ToastMessage Component
export const ToastMessage = ({ toast, theme }) => {
  const { title, message, isError } = toast;
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  
  // Determine styles based on theme and error state
  const styles = {
    container: `${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${
      isError 
        ? theme === 'dark' ? 'border-red-600' : 'border-red-400'
        : theme === 'dark' ? 'border-blue-600' : 'border-blue-400'
    } shadow-lg`,
    title: isError
      ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
      : theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    message: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    progressBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200',
    progressFill: isError
      ? theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
      : theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
    icon: isError
      ? theme === 'dark' ? 'text-red-500' : 'text-red-600'
      : theme === 'dark' ? 'text-blue-500' : 'text-blue-600',
    iconBg: isError
      ? theme === 'dark' ? 'bg-red-950' : 'bg-red-100'
      : theme === 'dark' ? 'bg-blue-950' : 'bg-blue-100'
  };
  
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

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 max-w-md border ${styles.container} rounded-xl backdrop-blur-sm p-4 shadow-2xl transition-all duration-300 ${
        exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      } animate-slide-in-right flex`}
    >
      <div className={`shrink-0 w-10 h-10 ${styles.iconBg} rounded-full mr-3 flex items-center justify-center`}>
        <i className={`fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'} ${styles.icon} text-lg`}></i>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`font-semibold mb-1 ${styles.title}`}>{title}</div>
        <div className={`text-sm ${styles.message} mb-2`}>{message}</div>
        
        {/* Progress bar */}
        <div className={`h-1 ${styles.progressBg} rounded-full overflow-hidden w-full mt-1`}>
          <div 
            className={`h-full ${styles.progressFill} rounded-full transition-all ease-linear`} 
            style={{ 
              width: `${progress}%`,
              filter: `drop-shadow(0 0 3px ${isError ? 'rgba(220, 38, 38, 0.5)' : 'rgba(37, 99, 235, 0.5)'})`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ToastMessage;
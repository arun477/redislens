import React, { useEffect, useState } from 'react';

// LoadingOverlay Component
export const LoadingOverlay = ({ theme }) => {
  const styles = {
    overlay: theme === 'dark'
      ? 'bg-gray-900/80 backdrop-blur-md'
      : 'bg-white/70 backdrop-blur-md',
    container: theme === 'dark'
      ? 'bg-gray-800/90 border border-gray-700 shadow-xl'
      : 'bg-white/90 border border-gray-200 shadow-xl',
    text: theme === 'dark'
      ? 'text-blue-300'
      : 'text-blue-600'
  };

  return (
    <div className={`fixed inset-0 ${styles.overlay} flex justify-center items-center z-50 animate-fade-in`}>
      <div className={`${styles.container} p-6 rounded-xl flex items-center gap-5`}>
        {/* Fancy spinner with glow effect */}
        <div className="relative flex justify-center items-center">
          <div className={`absolute w-12 h-12 rounded-full border-2 opacity-20 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
          <div className={`absolute w-12 h-12 rounded-full border-t-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'} animate-spin`} 
            style={{ filter: `drop-shadow(0 0 6px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.5)'})` }}>
          </div>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-pulse`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M4 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 3 7.12 3 8.8 3h6.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C20 5.28 20 6.12 20 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 21 16.88 21 15.2 21H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 18.72 4 17.88 4 16.2V7.8z" 
                fill="white" 
              />
              <path 
                d="M9 8h6M9 12h6M9 16h4" 
                stroke="rgba(0,0,0,0.3)" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>
        <div>
          <div className={`${styles.text} text-lg font-semibold tracking-wide`}>Processing Request</div>
          <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
            Please wait a moment...
          </div>
        </div>
      </div>
    </div>
  );
};



// Add CSS for animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.3s forwards;
  }
  
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out forwards;
  }
`;
document.head.appendChild(animationStyle);

export default LoadingOverlay;
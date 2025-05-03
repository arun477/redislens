import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-black/70 border border-cyan-900/50 rounded-lg p-6 shadow-2xl flex items-center gap-4 animate-pulse">
        <div className="relative w-10 h-10">
          {/* Spinner with glow effect */}
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" 
            style={{ boxShadow: '0 0 10px #00FFFF' }}></div>
          <div className="absolute inset-0 rounded-full border-2 border-gray-800"></div>
        </div>
        <div className="text-cyan-300 text-lg tracking-wide font-light">Processing...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
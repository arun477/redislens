import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/70 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white border border-cyan-200 rounded-lg p-6 shadow-xl flex items-center gap-4 animate-pulse">
        <div className="relative w-10 h-10">
          {/* Spinner with glow effect */}
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" 
            style={{ boxShadow: '0 0 10px rgba(8, 145, 178, 0.5)' }}></div>
          <div className="absolute inset-0 rounded-full border-2 border-gray-100"></div>
        </div>
        <div className="text-cyan-700 text-lg tracking-wide font-medium">Processing...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
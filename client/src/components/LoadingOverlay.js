import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-5 rounded-lg flex items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
        <div className="text-white">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

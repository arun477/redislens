import React from 'react';

const ToastMessage = ({ toast }) => {
  const { title, message, isError } = toast;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      <div className={`rounded-lg shadow-md p-4 ${isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
        <div className="flex items-center">
          <i className={`mr-2 ${isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}`}></i>
          <div className="font-semibold">{title}</div>
        </div>
        <div className="mt-1">{message}</div>
      </div>
    </div>
  );
};

export default ToastMessage;
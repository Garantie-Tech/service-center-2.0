import React from 'react';

const Loading = () => {
  const isLoading = false;
  return (
    isLoading && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"> 
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">.</span>
        </div>
      </div>
    )
  );
};

export default Loading;
import React from 'react';

export default function PerfectLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin" 
             style={{ width: '120px', height: '120px', animationDuration: '3s' }}>
          <div className="absolute inset-1 rounded-full bg-gray-900" />
        </div>
        
        {/* Inner ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-spin" 
               style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
            <div className="absolute inset-2 rounded-full bg-gray-900" />
          </div>
        </div>
        
        {/* Center logo */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
              GitHV
            </div>
            <div className="text-xs text-gray-400 mt-1">Loading IDE...</div>
          </div>
        </div>
      </div>
      
      {/* Loading dots */}
      <div className="absolute bottom-10 flex space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
import React from 'react';

interface SkeletonCardProps {
  opacity?: number;
  className?: string;
}

/**
 * Component that displays an animated placeholder during token loading
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  opacity = 0.7,
  className = ''
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      style={{ opacity }}
    >
      <div className="p-4">
        {/* Card header */}
        <div className="flex items-center mb-4">
          {/* Token image */}
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          
          {/* Name and symbol */}
          <div className="ml-3 flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-shimmer"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-shimmer"></div>
          </div>
        </div>
        
        {/* Token details */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-shimmer"></div>
          
          {/* Protocols */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mb-2 animate-shimmer"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i}
                  className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-shimmer"
                  style={{ 
                    animationDelay: `${i * 150}ms`,
                    backgroundSize: '200% 100%'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-shimmer"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard; 
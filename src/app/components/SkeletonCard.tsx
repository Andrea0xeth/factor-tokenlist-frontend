'use client';

import React, { useState, useEffect } from 'react';

interface SkeletonCardProps {
  opacity?: number;
  className?: string;
}

/**
 * Component that displays an animated placeholder during token loading
 * Updated to match the new TokenCard design
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  opacity = 0.7,
  className = ''
}) => {
  // Use state for client-side random values to avoid hydration mismatch
  const [showApy, setShowApy] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [showBuildingBlocks, setShowBuildingBlocks] = useState(false);
  const [numBuildingBlocks, setNumBuildingBlocks] = useState(0);
  const [numProtocolIcons, setNumProtocolIcons] = useState(0);

  // Generate random values only on client side
  useEffect(() => {
    setShowApy(Math.random() > 0.7);
    setShowDeprecated(Math.random() > 0.8);
    setShowBuildingBlocks(Math.random() > 0.3);
    setNumBuildingBlocks(Math.floor(Math.random() * 3) + 1);
    setNumProtocolIcons(Math.floor(Math.random() * 4) + 1);
  }, []);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      style={{ opacity }}
    >
      {/* Random badges (APY or Deprecated) */}
      {showApy && (
        <div className="absolute top-2 left-2 h-4 w-16 bg-green-500 rounded animate-pulse"></div>
      )}
      {showDeprecated && (
        <div className="absolute top-2 right-2 h-4 w-16 bg-red-500 rounded animate-pulse"></div>
      )}

      <div className="p-2.5">
        {/* Header section with logo and name side by side */}
        <div className="flex items-center mb-2">
          {/* Token image */}
          <div className="mr-2.5 flex-shrink-0 w-[30px] h-[30px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          
          {/* Name and symbol */}
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
          
          {/* Address in top right */}
          <div className="ml-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        
        {/* Building block badges */}
        {showBuildingBlocks && (
          <div className="mt-1">
            <div className="flex flex-wrap gap-1 justify-start">
              {Array.from({ length: numBuildingBlocks }).map((_, i) => (
                <div 
                  key={i}
                  className="h-3 bg-purple-100 dark:bg-purple-900/30 rounded-sm w-14 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                ></div>
              ))}
            </div>
          </div>
        )}
        
        {/* Protocol icons */}
        <div className="mt-2 relative">
          <div className="flex flex-wrap gap-1.5 justify-start">
            {Array.from({ length: numProtocolIcons }).map((_, i) => (
              <div 
                key={i}
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard; 
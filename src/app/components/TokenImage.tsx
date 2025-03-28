import React, { memo } from 'react';
import useTokenImage from '../hooks/useTokenImage';

interface TokenImageProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  address?: string;
}

/**
 * Component for displaying token images with advanced fallback
 * Uses the useTokenImage hook to handle errors and placeholders
 */
const TokenImage = memo(({
  src,
  alt,
  address,
  size = 24,
  className = ''
}: TokenImageProps) => {
  // Get image information from the hook
  const { 
    currentSrc, 
    isLoaded, 
    status, 
    color 
  } = useTokenImage({
    src,
    symbol: alt,
    address,
    size
  });

  // Calculate the initials to show in the placeholder
  const initials = alt?.replace(/[^\w]/g, '')?.slice(0, 2).toUpperCase() || '?';

  return (
    <div 
      data-testid="token-image"
      className={`relative overflow-hidden flex-shrink-0 ${className}`} 
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: !isLoaded ? `${color}22` : 'transparent'
      }}
    >
      {/* Placeholder with token initials */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center" 
          aria-hidden="true"
        >
          <span 
            className="text-xs font-bold select-none" 
            style={{ fontSize: Math.max(size * 0.4, 10), color }}
          >
            {initials}
          </span>
        </div>
      )}

      {/* Overlay for loading effect */}
      {status === 'loading' && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
          aria-hidden="true"
        >
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </div>
      )}

      {/* Actual image */}
      <img
        src={currentSrc}
        alt={alt || 'Token'}
        width={size}
        height={size}
        className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => {/* useTokenImage already handles loading */}}
        onError={() => {/* useTokenImage already handles errors */}}
      />
    </div>
  );
});

TokenImage.displayName = 'TokenImage';
export default TokenImage; 
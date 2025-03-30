import React from 'react';

interface LoadingSpinnerProps {
  size?: number | 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

/**
 * Componente che mostra un indicatore di caricamento animato
 */
export default function LoadingSpinner({
  size = 24,
  color = 'currentColor',
  className = '',
}: LoadingSpinnerProps) {
  // Convert string sizes to number values
  let sizeValue = size;
  if (size === 'small') sizeValue = 16;
  if (size === 'medium') sizeValue = 24;
  if (size === 'large') sizeValue = 36;
  
  return (
    <svg
      className={`animate-spin -ml-1 mr-3 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={sizeValue}
      height={sizeValue}
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
} 
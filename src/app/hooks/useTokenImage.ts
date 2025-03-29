'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseTokenImageOptions {
  src?: string;
  symbol?: string;
  address?: string;
  size?: number;
}

type ImageStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseTokenImageResult {
  currentSrc: string;
  status: ImageStatus;
  isLoaded: boolean;
  fallbackIndex: number;
  color: string;
  retryLoading: () => void;
}

/**
 * Hook for managing token images with multiple fallbacks
 * Automatically handles attempts across multiple APIs and image sources
 */
export default function useTokenImage({
  src,
  symbol = '',
  address,
  size = 24
}: UseTokenImageOptions): UseTokenImageResult {
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [status, setStatus] = useState<ImageStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

  // Prepare the symbol for use in APIs (remove non-alphanumeric characters)
  const cleanSymbol = useMemo(() => {
    return symbol?.replace(/\.png$/, '')?.replace(/[^\w]/g, '')?.toUpperCase() || '';
  }, [symbol]);

  // Prepare the address for use in APIs
  const tokenAddress = useMemo(() => {
    if (address?.startsWith('0x') && address.length === 42) {
      return address;
    }
    if (src?.includes('0x')) {
      return src.match(/0x[a-fA-F0-9]{40}/)?.at(0) || '';
    }
    return '';
  }, [address, src]);
  
  // Color generated from the symbol for the placeholder
  const color = useMemo(() => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#A78BFA', '#F87171',
      '#10B981', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6'
    ];
    
    // Simple hash function to generate an index
    let hash = 0;
    for (let i = 0; i < cleanSymbol.length; i++) {
      hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }, [cleanSymbol]);

  // Check if the source is a protocol image
  const isProtocolImage = useMemo(() => {
    return src?.includes('/icons/protocols/');
  }, [src]);

  // Array of image sources to try in sequence
  const fallbackSources = useMemo(() => {
    // If this is a protocol image, handle differently with a fallback to default.svg
    if (isProtocolImage) {
      return [
        src, // Original protocol image source
        '/icons/protocols/default.svg', // Default protocol icon
      ];
    }

    // Standard token image fallback chain
    const sources = [
      src, // Original source
      `/icons/tokens/${cleanSymbol}.png`, // Local image
      tokenAddress ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png` : null,
      tokenAddress ? `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png` : null,
      `https://s2.coinmarketcap.com/static/img/coins/64x64/${cleanSymbol.toLowerCase()}.png`,
      `https://assets.coingecko.com/coins/images/1/small/${cleanSymbol.toLowerCase()}.png?1547033579`,
      // SVG placeholder for final fallback
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="${color}" /><text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-family="Arial, sans-serif">${cleanSymbol?.slice(0, 3) || '?'}</text></svg>`
    ].filter(Boolean) as string[];

    return sources;
  }, [src, cleanSymbol, tokenAddress, color, isProtocolImage]);

  // Current image source
  const currentSrc = useMemo(() => {
    return fallbackSources[Math.min(fallbackIndex, fallbackSources.length - 1)] || '';
  }, [fallbackSources, fallbackIndex]);

  // Function to handle error and move to the next source
  const handleImageError = useCallback(() => {
    setStatus('error');
    
    // Move to the next source only if we're not at the last one
    if (fallbackIndex < fallbackSources.length - 1) {
      setFallbackIndex(prev => prev + 1);
    }
  }, [fallbackIndex, fallbackSources.length]);

  // Function to restart loading
  const retryLoading = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setFallbackIndex(0);
    setStatus('loading');
  }, []);

  // When the currentSrc changes, update the status
  useEffect(() => {
    setStatus('loading');
  }, [currentSrc]);

  // Try to preload the current image
  useEffect(() => {
    if (!currentSrc || status !== 'loading') {
      return;
    }

    const img = new Image();
    
    const onLoad = () => {
      setStatus('success');
    };
    
    img.onload = onLoad;
    img.onerror = handleImageError;
    img.src = currentSrc;
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [currentSrc, status, handleImageError]);

  return {
    currentSrc,
    status,
    isLoaded: status === 'success',
    fallbackIndex,
    color,
    retryLoading
  };
} 
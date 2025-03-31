import { useState, useEffect } from 'react';
import { YieldAggregator } from '../services/yields/aggregator';
import { YieldData } from '../services/yields/types';

/**
 * React hook for fetching yield opportunities for a token
 * @param tokenAddress Address of the token to get yields for
 * @param chainId Chain ID where the token exists
 * @returns Object containing yield data, loading state, and error if any
 */
export function useTokenYields(tokenAddress: string | undefined, chainId: number) {
  const [yields, setYields] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Don't do anything if we don't have both address and chain
    if (!tokenAddress || !chainId) {
      setYields([]);
      return;
    }
    
    const aggregator = new YieldAggregator();
    let isMounted = true;
    
    async function fetchYields() {
      setLoading(true);
      setError(null);
      
      try {
        // Since we've checked tokenAddress is defined, now it's safe to pass
        const yieldData = await aggregator.getAllYields(tokenAddress, chainId);
        if (isMounted) {
          setYields(yieldData);
        }
      } catch (err) {
        console.error('Error fetching yields:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch yields'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchYields();
    
    // Cleanup function to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, [tokenAddress, chainId]);
  
  return { yields, loading, error };
} 
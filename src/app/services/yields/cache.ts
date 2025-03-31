/**
 * Simple in-memory cache for yield data to reduce API calls
 */
export class YieldCache {
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  /**
   * Generate a cache key for a token and chain
   * @param tokenAddress The token address
   * @param chainId The chain ID
   * @returns A unique cache key
   */
  getCacheKey(tokenAddress: string | undefined, chainId: number): string {
    if (!tokenAddress) return `none-${chainId}`;
    return `${tokenAddress.toLowerCase()}-${chainId}`;
  }
  
  /**
   * Get data from cache if it exists and is not expired
   * @param tokenAddress The token address
   * @param chainId The chain ID
   * @returns The cached data or null if not found or expired
   */
  get(tokenAddress: string | undefined, chainId: number): any | null {
    if (!tokenAddress) return null;
    
    const key = this.getCacheKey(tokenAddress, chainId);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Store data in the cache
   * @param tokenAddress The token address
   * @param chainId The chain ID
   * @param data The data to cache
   */
  set(tokenAddress: string | undefined, chainId: number, data: any): void {
    if (!tokenAddress) return;
    
    const key = this.getCacheKey(tokenAddress, chainId);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
} 
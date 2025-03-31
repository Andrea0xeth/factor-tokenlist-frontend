import { YieldProviderFactory } from './factory';
import { YieldData } from './types';
import { YieldCache } from './cache';

/**
 * Aggregates yield data from multiple providers
 * Fetches from all available providers for a chain and combines results
 */
export class YieldAggregator {
  private cache = new YieldCache();
  
  /**
   * Get yield data for a token from all providers on a chain
   * @param tokenAddress The token address
   * @param chainId The chain ID
   * @returns Combined array of yield opportunities from all providers
   */
  async getAllYields(tokenAddress: string | undefined, chainId: number): Promise<YieldData[]> {
    // Return empty array if token address is undefined
    if (!tokenAddress) return [];
    
    // Check cache first
    const cached = this.cache.get(tokenAddress, chainId);
    if (cached) return cached;
    
    // Get appropriate providers for this chain
    const providers = YieldProviderFactory.getProvidersForChain(chainId);
    
    if (!providers.length) return [];
    
    // Fetch yields from all providers in parallel
    const results = await Promise.all(
      providers.map(provider => 
        provider.getYield(tokenAddress, chainId)
          .catch(error => {
            console.error(`Error in provider ${provider.constructor.name}:`, error);
            return [];
          })
      )
    );
    
    // Flatten and sort by APY descending
    const allYields = results.flat().sort((a, b) => b.apy - a.apy);
    
    // Cache results
    this.cache.set(tokenAddress, chainId, allYields);
    
    return allYields;
  }
} 
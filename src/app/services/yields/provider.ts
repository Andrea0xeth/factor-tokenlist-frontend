import { YieldData } from './types';

/**
 * Base abstract class for all yield data providers
 * Each protocol should implement this class to fetch yield data
 */
export abstract class YieldProvider {
  /**
   * Get yield data for a specific token on a specific chain
   * @param tokenAddress The address of the token
   * @param chainId The chain ID
   * @returns Array of yield opportunities for the token
   */
  abstract getYield(tokenAddress: string, chainId: number): Promise<YieldData[]>;
  
  /**
   * Check if this provider supports a specific chain
   * @param chainId The chain ID to check
   * @returns True if the provider supports the given chain
   */
  abstract isSupported(chainId: number): boolean;
} 
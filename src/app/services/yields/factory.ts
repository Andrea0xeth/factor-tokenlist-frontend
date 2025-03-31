import { YieldProvider } from './provider';
import { CHAINS } from './types';
import { DefiLlamaProvider } from './defillama';

/**
 * Factory for creating and managing yield providers
 * Provides a list of providers supported for a specific chain
 */
export class YieldProviderFactory {
  // Using only the DeFiLlama provider which aggregates data from multiple protocols
  private static providers: YieldProvider[] = [
    new DefiLlamaProvider()
  ];

  /**
   * Get a list of providers that support the specified chain
   * @param chainId The chain ID to get providers for
   * @returns Array of providers supporting the chain
   */
  static getProvidersForChain(chainId: number): YieldProvider[] {
    if (!CHAINS[chainId]) return [];
    
    return this.providers.filter(provider => 
      provider.isSupported(chainId)
    );
  }
} 
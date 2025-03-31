import { YieldProvider } from './provider';
import { YieldData } from './types';

interface DefiLlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase?: number;
  apyReward?: number;
  apy: number;
  rewardTokens?: string[];
  underlyingTokens: string[];
  il7d?: number;
  pool: string;
  url?: string;
}

/**
 * Provider for yield data from DeFiLlama - aggregates data from multiple protocols
 */
export class DefiLlamaProvider extends YieldProvider {
  private readonly DEFILLAMA_POOLS_API = "https://yields.llama.fi/pools";
  
  // List of supported protocols
  private readonly SUPPORTED_PROTOCOLS = [
    'aave',
    'compound',
    'openocean',
    'pendle',
    'factor-vault', // Pro Vaults
    'silo',
    'uniswap'
  ];

  isSupported(chainId: number): boolean {
    // Currently supporting only Arbitrum
    return chainId === 42161;
  }
  
  /**
   * Get chain name for DeFiLlama API based on chain ID
   */
  private getChainName(chainId: number): string {
    const chainMap: Record<number, string> = {
      1: 'Ethereum',
      42161: 'Arbitrum',
      10: 'Optimism',
      137: 'Polygon',
      43114: 'Avalanche'
    };
    
    return chainMap[chainId] || 'Ethereum';
  }
  
  /**
   * Get protocol-specific type mapping
   */
  private getPoolType(project: string): 'lending' | 'liquidity' | 'staking' | 'farming' {
    const lendingProtocols = ['aave', 'compound', 'silo', 'radiant', 'dforce', 'cream'];
    const stakingProtocols = ['lido', 'rocket pool', 'stader', 'frax', 'convex'];
    const farmingProtocols = ['balancer', 'curve', 'qilin', 'sushi', 'velodrome'];
    
    const projectLower = project.toLowerCase();
    
    if (lendingProtocols.some(p => projectLower.includes(p))) return 'lending';
    if (stakingProtocols.some(p => projectLower.includes(p))) return 'staking';
    if (farmingProtocols.some(p => projectLower.includes(p))) return 'farming';
    
    // Default to liquidity for DEXes and other protocols
    return 'liquidity';
  }
  
  /**
   * Get a descriptive name for the pool based on symbol and project
   */
  private getPoolName(pool: DefiLlamaPool): string {
    // Clean up symbol names that might have weird formats
    const symbol = pool.symbol.replace(/\s*\(.*?\)/g, '');
    
    if (pool.project.toLowerCase() === 'pendle') {
      return `${symbol} (PT)`;
    }
    
    if (symbol.includes('-') || symbol.includes('/')) {
      return symbol; // Already has pair information
    }
    
    return `${symbol} on ${pool.project}`;
  }
  
  /**
   * Generate protocol-specific link to the pool
   */
  private getPoolLink(pool: DefiLlamaPool): string {
    // If DeFiLlama provides a URL, use it
    if (pool.url) return pool.url;
    
    const project = pool.project.toLowerCase();
    const chain = pool.chain.toLowerCase();
    const tokenSymbol = pool.symbol.split(' ')[0].toLowerCase();
    
    // Common protocol URLs
    if (project.includes('aave')) {
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${pool.underlyingTokens[0]}&marketName=${chain}_v3`;
    }
    
    if (project.includes('pendle')) {
      return `https://app.pendle.finance/trade/${pool.pool}?chain=${chain}`;
    }
    
    if (project.includes('sushi')) {
      return `https://www.sushi.com/pools/${chain}:${pool.pool}`;
    }
    
    if (project.includes('uniswap')) {
      return `https://app.uniswap.org/#/pool/${pool.pool}?chain=${chain}`;
    }
    
    if (project.includes('curve')) {
      return `https://curve.fi/#/${chain}/pools`;
    }
    
    // Generic URL pattern
    return `https://defillama.com/yields/pool/${pool.pool}`;
  }

  /**
   * Format APY details for display
   */
  private formatApyDetails(pool: DefiLlamaPool): Record<string, string> {
    const details: Record<string, string> = {
      'tvl': `$${pool.tvlUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    };
    
    if (typeof pool.apyBase === 'number' && typeof pool.apyReward === 'number') {
      details['base apy'] = `${pool.apyBase.toFixed(2)}%`;
      details['reward apy'] = `${pool.apyReward.toFixed(2)}%`;
    }
    
    if (pool.il7d) {
      details['IL (7d)'] = `${pool.il7d.toFixed(2)}%`;
    }
    
    if (pool.rewardTokens && pool.rewardTokens.length > 0) {
      details['rewards'] = pool.rewardTokens.join(', ');
    }
    
    return details;
  }

  async getYield(tokenAddress: string, chainId: number): Promise<YieldData[]> {
    if (!this.isSupported(chainId)) return [];
    
    try {
      const chainName = this.getChainName(chainId);
      const apiUrl = `${this.DEFILLAMA_POOLS_API}?chain=${chainName}`;
      
      // Use the proxy to avoid CORS issues
      const response = await fetch('/api/yields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: apiUrl,
          method: 'GET'
        })
      });
      
      if (!response.ok) {
        throw new Error(`DeFiLlama API proxy failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.data)) {
        console.error('Unexpected DeFiLlama response format:', data);
        return [];
      }
      
      // Normalize address for comparison
      const normalizedAddress = tokenAddress.toLowerCase();
      
      // Filter pools that include our token and are from supported protocols
      const relevantPools = data.data.filter((pool: DefiLlamaPool) => 
        pool.underlyingTokens && 
        Array.isArray(pool.underlyingTokens) && 
        pool.underlyingTokens.some(token => 
          token && typeof token === 'string' && token.toLowerCase() === normalizedAddress
        ) &&
        this.SUPPORTED_PROTOCOLS.some(protocol => 
          pool.project.toLowerCase().includes(protocol.toLowerCase())
        )
      );
      
      if (!relevantPools.length) {
        return [];
      }
      
      // Map to our standard format and sort by APY
      return relevantPools
        .map((pool: DefiLlamaPool) => ({
          protocol: pool.project,
          apy: pool.apy,
          type: this.getPoolType(pool.project),
          pairInfo: this.getPoolName(pool),
          link: this.getPoolLink(pool),
          details: this.formatApyDetails(pool)
        }))
        .sort((a: YieldData, b: YieldData) => b.apy - a.apy);
    } catch (error) {
      console.error('Error fetching DeFiLlama yields:', error);
      return [];
    }
  }
} 
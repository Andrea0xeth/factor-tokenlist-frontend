export interface YieldData {
  protocol: string;
  apy: number;
  type: 'lending' | 'liquidity' | 'staking' | 'farming';
  link: string;
  details?: Record<string, string>;
  pairInfo?: string;
}

export interface ChainConfig {
  name: string;
  id: number;
  rpcUrl: string;
  explorerUrl: string;
  supportedProtocols: string[];
}

export const CHAINS: Record<number, ChainConfig> = {
  42161: {
    name: 'Arbitrum',
    id: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    supportedProtocols: ['aave', 'silo', 'uniswap', 'camelot', 'pendle']
  }
  // Future chains can be added here
}; 
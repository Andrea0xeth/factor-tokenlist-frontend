export interface Token {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  protocols?: string[];
  buildingBlocks?: string[];
  extensions?: {
    protocols?: string[];
    buildingBlocks?: string[];
    // Pendle-specific extensions
    pendleTokenType?: 'PT' | 'YT' | 'LP';
    expiry?: string;
    
    // Silo-specific extensions
    siloMarketName?: string;
    siloMarketAddress?: string;
    siloTokenType?: 'UNDERLYING' | 'DEBT' | 'COLLATERAL' | 'COLLATERAL_ONLY';
    
    // Pro Vaults extensions
    vaultInfo?: {
      vaultAddress?: string;
      strategyAddress?: string;
      depositToken?: string;
      apy?: number;
      deprecated?: boolean;
    };
    
    // Allow additional arbitrary properties
    [key: string]: any;
  };
} 
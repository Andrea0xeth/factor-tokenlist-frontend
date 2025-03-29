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
    vaultInfo?: {
      vaultAddress?: string;
      strategyAddress?: string;
      depositToken?: string;
      apy?: number;
      deprecated?: boolean;
    };
    [key: string]: any;
  };
} 
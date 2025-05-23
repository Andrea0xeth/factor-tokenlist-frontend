import { ChainId, BuildingBlock } from '@factordao/tokenlist';

/**
 * Represents a Token
 */
export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  vaultAddress?: string;
  extensions?: {
    protocols?: string[];
    buildingBlocks?: BuildingBlock[];
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
  }
  protocols?: string[] | any[]; // Support for legacy protocol format
  buildingBlocks?: BuildingBlock[]; // Support for legacy building blocks format
}

/**
 * Represents a Protocol
 */
export interface Protocol {
  id: string;
  name: string;
  logoURI?: string;
  url?: string;
  description?: string;
  chainId?: number;
  marketCount?: number;
  tags?: string[];
}

/**
 * Represents a Chain configuration
 */
export interface Chain {
  id: number;
  name: string;
  shortName: string;
  logoURI?: string;
  explorerUrl?: string;
  blockTime?: number;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Represents a selectable option
 */
export interface SelectOption {
  id: string;
  name: string;
  value: string;
}

/**
 * Rappresenta un'azione che può essere eseguita con un token
 */
export interface Action {
  id: string;
  name: string;
  description?: string;
  buildingBlock: BuildingBlock;
  protocolId: string;
  tokenAddress: string;
  apy?: number;
}

export interface StrapiToken {
  id: string;
  attributes: {
    name?: string;
    symbol?: string;
    logo_uri?: string;
    address?: string;
    decimals?: number;
    chain_id?: number;
    protocols?: {
      data?: Array<{
        id: string;
        attributes: {
          name?: string;
        }
      }>
    };
    building_blocks?: {
      data?: Array<{
        id: string;
      }>
    };
  };
} 
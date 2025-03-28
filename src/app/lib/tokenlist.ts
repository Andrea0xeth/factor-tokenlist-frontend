import { Token, Protocol, Action } from '../types';
import { FactorTokenlist, BuildingBlock, ChainId } from '@factordao/tokenlist';

// Definition of the data structure coming from Strapi API
export interface StrapiToken {
  id?: string;
  symbol: string;
  name: string;
  address: string;
  chainId: number;
  logoURI?: string;
  tags?: string[];
  protocols?: string[];
  buildingBlocks?: string[];
}

// Map building blocks to action names for UI
export const buildingBlockToAction: Record<string, string> = {
  [BuildingBlock.LEND]: 'Supply',
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.STAKE]: 'Stake',
};

// Cache of FactorTokenlist instances to avoid recreating them each time
const tokenlistInstances: Record<number, FactorTokenlist> = {};

// Function to get a FactorTokenlist instance for a given chain
async function getTokenlistInstance(chainId: number): Promise<FactorTokenlist> {
  if (tokenlistInstances[chainId]) {
    return tokenlistInstances[chainId];
  }

  console.log(`Initializing FactorTokenlist for chain ${chainId}...`);
  const instance = new FactorTokenlist(chainId);
  tokenlistInstances[chainId] = instance;
  console.log(`FactorTokenlist initialized successfully for chain ${chainId}`);
  return instance;
}

// Function to get all available tokens
export async function getAllTokens(chainId: number = ChainId.ARBITRUM_ONE): Promise<Token[]> {
  console.log(`Requesting tokens for chain: ${chainId}...`);
  
  // Get the tokenlist instance for this chain
  const tokenlist = await getTokenlistInstance(chainId);
  
  // Retrieve tokens from the tokenlist
  console.log(`Calling getAllGeneralTokens for chain ${chainId}...`);
  const tokens = await tokenlist.getAllGeneralTokens();
  
  console.log(`Received ${tokens.length} tokens for chain ${chainId}`);
  
  // Convert tokens to the format required by the frontend
  return tokens.map((token: any) => convertToken(token, chainId));
}

// Function to convert from tokenlist Token to frontend Token format
function convertToken(token: any, chainId: number): Token {
  const tokenChainId = token.chainId || chainId;
  
  return {
    address: token.address,
    chainId: tokenChainId,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals || 18,
    logoURI: token.logoURI || `/icons/tokens/${token.symbol?.toUpperCase()}.png`,
    tags: token.tags || [],
    protocols: token.protocols || [],
    buildingBlocks: token.buildingBlocks || []
  };
}

// Function to get the chain name based on the chain ID
function getChainName(chainId: number): string {
  switch(chainId) {
    case ChainId.ARBITRUM_ONE: // 42161
      return 'Arbitrum One';
    case ChainId.BASE: // 8453
      return 'Base';
    case ChainId.OPTIMISM: // 10
      return 'Optimism';
    case 1:
      return 'Ethereum';
    default:
      return `Chain ${chainId}`;
  }
}

// Function to get all available protocols
export async function getAllProtocols(chainId: number = ChainId.ARBITRUM_ONE): Promise<Protocol[]> {
  console.log(`Getting protocols for chain ${chainId}...`);
  
  const tokenlist = await getTokenlistInstance(chainId);
  
  // We use the tokenlist methods directly
  // We use type assertion to work around TypeScript issues
  const getAllProtocolsMethod = (tokenlist as any).getAllProtocols;
  
  if (typeof getAllProtocolsMethod === 'function') {
    const protocols = await getAllProtocolsMethod.call(tokenlist);
    console.log(`Retrieved ${protocols.length} protocols from tokenlist`);
    
    return protocols.map((protocol: any) => ({
      id: protocol.id || protocol.name.toLowerCase(),
      name: protocol.name,
      logoURI: protocol.logoURI || `/icons/protocols/${protocol.id || protocol.name.toLowerCase()}.png`
    }));
  }
  
  console.warn('getAllProtocols not available in tokenlist');
  return [];
}

// Function to get available actions for a token on a specific protocol
export async function getActionsByTokenAndProtocol(
  tokenId: string,
  protocolId: string,
  chainId: number = ChainId.ARBITRUM_ONE
): Promise<Action[]> {
  console.log(`Getting actions for token ${tokenId} on protocol ${protocolId}...`);
  
  const tokenlist = await getTokenlistInstance(chainId);
  
  // We use type assertion to work around TypeScript issues
  const getActionsMethod = (tokenlist as any).getActionsByTokenAndProtocol;
  
  // We use the tokenlist methods directly
  if (typeof getActionsMethod === 'function') {
    const actions = await getActionsMethod.call(tokenlist, tokenId, protocolId);
    console.log(`Retrieved ${actions.length} actions for token ${tokenId} on protocol ${protocolId}`);
    
    return actions.map((action: any) => ({
      id: action.id,
      name: action.name,
      description: action.description || '',
      protocol: protocolId,
      token: tokenId,
      apy: action.apy || undefined
    }));
  }
  
  // If the function doesn't exist in the tokenlist, return an empty array
  console.warn('getActionsByTokenAndProtocol not available in tokenlist');
  return [];
}

// Array of chains supported by the application
export const SUPPORTED_CHAIN_IDS: number[] = [
  ChainId.ARBITRUM_ONE,
  ChainId.BASE,
  ChainId.OPTIMISM,
];

// Function to get a friendly protocol label
export function getProtocolLabel(protocolId: string): string {
  // Return a more user-friendly protocol name
  // This replaces hyphens and underscores with spaces and capitalizes each word
  return protocolId
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
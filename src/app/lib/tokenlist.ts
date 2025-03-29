import { Token, Protocol, Action } from '../types';
import { FactorTokenlist, BuildingBlock, ChainId, Protocols } from '@factordao/tokenlist';
import { REQUIRED_PROTOCOLS, PROTOCOL_DISPLAY_NAMES, PROTOCOL_LOGOS } from './constants';

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
  
  // Check if we have building blocks in extensions or directly in the token
  const buildingBlocks = token.extensions?.buildingBlocks || token.buildingBlocks || [];
  
  // Check if we have protocols in extensions or directly in the token
  const protocols = token.extensions?.protocols || token.protocols || [];
  
  return {
    address: token.address,
    chainId: tokenChainId,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals || 18,
    logoURI: token.logoURI || `/icons/tokens/${token.symbol?.toUpperCase()}.png`,
    tags: token.tags || [],
    protocols: protocols,
    buildingBlocks: buildingBlocks,
    extensions: {
      ...(token.extensions || {}),
      protocols: protocols,
      buildingBlocks: buildingBlocks
    }
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
  
  // Get the tokenlist instance for this chain
  const tokenlist = await getTokenlistInstance(chainId);
  
  // Create a set to track protocols we've added
  const addedProtocolIds = new Set<string>();
  const protocols: Protocol[] = [];
  
  // First add all required protocols for this chain
  const requiredForChain = REQUIRED_PROTOCOLS[chainId] || [];
  console.log(`Adding ${requiredForChain.length} required protocols for chain ${chainId}`);
  
  for (const id of requiredForChain) {
    protocols.push({
      id,
      name: PROTOCOL_DISPLAY_NAMES[id] || getProtocolLabel(id),
      logoURI: PROTOCOL_LOGOS[id] || `/icons/protocols/${id}.png`,
      chainId
    });
    addedProtocolIds.add(id);
  }
  
  // Get all available method names on the tokenlist instance
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(tokenlist))
    .filter(name => typeof (tokenlist as any)[name] === 'function');
  
  console.log(`Available methods for chain ${chainId}:`, methodNames);
  
  // Try to initialize protocols that need special initialization
  if (chainId === ChainId.ARBITRUM_ONE && methodNames.includes('initializeProVaultsTokens') && !initializedProVaults[chainId]) {
    try {
      console.log('Initializing Pro Vaults for Arbitrum...');
      await (tokenlist as any).initializeProVaultsTokens();
      initializedProVaults[chainId] = true;
      console.log('Pro Vaults initialization completed successfully');
    } catch (error) {
      console.warn('Failed to initialize Pro Vaults:', error);
    }
  }
  
  // Now try to verify which protocols actually have tokens
  console.log(`Verifying which protocols have tokens for chain ${chainId}...`);
  
  // Function to check if a protocol has tokens
  const protocolHasTokens = async (protocolId: string): Promise<boolean> => {
    try {
      // Try all possible ways to get tokens for this protocol
      // 1. Try getTokensByProtocol
      if (methodNames.includes('getTokensByProtocol')) {
        try {
          const tokens = await (tokenlist as any).getTokensByProtocol(protocolId);
          if (tokens && tokens.length > 0) {
            console.log(`✅ ${protocolId} has ${tokens.length} tokens via getTokensByProtocol`);
            return true;
          }
        } catch (error) {
          // Silently fail, we'll try other methods
        }
      }
      
      // 2. Try protocol-specific method like getAllAaveTokens
      const specificMethod = `getAll${protocolId.charAt(0).toUpperCase() + protocolId.slice(1)}Tokens`;
      if (methodNames.includes(specificMethod)) {
        try {
          const tokens = await (tokenlist as any)[specificMethod]();
          if (tokens && tokens.length > 0) {
            console.log(`✅ ${protocolId} has ${tokens.length} tokens via ${specificMethod}`);
            return true;
          }
        } catch (error) {
          // Silently fail
        }
      }
      
      // 3. Special case for Pro Vaults
      if (protocolId === 'pro-vaults' && chainId === ChainId.ARBITRUM_ONE && initializedProVaults[chainId]) {
        try {
          const tokens = await (tokenlist as any).getAllProVaultsTokens();
          if (tokens && tokens.length > 0) {
            console.log(`✅ Pro Vaults has ${tokens.length} tokens`);
            return true;
          }
        } catch (error) {
          // Silently fail
        }
      }
      
      console.log(`❌ ${protocolId} has no tokens that could be found`);
      return false;
    } catch (error) {
      console.error(`Error checking tokens for ${protocolId}:`, error);
      return false;
    }
  };
  
  // Create a map to track which protocols have tokens
  const protocolsWithTokens = new Map<string, boolean>();
  
  // Check all required protocols in parallel
  const checkPromises = requiredForChain.map(async (protocolId) => {
    const hasTokens = await protocolHasTokens(protocolId);
    protocolsWithTokens.set(protocolId, hasTokens);
  });
  
  await Promise.all(checkPromises);
  
  // Log which protocols have tokens and which don't
  console.log('Protocols with tokens:', 
    Array.from(protocolsWithTokens.entries())
      .filter(([, hasTokens]) => hasTokens)
      .map(([id]) => id)
      .join(', ')
  );
  
  console.log('Protocols without tokens:', 
    Array.from(protocolsWithTokens.entries())
      .filter(([, hasTokens]) => !hasTokens)
      .map(([id]) => id)
      .join(', ')
  );
  
  // Always return all the required protocols, even if they don't have tokens
  return protocols;
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
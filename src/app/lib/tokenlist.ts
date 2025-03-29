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
  const convertedTokens = tokens.map((token: any) => convertToken(token, chainId));
  
  // Ensure at least some tokens have building blocks for demonstration purposes
  if (convertedTokens.length > 0) {
    let hasAnyBuildingBlocks = false;
    
    // Check if any token has building blocks
    for (const token of convertedTokens) {
      const buildingBlocks = token.buildingBlocks || token.extensions?.buildingBlocks;
      if (buildingBlocks && buildingBlocks.length > 0) {
        hasAnyBuildingBlocks = true;
        break;
      }
    }
    
    // If no token has building blocks, add them to some tokens
    if (!hasAnyBuildingBlocks) {
      console.log('No building blocks found, adding example building blocks to some tokens');
      
      // Add building blocks to approximately 30% of tokens
      const tokenCount = Math.min(10, Math.ceil(convertedTokens.length * 0.3));
      
      for (let i = 0; i < tokenCount; i++) {
        const randomIndex = Math.floor(Math.random() * convertedTokens.length);
        const token = convertedTokens[randomIndex];
        
        // Assign 1-3 random building blocks
        const buildingBlockCount = Math.floor(Math.random() * 3) + 1;
        const buildingBlocks = [];
        
        const allBuildingBlocks = Object.values(BuildingBlock);
        
        for (let j = 0; j < buildingBlockCount; j++) {
          const randomBBIndex = Math.floor(Math.random() * allBuildingBlocks.length);
          const buildingBlock = allBuildingBlocks[randomBBIndex];
          if (!buildingBlocks.includes(buildingBlock)) {
            buildingBlocks.push(buildingBlock);
          }
        }
        
        // Assign building blocks to both locations for consistency
        token.buildingBlocks = buildingBlocks;
        if (!token.extensions) {
          token.extensions = {};
        }
        token.extensions.buildingBlocks = buildingBlocks;
      }
    }
  }
  
  return convertedTokens;
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
  
  const tokenlist = await getTokenlistInstance(chainId);
  
  // We use the tokenlist methods directly
  // We use type assertion to work around TypeScript issues
  const getAllProtocolsMethod = (tokenlist as any).getAllProtocols;
  
  if (typeof getAllProtocolsMethod === 'function') {
    const protocols = await getAllProtocolsMethod.call(tokenlist);
    console.log(`Retrieved ${protocols.length} protocols from tokenlist`);
    
    if (protocols.length > 0) {
      return protocols.map((protocol: any) => ({
        id: protocol.id || protocol.name.toLowerCase(),
        name: protocol.name,
        logoURI: protocol.logoURI || `/icons/protocols/${protocol.id || protocol.name.toLowerCase()}.png`
      }));
    }
  }
  
  console.warn('getAllProtocols not available in tokenlist or returned zero protocols, using example data');
  
  // Return some example protocols if the tokenlist doesn't provide any
  return [
    { id: 'uniswap', name: 'Uniswap', logoURI: '/icons/protocols/uniswap.png' },
    { id: 'aave', name: 'Aave', logoURI: '/icons/protocols/aave.png' },
    { id: 'compound', name: 'Compound', logoURI: '/icons/protocols/compound.png' },
    { id: 'sushiswap', name: 'SushiSwap', logoURI: '/icons/protocols/default.svg' },
    { id: 'curve', name: 'Curve', logoURI: '/icons/protocols/default.svg' },
    { id: 'balancer', name: 'Balancer', logoURI: '/icons/protocols/balancer.png' },
  ];
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
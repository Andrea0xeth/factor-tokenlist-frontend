import { Token, Protocol, Action } from '../types';
import { FactorTokenlist, BuildingBlock, ChainId, Protocols } from '@factordao/tokenlist';

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
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.TRANSFER]: 'Transfer',
  [BuildingBlock.CDP]: 'CDP',
  [BuildingBlock.GRANTREWARDS]: 'Grant Rewards',
  [BuildingBlock.ZAP]: 'Zap',
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
  
  // Initialize Pro Vaults for Arbitrum if that's the selected chain
  if (chainId === ChainId.ARBITRUM_ONE) {
    try {
      console.log('Initializing Pro Vaults for Arbitrum...');
      await instance.initializeProVaultsTokens();
    } catch (error) {
      console.warn('Failed to initialize Pro Vaults:', error);
    }
  }
  
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
  
  return convertedTokens;
}

// Function to convert from tokenlist Token to frontend Token format
function convertToken(token: any, chainId: number): Token {
  const tokenChainId = token.chainId || chainId;
  
  // Ensure building blocks are in the correct format
  const buildingBlocks = Array.isArray(token.extensions?.buildingBlocks) 
    ? token.extensions.buildingBlocks 
    : Array.isArray(token.buildingBlocks) 
      ? token.buildingBlocks 
      : [];
  
  // Ensure protocols are in the correct format
  const protocols = Array.isArray(token.extensions?.protocols) 
    ? token.extensions.protocols 
    : Array.isArray(token.protocols) 
      ? token.protocols 
      : [];
  
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
  
  try {
    // Get the tokenlist instance for this chain
    const tokenlist = await getTokenlistInstance(chainId);
    
    // Get all protocol IDs from the Protocols enum
    const protocolIds = Object.values(Protocols).filter(p => typeof p === 'string');
    
    // Create protocol objects for this chain
    const protocols: Protocol[] = [];
    
    // Check each protocol to see if it has tokens on this chain
    for (const protocolId of protocolIds) {
      try {
        // Try to get tokens for this protocol on this chain
        const methodName = `getTokensByProtocol`;
        
        if (typeof (tokenlist as any)[methodName] === 'function') {
          const protocolTokens = await (tokenlist as any)[methodName](protocolId);
          
          // If there are tokens, this protocol is supported on this chain
          if (protocolTokens && protocolTokens.length > 0) {
            protocols.push({
              id: protocolId.toLowerCase(),
              name: getProtocolLabel(protocolId),
              logoURI: `/icons/protocols/${protocolId.toLowerCase()}.png`,
              chainId: chainId
            });
            console.log(`Added protocol ${protocolId} with ${protocolTokens.length} tokens for chain ${chainId}`);
          }
        }
      } catch (error) {
        // If there's an error, this protocol might not be supported on this chain
        console.debug(`Protocol ${protocolId} not available for chain ${chainId}:`, error);
      }
    }
    
    // Add specific protocols based on chain
    if (chainId === ChainId.ARBITRUM_ONE) {
      // Check for Pro Vaults on Arbitrum
      try {
        const proVaultTokens = await (tokenlist as any).getAllProVaultsTokens();
        if (proVaultTokens && proVaultTokens.length > 0) {
          protocols.push({
            id: 'pro-vaults',
            name: 'Pro Vaults',
            logoURI: `/icons/protocols/default.svg`,
            chainId: chainId
          });
        }
      } catch (error) {
        console.debug('Pro Vaults not available:', error);
      }
    }
    
    console.log(`Retrieved ${protocols.length} protocols for chain ${chainId}`);
    
    if (protocols.length > 0) {
      return protocols;
    }
    
    console.warn(`No protocols found for chain ${chainId} from the NPM package, falling back to default methods`);
    
    // Fall back to checking for specific protocol methods if the above approach didn't work
    const protocolChecks = [
      { id: 'aave', methodName: 'getAllAaveTokens' },
      { id: 'compound', methodName: 'getAllCompoundTokens' },
      { id: 'pendle', methodName: 'getAllPendleTokens' },
      { id: 'silo', methodName: 'getAllSiloTokens' },
      { id: 'morpho', methodName: 'getAllMorphoTokens' }
    ];
    
    const fallbackProtocols: Protocol[] = [];
    
    for (const check of protocolChecks) {
      if (typeof (tokenlist as any)[check.methodName] === 'function') {
        try {
          const tokens = await (tokenlist as any)[check.methodName]();
          if (tokens && tokens.length > 0) {
            fallbackProtocols.push({
              id: check.id,
              name: getProtocolLabel(check.id),
              logoURI: `/icons/protocols/${check.id}.png`,
              chainId: chainId
            });
          }
        } catch (error) {
          console.debug(`Method ${check.methodName} not available:`, error);
        }
      }
    }
    
    // Add chain-specific protocols
    if (chainId === ChainId.ARBITRUM_ONE) {
      fallbackProtocols.push(
        { id: 'camelot', name: 'Camelot', logoURI: '/icons/protocols/camelot.png', chainId },
        { id: 'uniswap', name: 'Uniswap', logoURI: '/icons/protocols/uniswap.png', chainId }
      );
    } else if (chainId === ChainId.BASE) {
      fallbackProtocols.push(
        { id: 'aerodrome', name: 'Aerodrome', logoURI: '/icons/protocols/default.svg', chainId },
        { id: 'uniswap', name: 'Uniswap', logoURI: '/icons/protocols/uniswap.png', chainId }
      );
    } else if (chainId === ChainId.OPTIMISM) {
      fallbackProtocols.push(
        { id: 'velodrome', name: 'Velodrome', logoURI: '/icons/protocols/default.svg', chainId },
        { id: 'uniswap', name: 'Uniswap', logoURI: '/icons/protocols/uniswap.png', chainId }
      );
    }
    
    if (fallbackProtocols.length > 0) {
      return fallbackProtocols;
    }
  } catch (error) {
    console.error(`Error getting protocols for chain ${chainId}:`, error);
  }
  
  // Return a minimal set of protocols if everything else fails
  return [
    { id: 'uniswap', name: 'Uniswap', logoURI: '/icons/protocols/uniswap.png', chainId },
    { id: 'aave', name: 'Aave', logoURI: '/icons/protocols/aave.png', chainId },
    { id: 'compound', name: 'Compound', logoURI: '/icons/protocols/compound.png', chainId },
  ];
}

// Function to get available actions for a token on a specific protocol
export async function getActionsByTokenAndProtocol(
  tokenAddress: string,
  protocolId: string,
  chainId: number = ChainId.ARBITRUM_ONE
): Promise<Action[]> {
  console.log(`Getting actions for token ${tokenAddress} on protocol ${protocolId}...`);
  
  const tokenlist = await getTokenlistInstance(chainId);
  
  // First try to get the building blocks for this token
  try {
    // Try to get the token from the tokenlist
    const token = await (tokenlist as any).getTokenByAddress(tokenAddress);
    
    if (token) {
      // Extract building blocks
      const buildingBlocks = token.buildingBlocks || token.extensions?.buildingBlocks || [];
      
      // Convert building blocks to actions
      if (buildingBlocks.length > 0) {
        return buildingBlocks.map((block: BuildingBlock) => ({
          id: `${block}-${protocolId}`,
          name: buildingBlockToAction[block] || block,
          description: `${buildingBlockToAction[block] || block} with ${getProtocolLabel(protocolId)}`,
          buildingBlock: block,
          protocolId: protocolId,
          tokenAddress: tokenAddress
        }));
      }
    }
  } catch (error) {
    console.warn(`Error getting token by address: ${error}`);
  }
  
  // If there's no specific method or no building blocks, return an empty array
  console.warn('No actions found for token and protocol');
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
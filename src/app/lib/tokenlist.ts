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
  
  // Get all available method names on the tokenlist instance
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(tokenlist))
    .filter(name => typeof (tokenlist as any)[name] === 'function');
  
  console.log(`Available methods for chain ${chainId}:`, methodNames);
  
  // 1. Try specific protocol getter methods (getAllAaveTokens, getAllSiloTokens, etc.)
  const specificProtocolMethods = methodNames.filter(name => name.startsWith('getAll') && name.endsWith('Tokens'));
  for (const method of specificProtocolMethods) {
    // Extract protocol name from method name (e.g., "getAllAaveTokens" -> "aave")
    const protocolMatch = method.match(/^getAll(.+)Tokens$/);
    if (!protocolMatch) continue;
    
    const protocolId = protocolMatch[1].toLowerCase();
    if (addedProtocolIds.has(protocolId)) continue;
    
    try {
      console.log(`Testing for ${protocolId} tokens using ${method}...`);
      const tokens = await (tokenlist as any)[method]();
      
      if (tokens && tokens.length > 0) {
        protocols.push({
          id: protocolId,
          name: getProtocolLabel(protocolId),
          logoURI: `/icons/protocols/${protocolId}.png`,
          chainId
        });
        addedProtocolIds.add(protocolId);
        console.log(`✅ Added ${protocolId} protocol with ${tokens.length} tokens`);
      } else {
        console.log(`❌ No tokens found for ${protocolId} protocol`);
      }
    } catch (error) {
      console.log(`❌ Method ${method} failed:`, error);
    }
  }
  
  // 2. Try Pro Vaults specifically for Arbitrum
  if (chainId === ChainId.ARBITRUM_ONE && !addedProtocolIds.has('pro-vaults') && methodNames.includes('getAllProVaultsTokens')) {
    try {
      // Ensure Pro Vaults are initialized
      if (!initializedProVaults[chainId]) {
        console.log('Initializing Pro Vaults for Arbitrum...');
        await (tokenlist as any).initializeProVaultsTokens();
        initializedProVaults[chainId] = true;
      }
      
      console.log('Testing for Pro Vault tokens...');
      const tokens = await (tokenlist as any).getAllProVaultsTokens();
      
      if (tokens && tokens.length > 0) {
        protocols.push({
          id: 'pro-vaults',
          name: 'Pro Vaults',
          logoURI: `/icons/protocols/default.svg`,
          chainId
        });
        addedProtocolIds.add('pro-vaults');
        console.log(`✅ Added Pro-Vaults protocol with ${tokens.length} vaults`);
      } else {
        console.log('❌ No Pro Vault tokens found');
      }
    } catch (error) {
      console.log('❌ Pro Vaults method failed:', error);
    }
  }
  
  // 3. Try the Protocols enum if available in the package
  if (methodNames.includes('getTokensByProtocol')) {
    try {
      // Try to import the Protocols enum from the package
      // Cannot use static import inside a function - use dynamic import instead
      const { Protocols } = await import('@factordao/tokenlist');
      
      // Get all protocol values from the enum
      const protocolValues = Object.values(Protocols).filter(value => typeof value === 'string');
      console.log(`Found ${protocolValues.length} protocols in Protocols enum`);
      
      // Test each protocol to see if it has tokens on this chain
      for (const protocol of protocolValues) {
        const protocolId = typeof protocol === 'string' ? protocol.toLowerCase() : '';
        if (!protocolId || addedProtocolIds.has(protocolId)) continue;
        
        try {
          console.log(`Testing for ${protocolId} tokens using getTokensByProtocol...`);
          const tokens = await (tokenlist as any).getTokensByProtocol(protocol);
          
          if (tokens && tokens.length > 0) {
            protocols.push({
              id: protocolId,
              name: getProtocolLabel(protocolId),
              logoURI: `/icons/protocols/${protocolId}.png`,
              chainId
            });
            addedProtocolIds.add(protocolId);
            console.log(`✅ Added ${protocolId} protocol with ${tokens.length} tokens`);
          } else {
            console.log(`❌ No tokens found for ${protocolId} protocol`);
          }
        } catch (error) {
          console.log(`❌ getTokensByProtocol failed for ${protocolId}:`, error);
        }
      }
    } catch (error) {
      console.log('❌ Failed to use Protocols enum:', error);
      
      // If we can't import the Protocols enum, try with known protocol IDs
      const commonProtocolIds = [
        'aave', 'compound', 'pendle', 'silo', 'morpho', 
        'uniswap', 'balancer', 'camelot', 'velodrome', 'aerodrome', 'openocean'
      ];
      
      for (const id of commonProtocolIds) {
        if (addedProtocolIds.has(id)) continue;
        
        try {
          console.log(`Testing for ${id} tokens using getTokensByProtocol (common protocols)...`);
          // Try both upper and lowercase
          let tokens = null;
          
          try {
            tokens = await (tokenlist as any).getTokensByProtocol(id.toUpperCase());
          } catch (upperError) {
            try {
              tokens = await (tokenlist as any).getTokensByProtocol(id);
            } catch (lowerError) {
              console.log(`❌ Both case variants failed for ${id}`);
              continue;
            }
          }
          
          if (tokens && tokens.length > 0) {
            protocols.push({
              id,
              name: getProtocolLabel(id),
              logoURI: `/icons/protocols/${id}.png`,
              chainId
            });
            addedProtocolIds.add(id);
            console.log(`✅ Added ${id} protocol with ${tokens.length} tokens`);
          } else {
            console.log(`❌ No tokens found for ${id} protocol`);
          }
        } catch (error) {
          console.log(`❌ getTokensByProtocol failed for ${id}:`, error);
        }
      }
    }
  }
  
  // 4. Check if any tokens from getAllGeneralTokens belong to specific protocols
  try {
    const allTokens = await tokenlist.getAllGeneralTokens();
    console.log(`Examining ${allTokens.length} general tokens for protocol information...`);
    
    // Extract unique protocol IDs from the tokens
    const protocolIdsFromTokens = new Set<string>();
    for (const token of allTokens) {
      if (token.protocols && Array.isArray(token.protocols)) {
        token.protocols.forEach((p: string) => {
          if (typeof p === 'string') protocolIdsFromTokens.add(p.toLowerCase());
        });
      } 
      
      if (token.extensions?.protocols && Array.isArray(token.extensions.protocols)) {
        token.extensions.protocols.forEach((p: string) => {
          if (typeof p === 'string') protocolIdsFromTokens.add(p.toLowerCase());
        });
      }
    }
    
    console.log(`Found ${protocolIdsFromTokens.size} unique protocols in token metadata:`, [...protocolIdsFromTokens]);
    
    // Add protocols found in tokens that we haven't added yet
    for (const id of protocolIdsFromTokens) {
      if (!addedProtocolIds.has(id)) {
        protocols.push({
          id,
          name: getProtocolLabel(id),
          logoURI: `/icons/protocols/${id}.png`,
          chainId
        });
        addedProtocolIds.add(id);
        console.log(`✅ Added ${id} protocol found in general tokens`);
      }
    }
  } catch (error) {
    console.log('❌ Failed to extract protocols from general tokens:', error);
  }
  
  // Log found protocols
  console.log(`Found ${protocols.length} protocols for chain ${chainId}:`, 
    protocols.map(p => p.id).join(', '));
  
  if (protocols.length === 0) {
    console.warn(`No protocols were found for chain ${chainId} directly from NPM package!`);
  }
  
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
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
// Track which instances have already initialized Pro Vaults
const initializedProVaults: Record<number, boolean> = {};

// Function to get a FactorTokenlist instance for a given chain
async function getTokenlistInstance(chainId: number): Promise<FactorTokenlist> {
  if (tokenlistInstances[chainId]) {
    return tokenlistInstances[chainId];
  }

  console.log(`Initializing FactorTokenlist for chain ${chainId}...`);
  const instance = new FactorTokenlist(chainId);
  tokenlistInstances[chainId] = instance;
  
  // Pro Vaults are only available on Arbitrum
  if (chainId === ChainId.ARBITRUM_ONE && !initializedProVaults[chainId]) {
    try {
      console.log('Initializing Pro Vaults for Arbitrum...');
      await instance.initializeProVaultsTokens();
      initializedProVaults[chainId] = true;
      console.log('Pro Vaults initialization completed successfully');
    } catch (error) {
      console.warn('Failed to initialize Pro Vaults:', error);
    }
  }
  
  console.log(`FactorTokenlist initialized successfully for chain ${chainId}`);
  return instance;
}

// Function to get all available tokens
export async function getAllTokens(chainId: number = ChainId.ARBITRUM_ONE): Promise<Token[]> {
  console.log(`Requesting tokens for chain: ${chainId}...`);
  
  // Get the tokenlist instance for this chain
  const tokenlist = await getTokenlistInstance(chainId);
  
  // Create an array to collect all tokens
  let allTokens: any[] = [];
  
  try {
    // Get general tokens
    console.log(`Calling getAllGeneralTokens for chain ${chainId}...`);
    const generalTokens = await tokenlist.getAllGeneralTokens();
    // Filter out invalid tokens (without address)
    const validGeneralTokens = generalTokens.filter(token => !!token.address);
    allTokens = [...validGeneralTokens];
    console.log(`Received ${generalTokens.length} general tokens, ${validGeneralTokens.length} valid for chain ${chainId}`);
    
    // Try to get specialized tokens based on protocols
    
    // 1. SILO tokens (available on multiple chains)
    try {
      const siloTokens = await tokenlist.getAllSiloTokens();
      if (siloTokens && siloTokens.length > 0) {
        // Process SILO tokens which have a special structure
        const processedSiloTokens = siloTokens.flatMap(market => {
          // Each market has multiple assets
          return market.asset.map(asset => {
            // For each asset, add both collateral and debt tokens
            return [
              // Only create tokens if addresses exist
              ...(asset.collateralToken.address ? [{
                address: asset.collateralToken.address,
                name: asset.collateralToken.name,
                symbol: asset.collateralToken.symbol,
                decimals: asset.collateralToken.decimals,
                chainId: chainId,
                protocols: [Protocols.SILO],
                buildingBlocks: [BuildingBlock.LEND, BuildingBlock.DEPOSIT],
                extensions: {
                  protocols: [Protocols.SILO],
                  buildingBlocks: [BuildingBlock.LEND, BuildingBlock.DEPOSIT],
                  marketInfo: {
                    marketName: market.marketName,
                    marketAddress: market.marketAddress,
                    assetType: 'collateral'
                  }
                }
              }] : []),
              ...(asset.debtToken.address ? [{
                address: asset.debtToken.address,
                name: asset.debtToken.name,
                symbol: asset.debtToken.symbol,
                decimals: asset.debtToken.decimals,
                chainId: chainId,
                protocols: [Protocols.SILO],
                buildingBlocks: [BuildingBlock.BORROW],
                extensions: {
                  protocols: [Protocols.SILO],
                  buildingBlocks: [BuildingBlock.BORROW],
                  marketInfo: {
                    marketName: market.marketName,
                    marketAddress: market.marketAddress,
                    assetType: 'debt'
                  }
                }
              }] : [])
            ];
          });
        }).flat();
        
        allTokens = [...allTokens, ...processedSiloTokens];
        console.log(`Added ${processedSiloTokens.length} SILO tokens for chain ${chainId}`);
      }
    } catch (error) {
      console.warn(`Failed to load SILO tokens for chain ${chainId}:`, error);
    }
    
    // 2. Pro Vaults (only on Arbitrum)
    if (chainId === ChainId.ARBITRUM_ONE && initializedProVaults[chainId]) {
      try {
        const proVaultTokens = await tokenlist.getAllProVaultsTokens();
        if (proVaultTokens && proVaultTokens.length > 0) {
          // Process Pro Vault tokens
          const processedProVaultTokens = proVaultTokens
            .filter(vault => !!vault.vaultAddress) // Filter out vaults without addresses
            .map(vault => ({
              address: vault.vaultAddress,
              name: vault.name,
              symbol: vault.symbol,
              decimals: vault.decimals || 18,
              chainId: chainId,
              protocols: ['pro-vaults'],
              buildingBlocks: [BuildingBlock.DEPOSIT, BuildingBlock.WITHDRAW],
              logoURI: vault.logoURI,
              extensions: {
                protocols: ['pro-vaults'],
                buildingBlocks: [BuildingBlock.DEPOSIT, BuildingBlock.WITHDRAW],
                vaultInfo: {
                  vaultAddress: vault.vaultAddress,
                  strategyAddress: vault.strategyAddress,
                  depositToken: vault.depositToken,
                  apy: vault.apy,
                  deprecated: vault.deprecated
                }
              }
            }));
          
          allTokens = [...allTokens, ...processedProVaultTokens];
          console.log(`Added ${processedProVaultTokens.length} Pro Vault tokens for chain ${chainId}`);
        }
      } catch (error) {
        console.warn('Failed to load Pro Vault tokens:', error);
      }
    }
    
    // Add more specialized tokens here if needed
    
  } catch (error) {
    console.error(`Error fetching tokens for chain ${chainId}:`, error);
  }
  
  // Log invalid tokens for debugging
  const invalidTokens = allTokens.filter(token => !token.address);
  if (invalidTokens.length > 0) {
    console.warn(`Found ${invalidTokens.length} tokens without addresses:`, invalidTokens);
  }
  
  // Filter out invalid tokens before conversion
  const validTokens = allTokens.filter(token => !!token.address);
  
  // Convert tokens to the format required by the frontend
  const convertedTokens = validTokens.map((token: any) => convertToken(token, chainId));
  
  // Remove duplicates by address (keeping the most detailed version)
  const uniqueTokens = removeDuplicateTokens(convertedTokens);
  
  console.log(`Total of ${uniqueTokens.length} unique tokens for chain ${chainId}`);
  return uniqueTokens;
}

// Function to remove duplicate tokens, keeping the most informative one
function removeDuplicateTokens(tokens: Token[]): Token[] {
  const addressMap = new Map<string, Token>();
  
  for (const token of tokens) {
    // Skip tokens without an address
    if (!token.address) {
      console.warn('Found token without address:', token);
      continue;
    }
    
    const key = `${token.chainId}-${token.address.toLowerCase()}`;
    if (!addressMap.has(key) || 
        (token.extensions && Object.keys(token.extensions).length > 0) ||
        (token.buildingBlocks && token.buildingBlocks.length > 0)) {
      addressMap.set(key, token);
    }
  }
  
  return Array.from(addressMap.values());
}

// Function to convert from tokenlist Token to frontend Token format
function convertToken(token: any, chainId: number): Token {
  // Skip tokens that don't have an address
  if (!token.address) {
    console.warn('Skipping token without address:', token);
    return {
      address: '0x0000000000000000000000000000000000000000', // Default address
      chainId: token.chainId || chainId,
      name: token.name || 'Unknown Token',
      symbol: token.symbol || 'UNKNOWN',
      decimals: token.decimals || 18,
      logoURI: token.logoURI || `/icons/tokens/UNKNOWN.png`,
      tags: token.tags || [],
      protocols: [],
      buildingBlocks: [],
      extensions: { isInvalid: true }
    };
  }

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
    name: token.name || 'Unknown Token',
    symbol: token.symbol || 'UNKNOWN',
    decimals: token.decimals || 18,
    logoURI: token.logoURI || `/icons/tokens/${(token.symbol || 'UNKNOWN').toUpperCase()}.png`,
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
  
  // Define complete protocol lists for each chain
  const chainProtocols: Record<number, string[]> = {
    // Arbitrum protocols
    [ChainId.ARBITRUM_ONE]: [
      'aave', 'compound', 'pendle', 'silo', 'morpho', 'pro-vaults',
      'gmx', 'camelot', 'uniswap', 'balancer', 'mux', 'gns',
      'openocean', 'penpie', 'pirex', 'umami', 'vlp'
    ],
    // Optimism protocols
    [ChainId.OPTIMISM]: [
      'aave', 'compound', 'pendle', 'silo', 'morpho',
      'uniswap', 'velodrome', 'openocean'
    ],
    // Base protocols
    [ChainId.BASE]: [
      'aave', 'compound', 'pendle', 'silo', 'morpho',
      'aerodrome', 'openocean', 'uniswap'
    ]
  };
  
  try {
    // Get the tokenlist instance for this chain
    const tokenlist = await getTokenlistInstance(chainId);
    
    // Create a set to track protocols we've added
    const addedProtocolIds = new Set<string>();
    
    // Get all protocol IDs from the Protocols enum
    const protocolIds = Object.values(Protocols).filter(p => typeof p === 'string');
    
    // Create protocol objects for this chain
    const protocols: Protocol[] = [];
    
    // First, check each protocol defined in the tokenlist Protocols enum
    for (const protocolId of protocolIds) {
      try {
        // Try to get tokens for this protocol on this chain
        const methodName = `getTokensByProtocol`;
        
        if (typeof (tokenlist as any)[methodName] === 'function') {
          const protocolTokens = await (tokenlist as any)[methodName](protocolId);
          
          // If there are tokens, this protocol is supported on this chain
          if (protocolTokens && protocolTokens.length > 0) {
            const id = protocolId.toLowerCase();
            if (!addedProtocolIds.has(id)) {
              protocols.push({
                id: id,
                name: getProtocolLabel(protocolId),
                logoURI: `/icons/protocols/${id}.png`,
                chainId: chainId
              });
              addedProtocolIds.add(id);
              console.log(`Added protocol ${protocolId} with ${protocolTokens.length} tokens for chain ${chainId}`);
            }
          }
        }
      } catch (error) {
        // If there's an error, this protocol might not be supported on this chain
        console.debug(`Protocol ${protocolId} not available for chain ${chainId}:`, error);
      }
    }
    
    // Check for protocols with specific methods
    const specificMethodProtocols = [
      { id: 'aave', methodName: 'getAllAaveTokens' },
      { id: 'compound', methodName: 'getAllCompoundTokens' },
      { id: 'pendle', methodName: 'getAllPendleTokens' },
      { id: 'silo', methodName: 'getAllSiloTokens' },
      { id: 'morpho', methodName: 'getAllMorphoTokens' }
    ];
    
    for (const protocol of specificMethodProtocols) {
      if (!addedProtocolIds.has(protocol.id) && typeof (tokenlist as any)[protocol.methodName] === 'function') {
        try {
          const tokens = await (tokenlist as any)[protocol.methodName]();
          if (tokens && tokens.length > 0) {
            protocols.push({
              id: protocol.id,
              name: getProtocolLabel(protocol.id),
              logoURI: `/icons/protocols/${protocol.id}.png`,
              chainId: chainId
            });
            addedProtocolIds.add(protocol.id);
            console.log(`Added protocol ${protocol.id} using ${protocol.methodName} with ${tokens.length} tokens for chain ${chainId}`);
          }
        } catch (error) {
          console.debug(`Method ${protocol.methodName} not available:`, error);
        }
      }
    }
    
    // Check for SILO tokens using the specialized method
    if (!addedProtocolIds.has('silo')) {
      try {
        const siloTokens = await tokenlist.getAllSiloTokens();
        if (siloTokens && siloTokens.length > 0) {
          protocols.push({
            id: 'silo',
            name: 'Silo',
            logoURI: '/icons/protocols/silo.png',
            chainId: chainId
          });
          addedProtocolIds.add('silo');
          console.log(`Added SILO protocol with ${siloTokens.length} markets for chain ${chainId}`);
        }
      } catch (error) {
        console.debug(`SILO tokens not available for chain ${chainId}:`, error);
      }
    }
    
    // Check for Pro Vaults on Arbitrum
    if (!addedProtocolIds.has('pro-vaults') && chainId === ChainId.ARBITRUM_ONE && initializedProVaults[chainId]) {
      try {
        const proVaultTokens = await tokenlist.getAllProVaultsTokens();
        if (proVaultTokens && proVaultTokens.length > 0) {
          protocols.push({
            id: 'pro-vaults',
            name: 'Pro Vaults',
            logoURI: `/icons/protocols/default.svg`,
            chainId: chainId
          });
          addedProtocolIds.add('pro-vaults');
          console.log(`Added Pro-Vaults protocol with ${proVaultTokens.length} vaults for chain ${chainId}`);
        }
      } catch (error) {
        console.debug('Pro Vaults not available:', error);
      }
    }
    
    // Add the remaining protocols for this chain from the predefined list
    const predefinedProtocols = chainProtocols[chainId] || [];
    for (const protocolId of predefinedProtocols) {
      if (!addedProtocolIds.has(protocolId)) {
        protocols.push({
          id: protocolId,
          name: getProtocolLabel(protocolId),
          logoURI: `/icons/protocols/${protocolId}.png`,
          chainId: chainId
        });
        addedProtocolIds.add(protocolId);
        console.log(`Added predefined protocol ${protocolId} for chain ${chainId}`);
      }
    }
    
    console.log(`Retrieved ${protocols.length} protocols for chain ${chainId}`);
    
    return protocols;
  } catch (error) {
    console.error(`Error getting protocols for chain ${chainId}:`, error);
    
    // Return the complete list of protocols for this chain as fallback
    const fallbackProtocols = (chainProtocols[chainId] || []).map(id => ({
      id,
      name: getProtocolLabel(id),
      logoURI: `/icons/protocols/${id}.png`,
      chainId
    }));
    
    console.log(`Returning ${fallbackProtocols.length} fallback protocols for chain ${chainId}`);
    return fallbackProtocols;
  }
}

// Function to get available actions for a token on a specific protocol
export async function getActionsByTokenAndProtocol(
  tokenAddress: string,
  protocolId: string,
  chainId: number = ChainId.ARBITRUM_ONE
): Promise<Action[]> {
  console.log(`Getting actions for token ${tokenAddress} on protocol ${protocolId}...`);
  
  const tokenlist = await getTokenlistInstance(chainId);
  
  // Special handling for SILO protocol
  if (protocolId.toLowerCase() === 'silo') {
    try {
      const siloTokens = await tokenlist.getAllSiloTokens();
      
      // Find which SILO market this token belongs to
      for (const market of siloTokens) {
        for (const asset of market.asset) {
          // Check if this token is a collateral token
          if (asset.collateralToken.address.toLowerCase() === tokenAddress.toLowerCase()) {
            return [
              {
                id: `lend-silo-${market.marketAddress}`,
                name: 'Supply',
                description: `Supply ${asset.collateralToken.symbol} to Silo market ${market.marketName}`,
                buildingBlock: BuildingBlock.LEND,
                protocolId: protocolId,
                tokenAddress: tokenAddress
              },
              {
                id: `deposit-silo-${market.marketAddress}`,
                name: 'Deposit',
                description: `Deposit ${asset.collateralToken.symbol} as collateral in Silo market ${market.marketName}`,
                buildingBlock: BuildingBlock.DEPOSIT,
                protocolId: protocolId,
                tokenAddress: tokenAddress
              }
            ];
          }
          
          // Check if this token is a debt token
          if (asset.debtToken.address.toLowerCase() === tokenAddress.toLowerCase()) {
            return [
              {
                id: `borrow-silo-${market.marketAddress}`,
                name: 'Borrow',
                description: `Borrow ${asset.debtToken.symbol} from Silo market ${market.marketName}`,
                buildingBlock: BuildingBlock.BORROW,
                protocolId: protocolId,
                tokenAddress: tokenAddress
              }
            ];
          }
        }
      }
    } catch (error) {
      console.warn(`Error getting SILO actions for token ${tokenAddress}:`, error);
    }
  }
  
  // Special handling for Pro Vaults (Arbitrum only)
  if (protocolId.toLowerCase() === 'pro-vaults' && chainId === ChainId.ARBITRUM_ONE) {
    try {
      if (initializedProVaults[chainId]) {
        const proVaultTokens = await tokenlist.getAllProVaultsTokens();
        
        // Find the vault this token belongs to
        const vault = proVaultTokens.find(v => 
          v.vaultAddress.toLowerCase() === tokenAddress.toLowerCase()
        );
        
        if (vault) {
          const actions = [
            {
              id: `deposit-provault-${vault.vaultAddress}`,
              name: 'Deposit',
              description: `Deposit ${vault.depositToken.symbol} into ${vault.name} vault`,
              buildingBlock: BuildingBlock.DEPOSIT,
              protocolId: protocolId,
              tokenAddress: tokenAddress,
              apy: vault.apy
            },
            {
              id: `withdraw-provault-${vault.vaultAddress}`,
              name: 'Withdraw',
              description: `Withdraw ${vault.depositToken.symbol} from ${vault.name} vault`,
              buildingBlock: BuildingBlock.WITHDRAW,
              protocolId: protocolId,
              tokenAddress: tokenAddress
            }
          ];
          
          return actions;
        }
      }
    } catch (error) {
      console.warn(`Error getting Pro Vault actions for token ${tokenAddress}:`, error);
    }
  }
  
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
  // Special cases
  if (protocolId.toLowerCase() === 'pro-vaults') {
    return 'Pro Vaults';
  }
  
  // Return a more user-friendly protocol name
  // This replaces hyphens and underscores with spaces and capitalizes each word
  return protocolId
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
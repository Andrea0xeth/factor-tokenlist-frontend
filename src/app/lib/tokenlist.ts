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

// Interface for Pro Vault tokens from the tokenlist
interface ProVaultToken {
  vaultAddress: string;
  name: string;
  symbol: string;
  decimals?: number;
  logoURI?: string;
  strategyAddress?: string;
  depositToken?: string;
  apy?: number;
  deprecated?: boolean;
}

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
  
  // Initialize Pro Vaults for Arbitrum
  if (chainId === ChainId.ARBITRUM_ONE) {
    try {
      console.log('Initializing Pro Vaults for Arbitrum...');
      await instance.initializeProVaultsTokens();
      initializedProVaults[chainId] = true;
      console.log('Pro Vaults initialization successful');
    } catch (error) {
      console.warn('Failed to initialize Pro Vaults:', error);
    }
  }
  
  console.log(`FactorTokenlist initialized successfully for chain ${chainId}`);
  return instance;
}

// Function to get all available tokens
export async function getAllTokens(chainId: number = ChainId.ARBITRUM_ONE): Promise<Token[]> {
  console.log(`🔍 Requesting tokens for chain: ${chainId}...`);
  
  // Get the tokenlist instance for this chain
  const tokenlist = await getTokenlistInstance(chainId);
  
  // Create an array to collect all tokens
  let allTokens: any[] = [];
  
  // Retrieve general tokens from the tokenlist
  console.log(`📋 Calling getAllGeneralTokens for chain ${chainId}...`);
  const generalTokens = await tokenlist.getAllGeneralTokens();
  allTokens = [...generalTokens];
  console.log(`📊 Received ${generalTokens.length} general tokens for chain ${chainId}`);

  // Debug: Log method names to see available protocol-specific methods
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(tokenlist))
    .filter(name => typeof (tokenlist as any)[name] === 'function');
  console.log('🕵️ Available methods:', methodNames);

  // Define all protocol-specific methods that could be available
  // List all possible protocol getter methods
  const standardProtocolMethods = [
    { method: 'getAllAaveTokens', protocolId: 'aave' },
    { method: 'getAllCompoundTokens', protocolId: 'compound' },
    { method: 'getAllMorphoTokens', protocolId: 'morpho' },
    { method: 'getAllUniswapTokens', protocolId: 'uniswap' },
    { method: 'getAllBalancerTokens', protocolId: 'balancer' },
    { method: 'getAllCamelotTokens', protocolId: 'camelot' },
    { method: 'getAllVelodromeTokens', protocolId: 'velodrome' },
    { method: 'getAllAerodromeTokens', protocolId: 'aerodrome' },
    { method: 'getAllOpenoceanTokens', protocolId: 'openocean' }
  ];

  // Process standard protocol methods
  for (const { method, protocolId } of standardProtocolMethods) {
    if (methodNames.includes(method)) {
      try {
        console.log(`📊 Calling ${method} for chain ${chainId}...`);
        const protocolTokens = await (tokenlist as any)[method]();
        
        if (protocolTokens && protocolTokens.length > 0) {
          // Convert tokens to our format with appropriate protocol tags
          const processedTokens = protocolTokens.map((token: any) => {
            const convertedToken = convertToken(token, chainId);
            // Ensure the protocol is correctly tagged
            return {
              ...convertedToken,
              protocols: [...(convertedToken.protocols || []), protocolId],
              extensions: {
                ...(convertedToken.extensions || {}),
                protocols: [...(convertedToken.extensions?.protocols || []), protocolId]
              }
            };
          });
          
          allTokens = [...allTokens, ...processedTokens];
          console.log(`✅ Added ${processedTokens.length} ${protocolId.toUpperCase()} tokens`);
        } else {
          console.log(`⚠️ No tokens returned from ${method}`);
        }
      } catch (error) {
        console.warn(`❌ Error calling ${method}:`, error);
      }
    } else {
      console.log(`ℹ️ Method ${method} not available for ${protocolId}`);
    }
  }

  // Specific protocol token retrieval methods with enhanced handling
  const complexProtocolMethods = [
    { 
      method: 'getAllPendleTokens', 
      name: 'PENDLE',
      processTokens: (tokens: any[]) => {
        // Process Pendle tokens to extract all relevant token types
        const processedPendleTokens: Token[] = [];
        tokens.forEach(pendleToken => {
          // Add Principal Token (PT)
          if (pendleToken.pt) {
            processedPendleTokens.push({
              ...convertToken(pendleToken.pt, chainId),
              protocols: ['pendle', 'pt'],
              buildingBlocks: [BuildingBlock.PROVIDE_LIQUIDITY],
              extensions: {
                protocols: ['pendle', 'pt'],
                buildingBlocks: [BuildingBlock.PROVIDE_LIQUIDITY],
                pendleTokenType: 'PT',
                expiry: pendleToken.expiry
              }
            });
          }
          
          // Add Yield Token (YT)
          if (pendleToken.yt) {
            processedPendleTokens.push({
              ...convertToken(pendleToken.yt, chainId),
              protocols: ['pendle', 'yt'],
              buildingBlocks: [BuildingBlock.PROVIDE_LIQUIDITY],
              extensions: {
                protocols: ['pendle', 'yt'],
                buildingBlocks: [BuildingBlock.PROVIDE_LIQUIDITY],
                pendleTokenType: 'YT',
                expiry: pendleToken.expiry
              }
            });
          }
          
          // Add Liquidity Pool Token (LP)
          if (pendleToken.lp) {
            processedPendleTokens.push({
              ...convertToken(pendleToken.lp, chainId),
              protocols: ['pendle', 'lp'],
              buildingBlocks: [
                BuildingBlock.PROVIDE_LIQUIDITY, 
                BuildingBlock.REMOVE_LIQUIDITY
              ],
              extensions: {
                protocols: ['pendle', 'lp'],
                buildingBlocks: [
                  BuildingBlock.PROVIDE_LIQUIDITY, 
                  BuildingBlock.REMOVE_LIQUIDITY
                ],
                pendleTokenType: 'LP',
                expiry: pendleToken.expiry
              }
            });
          }
        });
        return processedPendleTokens;
      }
    },
    { 
      method: 'getAllSiloTokens', 
      name: 'SILO',
      processTokens: (tokens: any[]) => {
        // Process Silo tokens to extract all relevant token types
        const processedSiloTokens: Token[] = [];
        tokens.forEach(siloMarket => {
          // Process each asset in the Silo market
          siloMarket.asset.forEach((asset: any) => {
            // Underlying Asset
            if (asset.underlyingAsset) {
              processedSiloTokens.push({
                ...convertToken(asset.underlyingAsset, chainId),
                protocols: ['silo', 'underlying'],
                buildingBlocks: [
                  BuildingBlock.LEND, 
                  BuildingBlock.BORROW
                ],
                extensions: {
                  protocols: ['silo', 'underlying'],
                  buildingBlocks: [
                    BuildingBlock.LEND, 
                    BuildingBlock.BORROW
                  ],
                  siloMarketName: siloMarket.marketName,
                  siloMarketAddress: siloMarket.marketAddress,
                  siloTokenType: 'UNDERLYING'
                }
              });
            }
            
            // Debt Token
            if (asset.debtToken) {
              processedSiloTokens.push({
                ...convertToken(asset.debtToken, chainId),
                protocols: ['silo', 'debt'],
                buildingBlocks: [
                  BuildingBlock.BORROW, 
                  BuildingBlock.REPAY
                ],
                extensions: {
                  protocols: ['silo', 'debt'],
                  buildingBlocks: [
                    BuildingBlock.BORROW, 
                    BuildingBlock.REPAY
                  ],
                  siloMarketName: siloMarket.marketName,
                  siloMarketAddress: siloMarket.marketAddress,
                  siloTokenType: 'DEBT'
                }
              });
            }
            
            // Collateral Token
            if (asset.collateralToken) {
              processedSiloTokens.push({
                ...convertToken(asset.collateralToken, chainId),
                protocols: ['silo', 'collateral'],
                buildingBlocks: [
                  BuildingBlock.LEND, 
                  BuildingBlock.WITHDRAW
                ],
                extensions: {
                  protocols: ['silo', 'collateral'],
                  buildingBlocks: [
                    BuildingBlock.LEND, 
                    BuildingBlock.WITHDRAW
                  ],
                  siloMarketName: siloMarket.marketName,
                  siloMarketAddress: siloMarket.marketAddress,
                  siloTokenType: 'COLLATERAL'
                }
              });
            }
            
            // Collateral Only Token
            if (asset.collateralOnlyToken) {
              processedSiloTokens.push({
                ...convertToken(asset.collateralOnlyToken, chainId),
                protocols: ['silo', 'collateral-only'],
                buildingBlocks: [
                  BuildingBlock.LEND, 
                  BuildingBlock.WITHDRAW
                ],
                extensions: {
                  protocols: ['silo', 'collateral-only'],
                  buildingBlocks: [
                    BuildingBlock.LEND, 
                    BuildingBlock.WITHDRAW
                  ],
                  siloMarketName: siloMarket.marketName,
                  siloMarketAddress: siloMarket.marketAddress,
                  siloTokenType: 'COLLATERAL_ONLY'
                }
              });
            }
          });
        });
        return processedSiloTokens;
      }
    }
  ];

  // Retrieve and process specific protocol tokens
  for (const { method, name, processTokens } of complexProtocolMethods) {
    if (methodNames.includes(method)) {
      try {
        console.log(`🔬 Attempting to retrieve ${name} tokens using ${method}...`);
        const tokens = await (tokenlist as any)[method]();
        
        if (tokens && tokens.length > 0) {
          const processedTokens = processTokens(tokens);
          console.log(`✅ Found and processed ${processedTokens.length} ${name} tokens`);
          allTokens.push(...processedTokens);
        } else {
          console.log(`❌ No ${name} tokens found`);
        }
      } catch (error) {
        console.warn(`❗ Error retrieving ${name} tokens:`, error);
      }
    } else {
      console.log(`❓ Method ${method} not found for ${name} tokens`);
    }
  }
  
  // Get Pro Vaults for Arbitrum - special handling as they need initialization
  if (chainId === ChainId.ARBITRUM_ONE) {
    try {
      // Ensure Pro Vaults are initialized
      if (!initializedProVaults[chainId]) {
        console.log('🏦 Initializing Pro Vaults for Arbitrum...');
        await tokenlist.initializeProVaultsTokens();
        initializedProVaults[chainId] = true;
      }
      
      console.log('🏦 Getting Pro Vault tokens...');
      const proVaultTokens = await tokenlist.getAllProVaultsTokens() as unknown as ProVaultToken[];
      
      if (proVaultTokens && proVaultTokens.length > 0) {
        // Process Pro Vault tokens to match our format
        const processedProVaultTokens = proVaultTokens.map((vault: ProVaultToken) => ({
          address: vault.vaultAddress,
          name: vault.name,
          symbol: vault.symbol,
          decimals: vault.decimals || 18,
          chainId: chainId,
          protocols: ['pro-vaults'],
          buildingBlocks: [BuildingBlock.DEPOSIT, BuildingBlock.WITHDRAW],
          logoURI: vault.logoURI,
          vaultAddress: vault.vaultAddress,
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
        console.log(`🏦 Added ${processedProVaultTokens.length} Pro Vault tokens`);
      } else {
        console.log('🏦 No Pro Vault tokens found');
      }
    } catch (error) {
      console.warn('🚨 Failed to load Pro Vault tokens:', error);
    }
  }
  
  // Convert tokens to the format required by the frontend
  const processedTokens = allTokens.map((token: any) => convertToken(token, chainId));

  // Debug: Log processed tokens
  console.log(`🎉 Total processed tokens: ${processedTokens.length}`);
  console.log('🔍 Processed token protocols:', 
    [...new Set(processedTokens.flatMap(t => t.protocols))]
  );

  return processedTokens;
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
    ...(token.vaultAddress && { vaultAddress: token.vaultAddress }),
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

// Function to get a protocol logo URI with proper fallbacks
function getProtocolLogoURI(protocolId: string): string {
  return `/icons/protocols/${protocolId.toLowerCase()}.png`;
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
  
  // Define all known protocols we want to check
  const protocolsToCheck = [
    // DEXes
    { id: 'uniswap', method: 'getAllUniswapTokens' },
    { id: 'balancer', method: 'getAllBalancerTokens' },
    { id: 'camelot', method: 'getAllCamelotTokens' },
    { id: 'velodrome', method: 'getAllVelodromeTokens' },
    { id: 'aerodrome', method: 'getAllAerodromeTokens' },
    { id: 'openocean', method: 'getAllOpenoceanTokens' },
    // Lending
    { id: 'aave', method: 'getAllAaveTokens' },
    { id: 'compound', method: 'getAllCompoundTokens' },
    { id: 'morpho', method: 'getAllMorphoTokens' },
    { id: 'silo', method: 'getAllSiloTokens' },
    // Yield
    { id: 'pendle', method: 'getAllPendleTokens' },
    // Pro Vaults is handled separately
  ];
  
  // 1. Check all known protocols with their specific methods
  for (const { id, method } of protocolsToCheck) {
    if (addedProtocolIds.has(id)) continue; // Skip if already added
    
    // Skip protocols that we know don't exist on certain chains
    if ((chainId === ChainId.OPTIMISM && ['balancer', 'camelot', 'aerodrome'].includes(id)) ||
        (chainId === ChainId.BASE && ['balancer', 'camelot', 'velodrome'].includes(id)) ||
        (chainId === ChainId.ARBITRUM_ONE && ['velodrome', 'aerodrome'].includes(id))) {
      console.log(`⏩ Skipping ${id} for chain ${chainId} - known to be unavailable`);
      continue;
    }
    
    if (methodNames.includes(method)) {
      try {
        console.log(`Testing for ${id} tokens using ${method}...`);
        const tokens = await (tokenlist as any)[method]();
        
        if (tokens && tokens.length > 0) {
          protocols.push({
            id,
            name: getProtocolLabel(id),
            logoURI: getProtocolLogoURI(id),
            chainId
          });
          addedProtocolIds.add(id);
          console.log(`✅ Added ${id} protocol with ${tokens.length} tokens`);
        } else {
          console.log(`❌ No tokens found for ${id} protocol`);
        }
      } catch (error) {
        console.log(`❌ Method ${method} failed:`, error);
      }
    } else {
      console.log(`⚠️ Method ${method} not found for ${id}`);
      
      // Try with getTokensByProtocol as fallback for protocols without dedicated methods
      if (methodNames.includes('getTokensByProtocol')) {
        try {
          console.log(`Trying fallback with getTokensByProtocol for ${id}...`);
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
              logoURI: getProtocolLogoURI(id),
              chainId
            });
            addedProtocolIds.add(id);
            console.log(`✅ Added ${id} protocol with ${tokens.length} tokens using getTokensByProtocol`);
          } else {
            console.log(`❌ No tokens found for ${id} protocol using getTokensByProtocol`);
          }
        } catch (error) {
          console.log(`❌ getTokensByProtocol failed for ${id}:`, error);
        }
      }
    }
  }
  
  // 2. Try Pro Vaults specifically for Arbitrum
  if (chainId === ChainId.ARBITRUM_ONE && !addedProtocolIds.has('pro-vaults')) {
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
          logoURI: getProtocolLogoURI('pro-vaults'),
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
              logoURI: getProtocolLogoURI(protocolId),
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
    }
  }
  
  // 4. Extract protocols from all tokens
  try {
    console.log('Extracting protocols from all tokens...');
    // Try to get all tokens using an empty protocols array
    const tokens = await tokenlist.getTokens([]);
    const protocolIdsFromTokens = new Set<string>();
    
    for (const token of tokens) {
      if (token.protocols && Array.isArray(token.protocols)) {
        token.protocols.forEach((p: string) => {
          if (typeof p === 'string') protocolIdsFromTokens.add(p.toLowerCase());
        });
      } 
      
      // Use safe type assertions for extensions
      const tokenWithExtensions = token as unknown as { extensions?: { protocols?: string[] } };
      if (tokenWithExtensions.extensions?.protocols && Array.isArray(tokenWithExtensions.extensions.protocols)) {
        tokenWithExtensions.extensions.protocols.forEach((p: string) => {
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
          logoURI: getProtocolLogoURI(id),
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
  
  // Filter protocols to ensure we only return those appropriate for the current chain
  const filteredProtocols = filterProtocolsByChainAvailability(protocols, chainId);
  console.log(`After chain availability filtering: ${filteredProtocols.length} protocols`);
  
  return filteredProtocols;
}

// Function to filter protocols based on chain-specific availability
function filterProtocolsByChainAvailability(protocols: Protocol[], chainId: number): Protocol[] {
  // Define chain-specific protocols 
  const chainProtocols: Record<number, string[]> = {
    [ChainId.ARBITRUM_ONE]: ['aave', 'compound', 'pendle', 'silo', 'pro-vaults', 'camelot', 'uniswap', 'balancer', 'openocean'],
    [ChainId.OPTIMISM]: ['aave', 'compound', 'pendle', 'silo', 'morpho', 'uniswap', 'velodrome', 'openocean'],
    [ChainId.BASE]: ['aave', 'compound', 'pendle', 'silo', 'morpho', 'aerodrome', 'openocean']
  };
  
  // If we don't have chain-specific protocols, return all
  if (!chainProtocols[chainId]) return protocols;
  
  // Filter protocols based on chain availability
  return protocols.filter(protocol => {
    return chainProtocols[chainId].includes(protocol.id.toLowerCase());
  });
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
      buildingBlock: action.buildingBlock || BuildingBlock.LEND,
      protocolId: protocolId,
      tokenAddress: tokenId,
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

// Function to get protocols filtered by chain
export function filterProtocolsByChain(protocols: Protocol[], chainId: number): Protocol[] {
  console.log(`Filtering ${protocols.length} protocols for chain ${chainId}`);
  const filtered = protocols.filter(p => !p.chainId || p.chainId === chainId);
  console.log(`Filtered protocols for chain ${chainId}:`, filtered.map(p => p.id).join(', '));
  return filtered;
}
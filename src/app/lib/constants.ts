import { ChainId } from '@factordao/tokenlist';

/**
 * Required protocols for each chain.
 * These are guaranteed to be included even if they're not found dynamically.
 */
export const REQUIRED_PROTOCOLS: Record<number, string[]> = {
  // Arbitrum protocols
  [ChainId.ARBITRUM_ONE]: [
    'aave', 'compound', 'pendle', 'silo', 'pro-vaults', 
    'camelot', 'uniswap', 'balancer', 'openocean'
  ],
  // Optimism protocols
  [ChainId.OPTIMISM]: [
    'aave', 'compound', 'pendle', 'silo', 'morpho', 
    'uniswap', 'velodrome', 'openocean'
  ],
  // Base protocols
  [ChainId.BASE]: [
    'aave', 'compound', 'pendle', 'silo', 'morpho', 
    'aerodrome', 'openocean'
  ]
};

/**
 * Map protocol IDs to their friendly display names
 */
export const PROTOCOL_DISPLAY_NAMES: Record<string, string> = {
  'aave': 'Aave',
  'compound': 'Compound',
  'pendle': 'Pendle',
  'silo': 'Silo',
  'morpho': 'Morpho',
  'pro-vaults': 'Pro Vaults',
  'camelot': 'Camelot',
  'uniswap': 'Uniswap',
  'balancer': 'Balancer',
  'openocean': 'OpenOcean',
  'velodrome': 'Velodrome',
  'aerodrome': 'Aerodrome'
};

/**
 * Map protocol IDs to their logo URLs
 */
export const PROTOCOL_LOGOS: Record<string, string> = {
  'aave': '/icons/protocols/aave.png',
  'compound': '/icons/protocols/compound.png',
  'pendle': '/icons/protocols/pendle.png',
  'silo': '/icons/protocols/silo.png',
  'morpho': '/icons/protocols/morpho.png',
  'pro-vaults': '/icons/protocols/default.svg',
  'camelot': '/icons/protocols/camelot.png',
  'uniswap': '/icons/protocols/uniswap.png',
  'balancer': '/icons/protocols/balancer.png',
  'openocean': '/icons/protocols/default.svg',
  'velodrome': '/icons/protocols/default.svg', 
  'aerodrome': '/icons/protocols/default.svg'
}; 
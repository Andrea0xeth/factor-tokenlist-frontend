// This is a simple express server that provides an API endpoint to get protocols
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { FactorTokenlist, ChainId } = require('@factordao/tokenlist');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Define the required protocols for each chain
const REQUIRED_PROTOCOLS = {
  // Arbitrum protocols (ChainId: 42161)
  42161: [
    'aave', 'compound', 'pendle', 'silo', 'pro-vaults', 
    'camelot', 'uniswap', 'balancer', 'openocean'
  ],
  // Optimism protocols (ChainId: 10)
  10: [
    'aave', 'compound', 'pendle', 'silo', 'morpho', 
    'uniswap', 'velodrome', 'openocean'
  ],
  // Base protocols (ChainId: 8453)
  8453: [
    'aave', 'compound', 'pendle', 'silo', 'morpho', 
    'aerodrome', 'openocean'
  ]
};

// Store for cached protocol data
const protocolCache = {
  42161: [], // Arbitrum
  10: [],    // Optimism
  8453: []   // Base
};

// Cache tokens with protocols
const tokenCache = {
  42161: [], // Arbitrum
  10: [],    // Optimism
  8453: []   // Base
};

// Pro Vaults initialization status
const proVaultsInitialized = {
  42161: false
};

// Helper function to get protocol display name
function getProtocolDisplayName(id) {
  const names = {
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
  
  return names[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

// Helper function to get protocol logo
function getProtocolLogo(id) {
  return `/icons/protocols/${id}.png`;
}

// Initialize and check protocols for a specific chain
async function checkProtocolsForChain(chainId) {
  console.log(`Checking protocols for chain ${chainId}...`);
  
  try {
    // Create a new tokenlist instance for this chain
    const tokenlist = new FactorTokenlist(chainId);
    
    // For Arbitrum, initialize Pro Vaults if needed
    if (chainId === 42161 && !proVaultsInitialized[chainId]) {
      try {
        console.log('Initializing Pro Vaults for Arbitrum...');
        await tokenlist.initializeProVaultsTokens();
        proVaultsInitialized[chainId] = true;
        console.log('Pro Vaults initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Pro Vaults:', error);
      }
    }
    
    // Get available methods
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(tokenlist))
      .filter(name => typeof tokenlist[name] === 'function');
    
    // Track protocols with verified tokens
    const protocolsWithTokens = new Map();
    const requiredForChain = REQUIRED_PROTOCOLS[chainId] || [];
    
    // Check each required protocol
    for (const id of requiredForChain) {
      // 1. Try getTokensByProtocol
      try {
        const tokens = await tokenlist.getTokensByProtocol(id.toUpperCase());
        if (tokens && tokens.length > 0) {
          protocolsWithTokens.set(id, true);
          continue;
        }
      } catch (error) {
        // Silently continue to next method
      }
      
      // 2. Try protocol-specific method
      const specificMethod = `getAll${id.charAt(0).toUpperCase() + id.slice(1)}Tokens`;
      if (methods.includes(specificMethod)) {
        try {
          const tokens = await tokenlist[specificMethod]();
          if (tokens && tokens.length > 0) {
            protocolsWithTokens.set(id, true);
            continue;
          }
        } catch (error) {
          // Silently continue to next method
        }
      }
      
      // 3. Special case for Pro Vaults
      if (id === 'pro-vaults' && chainId === 42161 && proVaultsInitialized[chainId]) {
        try {
          const tokens = await tokenlist.getAllProVaultsTokens();
          if (tokens && tokens.length > 0) {
            protocolsWithTokens.set(id, true);
            continue;
          }
        } catch (error) {
          // Silently continue
        }
      }
      
      // If we get here, no tokens were found for this protocol
      protocolsWithTokens.set(id, false);
    }
    
    // Create protocol objects for all required protocols
    const protocols = requiredForChain.map(id => ({
      id,
      name: getProtocolDisplayName(id),
      logoURI: getProtocolLogo(id),
      chainId,
      hasTokens: protocolsWithTokens.get(id) || false
    }));
    
    // Update the cache
    protocolCache[chainId] = protocols;
    
    // Log results
    console.log(`Found ${protocols.length} protocols for chain ${chainId}`);
    console.log('Protocols with tokens:', 
      protocols.filter(p => p.hasTokens).map(p => p.id).join(', '));
    console.log('Protocols without tokens:', 
      protocols.filter(p => !p.hasTokens).map(p => p.id).join(', '));
      
    return protocols;
  } catch (error) {
    console.error(`Error checking protocols for chain ${chainId}:`, error);
    // Return the previously cached protocols or empty array
    return protocolCache[chainId] || [];
  }
}

// Function to update protocol data for all chains
async function updateAllProtocolData() {
  console.log('Updating protocol data for all chains...');
  
  try {
    // Check all chains in parallel
    await Promise.all([
      checkProtocolsForChain(42161), // Arbitrum
      checkProtocolsForChain(10),    // Optimism
      checkProtocolsForChain(8453)   // Base
    ]);
    
    console.log('Protocol data updated successfully');
  } catch (error) {
    console.error('Error updating protocol data:', error);
  }
}

// Update protocol data on server start
updateAllProtocolData();

// Schedule updates every 5 minutes
const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
setInterval(updateAllProtocolData, UPDATE_INTERVAL_MS);

// API endpoint to get protocols for a specific chain
app.get('/api/protocols/:chainId', (req, res) => {
  const chainId = parseInt(req.params.chainId);
  
  if (!REQUIRED_PROTOCOLS[chainId]) {
    return res.status(400).json({ error: 'Invalid chain ID' });
  }
  
  // Return cached data
  return res.json(protocolCache[chainId]);
});

// API endpoint to get all protocols for all chains
app.get('/api/protocols', (req, res) => {
  return res.json({
    arbitrum: protocolCache[42161],
    optimism: protocolCache[10],
    base: protocolCache[8453]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Protocol checking server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- GET /api/protocols - Get all protocols for all chains`);
  console.log(`- GET /api/protocols/:chainId - Get protocols for a specific chain`);
}); 
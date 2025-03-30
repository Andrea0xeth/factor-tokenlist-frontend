'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useState, useEffect, useMemo } from 'react';
import { Token, Protocol } from '../types/index';
import { ChainId } from '@factordao/tokenlist';
import { getAllTokens, getAllProtocols, SUPPORTED_CHAIN_IDS } from '../lib/tokenlist';
import { BuildingBlock } from '@factordao/tokenlist';

// State definitions
interface AppState {
  tokens: Token[];
  protocols: Protocol[];
  selectedChain: ChainId;
  isLoading: boolean;
  isChangingChain: boolean;
  error: string | null;
  filters: {
    searchText: string;
    selectedProtocolIds: string[];
    selectedBuildingBlocks: BuildingBlock[];
  };
}

// Action types
type AppAction =
  | { type: 'SET_TOKENS'; payload: Token[] }
  | { type: 'SET_PROTOCOLS'; payload: Protocol[] }
  | { type: 'SET_CHAIN'; payload: ChainId }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CHANGING_CHAIN'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TEXT'; payload: string }
  | { type: 'SET_SELECTED_PROTOCOLS'; payload: string[] }
  | { type: 'TOGGLE_PROTOCOL'; payload: string }
  | { type: 'SET_SELECTED_BUILDING_BLOCKS'; payload: BuildingBlock[] }
  | { type: 'TOGGLE_BUILDING_BLOCK'; payload: BuildingBlock }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: AppState = {
  tokens: [],
  protocols: [],
  selectedChain: SUPPORTED_CHAIN_IDS[0] || ChainId.ARBITRUM_ONE,
  isLoading: true,
  isChangingChain: false,
  error: null,
  filters: {
    searchText: '',
    selectedProtocolIds: [],
    selectedBuildingBlocks: []
  }
};

// Reducer to handle all state actions
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
    case 'SET_PROTOCOLS':
      return { ...state, protocols: action.payload };
    case 'SET_CHAIN':
      return { 
        ...state, 
        selectedChain: action.payload,
        filters: {
          ...initialState.filters // Reset filters when changing chain
        }
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CHANGING_CHAIN':
      return { ...state, isChangingChain: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_TEXT':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          searchText: action.payload 
        } 
      };
    case 'SET_SELECTED_PROTOCOLS':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          selectedProtocolIds: action.payload 
        } 
      };
    case 'TOGGLE_PROTOCOL':
      const protocolId = action.payload;
      const isProtocolSelected = state.filters.selectedProtocolIds.includes(protocolId);
      return {
        ...state,
        filters: {
          ...state.filters,
          selectedProtocolIds: isProtocolSelected
            ? state.filters.selectedProtocolIds.filter(id => id !== protocolId)
            : [...state.filters.selectedProtocolIds, protocolId]
        }
      };
    case 'SET_SELECTED_BUILDING_BLOCKS':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          selectedBuildingBlocks: action.payload 
        } 
      };
    case 'TOGGLE_BUILDING_BLOCK':
      const buildingBlock = action.payload;
      const isBuildingBlockSelected = state.filters.selectedBuildingBlocks.includes(buildingBlock);
      return {
        ...state,
        filters: {
          ...state.filters,
          selectedBuildingBlocks: isBuildingBlockSelected
            ? state.filters.selectedBuildingBlocks.filter(bb => bb !== buildingBlock)
            : [...state.filters.selectedBuildingBlocks, buildingBlock]
        }
      };
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: { 
          ...initialState.filters 
        } 
      };
    default:
      return state;
  }
}

// Context type definition
interface AppContextType {
  state: AppState;
  loadTokens: (chainId: ChainId) => Promise<void>;
  loadProtocols: (chainId: ChainId) => Promise<void>;
  changeChain: (chainId: ChainId) => void;
  setSearchText: (text: string) => void;
  setSelectedProtocols: (protocolIds: string[]) => void;
  toggleProtocol: (protocolId: string) => void;
  setSelectedBuildingBlocks: (buildingBlocks: BuildingBlock[]) => void;
  toggleBuildingBlock: (buildingBlock: BuildingBlock) => void;
  resetFilters: () => void;
  filteredTokens: Token[];
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  // Function to load tokens
  const loadTokens = useCallback(async (chainId: ChainId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log(`Loading tokens for chain ${chainId}...`);
      const tokensData = await getAllTokens(chainId);
      console.log(`Loaded ${tokensData.length} tokens for chain ${chainId}`);
      
      if (tokensData.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: `No tokens found for chain ${chainId}` });
      }
      
      dispatch({ type: 'SET_TOKENS', payload: tokensData });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error loading tokens:', error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to load tokens: ${(error as Error).message}` });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Function to load protocols
  const loadProtocols = useCallback(async (chainId: ChainId) => {
    try {
      console.log(`Loading protocols for chain ${chainId}...`);
      const protocolsData = await getAllProtocols(chainId);
      console.log(`Loaded ${protocolsData.length} protocols for chain ${chainId}`);
      
      dispatch({ type: 'SET_PROTOCOLS', payload: protocolsData });
    } catch (error) {
      console.error('Error loading protocols:', error);
      dispatch({ type: 'SET_PROTOCOLS', payload: [] });
    }
  }, []);

  // Function to change the current chain
  const changeChain = useCallback((chainId: ChainId) => {
    if (chainId === state.selectedChain) return;
    
    dispatch({ type: 'SET_CHANGING_CHAIN', payload: true });
    dispatch({ type: 'SET_CHAIN', payload: chainId });
    
    // Load data for the new chain
    loadProtocols(chainId);
    loadTokens(chainId).finally(() => {
      // Short timeout for a smoother transition
      setTimeout(() => {
        dispatch({ type: 'SET_CHANGING_CHAIN', payload: false });
      }, 500);
    });
  }, [state.selectedChain, loadProtocols, loadTokens]);

  // Filter actions
  const setSearchText = useCallback((text: string) => {
    dispatch({ type: 'SET_SEARCH_TEXT', payload: text });
  }, []);

  const setSelectedProtocols = useCallback((protocolIds: string[]) => {
    dispatch({ type: 'SET_SELECTED_PROTOCOLS', payload: protocolIds });
  }, []);

  const toggleProtocol = useCallback((protocolId: string) => {
    dispatch({ type: 'TOGGLE_PROTOCOL', payload: protocolId });
  }, []);

  const setSelectedBuildingBlocks = useCallback((buildingBlocks: BuildingBlock[]) => {
    dispatch({ type: 'SET_SELECTED_BUILDING_BLOCKS', payload: buildingBlocks });
  }, []);

  const toggleBuildingBlock = useCallback((buildingBlock: BuildingBlock) => {
    dispatch({ type: 'TOGGLE_BUILDING_BLOCK', payload: buildingBlock });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Filter tokens based on search text and other filters
  useEffect(() => {
    const { searchText, selectedProtocolIds, selectedBuildingBlocks } = state.filters;
    const searchLower = searchText.toLowerCase().trim();

    // Defensive filtering with null checks
    let filtered = state.tokens.filter(token => {
      // Skip tokens with undefined properties
      if (!token || !token.name || !token.symbol || !token.address) {
        return false;
      }

      // Search text filter
      const matchesSearch = !searchText || (
        token.name.toLowerCase().includes(searchLower) || 
        token.symbol.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
      );

      return matchesSearch;
    });
    
    // Apply protocol filter if selected
    if (selectedProtocolIds.length > 0) {
      filtered = filtered.filter(token => {
        // Special handling for Pro Vaults
        if (selectedProtocolIds.some(id => id.toLowerCase() === 'pro-vaults')) {
          // Check if token is a Pro Vault
          const isProVault = () => {
            // Check direct protocols property
            if (token.protocols && Array.isArray(token.protocols)) {
              if (token.protocols.some(p => typeof p === 'string' && p.toLowerCase() === 'pro-vaults')) {
                return true;
              }
            }
            
            // Check extensions.protocols property
            if (token.extensions?.protocols && Array.isArray(token.extensions.protocols)) {
              if (token.extensions.protocols.some(p => typeof p === 'string' && p.toLowerCase() === 'pro-vaults')) {
                return true;
              }
            }
            
            // Check vaultAddress or vaultInfo existence
            if (token.vaultAddress || 
                (token.extensions?.vaultInfo && Object.keys(token.extensions.vaultInfo).length > 0)) {
              return true;
            }
            
            // Check if symbol starts with "pv" (Pro Vault naming convention)
            if (token.symbol && token.symbol.toLowerCase().startsWith('pv')) {
              return true;
            }

            // Special fallback for hardcoded Pro Vault addresses on Arbitrum
            const proVaultAddresses = [
              '0x7ac6515f4772fcb6eb5c013042578c9ae1d7fe04', // pvUSDC
              '0x2e2bbbcc801a0796e7c5d2c27a343381e0533d06', // pvUSDT
              '0xa74eb41c7d65e77570d5bc9fff5390137f32fc4e'  // pvETH
            ];
            
            return proVaultAddresses.includes(token.address.toLowerCase());
          };

          if (isProVault()) {
            return true;
          }
        }

        // Check for other protocols
        // Check if token belongs to any of the selected protocols
        if (token.protocols && Array.isArray(token.protocols)) {
          for (const protocol of token.protocols) {
            if (typeof protocol === 'string' && 
                selectedProtocolIds.some(id => id.toLowerCase() === protocol.toLowerCase())) {
              return true;
            }
          }
        }
        
        // Check extensions.protocols property
        if (token.extensions?.protocols && Array.isArray(token.extensions.protocols)) {
          for (const protocol of token.extensions.protocols) {
            if (typeof protocol === 'string' && 
                selectedProtocolIds.some(id => id.toLowerCase() === protocol.toLowerCase())) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      // Debug logging for protocol filter
      if (process.env.NODE_ENV === 'development') {
        console.log(`After protocol filter (${selectedProtocolIds.join(', ')}): ${filtered.length} tokens`);
      }
    }
    
    // Apply building block filter if selected
    if (selectedBuildingBlocks.length > 0) {
      filtered = filtered.filter(token => {
        // Check direct buildingBlocks property
        if (token.buildingBlocks && Array.isArray(token.buildingBlocks)) {
          if (token.buildingBlocks.some(bb => selectedBuildingBlocks.includes(bb))) {
            return true;
          }
        }
        
        // Check extensions.buildingBlocks property
        if (token.extensions?.buildingBlocks && Array.isArray(token.extensions.buildingBlocks)) {
          if (token.extensions.buildingBlocks.some(bb => selectedBuildingBlocks.includes(bb))) {
            return true;
          }
        }
        
        return false;
      });
      
      // Debug logging for building block filter
      if (process.env.NODE_ENV === 'development') {
        console.log(`After building block filter (${selectedBuildingBlocks.join(', ')}): ${filtered.length} tokens`);
      }
    }

    setFilteredTokens(filtered);
  }, [state.tokens, state.filters]);

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { selectedChain } = state;
        console.log(`Initializing app with chain ${selectedChain}...`);
        
        await Promise.all([
          loadTokens(selectedChain),
          loadProtocols(selectedChain)
        ]);
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch({ type: 'SET_ERROR', payload: `Failed to initialize app: ${(error as Error).message}` });
      }
    };

    initializeApp();
  }, [state.selectedChain, loadTokens, loadProtocols, dispatch]);

  const contextValue: AppContextType = {
    state,
    loadTokens,
    loadProtocols,
    changeChain,
    setSearchText,
    setSelectedProtocols,
    toggleProtocol,
    setSelectedBuildingBlocks,
    toggleBuildingBlock,
    resetFilters,
    filteredTokens
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export interface AppContextState {
  selectedChainId: number;
  setSelectedChainId: (chainId: number) => void;
  protocols: Array<string>;
  buildingBlocks: Array<string>;
  filteredProtocols: Array<string>;
  filteredBuildingBlocks: Array<string>;
  search: string;
  isLoading: boolean;
  loadingError: Error | null;
  tokens: Array<Token>;
  filteredTokens: Array<Token>;
  toggleFilterProtocol: (protocol: string) => void;
  toggleFilterBuildingBlock: (buildingBlock: string) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
} 
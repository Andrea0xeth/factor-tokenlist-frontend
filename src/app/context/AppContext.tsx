'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useState, useEffect } from 'react';
import { Token, Protocol } from '../types';
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
    selectedProtocolId: string | null;
    selectedBuildingBlock: BuildingBlock | null;
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
  | { type: 'SET_SELECTED_PROTOCOL'; payload: string | null }
  | { type: 'SET_SELECTED_BUILDING_BLOCK'; payload: BuildingBlock | null }
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
    selectedProtocolId: null,
    selectedBuildingBlock: null
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
    case 'SET_SELECTED_PROTOCOL':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          selectedProtocolId: action.payload 
        } 
      };
    case 'SET_SELECTED_BUILDING_BLOCK':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          selectedBuildingBlock: action.payload 
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
  setSelectedProtocol: (protocolId: string | null) => void;
  setSelectedBuildingBlock: (buildingBlock: BuildingBlock | null) => void;
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

  const setSelectedProtocol = useCallback((protocolId: string | null) => {
    dispatch({ type: 'SET_SELECTED_PROTOCOL', payload: protocolId });
  }, []);

  const setSelectedBuildingBlock = useCallback((buildingBlock: BuildingBlock | null) => {
    dispatch({ type: 'SET_SELECTED_BUILDING_BLOCK', payload: buildingBlock });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Effect to calculate filtered tokens
  useEffect(() => {
    if (!state.tokens) {
      setFilteredTokens([]);
      return;
    }
    
    let result = [...state.tokens];
    const { searchText, selectedProtocolId, selectedBuildingBlock } = state.filters;
    
    // Filter by protocol
    if (selectedProtocolId) {
      result = result.filter(token => {
        if (!token.protocols) return false;
        
        // Il token deve essere sulla stessa chain del filtro selezionato
        const matchingProtocol = state.protocols.find(p => 
          p.id.toLowerCase() === selectedProtocolId.toLowerCase() && 
          p.chainId === token.chainId
        );
        
        if (!matchingProtocol) return false;
        
        if (Array.isArray(token.protocols)) {
          return token.protocols.some(p => {
            if (typeof p === 'string') {
              return p.toLowerCase() === selectedProtocolId.toLowerCase();
            } else if (p && typeof p === 'object' && 'id' in p) {
              return (p as any).id.toLowerCase() === selectedProtocolId.toLowerCase();
            }
            return String(p).toLowerCase() === selectedProtocolId.toLowerCase();
          });
        }
        return false;
      });
    }
    
    // Filter by building block
    if (selectedBuildingBlock) {
      result = result.filter(token => {
        // Check in both possible locations of building blocks
        const tokenBuildingBlocks = token.buildingBlocks || token.extensions?.buildingBlocks || [];
        return tokenBuildingBlocks.includes(selectedBuildingBlock);
      });
    }
    
    // Filter by text
    if (searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter(token => 
        token.name.toLowerCase().includes(searchLower) || 
        token.symbol.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTokens(result);
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
    setSelectedProtocol,
    setSelectedBuildingBlock,
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
'use client';

import { useState, useEffect } from 'react';
import { Token, Protocol } from '../types/index';
import TokenImage from './TokenImage';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TokenRowProps {
  token: Token;
  protocols: Protocol[];
  onSelect: (token: Token, protocol: Protocol) => void;
}

/**
 * Row component that displays a token with expandable protocol details
 */
export default function TokenRow({ token, protocols, onSelect }: TokenRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenProtocols, setTokenProtocols] = useState<Protocol[]>([]);
  const [isLoadingProtocols, setIsLoadingProtocols] = useState(false);
  
  // Filter protocols associated with the token
  useEffect(() => {
    if (!token.protocols || !protocols) {
      console.log(`TokenRow - Token ${token.symbol} has no protocols array or no protocols provided`);
      setTokenProtocols([]);
      return;
    }
    
    // Check if token.protocols is an array of strings or an array of objects
    let normalizedTokenProtocols: string[];
    
    if (Array.isArray(token.protocols)) {
      if (typeof token.protocols[0] === 'string') {
        // It's an array of strings
        normalizedTokenProtocols = token.protocols.map(p => p.toLowerCase());
      } else {
        // Could be another format, convert to strings for safety
        console.log(`TokenRow - Token ${token.symbol} has protocols in non-string format:`, token.protocols);
        normalizedTokenProtocols = token.protocols.map(p => 
          typeof p === 'string' ? p.toLowerCase() : 
          (p && typeof p === 'object' && 'id' in p) ? (p as {id: string}).id.toLowerCase() : String(p).toLowerCase()
        );
      }
    } else {
      console.warn(`TokenRow - Token ${token.symbol} has protocols in unexpected format:`, token.protocols);
      normalizedTokenProtocols = [];
    }
    
    // Debug
    console.log(`TokenRow - Token ${token.symbol} has protocols:`, normalizedTokenProtocols);
    console.log(`TokenRow - Available protocols to match:`, protocols.map(p => p.id));
    
    // Match token protocols with available protocol objects
    setIsLoadingProtocols(true);
    
    try {
      const matchedProtocols = protocols.filter(p => 
        normalizedTokenProtocols.includes(p.id.toLowerCase())
      );
      
      console.log(`TokenRow - Matched ${matchedProtocols.length} protocols for token ${token.symbol}`);
      setTokenProtocols(matchedProtocols);
    } catch (err) {
      console.error(`Error matching protocols for token ${token.symbol}:`, err);
      setTokenProtocols([]);
    } finally {
      setIsLoadingProtocols(false);
    }
  }, [token, protocols]);
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Count of protocols for this token
  const protocolCount = token.protocols?.length || 0;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Token row header - always visible */}
      <div 
        className={`grid grid-cols-12 gap-2 p-4 cursor-pointer ${
          isExpanded ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={toggleExpanded}
      >
        {/* Token icon and basic info */}
        <div className="col-span-9 sm:col-span-5 flex items-center">
          <TokenImage 
            src={token.logoURI} 
            alt={token.symbol} 
            size={32}
            className="flex-shrink-0"
          />
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {token.symbol}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {token.name}
            </p>
          </div>
        </div>
        
        {/* Token address - hidden on small screens */}
        <div className="hidden sm:col-span-4 sm:flex items-center">
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
            {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
          </span>
        </div>
        
        {/* Protocol count and expand/collapse control */}
        <div className="col-span-3 sm:col-span-3 flex items-center justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            {protocolCount} {protocolCount === 1 ? 'protocol' : 'protocols'}
          </span>
          <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400">
            {isExpanded ? 
              <ChevronUpIcon className="h-4 w-4" /> : 
              <ChevronDownIcon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
      
      {/* Expanded content - protocols list */}
      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Available protocols:
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {isLoadingProtocols ? (
              // Loading state
              <div className="col-span-1 md:col-span-3 lg:col-span-4 flex items-center text-sm text-gray-500 dark:text-gray-400 p-2">
                <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading protocols...
              </div>
            ) : (
              tokenProtocols.length > 0 ? (
                // Show found protocols
                tokenProtocols.map(protocol => (
                  <div 
                    key={protocol.id}
                    className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(token, protocol);
                    }}
                  >
                    <TokenImage 
                      src={protocol.logoURI} 
                      alt={protocol.name} 
                      size={24} 
                      className="mr-2"
                    />
                    <span className="ml-2 text-sm font-medium">{protocol.name}</span>
                    {protocol.marketCount && (
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {protocol.marketCount} markets
                      </span>
                    )}
                  </div>
                ))
              ) : (
                // No protocols found
                <div className="col-span-1 md:col-span-3 lg:col-span-4 text-sm text-gray-500 dark:text-gray-400 p-2">
                  {protocolCount > 0 ? 
                    `Found 0 matching protocols out of ${protocolCount} listed. The protocols may not be available in the system.` : 
                    'No protocols available for this token'
                  }
                </div>
              )
            )}
            
            {/* Display a warning if not all protocols were found */}
            {protocolCount > tokenProtocols.length && tokenProtocols.length > 0 && (
              <div className="col-span-1 md:col-span-3 lg:col-span-4 flex items-center p-2 text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Showing {tokenProtocols.length} out of {protocolCount} protocols. Some listed protocols could not be found in the system.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
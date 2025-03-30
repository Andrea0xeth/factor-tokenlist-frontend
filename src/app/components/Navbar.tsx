import React from 'react';
import { useAppContext } from '../context/AppContext';
import ChainSelector from './ChainSelector';
import { SUPPORTED_CHAIN_IDS } from '../lib/tokenlist';
import { ChainId } from '@factordao/tokenlist';

interface NavbarProps {
  className?: string;
  selectedChainId?: ChainId;
  onChainChange?: (chainId: ChainId) => void;
}

/**
 * Component for the main navigation bar
 * Now includes the chain selector in the header
 */
export default function Navbar({ className = '', selectedChainId, onChainChange }: NavbarProps) {
  const appContext = useAppContext();
  
  // Use props if provided, otherwise fall back to context
  const selectedChain = selectedChainId || appContext.state.selectedChain;
  const handleChainChange = onChainChange || appContext.changeChain;
  
  return (
    <header className={`bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg shadow-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM16 5C22.065 5 27 9.935 27 16C27 22.065 22.065 27 16 27C9.935 27 5 22.065 5 16C5 9.935 9.935 5 16 5ZM10 12V20H14V12H10ZM18 12V20H22V12H18Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                Factor DAO
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">TokenList</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Explore tokens across DeFi protocols</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            
            {/* Links */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://docs.factordao.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Docs
              </a>
              <a
                href="https://github.com/Factor-dao/factor-tokenlist"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://factor.fi"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
              >
                Factor.fi
              </a>
                          {/* Chain selector - only show if multiple chains are supported */}
            {SUPPORTED_CHAIN_IDS.length > 1 && (
              <div>
                <ChainSelector 
                  selectedChain={selectedChain} 
                  onChainChange={handleChainChange} 
                  className="min-w-[160px]"
                />
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 
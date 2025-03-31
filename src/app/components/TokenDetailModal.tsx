'use client';

import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Token } from '../types';
import TokenImage from './TokenImage';
import { getExplorerUrl, getChainName } from '../lib/chains';
import { BuildingBlock } from '@factordao/tokenlist';

interface TokenDetailModalProps {
  token: Token | null;
  onClose: () => void;
  isOpen: boolean;
}

// Map building block IDs to user-friendly names
const BUILDING_BLOCK_NAMES: Record<string, string> = {
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.STAKE]: 'Stake',
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.SWAP]: 'Swap',
  [BuildingBlock.REPAY]: 'Repay',
};

// Function to get protocol logo URLs
const getProtocolLogoUrl = (protocol: string): string => {
  return `/icons/protocols/${protocol.toLowerCase()}.png`;
};

const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ token, onClose, isOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !token) return null;

  // Extract token details
  const { 
    symbol, 
    name, 
    address, 
    chainId, 
    decimals, 
    logoURI, 
    vaultAddress 
  } = token;
  
  const protocols = token.extensions?.protocols || [];
  const buildingBlocks = token.extensions?.buildingBlocks || [];
  const isProVault = protocols.includes('pro-vaults') || Boolean(vaultAddress);
  const apy = token.extensions?.vaultInfo?.apy;
  const formattedApy = typeof apy === 'number' ? `${apy.toFixed(2)}%` : null;
  const isDeprecated = token.extensions?.vaultInfo?.deprecated;
  
  // Get chain-specific details
  const chainName = getChainName(chainId);
  const explorerLink = getExplorerUrl(chainId, address);
  
  // Pendle specific details
  const pendleTokenType = token.extensions?.pendleTokenType;
  const expiry = token.extensions?.expiry;
  
  // Silo specific details
  const siloMarketName = token.extensions?.siloMarketName;
  const siloMarketAddress = token.extensions?.siloMarketAddress;
  const siloTokenType = token.extensions?.siloTokenType;
  
  // Pro Vault details
  const vaultInfo = token.extensions?.vaultInfo;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <TokenImage 
              src={logoURI}
              alt={symbol || ''}
              address={address}
              size={40}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {symbol}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Status badges */}
        {(isDeprecated || isProVault || pendleTokenType || siloTokenType) && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900">
            {isDeprecated && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Deprecated
              </span>
            )}
            
            {isProVault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Pro Vault
              </span>
            )}
            
            {formattedApy && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                APY: {formattedApy}
              </span>
            )}
            
            {pendleTokenType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Pendle: {pendleTokenType}
              </span>
            )}
            
            {siloTokenType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Silo: {siloTokenType}
              </span>
            )}
          </div>
        )}
        
        {/* Main content */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column - Basic info */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Basic Information
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Chain</span>
                <span className="text-sm font-medium">{chainName}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Symbol</span>
                <span className="text-sm font-medium">{symbol}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Decimals</span>
                <span className="text-sm font-medium">{decimals}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
                <a 
                  href={explorerLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {address}
                </a>
              </div>
            </div>
          </div>
          
          {/* Right column - Extensions and additional data */}
          <div>
            {/* Protocols */}
            {protocols.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Protocols
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {protocols.map((protocol) => (
                    <div 
                      key={protocol}
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"
                    >
                      <div 
                        className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600"
                        style={{ 
                          backgroundImage: `url(${getProtocolLogoUrl(protocol)})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="text-xs">{protocol.charAt(0).toUpperCase() + protocol.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Building Blocks */}
            {buildingBlocks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Building Blocks
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {buildingBlocks.map((block) => (
                    <span 
                      key={block}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-md"
                    >
                      {BUILDING_BLOCK_NAMES[block] || block}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pendle specific info */}
            {pendleTokenType && expiry && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Pendle Details
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Token Type</span>
                    <span className="text-sm font-medium">{pendleTokenType}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Expiry</span>
                    <span className="text-sm font-medium">
                      {new Date(expiry).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Silo specific info */}
            {siloTokenType && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Silo Details
                </h3>
                
                <div className="space-y-2">
                  {siloMarketName && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Market</span>
                      <span className="text-sm font-medium">{siloMarketName}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Token Type</span>
                    <span className="text-sm font-medium">{siloTokenType}</span>
                  </div>
                  
                  {siloMarketAddress && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Market Address</span>
                      <a 
                        href={getExplorerUrl(chainId, siloMarketAddress)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {siloMarketAddress.slice(0, 6)}...{siloMarketAddress.slice(-4)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Pro Vault info */}
            {vaultInfo && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Vault Details
                </h3>
                
                <div className="space-y-2">
                  {vaultInfo.vaultAddress && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Vault Address</span>
                      <a 
                        href={getExplorerUrl(chainId, vaultInfo.vaultAddress)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {vaultInfo.vaultAddress.slice(0, 6)}...{vaultInfo.vaultAddress.slice(-4)}
                      </a>
                    </div>
                  )}
                  
                  {vaultInfo.strategyAddress && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Strategy Address</span>
                      <a 
                        href={getExplorerUrl(chainId, vaultInfo.strategyAddress)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {vaultInfo.strategyAddress.slice(0, 6)}...{vaultInfo.strategyAddress.slice(-4)}
                      </a>
                    </div>
                  )}
                  
                  {vaultInfo.depositToken && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Deposit Token</span>
                      <a 
                        href={getExplorerUrl(chainId, vaultInfo.depositToken)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {vaultInfo.depositToken.slice(0, 6)}...{vaultInfo.depositToken.slice(-4)}
                      </a>
                    </div>
                  )}
                  
                  {typeof vaultInfo.apy === 'number' && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">APY</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {vaultInfo.apy.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailModal; 
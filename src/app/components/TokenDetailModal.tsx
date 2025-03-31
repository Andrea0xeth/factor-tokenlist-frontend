'use client';

import React, { useRef, useEffect, useState } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Token } from '../types';
import TokenImage from './TokenImage';
import { getExplorerUrl, getChainName } from '../lib/chains';
import { BuildingBlock } from '@factordao/tokenlist';
import { useTokenYields } from '../hooks/useTokenYields';

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

// Protocol Icon component 
function ProtocolIcon({ protocol, size = 6 }: { protocol: string, size?: number }) {
  const [hasError, setHasError] = useState(false);
  
  // Check if hardcoded logo is available for common protocols
  const getProtocolLogoURI = (protocolId: string): string | null => {
    const knownProtocols: Record<string, string> = {
      'balancer': 'https://factor.fi/assets/protocols/balancer.svg',
      'aave': 'https://factor.fi/assets/protocols/aave.svg',
      'camelot': 'https://factor.fi/assets/protocols/camelot.svg',
      'uniswap': 'https://factor.fi/assets/protocols/uniswap-v3.svg',
      'compound': 'https://factor.fi/assets/protocols/compound.svg',
      'silo': 'https://factor.fi/assets/protocols/silo.svg',
      'pendle': 'https://factor.fi/assets/protocols/pendle.svg',
      'openocean': 'https://factor.fi/assets/protocols/openocean.svg',
      'pro-vaults': 'https://factor.fi/assets/protocols/pro-vaults.svg',
      'factor vault': 'https://factor.fi/assets/protocols/pro-vaults.svg',
      'pv': 'https://factor.fi/assets/protocols/pro-vaults.svg',
      'provault': 'https://factor.fi/assets/protocols/pro-vaults.svg',
      'pro-vault': 'https://factor.fi/assets/protocols/pro-vaults.svg',
    };
    
    return knownProtocols[protocolId.toLowerCase()] || null;
  }
  
  // Show initials if image fails
  if (hasError) {
    return (
      <div className={`w-${size} h-${size} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold`}>
        {protocol.substring(0, 2).toUpperCase()}
      </div>
    );
  }
  
  // Logo with fallback
  const hardcodedLogo = getProtocolLogoURI(protocol);
  const logoUrl = hardcodedLogo || `/icons/protocols/${protocol.toLowerCase()}.png`;
  
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden`}>
      <img 
        src={logoUrl}
        alt={protocol}
        className={`w-${size-1} h-${size-1} object-contain`}
        onError={() => setHasError(true)}
        id={`protocol-img-${protocol}`}
      />
    </div>
  );
}

// Tooltip component
function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help inline-flex items-center"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-800 text-white rounded shadow-lg whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}

// Function to get protocol logo URLs
const getProtocolLogoUrl = (protocol: string): string => {
  return `/icons/protocols/${protocol.toLowerCase()}.png`;
};

const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ token, onClose, isOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Add the hook to fetch yield data
  const { yields, loading, error } = useTokenYields(
    token?.address,
    token?.chainId || 0
  );

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
  
  // Truncate address for display
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
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
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  title={address}
                >
                  {truncatedAddress}
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
                      <ProtocolIcon protocol={protocol} size={4} />
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
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        title={siloMarketAddress}
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
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        title={vaultInfo.vaultAddress}
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
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        title={vaultInfo.strategyAddress}
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
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        title={vaultInfo.depositToken}
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
        
        {/* Add the Yield Opportunities section after the existing content */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Yield Opportunities
          </h3>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm py-2">
              Error loading yield data: {error.message}
            </div>
          ) : yields.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
              No yield opportunities found for this token on Arbitrum.
            </div>
          ) : (
            <>
              {/* Desktop table view - hidden on small screens */}
              <div className="hidden sm:block overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Protocol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Tooltip content="Type of yield opportunity (lending, liquidity, staking, or farming)">
                          <div className="flex items-center">
                            Type
                            <InformationCircleIcon className="h-3.5 w-3.5 ml-1" />
                          </div>
                        </Tooltip>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Tooltip content="Details about the opportunity including TVL and reward information">
                          <div className="flex items-center">
                            Pool Info
                            <InformationCircleIcon className="h-3.5 w-3.5 ml-1" />
                          </div>
                        </Tooltip>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Tooltip content="Annual Percentage Yield - higher is better">
                          <div className="flex items-center">
                            APY
                            <InformationCircleIcon className="h-3.5 w-3.5 ml-1" />
                          </div>
                        </Tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {yields.map((yieldData, index) => (
                      <tr key={`${yieldData.protocol}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm">
                          <a 
                            href={yieldData.link} 
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <ProtocolIcon protocol={yieldData.protocol} size={6} />
                            <span className="font-medium">{yieldData.protocol}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{yieldData.type}</td>
                        <td className="px-4 py-3 text-sm">
                          <Tooltip content="Click for more details">
                            <a 
                              href={yieldData.link} 
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="block hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {yieldData.pairInfo && <div className="font-medium">{yieldData.pairInfo}</div>}
                              {yieldData.details && 
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {yieldData.details.tvl && <span className="mr-3">TVL: {yieldData.details.tvl}</span>}
                                  {yieldData.details['base apy'] && <span className="mr-3">Base: {yieldData.details['base apy']}</span>}
                                  {yieldData.details['reward apy'] && <span>Rewards: {yieldData.details['reward apy']}</span>}
                                </div>
                              }
                            </a>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                          {yieldData.apy.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view - shown only on small screens */}
              <div className="sm:hidden space-y-4">
                {yields.map((yieldData, index) => (
                  <a 
                    key={`mobile-${yieldData.protocol}-${index}`}
                    href={yieldData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <ProtocolIcon protocol={yieldData.protocol} size={8} />
                        <span className="font-medium text-base">{yieldData.protocol}</span>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold px-3 py-1 rounded-full text-sm">
                        {yieldData.apy.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Type</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 capitalize">{yieldData.type}</div>
                    </div>
                    
                    {yieldData.pairInfo && (
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Pool</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{yieldData.pairInfo}</div>
                      </div>
                    )}
                    
                    {yieldData.details && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {yieldData.details.tvl && (
                            <div className="flex flex-col">
                              <span className="text-gray-500 dark:text-gray-400 uppercase font-medium">TVL</span>
                              <span className="text-gray-700 dark:text-gray-300">{yieldData.details.tvl}</span>
                            </div>
                          )}
                          
                          {yieldData.details['base apy'] && (
                            <div className="flex flex-col">
                              <span className="text-gray-500 dark:text-gray-400 uppercase font-medium">Base APY</span>
                              <span className="text-gray-700 dark:text-gray-300">{yieldData.details['base apy']}</span>
                            </div>
                          )}
                          
                          {yieldData.details['reward apy'] && (
                            <div className="flex flex-col">
                              <span className="text-gray-500 dark:text-gray-400 uppercase font-medium">Rewards</span>
                              <span className="text-gray-700 dark:text-gray-300">{yieldData.details['reward apy']}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailModal; 
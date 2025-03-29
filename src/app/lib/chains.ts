import { ChainId } from "@factordao/tokenlist";

interface ChainInfo {
  name: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: boolean;
}

// Definizione di costanti per chain ID che potrebbero non essere presenti nell'enum ChainId
const ETHEREUM = 1;
const BLAST = 81457;
const ZORA = 7777777;
const LINEA = 59144;
const MODE = 34443;

// Mappa delle informazioni per ogni chain supportata
const CHAIN_INFO: Record<number, ChainInfo> = {
  [ChainId.ARBITRUM_ONE]: {
    name: "Arbitrum",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  [ChainId.BASE]: {
    name: "Base",
    explorerUrl: "https://basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  [ChainId.OPTIMISM]: {
    name: "Optimism",
    explorerUrl: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Aggiungi altre chain secondo necessità
};

/**
 * Ottiene il nome leggibile di una chain dal suo ID
 */
export function getChainName(chainId: number): string {
  switch (chainId) {
    case ETHEREUM:
      return 'Ethereum';
    case ChainId.ARBITRUM_ONE:
      return 'Arbitrum One';
    case ChainId.OPTIMISM:
      return 'Optimism';
    case ChainId.BASE:
      return 'Base';
    case BLAST:
      return 'Blast';
    case ZORA:
      return 'Zora';
    case LINEA:
      return 'Linea';
    case MODE:
      return 'Mode';
    default:
      return `Chain ${chainId}`;
  }
}

/**
 * Ottiene il colore associato a una chain
 */
export function getChainColor(chainId: number): string {
  switch (chainId) {
    case ETHEREUM:
      return '#627EEA';
    case ChainId.ARBITRUM_ONE:
      return '#2D374B';
    case ChainId.OPTIMISM:
      return '#FF0420';
    case ChainId.BASE:
      return '#0052FF';
    case BLAST:
      return '#FFAA3E';
    case ZORA:
      return '#909090';
    case LINEA:
      return '#0CF0A9';
    case MODE:
      return '#0C0C0F';
    default:
      return '#888888';
  }
}

/**
 * Ottiene l'URL dell'explorer per una chain
 */
export function getExplorerUrl(chainId: number, address: string): string {
  let baseUrl = '';
  
  switch (chainId) {
    case ETHEREUM:
      baseUrl = 'https://etherscan.io';
      break;
    case ChainId.ARBITRUM_ONE:
      baseUrl = 'https://arbiscan.io';
      break;
    case ChainId.OPTIMISM:
      baseUrl = 'https://optimistic.etherscan.io';
      break;
    case ChainId.BASE:
      baseUrl = 'https://basescan.org';
      break;
    case BLAST:
      baseUrl = 'https://blastscan.io';
      break;
    case ZORA:
      baseUrl = 'https://explorer.zora.energy';
      break;
    case LINEA:
      baseUrl = 'https://lineascan.build';
      break;
    case MODE:
      baseUrl = 'https://explorer.mode.network';
      break;
    default:
      return '';
  }
  
  return `${baseUrl}/address/${address}`;
}

/**
 * Ottiene il simbolo della valuta nativa per una chain
 * @param chainId ID della chain
 * @returns Simbolo della valuta nativa
 */
export function getNativeCurrencySymbol(chainId: number): string {
  return CHAIN_INFO[chainId]?.nativeCurrency.symbol || "ETH";
}

/**
 * Controlla se una chain è una testnet
 * @param chainId ID della chain
 * @returns true se è una testnet, false altrimenti
 */
export function isTestnet(chainId: number): boolean {
  return CHAIN_INFO[chainId]?.testnet || false;
}

/**
 * Ottiene l'elenco di tutte le chain supportate
 * @returns Array di oggetti chain con id e nome
 */
export function getSupportedChains(): { id: number; name: string }[] {
  return Object.entries(CHAIN_INFO).map(([id, info]) => ({
    id: Number(id),
    name: info.name,
  }));
} 
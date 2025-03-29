import { Protocol } from '../types';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Fetches protocols for a specific chain from the server
 */
export async function fetchProtocolsFromServer(chainId: number): Promise<Protocol[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/protocols/${chainId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching protocols from server for chain ${chainId}:`, error);
    return [];
  }
}

/**
 * Fetches protocols for all supported chains from the server
 */
export async function fetchAllProtocolsFromServer(): Promise<Record<string, Protocol[]>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/protocols`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all protocols from server:', error);
    return {
      arbitrum: [],
      optimism: [],
      base: []
    };
  }
} 
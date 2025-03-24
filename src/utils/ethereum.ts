import { FUSE_NETWORK_CONFIG, FUSE_EMBER_ID } from '../constants/networks';
import { ethers } from 'ethers';

// Define contract interface to replace any
export interface ContractWithMethods {
  [method: string]: (...args: unknown[]) => Promise<unknown>;
}

// Define Ethereum provider types with more specific types instead of any
type EthereumRequest = { method: string; params?: unknown[] };
export type EthereumEventListener = (...args: unknown[]) => void;

// Define the window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: EthereumRequest) => Promise<unknown>;
      on: (eventName: string, listener: EthereumEventListener) => void;
      removeListener: (eventName: string, listener: EthereumEventListener) => void;
    };
  }
}

/**
 * Format Ethereum address for display
 * @param address Ethereum address
 * @param truncateLength Number of characters to show at start and end (default: 6 and 4)
 * @returns Formatted address (e.g., 0x1234...5678)
 */
export const formatAddress = (address: string, truncateLength?: number): string => {
  if (!address) return '';
  
  // Default truncation or use provided length
  const startChars = truncateLength || 6;
  const endChars = truncateLength || 4;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format wei to ether
 * @param wei Amount in wei
 * @returns Amount in ether
 */
export const weiToEther = (wei: string): string => {
  if (!wei) return '0';
  return (parseInt(wei, 16) / 1e18).toFixed(4);
};

/**
 * Check if MetaMask is installed
 * @returns true if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum && !!window.ethereum.isMetaMask;
};

/**
 * Request access to MetaMask accounts
 * @returns Array of accounts
 */
export const requestAccounts = async (): Promise<string[]> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });
  return accounts as string[];
};

/**
 * Get current chain ID
 * @returns Chain ID in hexadecimal format
 */
export const getChainId = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
  return chainId as string;
};

/**
 * Get account balance
 * @param account Ethereum address
 * @returns Balance in wei (hexadecimal format)
 */
export const getBalance = async (account: string): Promise<string> => {
  if (!isMetaMaskInstalled() || !account) {
    throw new Error('MetaMask is not installed or account is not provided');
  }
  
  const balance = await window.ethereum!.request({
    method: 'eth_getBalance',
    params: [account, 'latest'],
  });
  return balance as string;
};

/**
 * Switch to Fuse Ember network
 */
export const switchToFuseEmber = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    // Try to switch to the Fuse Ember network
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUSE_EMBER_ID }],
    });
  } catch (switchError: unknown) {
    // Type guard for the error
    if (typeof switchError === 'object' && switchError !== null && 'code' in switchError && switchError.code === 4902) {
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: FUSE_NETWORK_CONFIG.chainId,
              chainName: FUSE_NETWORK_CONFIG.chainName,
              nativeCurrency: FUSE_NETWORK_CONFIG.nativeCurrency,
              rpcUrls: FUSE_NETWORK_CONFIG.rpcUrls,
              blockExplorerUrls: FUSE_NETWORK_CONFIG.blockExplorerUrls,
            },
          ],
        });
      } catch (addError: unknown) {
        const errorMessage = addError instanceof Error ? addError.message : 'Unknown error';
        throw new Error(`Error adding network: ${errorMessage}`);
      }
    } else {
      const errorMessage = switchError instanceof Error ? switchError.message : 'Unknown error';
      throw new Error(`Error switching network: ${errorMessage}`);
    }
  }
};

// Utility function to safely call contract methods with proper TypeScript support
export const safeContractCall = async <T>(
  contract: ethers.Contract | ContractWithMethods, 
  methodName: string, 
  ...args: unknown[]
): Promise<T> => {
  if (typeof contract[methodName] !== 'function') {
    throw new Error(`Method ${methodName} does not exist on contract`);
  }
  
  return await contract[methodName](...args);
}; 
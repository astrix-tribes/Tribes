"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { FUSE_EMBER_ID } from '../../constants/networks';
import { 
  isMetaMaskInstalled, 
  requestAccounts, 
  getChainId, 
  getBalance, 
  weiToEther, 
  switchToFuseEmber,
  EthereumEventListener 
} from '../../utils/ethereum';

interface WalletContextType {
  account: string;
  chainId: string;
  balance: string;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: (walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  account: '',
  chainId: '',
  balance: '0',
  isConnecting: false,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
});

// Hook to use wallet context
export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to wallet
  const connectWallet = async (walletType: string) => {
    if (walletType !== 'metamask') {
      console.error('Only MetaMask is supported for now');
      return;
    }
    
    if (!isMetaMaskInstalled()) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await requestAccounts();
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Get chain ID
        const chainId = await getChainId();
        setChainId(chainId);
        
        // If not on Fuse Ember network, switch to it
        if (chainId !== FUSE_EMBER_ID) {
          await switchNetwork();
        }
        
        // Get balance
        const balanceWei = await getBalance(accounts[0]);
        const etherBalance = weiToEther(balanceWei);
        setBalance(etherBalance);
        
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('');
    setChainId('');
    setBalance('0');
    setIsConnected(false);
  };

  // Switch to Fuse Ember network
  const switchNetwork = async () => {
    if (!isMetaMaskInstalled() || !isConnected) return;
    
    try {
      await switchToFuseEmber();
      const chainId = await getChainId();
      setChainId(chainId);
      
      // Update balance after network switch
      if (account) {
        const balanceWei = await getBalance(account);
        const etherBalance = weiToEther(balanceWei);
        setBalance(etherBalance);
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  // Set up event listeners for account and chain changes
  useEffect(() => {
    if (isMetaMaskInstalled() && isConnected) {
      const ethereum = window.ethereum;
      // Safety check for TypeScript - window.ethereum should be defined here
      if (!ethereum) return;
      
      const handleAccountsChanged = ((accounts: unknown[]) => {
        const ethAccounts = accounts as string[];
        if (ethAccounts.length === 0) {
          // User has disconnected all accounts
          disconnectWallet();
        } else if (ethAccounts[0] !== account) {
          setAccount(ethAccounts[0]);
          
          // Update balance when account changes
          getBalance(ethAccounts[0])
            .then(balanceWei => {
              const etherBalance = weiToEther(balanceWei);
              setBalance(etherBalance);
            })
            .catch(error => {
              console.error('Error fetching balance:', error);
            });
        }
      }) as EthereumEventListener;

      const handleChainChanged = ((chainId: unknown) => {
        setChainId(chainId as string);
        // Refresh the page on chain change as recommended by MetaMask
        window.location.reload();
      }) as EthereumEventListener;

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      // Cleanup function
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, isConnected]);

  // Provide wallet context to children
  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        balance,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 
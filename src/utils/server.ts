import { ethers } from 'ethers';

// Get the admin private key from environment variables
export const getAdminPrivateKey = (): string => {
  const privateKey = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('NEXT_PUBLIC_ADMIN_PRIVATE_KEY is not set in environment variables');
  }
  
  return privateKey;
};

// Create an admin wallet for server-side contract interactions
export const getServerAdminWallet = (): ethers.Wallet => {
  const privateKey = getAdminPrivateKey();
  return new ethers.Wallet(privateKey);
};

// Get RPC URL from environment variables
export const getFuseRpcUrl = (): string => {
  const rpcUrl = process.env.NEXT_PUBLIC_FUSE_EMBER_RPC;
  
  if (!rpcUrl) {
    throw new Error('NEXT_PUBLIC_FUSE_EMBER_RPC is not set in environment variables');
  }
  
  return rpcUrl;
};

// Create a provider for server-side operations
export const getServerProvider = (): ethers.JsonRpcProvider => {
  const rpcUrl = getFuseRpcUrl();
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Create an admin wallet connected to a provider for server-side contract interactions
export const getServerConnectedAdminWallet = (): ethers.Wallet => {
  const wallet = getServerAdminWallet();
  const provider = getServerProvider();
  return wallet.connect(provider);
}; 
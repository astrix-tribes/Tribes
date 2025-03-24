'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../app/components/WalletProvider';
import { FUSE_EMBER_DECIMAL } from '../constants/networks';
import { getContractAddresses } from '../constants/contracts';
import ProfileNFTMinterABI from '../abi/ProfileNFTMinter.json';
import { safeContractCall, ContractWithMethods } from '../utils/ethereum';

// Profile metadata interface
export interface ProfileMetadata {
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
}

// Profile data interface
export interface ProfileData {
  tokenId: string;
  username: string;
  metadata: ProfileMetadata;
  owner: string;
}

interface ProfileContextType {
  // Profile data
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshProfile: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  createProfile: (username: string, metadata: ProfileMetadata) => Promise<boolean>;
  updateProfile: (metadata: ProfileMetadata) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { account, isConnected } = useWallet();
  
  // Fixed chainId for contract interactions
  const chainId = FUSE_EMBER_DECIMAL;
  
  // Setup provider and signer
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and signer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      if (isConnected && account) {
        provider.getSigner().then(signer => {
          setSigner(signer);
        }).catch(err => {
          console.error('Error getting signer:', err);
          setSigner(null);
        });
      } else {
        setSigner(null);
      }
    }
  }, [isConnected, account]);

  // Get ProfileNFTMinter contract
  const getProfileNFTMinterContract = (provider: ethers.Provider) => {
    const addresses = getContractAddresses(chainId);
    return new ethers.Contract(addresses.PROFILE_NFT_MINTER, ProfileNFTMinterABI, provider);
  };

  // Parse metadata from string to object
  const parseMetadata = (metadataStr: string): ProfileMetadata => {
    try {
      return JSON.parse(metadataStr);
    } catch (e) {
      console.error('Error parsing profile metadata:', e);
      return { name: 'Unknown' };
    }
  };

  // Get profile by address
  const getProfileByAddress = async (address: string): Promise<ProfileData | null> => {
    if (!provider) return null;
    
    console.log(`Getting profile for address: ${address}`);
    try {
      const contract = getProfileNFTMinterContract(provider);
      
      // First check if the address has a profile NFT
      const balance = await safeContractCall<bigint>(
        contract,
        'balanceOf',
        address
      );
      
      console.log(`Profile NFT balance for ${address}: ${balance}`);
      
      if (!balance || balance === BigInt(0)) {
        console.log(`No profile found for address ${address}`);
        return null;
      }
      
      // Find the token ID by checking ownership
      let userTokenId: bigint | null = null;
      for (let i = 0; i < 10; i++) {
        try {
          const owner = await safeContractCall<string>(
            contract,
            'ownerOf',
            BigInt(i)
          );
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            userTokenId = BigInt(i);
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (userTokenId === null) {
        console.log(`Could not find token ID for address ${address}`);
        return null;
      }
      
      // Get profile data using token ID
      const result = await safeContractCall<[string, string, string]>(
        contract,
        'getProfileByTokenId',
        userTokenId
      );
      
      const [username, metadataStr] = result;
      const metadata = parseMetadata(metadataStr);
      
      console.log(`Found profile for ${address}: ${username}`);
      
      return {
        tokenId: userTokenId.toString(),
        username,
        metadata,
        owner: address
      };
    } catch (error) {
      console.error(`Error getting profile for ${address}:`, error);
      return null;
    }
  };

  // Refresh user's profile
  const refreshProfile = async () => {
    if (!provider || !account) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userProfile = await getProfileByAddress(account);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Check if a username already exists
  const checkUsername = async (username: string): Promise<boolean> => {
    if (!provider) return false;
    
    try {
      const contract = getProfileNFTMinterContract(provider);
      const exists = await safeContractCall<boolean>(
        contract,
        'usernameExists',
        username
      );
      
      return exists;
    } catch (error) {
      console.error(`Error checking username ${username}:`, error);
      return false;
    }
  };

  // Create a new profile
  const createProfile = async (username: string, metadata: ProfileMetadata): Promise<boolean> => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const contract = getProfileNFTMinterContract(signer.provider as ethers.Provider);
      const contractWithSigner = contract.connect(signer);
      
      // Check if username already exists
      const usernameExists = await checkUsername(username);
      if (usernameExists) {
        throw new Error(`Username '${username}' is already taken`);
      }
      
      // Convert metadata to JSON string
      const metadataURI = JSON.stringify(metadata);
      
      // Create profile
      const tx = await safeContractCall<ethers.TransactionResponse>(
        contractWithSigner as unknown as ContractWithMethods,
        'createProfile',
        username,
        metadataURI,
        { gasLimit: 500000 }
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Refresh the profile after creation
      await refreshProfile();
      
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  // Update profile metadata
  const updateProfile = async (metadata: ProfileMetadata): Promise<boolean> => {
    if (!signer || !isConnected || !profile) {
      throw new Error('Wallet not connected or profile not loaded');
    }
    
    try {
      const contract = getProfileNFTMinterContract(signer.provider as ethers.Provider);
      const contractWithSigner = contract.connect(signer);
      
      // Convert metadata to JSON string
      const metadataURI = JSON.stringify(metadata);
      
      // Update profile metadata
      const tx = await safeContractCall<ethers.TransactionResponse>(
        contractWithSigner as unknown as ContractWithMethods,
        'updateProfileMetadata',
        profile.tokenId,
        metadataURI,
        { gasLimit: 300000 }
      );
      
      console.log('Update profile transaction sent:', tx.hash);
      await tx.wait();
      
      // Refresh the profile after update
      await refreshProfile();
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // Load profile on connection
  useEffect(() => {
    if (provider && account) {
      refreshProfile();
    }
  }, [provider, account]);

  const value = {
    profile,
    loading,
    error,
    refreshProfile,
    checkUsername,
    createProfile,
    updateProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 
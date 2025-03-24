import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import TribeControllerABI from '../../abi/TribeController.json';
import { safeContractCall, ContractWithMethods } from '../ethereum';

// Enum for join types
export enum JoinType {
  Open = 0,
  Approval = 1,
  Invite = 2,
  NFTGated = 3,
}

// Interface for Tribe data
export interface Tribe {
  id: string;
  name: string;
  description: string; // Extracted from metadata
  joinType: JoinType;
  entryFee: string;
  memberCount: number;
  canMerge: boolean;
  admin?: string;
  isActive?: boolean;
}

// Interface for NFT requirement
export interface NFTRequirement {
  contractAddress: string;
  tokenId: string;
}

// Interface for Tribe configuration
export interface TribeConfig {
  joinType: JoinType;
  entryFee: string;
  nftRequirements: NFTRequirement[];
  canMerge: boolean;
}

// Initialize contract
export const getTribeControllerContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.TRIBE_CONTROLLER, TribeControllerABI, provider);
};

// Get next tribe ID
export const getNextTribeId = async (
  provider: ethers.Provider,
  chainId: number
): Promise<number> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const nextId = await contract.nextTribeId();
    console.log(`[nextId]:`, nextId);
    return Number(nextId);
  } catch (error) {
    console.error('Error fetching next tribe ID:', error);
    throw error;
  }
};

// Get tribe config
export const getTribeConfig = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<TribeConfig> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const config = await contract.getTribeConfigView(tribeId);
    
    return {
      joinType: config.joinType,
      entryFee: config.entryFee.toString(),
      nftRequirements: config.nftRequirements,
      canMerge: config.canMerge,
    };
  } catch (error) {
    console.error(`Error fetching config for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Get tribe member count
export const getTribeMemberCount = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<number> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const count = await contract.getMemberCount(tribeId);
    return Number(count);
  } catch (error) {
    console.error(`Error fetching member count for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Get tribe details
export const getTribeDetails = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string
): Promise<Tribe | null> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    const details = await contract.getTribeDetails(tribeId);
    
    // Parse metadata to get description
    let description = "";
    try {
      const metadataObj = JSON.parse(details.metadata);
      description = metadataObj.description || "";
    } catch (error) {
      console.warn(`Error parsing metadata for tribe ${tribeId}:`, error);
    }
    
    return {
      id: tribeId,
      name: details.name,
      description,
      joinType: details.joinType,
      entryFee: details.entryFee.toString(),
      memberCount: Number(details.memberCount),
      canMerge: details.canMerge,
      admin: details.admin,
      isActive: details.isActive,
    };
  } catch (error) {
    console.error(`Error fetching details for tribe ${tribeId}:`, error);
    return null; // Return null instead of throwing to handle non-existent tribes
  }
};

// Get all tribes
export const getAllTribes = async (
  provider: ethers.Provider,
  chainId: number
): Promise<Tribe[]> => {
  try {
    const nextTribeId = await getNextTribeId(provider, chainId);
    console.log(`[nextTribeId]:`, nextTribeId);
    const tribes: Tribe[] = [];

    // Fetch all tribes from 0 to nextTribeId - 1
    const tribePromises: Promise<Tribe | null>[] = [];
    for (let i = 0; i < nextTribeId; i++) {
      tribePromises.push(getTribeDetails(provider, chainId, i.toString()));
    }

    const results = await Promise.all(tribePromises);
    
    // Filter out null results (non-existent tribes)
    for (const tribe of results) {
      if (tribe) {
        tribes.push(tribe);
      }
    }
    
    return tribes;
  } catch (error) {
    console.error('Error fetching all tribes:', error);
    throw error;
  }
};

// Check if user is a member of a tribe
export const isMemberOfTribe = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string,
  address: string
): Promise<boolean> => {
  try {
    const contract = getTribeControllerContract(provider, chainId);
    return await safeContractCall<boolean>(contract, 'isMember', tribeId, address);
  } catch (error) {
    console.error(`Error checking membership for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Join a tribe - uses safeContractCall to avoid TypeScript errors
export const joinTribe = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string
) => {
  try {
    const contract = getTribeControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Type assertion for the transaction - we know it returns a transaction
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods, 
      'joinTribe', 
      tribeId, 
      { gasLimit: 300000 }
    );
    return await tx.wait();
  } catch (error) {
    console.error(`Error joining tribe ${tribeId}:`, error);
    throw error;
  }
};

// Create a new tribe - uses safeContractCall to avoid TypeScript errors
export const createTribe = async (
  signer: ethers.Signer,
  chainId: number,
  name: string,
  description: string,
  joinType: JoinType = JoinType.Open,
  entryFee: string = "0"
) => {
  try {
    const contract = getTribeControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Create metadata
    const metadata = JSON.stringify({
      description,
      createdAt: new Date().toISOString(),
    });
    
    // Type assertion for the transaction - we know it returns a transaction
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods,
      'createTribe',
      name,
      metadata,
      [], // admins (empty array means caller is the only admin)
      joinType,
      entryFee,
      [], // nftRequirements
      { gasLimit: 500000 } // Add gas limit to prevent underestimation
    );
    
    return await tx.wait();
  } catch (error) {
    console.error('Error creating tribe:', error);
    throw error;
  }
};

// Leave a tribe
export const rejectMember = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string
) => {
  try {
    const contract = getTribeControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Type assertion for the transaction - we know it returns a transaction
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods, 
      'rejectMember', 
      tribeId, 
      { gasLimit: 300000 }
    );
    return await tx.wait();
  } catch (error) {
    console.error(`Error leaving tribe ${tribeId}:`, error);
    throw error;
  }
}; 
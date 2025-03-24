import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import RoleManagerABI from '../../abi/RoleManager.json';
import { safeContractCall, ContractWithMethods } from '../ethereum';

// Role constants
// export const ROLES = {
//   DEFAULT_ADMIN_ROLE: 'DEFAULT_ADMIN_ROLE',
//   FAN_ROLE: '0xbca0505abd2b509ad0eaa840e6f168977e35443c6d3673d54b38d65824c63872',
//   ORGANIZER_ROLE: '0x4d2e7a1e3f5dd6e203f087b15756ccf0e4ccd947fe1b639a38540089a1e47f63',
//   MODERATOR_ROLE: '0x71f3d55856e4058ed06ee057d79ada615f65cdf5f9ee88181b914225088f834f',
//   ARTIST_ROLE: '0x877a78dc988c0ec5f58453b44888a55eb39755c3d5ed8d8ea990912aa3ef29c6',
//   BRAND_ROLE: '0xd52b9622fe3ce468afb95246111fe2ff28de74ab22e427623dca2ad2172e5f59',
// };
export const ROLES = {
  DEFAULT_ADMIN_ROLE: 'DEFAULT_ADMIN_ROLE',
  FAN_ROLE: 'FAN_ROLE',
  ORGANIZER_ROLE: 'ORGANIZER_ROLE',
  MODERATOR_ROLE: 'MODERATOR_ROLE',
  ARTIST_ROLE: 'ARTIST_ROLE',
  BRAND_ROLE: 'BRAND_ROLE',
};

// Initialize contract
export const getRoleManagerContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.ROLE_MANAGER, RoleManagerABI, provider);
};

// Check if user has a specific role
export const hasRole = async (
  provider: ethers.Provider,
  chainId: number,
  address: string,
  role: string
): Promise<boolean> => {
  try {
    const contract = getRoleManagerContract(provider, chainId);
    // First get the bytes32 role
    const roleBytes = await safeContractCall<string>(contract, role);
    // Then check if the address has the role
    return await safeContractCall<boolean>(contract, 'hasRole', roleBytes, address);
  } catch (error) {
    console.error(`Error checking if user has role ${role}:`, error);
    return false;
  }
};

// Get all roles for a user
export const getUserRoles = async (
  provider: ethers.Provider,
  chainId: number,
  address: string
): Promise<string[]> => {
  try {
    const contract = getRoleManagerContract(provider, chainId);
    const roleBytes = await safeContractCall<string[]>(contract, 'getUserRoles', address);
    
    // Map the role bytes to role names (this is just for UI display)
    const roleNames: string[] = [];
    for (const roleByte of roleBytes) {
      for (const [name, func] of Object.entries(ROLES)) {
        const expectedByte = await safeContractCall<string>(contract, func);
        if (roleByte === expectedByte) {
          roleNames.push(name);
          break;
        }
      }
    }
    
    return roleNames;
  } catch (error) {
    console.error(`Error getting user roles:`, error);
    return [];
  }
};

// Assign a role to a user using admin key
export const assignRole = async (
  provider: ethers.Provider,
  chainId: number,
  userAddress: string,
  role: string
): Promise<boolean> => {
  try {
    // Get admin signer using the private key in environment variables
    const adminPrivateKey = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
    
    if (!adminPrivateKey) {
      throw new Error('Admin private key is not set in environment variables');
    }
    
    // Create admin wallet and connect to provider
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    
    const contract = getRoleManagerContract(provider, chainId);
    const contractWithSigner = contract.connect(adminWallet);
    
    // First get the bytes32 role
    const roleBytes = await safeContractCall<string>(contract, role);
    
    // Assign the role using admin wallet
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods,
      'assignRole',
      userAddress,
      roleBytes,
      { gasLimit: 300000 }
    );
    
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error assigning role ${role}:`, error);
    return false;
  }
}; 
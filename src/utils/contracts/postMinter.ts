import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import PostMinterABI from '../../abi/PostMinter.json';

// Types for post data
export interface PostMetadata {
  title: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'EVENT';
  createdAt: string;
  imageUrl?: string; // Optional for image posts
}

export interface Post {
  id: string;
  creator: string;
  tribeId: string;
  metadata: PostMetadata;
  isGated: boolean;
  collectibleContract: string;
  collectibleId: string;
  isEncrypted: boolean;
  accessSigner: string;
  // Derived fields (not from contract)
  likes?: number;
  replies?: number;
}

// Initialize contract
export const getPostMinterContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.POST_MINTER, PostMinterABI, provider);
};

// Create a text post
export const createTextPost = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string,
  title: string,
  content: string
) => {
  try {
    const contract = getPostMinterContract(signer.provider as ethers.Provider, chainId).connect(signer);
    
    const metadata: PostMetadata = {
      title,
      content,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
    };
    
    const tx = await contract.createPost(
      tribeId,
      JSON.stringify(metadata),
      false, // isGated
      ethers.ZeroAddress,
      0
    );
    
    return await tx.wait();
  } catch (error) {
    console.error('Error creating text post:', error);
    throw error;
  }
};

// Create an image post
export const createImagePost = async (
  signer: ethers.Signer,
  chainId: number,
  tribeId: string,
  title: string,
  content: string,
  imageUrl: string
) => {
  try {
    const contract = getPostMinterContract(signer.provider as ethers.Provider, chainId).connect(signer);
    
    const metadata: PostMetadata = {
      title,
      content,
      type: 'IMAGE',
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    
    const tx = await contract.createPost(
      tribeId,
      JSON.stringify(metadata),
      false, // isGated
      ethers.ZeroAddress,
      0
    );
    
    return await tx.wait();
  } catch (error) {
    console.error('Error creating image post:', error);
    throw error;
  }
};

// Get posts by tribe
export const getPostsByTribe = async (
  provider: ethers.Provider,
  chainId: number,
  tribeId: string,
  offset = 0,
  limit = 20
) => {
  try {
    const contract = getPostMinterContract(provider, chainId);
    
    const result = await contract.getPostsByTribe(tribeId, offset, limit);
    return {
      postIds: result.postIds,
      total: result.total
    };
  } catch (error) {
    console.error(`Error fetching posts for tribe ${tribeId}:`, error);
    throw error;
  }
};

// Get a single post by ID
export const getPost = async (
  provider: ethers.Provider,
  chainId: number,
  postId: string
): Promise<Post> => {
  try {
    const contract = getPostMinterContract(provider, chainId);
    
    const postData = await contract.getPost(postId);
    let metadata: PostMetadata;
    
    try {
      metadata = JSON.parse(postData.metadata);
    } catch (error) {
      console.error(`Error parsing metadata for post ${postId}:`, error);
      metadata = {
        title: 'Error',
        content: 'Could not parse post metadata',
        type: 'TEXT',
        createdAt: new Date().toISOString(),
      };
    }
    
    return {
      id: postId,
      creator: postData.creator,
      tribeId: postData.tribeId.toString(),
      metadata,
      isGated: postData.isGated,
      collectibleContract: postData.collectibleContract,
      collectibleId: postData.collectibleId.toString(),
      isEncrypted: postData.isEncrypted,
      accessSigner: postData.accessSigner,
    };
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
};

// Get interaction count (likes, etc.)
export const getInteractionCount = async (
  provider: ethers.Provider,
  chainId: number,
  postId: string,
  interactionType: number // 0 = Like, 1 = Dislike, etc.
) => {
  try {
    const contract = getPostMinterContract(provider, chainId);
    
    const count = await contract.getInteractionCount(postId, interactionType);
    return count;
  } catch (error) {
    console.error(`Error fetching interaction count for post ${postId}:`, error);
    throw error;
  }
};

// Interact with a post (like, etc.)
export const interactWithPost = async (
  signer: ethers.Signer,
  chainId: number,
  postId: string,
  interactionType: number // 0 = Like, 1 = Dislike, etc.
) => {
  try {
    const contract = getPostMinterContract(signer.provider as ethers.Provider, chainId).connect(signer);
    
    const tx = await contract.interactWithPost(postId, interactionType);
    return await tx.wait();
  } catch (error) {
    console.error(`Error interacting with post ${postId}:`, error);
    throw error;
  }
};

// Get all posts from all tribes
export const getAllPosts = async (
  provider: ethers.Provider,
  chainId: number,
  tribeIds: string[],
  limit = 10
) => {
  try {
    const allPosts: Post[] = [];
    const fetchPromises: Promise<Post>[] = [];
    
    // First get post IDs from each tribe
    for (const tribeId of tribeIds) {
      try {
        const { postIds } = await getPostsByTribe(provider, chainId, tribeId, 0, limit);
        
        // For each post ID, create a promise to fetch the post
        for (const postId of postIds) {
          fetchPromises.push(getPost(provider, chainId, postId.toString()));
        }
      } catch (error) {
        console.error(`Error fetching posts for tribe ${tribeId}:`, error);
        // Continue with other tribes if one fails
      }
    }
    
    // Resolve all promises
    const posts = await Promise.all(fetchPromises);
    allPosts.push(...posts);
    
    // Sort by creation date (newest first)
    return allPosts.sort((a, b) => {
      return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    throw error;
  }
}; 
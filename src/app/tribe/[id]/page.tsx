'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../components/WalletProvider';
import Header from '../../components/Header';
import { formatAddress } from '../../../utils/ethereum';

// Temporary mock data - will be replaced with contract data
const MOCK_TRIBES = {
  '1': { 
    id: '1', 
    name: 'DeFi Enthusiasts', 
    description: 'A community for DeFi enthusiasts to discuss yield farming, liquidity mining, and everything DeFi-related on Fuse Network.',
    memberCount: 1243,
    postCount: 347,
    createdAt: '2023-06-15T12:00:00Z',
    creator: '0x1234567890abcdef1234567890abcdef12345678'
  },
  '2': { 
    id: '2', 
    name: 'NFT Collectors', 
    description: 'Share and discuss NFT collections, marketplaces, and creation tools built on Fuse blockchain.',
    memberCount: 876,
    postCount: 215,
    createdAt: '2023-07-23T09:30:00Z',
    creator: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  '3': { 
    id: '3', 
    name: 'Fuse Developers', 
    description: 'Technical discussions about building on Fuse. Share code, ask questions, and collaborate on projects.',
    memberCount: 521,
    postCount: 189,
    createdAt: '2023-08-10T14:15:00Z',
    creator: '0x9876543210abcdef1234567890abcdef12345678'
  },
  '4': { 
    id: '4', 
    name: 'DAO Governance', 
    description: 'Discussions about governance models, voting mechanisms, and DAO structures within the Fuse ecosystem.',
    memberCount: 328,
    postCount: 124,
    createdAt: '2023-09-05T11:45:00Z',
    creator: '0xfedcba9876543210abcdef1234567890abcdef12'
  },
  '5': { 
    id: '5', 
    name: 'Web3 Gaming', 
    description: 'For gamers and developers interested in blockchain gaming, NFT gaming assets, and play-to-earn models on Fuse.',
    memberCount: 912,
    postCount: 276,
    createdAt: '2023-10-20T16:20:00Z',
    creator: '0x0123456789abcdef1234567890abcdef12345678'
  }
};

// Mock Posts for each tribe
const MOCK_TRIBE_POSTS = {
  '1': [
    { 
      id: '101', 
      author: '0x1234567890abcdef1234567890abcdef12345678', 
      content: `Just set up a yield farming strategy on Fuse that's giving me 20% APY! Anyone else getting good yields?`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 24
    },
    { 
      id: '102', 
      author: '0x9876543210abcdef1234567890abcdef12345678', 
      content: 'What DEXes on Fuse are you all using? Looking for one with good liquidity for smaller tokens.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 18
    }
  ],
  '2': [
    { 
      id: '201', 
      author: '0xabcdef1234567890abcdef1234567890abcdef12', 
      content: 'Check out this new NFT collection that just launched on Fuse. The artwork is amazing!',
      timestamp: new Date(Date.now() - 4800000).toISOString(),
      likes: 32
    }
  ],
  '3': [
    { 
      id: '301', 
      author: '0x9876543210abcdef1234567890abcdef12345678', 
      content: 'Just deployed my first smart contract on Fuse. Gas fees are incredibly low!',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      likes: 29
    }
  ],
  '4': [
    { 
      id: '401', 
      author: '0xfedcba9876543210abcdef1234567890abcdef12', 
      content: `Proposal #27 is now open for voting. Don't forget to cast your vote before Friday!`,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      likes: 45
    }
  ],
  '5': [
    { 
      id: '501', 
      author: '0x0123456789abcdef1234567890abcdef12345678', 
      content: `Anyone played "Crypto Raiders" yet? It's the new blockchain game everyone's talking about.`,
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      likes: 37
    }
  ]
};

interface TribePageProps {
  params: {
    id: string;
  };
}

export default function TribePage({ params }: TribePageProps) {
  const router = useRouter();
  const { isConnected, account } = useWallet();
  interface Tribe {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    postCount: number;
    createdAt: string;
    creator: string;
  }

  interface Post {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
  }

  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Format date (e.g., "Jun 15, 2023")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // TODO: Replace with actual contract calls to fetch tribe and posts
  useEffect(() => {
    const fetchTribeData = async () => {
      setIsLoading(true);
      try {
        // This will be replaced with real contract calls
        // const tribeContract = new Contract(tribeContractAddress, tribeABI, provider);
        // const fetchedTribe = await tribeContract.getTribe(params.id);
        // const fetchedPosts = await tribeContract.getTribePosts(params.id);
        
        // For now, we use mock data with a delay to simulate loading
        setTimeout(() => {
          const mockTribe = MOCK_TRIBES[params.id as keyof typeof MOCK_TRIBES];
          const mockPosts = MOCK_TRIBE_POSTS[params.id as keyof typeof MOCK_TRIBE_POSTS] || [];
          
          if (mockTribe) {
            setTribe(mockTribe);
            setPosts(mockPosts);
            // Randomly set joined status for demo
            setIsJoined(Math.random() > 0.5);
          } else {
            // If tribe not found, redirect to tribes page
            router.push('/tribes');
          }
          
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching tribe data:', error);
        setIsLoading(false);
      }
    };

    fetchTribeData();
  }, [params.id, router]);

  const handleJoinTribe = async () => {
    if (!isConnected) {
      // Prompt user to connect wallet
      return;
    }

    try {
      // TODO: Replace with actual contract call to join tribe
      console.log(`${isJoined ? 'Leaving' : 'Joining'} tribe:`, params.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Toggle joined status
      setIsJoined(!isJoined);
      
      // Update member count
      setTribe((prevTribe) => {
        if (!prevTribe) return prevTribe;
        return {
          ...prevTribe,
          memberCount: isJoined 
            ? prevTribe.memberCount - 1 
            : prevTribe.memberCount + 1
        };
      });
    } catch (error) {
      console.error(`Error ${isJoined ? 'leaving' : 'joining'} tribe:`, error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !isConnected) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual contract interaction to create a post
      console.log('Creating post in tribe:', { tribeId: params.id, content });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add post to the list (in a real app, we'd fetch the updated list)
      const newPost = {
        id: `new-${Date.now()}`,
        author: account,
        content,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      
      setPosts([newPost, ...posts]);
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!tribe) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tribe Header */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">{tribe.name}</h1>
                <p className="text-gray-300 mt-2">{tribe.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <div>
                    <strong className="text-gray-200">{tribe.memberCount.toLocaleString()}</strong> members
                  </div>
                  <div>
                    <strong className="text-gray-200">{tribe.postCount}</strong> posts
                  </div>
                  <div>
                    Created by <span className="font-mono text-purple-300">{formatAddress(tribe.creator)}</span>
                  </div>
                  <div>
                    Created on {formatDate(tribe.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={handleJoinTribe}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isJoined 
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                disabled={!isConnected}
              >
                {isJoined ? 'Leave Tribe' : 'Join Tribe'}
              </button>
            </div>
          </div>
          
          {/* Create Post Form (for joined members) */}
          {isConnected && isJoined && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm mb-6">
              <form onSubmit={handleCreatePost}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-200"
                  placeholder="Share something with the tribe..."
                  rows={3}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !content}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Posts List */}
          <h2 className="text-xl font-bold mb-4 text-gray-100">Posts</h2>
          {posts.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
              No posts in this tribe yet.
              {isConnected && isJoined && (
                <div className="mt-2">Be the first to post something!</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-200">{formatAddress(post.author)}</div>
                        <div className="text-sm text-gray-400">
                          {getRelativeTime(post.timestamp)}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-300">{post.content}</p>
                      <div className="mt-3 flex items-center text-gray-400 text-sm">
                        <button className="flex items-center hover:text-purple-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {post.likes}
                        </button>
                        <button className="flex items-center ml-4 hover:text-purple-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
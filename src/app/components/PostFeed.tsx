"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from './WalletProvider';
import { formatAddress } from '../../utils/ethereum';

// Temporary mock data - will be replaced with contract data
const MOCK_POSTS = [
  { 
    id: '1', 
    author: '0x1234567890abcdef1234567890abcdef12345678', 
    content: 'Just joined the DeFi Enthusiasts tribe! Excited to discuss yield farming strategies with everyone.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    likes: 24,
    tribe: { id: '1', name: 'DeFi Enthusiasts' }
  },
  { 
    id: '2', 
    author: '0xabcdef1234567890abcdef1234567890abcdef12', 
    content: 'Anyone here collected the new Fuse Fighters NFT series? The artwork is amazing!',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    likes: 18,
    tribe: { id: '2', name: 'NFT Collectors' }
  },
  { 
    id: '3', 
    author: '0x9876543210abcdef1234567890abcdef12345678', 
    content: 'Working on a new dApp using Fuse network. The transaction speed is incredible!',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    likes: 32,
    tribe: { id: '3', name: 'Fuse Developers' }
  },
  { 
    id: '4', 
    author: '0xfedcba9876543210abcdef1234567890abcdef12', 
    content: 'Just voted on the latest governance proposal. Make sure you cast your vote before Friday!',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    likes: 45,
    tribe: { id: '4', name: 'DAO Governance' }
  },
  { 
    id: '5', 
    author: '0x0123456789abcdef1234567890abcdef12345678', 
    content: 'Check out this new Web3 game built on Fuse - it has really smooth gameplay and interesting tokenomics.',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    likes: 29,
    tribe: { id: '5', name: 'Web3 Gaming' }
  },
];

const PostFeed: React.FC = () => {
  const { isConnected } = useWallet();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(false);

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

  // TODO: Replace with actual contract call to fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // This will be replaced with a real contract call
        // const postContract = new Contract(postContractAddress, postABI, provider);
        // const fetchedPosts = await postContract.getAllPosts();
        // setPosts(fetchedPosts);
        
        // For now, we use mock data with a delay to simulate loading
        setTimeout(() => {
          setPosts(MOCK_POSTS);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex-1 p-4 bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Feed</h1>
          {isConnected && (
            <Link 
              href="/create-post" 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Post
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
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
                      <div>
                        <span className="font-medium text-gray-200">{formatAddress(post.author)}</span>
                        <span className="text-gray-400 text-sm ml-2">in</span>
                        <Link 
                          href={`/tribe/${post.tribe.id}`}
                          className="text-purple-400 hover:underline ml-1 text-sm"
                        >
                          {post.tribe.name}
                        </Link>
                      </div>
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
  );
};

export default PostFeed; 
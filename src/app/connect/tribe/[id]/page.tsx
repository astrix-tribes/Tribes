'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../../components/WalletProvider';
import { usePosts } from '../../../../context/PostsContext';
import Header from '../../../components/Header';
import PostList from '../../../../components/PostList';
import PostModal from '../../../../components/PostModal';
import { formatAddress } from '../../../../utils/ethereum';
import { JoinType } from '../../../../utils/contracts/tribeController';
import { getPostsByTribe } from '../../../../utils/contracts/postMinter';
import { ethers } from 'ethers';
import { FUSE_EMBER_DECIMAL } from '../../../../constants/networks';

interface TribePageProps {
  params: {
    id: string;
  };
}

export default function TribePage({ params }: TribePageProps) {
  const router = useRouter();
  const { isConnected, account } = useWallet();
  const { 
    tribes, 
    refreshTribes, 
    joinExistingTribe, 
    leaveTribe, 
    checkTribeMembership 
  } = usePosts();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  
  // Find the tribe from our context
  const tribe = tribes.find(t => t.id === params.id);
  
  // Initialize provider
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);
  
  // Check if user is a member of the tribe using the context function
  useEffect(() => {
    const checkMembership = async () => {
      if (!isConnected || !account || !tribe) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the context function to check membership
        const memberStatus = await checkTribeMembership(params.id, account);
        setIsMember(memberStatus);
      } catch (err) {
        console.error('Error checking membership:', err);
        // Default to false if there's an error
        setIsMember(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMembership();
  }, [isConnected, account, tribe, params.id, checkTribeMembership]);
  
  // Get post count for this tribe
  useEffect(() => {
    const fetchPostCount = async () => {
      if (!provider || !tribe) return;
      
      try {
        const { total } = await getPostsByTribe(
          provider,
          FUSE_EMBER_DECIMAL,
          params.id
        );
        
        setPostCount(Number(total));
      } catch (err) {
        console.error('Error fetching post count:', err);
        setPostCount(0);
      }
    };
    
    fetchPostCount();
  }, [provider, tribe, params.id]);
  
  // If tribe not found, redirect to tribes page
  useEffect(() => {
    if (!isLoading && !tribe) {
      router.push('/connect/tribes');
    }
  }, [isLoading, tribe, router]);
  
  const handleJoinTribe = async () => {
    if (!isConnected) {
      router.push('/connect');
      return;
    }
    
    setIsJoining(true);
    setError(null);
    
    try {
      await joinExistingTribe(params.id);
      setIsMember(true);
      refreshTribes(); // Refresh tribes data
    } catch (err) {
      console.error('Error joining tribe:', err);
      setError('Failed to join tribe. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTribe = async () => {
    if (!isConnected) return;
    
    setIsLeaving(true);
    setError(null);
    
    try {
      // Use the context function to leave the tribe
      await leaveTribe(params.id);
      
      // Update local state
      setIsMember(false);
    } catch (err) {
      console.error('Error leaving tribe:', err);
      setError('Failed to leave tribe. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };
  
  if (isLoading || !tribe) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Tribe Header */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">{tribe.name}</h1>
                <p className="text-gray-400 mt-2">{tribe.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                  <div>
                    <strong>{tribe.memberCount.toLocaleString()}</strong> members
                  </div>
                  <div>
                    <span className="capitalize">{JoinType[tribe.joinType].toLowerCase()}</span> tribe
                  </div>
                  {tribe.admin && (
                    <div>
                      Admin: <span className="font-mono">{formatAddress(tribe.admin)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isMember ? (
                  <button
                    onClick={handleJoinTribe}
                    disabled={isJoining || !isConnected}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoining ? 'Joining...' : 'Join Tribe'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsPostModalOpen(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create Post
                    </button>
                    <button
                      onClick={handleLeaveTribe}
                      disabled={isLeaving}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLeaving ? 'Leaving...' : 'Leave Tribe'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
          </div>
          
          {/* Tribe Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <h3 className="text-gray-400 text-sm mb-1">Members</h3>
              <p className="text-2xl font-bold">{tribe.memberCount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <h3 className="text-gray-400 text-sm mb-1">Posts</h3>
              <p className="text-2xl font-bold">{postCount}</p>
            </div>
            <Link href="/events" className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-700 transition-colors">
              <h3 className="text-gray-400 text-sm mb-1">Events</h3>
              <p className="text-xl font-bold">View & Create</p>
            </Link>
          </div>
          
          {/* Posts from this tribe */}
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-100">Tribe Posts {postCount > 0 ? `(${postCount})` : ''}</h2>
            {isMember && (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex items-center text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Create Post
              </button>
            )}
          </div>
          
          <PostList />
          
          {/* Back button */}
          <div className="mt-8">
            <Link 
              href="/" 
              className="text-purple-400 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      {/* Post Creation Modal */}
      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        tribeId={params.id}
      />
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '../components/WalletProvider';
import Header from '../components/Header';
import { PostsProvider, usePosts } from '../../context/PostsContext';
import { Tribe } from '../../utils/contracts/tribeController';

const TribeCard = ({ 
  tribe, 
  isUserMember, 
  onJoin, 
  isJoining, 
  joinableTribeIds
}: { 
  tribe: Tribe; 
  isUserMember: boolean; 
  onJoin: (tribeId: string) => void;
  isJoining: boolean;
  joinableTribeIds: string[];
}) => {
  const isJoiningThisTribe = isJoining && joinableTribeIds.includes(tribe.id);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm hover:bg-gray-750 transition-all">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-100">{tribe.name}</h2>
        <div className="text-sm text-gray-300">
          {tribe.memberCount?.toLocaleString()} members
        </div>
      </div>
      <p className="text-gray-300 mt-2 line-clamp-2">{tribe.description}</p>
      
      <div className="flex items-center justify-between mt-4">
        <Link 
          href={`/connect/tribe/${tribe.id}`} 
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          View Details
        </Link>
        
        {isUserMember ? (
          <span className="bg-purple-800/30 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
            Member
          </span>
        ) : (
          <button
            onClick={() => onJoin(tribe.id)}
            disabled={isJoining}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isJoiningThisTribe ? 'Joining...' : 'Join Tribe'}
          </button>
        )}
      </div>
    </div>
  );
};

const TribesContent = () => {
  const { account, isConnected } = useWallet();
  const { 
    tribes, 
    tribesLoading, 
    tribesError, 
    refreshTribes, 
    joinExistingTribe,
    checkTribeMembership 
  } = usePosts();
  
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [memberStatus, setMemberStatus] = useState<Record<string, boolean>>({});
  const [isJoining, setIsJoining] = useState(false);
  const [joinableTribeIds, setJoinableTribeIds] = useState<string[]>([]);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Check member status for each tribe
  useEffect(() => {
    const checkMemberships = async () => {
      if (!isConnected || !account || tribes.length === 0) return;

      const membershipStatus: Record<string, boolean> = {};
      
      try {
        for (const tribe of tribes) {
          const isMember = await checkTribeMembership(tribe.id, account);
          membershipStatus[tribe.id] = isMember;
        }
        
        setMemberStatus(membershipStatus);
      } catch (error) {
        console.error('Error checking memberships:', error);
      }
    };

    checkMemberships();
  }, [tribes, isConnected, account, checkTribeMembership]);

  // Get user tribes based on membership status
  const userTribes = tribes.filter(tribe => memberStatus[tribe.id]);
  
  // Handle joining a tribe
  const handleJoinTribe = async (tribeId: string) => {
    if (!isConnected) {
      setJoinError('Please connect your wallet to join tribes');
      return;
    }
    
    setIsJoining(true);
    setJoinableTribeIds(prev => [...prev, tribeId]);
    setJoinError(null);
    
    try {
      await joinExistingTribe(tribeId);
      
      // Update member status after joining
      setMemberStatus(prev => ({
        ...prev,
        [tribeId]: true
      }));
      
      // Refresh tribes to get updated member counts
      await refreshTribes();
    } catch (error) {
      console.error('Error joining tribe:', error);
      setJoinError(error instanceof Error ? error.message : 'Failed to join tribe');
    } finally {
      setIsJoining(false);
      setJoinableTribeIds(prev => prev.filter(id => id !== tribeId));
    }
  };

  if (tribesLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (tribesError) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
        <p className="text-red-400 mb-2">Error loading tribes</p>
        <p className="text-red-400/80 text-sm">{tribesError}</p>
        <button 
          onClick={() => refreshTribes()}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {joinError && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-400">{joinError}</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'all' 
              ? 'border-b-2 border-purple-500 text-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Tribes ({tribes.length})
        </button>
        {isConnected && (
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'my' 
                ? 'border-b-2 border-purple-500 text-purple-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Tribes ({userTribes.length})
          </button>
        )}
      </div>
      
      {/* Display tribes based on active tab */}
      {activeTab === 'all' ? (
        tribes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tribes.map((tribe) => (
              <TribeCard 
                key={tribe.id} 
                tribe={tribe} 
                isUserMember={memberStatus[tribe.id] || false}
                onJoin={handleJoinTribe}
                isJoining={isJoining}
                joinableTribeIds={joinableTribeIds}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-gray-400 mb-2">No tribes available</p>
            {isConnected && (
              <Link 
                href="/create-tribe" 
                className="inline-block mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Create the First Tribe
              </Link>
            )}
          </div>
        )
      ) : (
        userTribes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTribes.map((tribe) => (
              <TribeCard 
                key={tribe.id} 
                tribe={tribe} 
                isUserMember={true}
                onJoin={() => {}}
                isJoining={false}
                joinableTribeIds={[]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-gray-400 mb-2">You haven&apos;t joined any tribes yet</p>
            <p className="text-gray-500 text-sm mb-4">Join a tribe to connect with others and share content</p>
          </div>
        )
      )}
    </div>
  );
};

export default function TribesPage() {
  const { isConnected } = useWallet();

  return (
    <PostsProvider>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-100">Tribes</h1>
              {isConnected && (
                <Link 
                  href="/create-tribe" 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Tribe
                </Link>
              )}
            </div>
            
            <TribesContent />
          </div>
        </div>
      </div>
    </PostsProvider>
  );
} 
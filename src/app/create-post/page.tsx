'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../components/WalletProvider';
import Header from '../components/Header';

export default function CreatePostPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [content, setContent] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock tribes for the dropdown (will be replaced with actual contract data)
  const tribes = [
    { id: '1', name: 'DeFi Enthusiasts' },
    { id: '2', name: 'NFT Collectors' },
    { id: '3', name: 'Fuse Developers' },
    { id: '4', name: 'DAO Governance' },
    { id: '5', name: 'Web3 Gaming' },
  ];

  // Redirect to home page if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !selectedTribe) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual contract interaction to create a post
      console.log('Creating post:', { content, tribeId: selectedTribe });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to feed
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-gray-100">Create Post</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="tribe" className="block text-sm font-medium text-gray-300 mb-1">
                Select Tribe
              </label>
              <select
                id="tribe"
                value={selectedTribe}
                onChange={(e) => setSelectedTribe(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-200"
                required
              >
                <option value="">Select a tribe</option>
                {tribes.map((tribe) => (
                  <option key={tribe.id} value={tribe.id}>
                    {tribe.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                Post Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-200"
                placeholder="What's on your mind?"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !content || !selectedTribe}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
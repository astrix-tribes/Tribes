'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../../components/WalletProvider';
import { usePosts } from '../../../../context/PostsContext';
import Header from '../../../components/Header';
import CreatePostForm from '../../../../components/CreatePostForm';
import { Tribe } from '../../../../utils/contracts/tribeController';

interface CreatePostForTribePageProps {
  params: {
    tribeId: string;
  };
}

export default function CreatePostForTribePage({ params }: CreatePostForTribePageProps) {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { tribes, tribesLoading } = usePosts();
  
  const [tribe, setTribe] = useState<Tribe | null>(null);
  
  // Redirect to connect page if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/connect');
    }
  }, [isConnected, router]);
  
  // Find the tribe
  useEffect(() => {
    if (!tribesLoading && tribes.length > 0) {
      const foundTribe = tribes.find(t => t.id === params.tribeId);
      if (foundTribe) {
        setTribe(foundTribe);
      } else {
        // Tribe not found, redirect back to tribes page
        router.push('/connect/tribes');
      }
    }
  }, [tribesLoading, tribes, params.tribeId, router]);

  if (!isConnected) {
    return null; // Don't render anything while redirecting
  }
  
  if (tribesLoading || !tribe) {
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-100">Create a Post in {tribe.name}</h1>
            <p className="text-gray-400 mt-1">
              Share content with the members of this tribe
            </p>
          </div>
          
          {/* Create Post Form */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm mb-6">
            <CreatePostForm tribeId={params.tribeId} />
          </div>
          
          {/* Back to tribe */}
          <div className="mt-6">
            <Link 
              href={`/connect/tribe/${params.tribeId}`}
              className="text-purple-400 hover:underline"
            >
              ← Back to {tribe.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
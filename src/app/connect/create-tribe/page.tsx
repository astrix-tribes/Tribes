'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../components/WalletProvider';
import Header from '../../components/Header';
import CreateTribeForm from '../../../components/CreateTribeForm';

export default function CreateTribePage() {
  const router = useRouter();
  const { isConnected } = useWallet();

  // Redirect to connect page if not connected
  React.useEffect(() => {
    if (!isConnected) {
      router.push('/connect');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-100">Create a New Tribe</h1>
            <p className="text-gray-400 mt-1">
              Form a community around your interests on the Fuse network
            </p>
          </div>
          
          {/* Create Tribe Form */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm mb-6">
            <CreateTribeForm />
          </div>
          
          {/* Back to tribes */}
          <div className="mt-6">
            <Link 
              href="/connect/tribes" 
              className="text-purple-400 hover:underline"
            >
              ← Back to All Tribes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
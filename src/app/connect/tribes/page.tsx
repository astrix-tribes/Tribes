'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '../../components/WalletProvider';
import Header from '../../components/Header';
import TribeList from '../../../components/TribeList';

export default function TribesPage() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">All Tribes</h1>
              <p className="text-gray-400 mt-1">
                Explore and join tribes on the Fuse network
              </p>
            </div>
            
            {isConnected && (
              <Link
                href="/connect/create-tribe"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Create New Tribe
              </Link>
            )}
          </div>
          
          {/* Display all tribes */}
          <TribeList showCreateButton={true} />
          
          {/* Back to home */}
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
    </div>
  );
} 
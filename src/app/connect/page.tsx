'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../components/WalletProvider';
import Header from '../components/Header';
import NextImageWrapper from '../../components/NextImageWrapper';

export default function ConnectPage() {
  const router = useRouter();
  const { isConnected, connectWallet } = useWallet();
  
  // Redirect to home if already connected
  useEffect(() => {
    if (isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleConnect = async (provider: string) => {
    try {
      await connectWallet(provider);
      // Will redirect via the useEffect hook above
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-md border border-gray-700">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-100">Connect Your Wallet</h1>
          
          <p className="text-gray-300 mb-8 text-center">
            Connect your wallet to start interacting with Fuse Tribe. Join communities, create posts, and participate in discussions.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleConnect('metamask')}
              className="w-full flex items-center justify-center gap-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
            >
              <div className="w-6 h-6 mr-3">
                <NextImageWrapper src="/metamask-fox.svg" alt="MetaMask" width={24} height={24} />
              </div>
              <span>MetaMask</span>
            </button>
            
            <button
              onClick={() => handleConnect('walletconnect')}
              className="w-full flex items-center justify-center gap-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
            >
              <div className="w-6 h-6 mr-3">
                <NextImageWrapper src="/walletconnect-logo.svg" alt="WalletConnect" width={24} height={24} />
              </div>
              <span>WalletConnect</span>
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
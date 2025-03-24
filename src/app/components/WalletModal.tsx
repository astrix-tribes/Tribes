"use client";
import React, { useState } from 'react';
import NextImageWrapper from '../../components/NextImageWrapper';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => Promise<void>;
  connectedAccount?: string;
  balance?: string;
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  connectedAccount,
  balance
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true);
    try {
      await onConnect(walletType);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  // Format address for display (e.g., 0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4 border border-gray-700 text-gray-100">
        {!connectedAccount ? (
          // Wallet selection view
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-100">Connect Wallet</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleConnect('metamask')}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <NextImageWrapper src="/metamask-fox.svg" alt="MetaMask" width={8} height={8} />
                  </div>
                  <span className="font-medium">MetaMask</span>
                </div>
                <span className="text-sm text-gray-400">Popular</span>
              </button>
              
              <button
                onClick={() => handleConnect('walletconnect')}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <NextImageWrapper src="/walletconnect-logo.svg" alt="WalletConnect" width={8} height={8} />
                  </div>
                  <span className="font-medium">WalletConnect</span>
                </div>
                <span className="text-sm text-gray-400">Multi-device</span>
              </button>
            </div>
          </>
        ) : (
          // Connected account view
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-100">Connected account</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center justify-between p-2 mb-6">
              <div className="font-mono text-lg text-purple-300">{formatAddress(connectedAccount)}</div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => copyToClipboard(connectedAccount)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-300"
                  title="Copy address"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                <button 
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-300"
                  title="QR Code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <div className="flex flex-col">
                <h3 className="text-xl mb-2 text-gray-200">Wallet</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-xl">
                  <div className="bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xl font-bold text-gray-100">Fuse Token</div>
                        <div className="text-gray-400">FUSE</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl text-gray-100">{balance || '0.0000'}</div>
                        <div className="text-gray-400">$0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-6 border-t border-gray-700 pt-6">
              <button
                onClick={() => window.location.href = '/connect/switch-network'}
                className="flex items-center justify-center gap-2 w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Switch Network</span>
              </button>
            </div>
            
            <div className="flex items-center mt-4">
              <button
                onClick={() => {
                  // Handle disconnect
                  onConnect('');
                }}
                className="flex items-center justify-center gap-2 w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 text-red-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Disconnect</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletModal; 
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from './WalletProvider';
import { useProfile } from '../../context/ProfileContext';
import { formatAddress } from '../../utils/ethereum';
import NextImageWrapper from '../../components/NextImageWrapper';

const Header: React.FC = () => {
  const { account, isConnected, connectWallet, switchNetwork, disconnectWallet, chainId } = useWallet();
  const { profile } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Determine network name from chainId
  const getNetworkName = (): string => {
    if (!chainId) return 'Unknown Network';
    
    // Common network IDs (in hex)
    switch (chainId) {
      case '0x122': // 290 in decimal
        return 'Fuse Ember';
      case '0x7a': // 122 in decimal
        return 'Fuse Network';
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x5':
        return 'Goerli Testnet';
      case '0x89':
        return 'Polygon';
      case '0x38':
        return 'BNB Smart Chain';
      default:
        return `Network #${parseInt(chainId, 16)}`;
    }
  };

  const handleConnect = async () => {
    if (!isConnected) {
      await connectWallet('metamask');
    }
  };

  const copyToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on window resize (when screen becomes large enough)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-purple-400 mr-6">
              Fuse Tribe
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex gap-6">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-purple-400 transition-colors">
                    Feed
                  </Link>
                </li>
                <li>
                  <Link href="/tribes" className="text-gray-300 hover:text-purple-400 transition-colors">
                    Tribes
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-gray-300 hover:text-purple-400 transition-colors">
                    Events
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-700 focus:outline-none mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {isConnected ? (
              <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="text-sm font-mono text-purple-300 hidden xs:block">
                    {profile ? `@${profile.username}` : formatAddress(account, 8)}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <Link 
                  href="/profile" 
                  className="bg-gray-700 p-1.5 rounded-full hover:bg-gray-600 transition-colors"
                >
                  {profile && profile.metadata.avatar ? (
                    <NextImageWrapper 
                      src={profile.metadata.avatar} 
                      alt={profile.metadata.name} 
                      width={5}
                      height={5}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </Link>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden z-20">
                    <div className="p-3 border-b border-gray-600">
                      {profile && (
                        <div className="mb-2">
                          <p className="font-medium text-gray-200">{profile.metadata.name}</p>
                          <p className="text-purple-300 text-sm">@{profile.username}</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-400">Connected with MetaMask</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-mono text-sm text-purple-300 truncate">{formatAddress(account, 8)}</p>
                        <button 
                          onClick={copyToClipboard}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Copy address"
                        >
                          {copySuccess ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* Network Indicator */}
                      <div className="mt-2 flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-gray-300">{getNetworkName()}</span>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link 
                        href="/profile"
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {profile ? 'View Profile' : 'Create Profile'}
                      </Link>
                      
                      <button 
                        onClick={switchNetwork}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Switch to Fuse Ember
                      </button>
                      
                      <button 
                        onClick={disconnectWallet}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-purple-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="hidden xs:inline">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden bg-gray-800 border-t border-gray-700 mt-3 rounded-b-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
          >
            <nav className="py-2">
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/" 
                    className="block px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Feed
                    </div>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tribes" 
                    className="block px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Tribes
                    </div>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/events" 
                    className="block px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Events
                    </div>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </div>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 
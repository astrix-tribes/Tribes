'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePosts } from '../context/PostsContext';
import { useWallet } from '../app/components/WalletProvider';
import PostList from '../components/PostList';
import TribeList from '../components/TribeList';
import TribeModal from '../components/TribeModal';
import '../styles/homePage.css';
import Header from './components/Header';

export default function HomePage() {
  const { isConnected } = useWallet();
  const { tribes, posts } = usePosts();
  const [tribeModalOpen, setTribeModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6 inline-block">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gray-800 rounded-full p-6 border border-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Welcome to FuseTribe</h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              A decentralized platform for creating and joining communities on the Fuse Network
            </p>
            <Link
              href="/connect"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="relative rounded-md bg-gray-900 px-5 py-3 transition-all duration-300 ease-out group-hover:bg-opacity-0">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Wallet to Get Started
                </span>
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              } 
              title="Join Communities" 
              description="Find and join tribes based on your interests and connect with like-minded individuals"
            />
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              } 
              title="Engage in Discussions" 
              description="Share thoughts, ask questions, and participate in meaningful conversations"
            />
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              } 
              title="Attend Events" 
              description="Discover and participate in virtual and in-person events organized by tribe members"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="relative min-h-[calc(100vh-64px)] flex">
        {/* Sidebar Toggle Button for Mobile */}
        <button 
          className="lg:hidden sidebar-toggle fixed bottom-6 right-6 z-50 rounded-full bg-purple-600 p-3 shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* Left Sidebar - Tribes */}
        <div 
          className={`sidebar fixed lg:static top-[64px] left-0 h-[calc(100vh-64px)] w-80 border-r border-gray-800 bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } overflow-y-auto`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-100">Communities</h2>
              <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                {tribes.length}
              </span>
            </div>
            <button
              onClick={() => setTribeModalOpen(true)}
              className="w-full mb-6 group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="relative flex items-center justify-center gap-2 w-full rounded-md bg-gray-900 px-5 py-2.5 transition-all duration-300 ease-out group-hover:bg-opacity-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Tribe
              </span>
            </button>
            <TribeList />
          </div>
        </div>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Posts */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Your Feed</h1>
                {posts.length > 0 && (
                  <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                    {posts.length}
                  </span>
                )}
              </div>
              <p className="text-gray-400">
                Welcome to FuseTribe! Join tribes or create your own to start engaging with posts.
              </p>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  href="/tribes"
                  className="flex flex-col items-center justify-center p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-300">Browse Tribes</span>
                </Link>
                
                <Link
                  href="/events"
                  className="flex flex-col items-center justify-center p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-300">Events</span>
                </Link>
                
                <Link
                  href="/profile"
                  className="flex flex-col items-center justify-center p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm text-gray-300">Profile</span>
                </Link>
              </div>
            </div>
            
            <PostList />
          </div>
        </div>
      </div>
      
      {/* Tribe Creation Modal */}
      <TribeModal 
        isOpen={tribeModalOpen} 
        onClose={() => setTribeModalOpen(false)}
      />
    </div>
  );
}

// Feature card component for the landing page
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-500/30 group">
      <div className="flex items-center justify-center w-14 h-14 bg-purple-900/30 rounded-lg mb-4 group-hover:bg-purple-800/40 transition-colors">
        <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-100">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

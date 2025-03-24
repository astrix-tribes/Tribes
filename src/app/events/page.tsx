'use client';

import React from 'react';
import Link from 'next/link';
import { EventsProvider } from '../../context/EventsContext';
import EventList from '../../components/events/EventList';
import { useWallet } from '../components/WalletProvider';
import Header from '../components/Header';

const EventsPage: React.FC = () => {
  const { isConnected } = useWallet();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <EventsProvider>
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-100">Events</h1>
              {isConnected && (
                <Link
                  href="/events/create"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Event
                </Link>
              )}
            </div>
            
            {!isConnected ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-300 mb-4">Connect your wallet to view and create events.</p>
              </div>
            ) : (
              <EventList />
            )}
          </div>
        </div>
      </EventsProvider>
    </div>
  );
};

export default EventsPage; 
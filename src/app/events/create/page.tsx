'use client';

import React from 'react';
import Link from 'next/link';
import { EventsProvider } from '../../../context/EventsContext';
import CreateEventForm from '../../../components/events/CreateEventForm';
import { useWallet } from '../../components/WalletProvider';
import Header from '../../components/Header';

const CreateEventPage: React.FC = () => {
  const { isConnected } = useWallet();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <Header />
      
      <EventsProvider>
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
              <Link href="/events" className="text-purple-400 hover:text-purple-300 mr-4">
                ← Back to Events
              </Link>
              <h1 className="text-2xl font-bold text-gray-100">Create a New Event</h1>
            </div>
            
            {!isConnected ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-300 mb-4">Please connect your wallet to create an event.</p>
              </div>
            ) : (
              <CreateEventForm />
            )}
          </div>
        </div>
      </EventsProvider>
    </div>
  );
};

export default CreateEventPage; 
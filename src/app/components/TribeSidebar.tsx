"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from './WalletProvider';

// Temporary mock data - will be replaced with contract data
const MOCK_TRIBES = [
  { id: '1', name: 'DeFi Enthusiasts', memberCount: 1243 },
  { id: '2', name: 'NFT Collectors', memberCount: 876 },
  { id: '3', name: 'Fuse Developers', memberCount: 521 },
  { id: '4', name: 'DAO Governance', memberCount: 328 },
  { id: '5', name: 'Web3 Gaming', memberCount: 912 },
];

const TribeSidebar: React.FC = () => {
  const { isConnected } = useWallet();
  const [tribes, setTribes] = useState(MOCK_TRIBES);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual contract call to fetch tribes
  useEffect(() => {
    const fetchTribes = async () => {
      setIsLoading(true);
      try {
        // This will be replaced with a real contract call
        // const tribeContract = new Contract(tribeContractAddress, tribeABI, provider);
        // const fetchedTribes = await tribeContract.getAllTribes();
        // setTribes(fetchedTribes);
        
        // For now, we use mock data with a delay to simulate loading
        setTimeout(() => {
          setTribes(MOCK_TRIBES);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching tribes:', error);
        setIsLoading(false);
      }
    };

    fetchTribes();
  }, []);

  return (
    <aside className="w-64 border-r border-gray-700 min-h-screen p-4 bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-200">Tribes</h2>
        {isConnected && (
          <Link 
            href="/create-tribe" 
            className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            Create
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <ul className="space-y-2">
          {tribes.map((tribe) => (
            <li key={tribe.id}>
              <Link 
                href={`/tribe/${tribe.id}`}
                className="block p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-200">{tribe.name}</div>
                <div className="text-sm text-gray-400">{tribe.memberCount.toLocaleString()} members</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default TribeSidebar; 
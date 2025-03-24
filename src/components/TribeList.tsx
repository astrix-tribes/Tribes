import React from 'react';
import Link from 'next/link';
import { usePosts } from '../context/PostsContext';
import { Tribe } from '../utils/contracts/tribeController';

interface TribeListProps {
  showCreateButton?: boolean;
}

const TribeList: React.FC<TribeListProps> = ({ showCreateButton = false }) => {
  const { tribes, tribesLoading, tribesError } = usePosts();

  if (tribesLoading) {
    return (
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-3"></div>
          <p className="text-gray-400 text-sm">Loading tribes...</p>
        </div>
      </div>
    );
  }

  if (tribesError) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl">
        <div className="text-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 mb-1">Failed to load tribes</p>
          <p className="text-sm text-red-400/70 mb-3">{tribesError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 shadow-sm">
      {showCreateButton && (
        <Link
          href="/create-tribe"
          className="block w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
        >
          Create New Tribe
        </Link>
      )}

      {tribes.length === 0 ? (
        <div className="text-center py-6 fade-in">
          <div className="bg-gray-700/50 rounded-full p-4 inline-block mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-300 font-medium">No tribes found</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create a tribe to get started</p>
          <Link
            href="/create-tribe"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create First Tribe
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-300 font-medium">Your Communities</h3>
            <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full text-xs">
              {tribes.length}
            </span>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 tribe-scroll">
            {tribes.map((tribe) => (
              <TribeItem key={tribe.id} tribe={tribe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TribeItemProps {
  tribe: Tribe;
}

const TribeItem: React.FC<TribeItemProps> = ({ tribe }) => {
  // Helper to truncate long descriptions
  const truncateDescription = (desc: string, maxLength = 100) => {
    if (desc.length <= maxLength) return desc;
    return `${desc.substring(0, maxLength)}...`;
  };

  return (
    <Link
      href={`/connect/tribe/${tribe.id}`}
      className="block p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-md tribe-card"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-200">{tribe.name}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {truncateDescription(tribe.description)}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm bg-gray-700 px-2 py-1 rounded-full text-purple-300 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">{tribe.memberCount}</span>
          </div>
          {tribe.joinType === 0 && (
            <span className="mt-2 text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">Open</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TribeList; 
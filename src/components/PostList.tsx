import React from 'react';
import Link from 'next/link';
import { usePosts } from '../context/PostsContext';
import Post from './Post';

const PostList: React.FC = () => {
  const { posts, loading, error, tribes } = usePosts();

  if (loading) {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 shadow-lg">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-900/30 border border-red-700 p-6 shadow-lg">
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-lg mb-2">Failed to load posts</p>
          <p className="text-red-500/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="text-center py-12">
          <div className="bg-gray-700/50 rounded-full p-6 inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-6">Join a tribe or create your own to see posts here</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tribes"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Browse Tribes
            </Link>
            
            {tribes.length > 0 && (
              <Link
                href="/connect/create-post"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Post
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {posts.map((post) => {
        const tribe = tribes.find(t => t.id === post.tribeId);
        return (
          <div 
            key={post.id} 
            className="transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl"
          >
            <Post post={post} tribeName={tribe?.name} />
          </div>
        );
      })}
    </div>
  );
};

export default PostList; 
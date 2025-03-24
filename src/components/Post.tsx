import React from 'react';
import Link from 'next/link';
import { formatAddress } from '../utils/ethereum';
import { Post as PostType } from '../utils/contracts/postMinter';
import NextImageWrapper from './NextImageWrapper';

interface PostProps {
  post: PostType;
  tribeName?: string;
}

const Post: React.FC<PostProps> = ({ post, tribeName }) => {
  // Parse date from ISO string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const renderContent = () => {
    // Handle different post types
    switch (post.metadata.type) {
      case 'IMAGE':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">{post.metadata.title}</h3>
            <p className="text-gray-300">{post.metadata.content}</p>
            {post.metadata.imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <NextImageWrapper 
                  src={post.metadata.imageUrl} 
                  alt={post.metadata.title || 'Post image'} 
                  className="w-full h-auto max-h-80 object-cover"
                  fill={true}
                />
              </div>
            )}
          </div>
        );
      
      case 'EVENT':
        // Simple placeholder for event posts
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md mr-2">EVENT</span>
              <h3 className="text-lg font-semibold text-gray-200">{post.metadata.title}</h3>
            </div>
            <p className="text-gray-300">{post.metadata.content}</p>
          </div>
        );
      
      case 'TEXT':
      default:
        return (
          <div className="space-y-3">
            {post.metadata.title && (
              <h3 className="text-lg font-semibold text-gray-200">{post.metadata.title}</h3>
            )}
            <p className="text-gray-300">{post.metadata.content}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-200">{formatAddress(post.creator)}</div>
            <div className="text-sm text-gray-400">
              {post.metadata.createdAt && formatDate(post.metadata.createdAt)}
            </div>
          </div>

          {tribeName && (
            <Link href={`/connect/tribe/${post.tribeId}`} className="text-sm text-purple-400 hover:underline">
              {tribeName}
            </Link>
          )}

          <div className="mt-3">
            {renderContent()}
          </div>

          <div className="mt-4 flex items-center text-gray-400 text-sm">
            <button className="flex items-center hover:text-purple-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"
                />
              </svg>
              {post.likes || 0}
            </button>
            <button className="flex items-center ml-4 hover:text-purple-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
              {post.replies || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post; 
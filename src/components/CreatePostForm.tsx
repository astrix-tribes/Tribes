import React, { useState } from 'react';
import { usePosts } from '../context/PostsContext';
import NextImageWrapper from './NextImageWrapper';

type PostType = 'TEXT' | 'IMAGE';

interface CreatePostFormProps {
  tribeId?: string; // Optional, if not provided will show tribe selector
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ tribeId }) => {
  const { tribes, createNewTextPost, createNewImagePost } = usePosts();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTribeId, setSelectedTribeId] = useState(tribeId || '');
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTribeId) {
      setError('Please select a tribe');
      return;
    }
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }
    
    if (postType === 'IMAGE' && !imageUrl) {
      setError('Image URL is required for image posts');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (postType === 'IMAGE') {
        await createNewImagePost(selectedTribeId, title, content, imageUrl);
      } else {
        await createNewTextPost(selectedTribeId, title, content);
      }
      
      // Clear form after successful submission
      setTitle('');
      setContent('');
      setImageUrl('');
      if (!tribeId) {
        setSelectedTribeId('');
      }
      setPostType('TEXT');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Create New Post</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Post Type Selection */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setPostType('TEXT')}
              className={`px-4 py-2 rounded-md ${
                postType === 'TEXT'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Text Post
            </button>
            <button
              type="button"
              onClick={() => setPostType('IMAGE')}
              className={`px-4 py-2 rounded-md ${
                postType === 'IMAGE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Image Post
            </button>
          </div>
        </div>
        
        {/* Tribe Selector (if tribeId is not provided) */}
        {!tribeId && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Select Tribe</label>
            <select
              value={selectedTribeId}
              onChange={(e) => setSelectedTribeId(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
              required
            >
              <option value="">-- Select a Tribe --</option>
              {tribes.map((tribe) => (
                <option key={tribe.id} value={tribe.id}>
                  {tribe.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
            required
          />
        </div>
        
        {/* Content Input */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={5}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
            required
          />
        </div>
        
        {/* Image URL Input (only for Image posts) */}
        {postType === 'IMAGE' && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
              required
            />
            {imageUrl && (
              <div className="mt-2 p-2 border border-gray-600 rounded-lg">
                <NextImageWrapper
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-40 rounded"
                  width={400}
                  height={200}
                  style={{ maxHeight: '160px' }}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm; 
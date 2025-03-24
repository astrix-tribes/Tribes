import React, { useState } from 'react';
import { usePosts } from '../context/PostsContext';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  tribeId?: string;
}

type PostType = 'TEXT' | 'IMAGE';

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, tribeId }) => {
  const { createNewTextPost, createNewImagePost, tribes } = usePosts();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTribeId, setSelectedTribeId] = useState(tribeId || '');
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or tribeId changes
  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setImageUrl('');
      setSelectedTribeId(tribeId || '');
      setPostType('TEXT');
      setError(null);
    }
  }, [isOpen, tribeId]);

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
      if (postType === 'TEXT') {
        await createNewTextPost(selectedTribeId, title, content);
      } else {
        await createNewImagePost(selectedTribeId, title, content, imageUrl);
      }
      
      // Close modal after successful submission
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">Create New Post</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type Selection */}
            <div>
              <label className="block text-gray-300 mb-2">Post Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPostType('TEXT')}
                  className={`p-3 rounded-lg border ${
                    postType === 'TEXT'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">Text Post</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPostType('IMAGE')}
                  className={`p-3 rounded-lg border ${
                    postType === 'IMAGE'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">Image Post</div>
                </button>
              </div>
            </div>
            
            {/* Tribe Selector - only show if tribeId not provided */}
            {!tribeId && (
              <div>
                <label className="block text-gray-300 mb-2">Select Tribe</label>
                <select
                  value={selectedTribeId}
                  onChange={(e) => setSelectedTribeId(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
                  required
                >
                  <option value="">Select a tribe</option>
                  {tribes.map((tribe) => (
                    <option key={tribe.id} value={tribe.id}>
                      {tribe.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Title Input */}
            <div>
              <label className="block text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
                required
              />
            </div>
            
            {/* Content Input */}
            <div>
              <label className="block text-gray-300 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
                required
              />
            </div>
            
            {/* Image URL Input (for image posts) */}
            {postType === 'IMAGE' && (
              <div>
                <label className="block text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
                  required
                />
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostModal; 
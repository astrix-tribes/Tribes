import React, { useState } from 'react';
import { usePosts } from '../context/PostsContext';
import { JoinType } from '../utils/contracts/tribeController';

interface TribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TribeModal: React.FC<TribeModalProps> = ({ isOpen, onClose }) => {
  const { createNewTribe } = usePosts();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinType, setJoinType] = useState<JoinType>(JoinType.Open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setJoinType(JoinType.Open);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description) {
      setError('Name and description are required');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await createNewTribe(name, description, joinType);
      
      // Close modal after successful submission
      onClose();
    } catch (err) {
      console.error('Error creating tribe:', err);
      setError('Failed to create tribe. Please try again.');
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
            <h2 className="text-xl font-bold text-gray-100">Create New Tribe</h2>
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
            {/* Name Input */}
            <div>
              <label className="block text-gray-300 mb-2">Tribe Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tribe name"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
                required
              />
            </div>
            
            {/* Description Input */}
            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your tribe..."
                rows={4}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-100"
                required
              />
            </div>
            
            {/* Join Type Selection */}
            <div>
              <label className="block text-gray-300 mb-2">Join Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setJoinType(JoinType.Open)}
                  className={`p-3 rounded-lg border ${
                    joinType === JoinType.Open
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">Open</div>
                  <div className="text-sm opacity-75 mt-1">Anyone can join</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setJoinType(JoinType.Approval)}
                  className={`p-3 rounded-lg border ${
                    joinType === JoinType.Approval
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">Approval</div>
                  <div className="text-sm opacity-75 mt-1">Admin must approve</div>
                </button>
              </div>
            </div>
            
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
                {isSubmitting ? 'Creating...' : 'Create Tribe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TribeModal; 
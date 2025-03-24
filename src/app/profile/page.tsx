'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../components/WalletProvider';
import { useProfile, ProfileMetadata } from '../../context/ProfileContext';
import { usePosts } from '../../context/PostsContext';
import { useEvents } from '../../context/EventsContext';
import { ProfileProvider } from '../../context/ProfileContext';
import Header from '../components/Header';
import { formatAddress } from '../../utils/ethereum';
import Post from '../../components/Post';
import { Event } from '../../utils/contracts/eventController';
import { Tribe } from '../../utils/contracts/tribeController';
import NextImageWrapper from '../../components/NextImageWrapper';

const ProfileForm = ({ 
  initialData,
  onSubmit,
  isCreate = false
}: { 
  initialData?: ProfileMetadata,
  onSubmit: (data: ProfileMetadata) => void,
  isCreate?: boolean
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatar, setAvatar] = useState(initialData?.avatar || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [twitter, setTwitter] = useState(initialData?.socialLinks?.twitter || '');
  const [telegram, setTelegram] = useState(initialData?.socialLinks?.telegram || '');
  const [discord, setDiscord] = useState(initialData?.socialLinks?.discord || '');
  const [website, setWebsite] = useState(initialData?.socialLinks?.website || '');
  const [usernameError, setUsernameError] = useState('');
  
  const { checkUsername } = useProfile();
  
  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    const exists = await checkUsername(value);
    if (exists) {
      setUsernameError('Username already taken');
    } else {
      setUsernameError('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreate && usernameError) {
      return;
    }
    
    const profileData: ProfileMetadata = {
      name,
      bio: bio || undefined,
      avatar: avatar || undefined,
      coverImage: coverImage || undefined,
      socialLinks: {
        twitter: twitter || undefined,
        telegram: telegram || undefined,
        discord: discord || undefined,
        website: website || undefined
      }
    };
    
    onSubmit(profileData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Full Name*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
          required
        />
      </div>
      
      {isCreate && (
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Username* (cannot be changed later)</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={handleUsernameChange}
            className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            required
          />
          {usernameError && (
            <p className="text-red-400 mt-1 text-sm">{usernameError}</p>
          )}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Avatar URL</label>
        <input
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Cover Image URL</label>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
          placeholder="https://example.com/cover.jpg"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-gray-300 mb-3">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 mb-1">Twitter</label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              placeholder="https://twitter.com/username"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Telegram</label>
            <input
              type="url"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              placeholder="https://t.me/username"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Discord</label>
            <input
              type="text"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              placeholder="username#1234"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          disabled={isCreate && !!usernameError}
        >
          {isCreate ? 'Create Profile' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

const UserContent = ({ account }: { account: string }) => {
  const { posts, tribes } = usePosts();
  const { userEvents } = useEvents();
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'tribes'>('posts');

  // Filter posts by the current user
  const userPosts = posts.filter(post => post.creator.toLowerCase() === account.toLowerCase());
  
  // Filter tribes owned by the current user (using admin field)
  const userTribes = tribes.filter(tribe => tribe.admin?.toLowerCase() === account.toLowerCase());

  return (
    <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'posts' 
              ? 'border-b-2 border-purple-500 text-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Your Posts ({userPosts.length})
        </button>
        <button
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'events' 
              ? 'border-b-2 border-purple-500 text-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('events')}
        >
          Your Events ({userEvents.length})
        </button>
        <button
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'tribes' 
              ? 'border-b-2 border-purple-500 text-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('tribes')}
        >
          Your Tribes ({userTribes.length})
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <div>
            {userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.map(post => (
                  <Post 
                    key={post.id} 
                    post={post} 
                    tribeName={tribes.find(t => t.id === post.tribeId)?.name}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>You haven&apos;t created any posts yet.</p>
                <Link 
                  href="/connect/create-post"
                  className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Create Your First Post
                </Link>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'events' && (
          <div>
            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>You haven&apos;t created any events yet.</p>
                <Link 
                  href="/events/create"
                  className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Create Your First Event
                </Link>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'tribes' && (
          <div>
            {userTribes.length > 0 ? (
              <div className="space-y-4">
                {userTribes.map(tribe => (
                  <TribeCard key={tribe.id} tribe={tribe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>You haven&apos;t created any tribes yet.</p>
                <Link 
                  href="/connect/create-tribe"
                  className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Create Your First Tribe
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component for displaying an event card
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  let eventData;
  try {
    eventData = JSON.parse(event.metadataURI);
  } catch {
    return null;
  }

  const startDate = eventData.startDate 
    ? new Date(eventData.startDate * 1000).toLocaleString() 
    : 'Unknown date';
  
  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden shadow-md">
      {eventData.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <NextImageWrapper 
            src={eventData.imageUrl} 
            alt={eventData.title}
            fill={true}
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-100">{eventData.title}</h3>
        <p className="text-gray-400 mb-2">{startDate}</p>
        <p className="text-gray-300 mb-4 line-clamp-2">{eventData.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {event.ticketsSold} / {event.maxTickets} tickets sold
          </span>
          <span className="text-sm font-semibold text-purple-300">
            {event.price} ETH
          </span>
        </div>
        
        <div className="mt-3">
          <Link 
            href={`/events/${event.id}`}
            className="w-full block text-center bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// Component for displaying a tribe card
const TribeCard: React.FC<{ tribe: Tribe }> = ({ tribe }) => {
  return (
    <Link
      href={`/connect/tribe/${tribe.id}`}
      className="block p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-200 text-lg">{tribe.name}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {tribe.description.length > 100 
              ? `${tribe.description.substring(0, 100)}...` 
              : tribe.description}
          </p>
        </div>
        <div className="text-sm text-gray-400">
          <span className="font-medium">{tribe.memberCount}</span> members
        </div>
      </div>
    </Link>
  );
};

const ProfileContent = () => {
  const { account, isConnected, balance } = useWallet();
  const { profile, loading, error, createProfile, updateProfile } = useProfile();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const handleCreateProfile = async (profileData: ProfileMetadata, username: string) => {
    if (!username) return;
    
    setProcessing(true);
    setTransactionStatus(null);
    
    try {
      const success = await createProfile(username, profileData);
      
      if (success) {
        setTransactionStatus({
          success: true,
          message: 'Profile created successfully!'
        });
        setShowCreateForm(false);
      } else {
        setTransactionStatus({
          success: false,
          message: 'Failed to create profile. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setTransactionStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleUpdateProfile = async (profileData: ProfileMetadata) => {
    setProcessing(true);
    setTransactionStatus(null);
    
    try {
      const success = await updateProfile(profileData);
      
      if (success) {
        setTransactionStatus({
          success: true,
          message: 'Profile updated successfully!'
        });
        setShowUpdateForm(false);
      } else {
        setTransactionStatus({
          success: false,
          message: 'Failed to update profile. Please try again.'
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setTransactionStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300 mb-4">Please connect your wallet to view or create your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Status message */}
      {transactionStatus && (
        <div className={`mb-6 p-4 rounded-lg ${transactionStatus.success ? 'bg-green-900/30 border border-green-700 text-green-400' : 'bg-red-900/30 border border-red-700 text-red-400'}`}>
          {transactionStatus.message}
        </div>
      )}
      
      {/* No profile view */}
      {!profile && !showCreateForm && (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">{`You don't have a profile yet.`}</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Create Profile'}
          </button>
        </div>
      )}
      
      {/* Create profile form */}
      {!profile && showCreateForm && (
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Create Your Profile</h2>
          <ProfileForm 
            onSubmit={(data) => {
              const usernameInput = document.querySelector('input[name="username"]') as HTMLInputElement;
              if (usernameInput) {
                handleCreateProfile(data, usernameInput.value);
              }
            }}
            isCreate={true}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-300"
              disabled={processing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Profile view */}
      {profile && !showUpdateForm && (
        <div>
          {/* Cover image */}
          {profile.metadata.coverImage && (
            <div className="h-48 overflow-hidden rounded-t-lg mb-4">
              <NextImageWrapper 
                src={profile.metadata.coverImage}
                alt="Cover"
                fill={true}
                className="object-cover"
              />
            </div>
          )}
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 flex-shrink-0 mb-4 md:mb-0">
                {profile.metadata.avatar ? (
                  <NextImageWrapper 
                    src={profile.metadata.avatar}
                    alt={profile.metadata.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile?.metadata?.name?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-100 mb-1">{profile.metadata.name}</h1>
                <p className="text-purple-400 mb-3">@{profile.username}</p>
                
                <p className="text-gray-300 mb-4">{profile.metadata.bio || 'No bio provided'}</p>
                
                <div className="mb-4 flex flex-wrap items-center">
                  <p className="text-gray-400 mr-4">
                    <span className="font-medium">Address:</span> {formatAddress(profile.owner)}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Balance:</span> <span className="text-purple-300">{parseFloat(balance).toFixed(4)} FUSE</span>
                  </p>
                </div>
                
                {/* Social links */}
                {profile.metadata.socialLinks && Object.values(profile.metadata.socialLinks).some(Boolean) && (
                  <div className="mb-4">
                    <h3 className="text-gray-200 mb-2">Social Links</h3>
                    <div className="flex flex-wrap gap-4">
                      {profile.metadata.socialLinks.twitter && (
                        <a 
                          href={profile.metadata.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Twitter
                        </a>
                      )}
                      {profile.metadata.socialLinks.telegram && (
                        <a 
                          href={profile.metadata.socialLinks.telegram}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Telegram
                        </a>
                      )}
                      {profile.metadata.socialLinks.discord && (
                        <a 
                          href="#"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Discord: {profile.metadata.socialLinks.discord}
                        </a>
                      )}
                      {profile.metadata.socialLinks.website && (
                        <a 
                          href={profile.metadata.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowUpdateForm(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* User content (posts, events, tribes) */}
          {account && <UserContent account={account} />}
        </div>
      )}
      
      {/* Update profile form */}
      {profile && showUpdateForm && (
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Update Your Profile</h2>
          <ProfileForm 
            initialData={profile.metadata} 
            onSubmit={handleUpdateProfile} 
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowUpdateForm(false)}
              className="text-gray-400 hover:text-gray-300"
              disabled={processing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  return (
    <ProfileProvider>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link href="/" className="text-purple-400 hover:text-purple-300 mr-4">
                ← Back to Home
              </Link>
            </div>
            
            <ProfileContent />
          </div>
        </div>
      </div>
    </ProfileProvider>
  );
};

export default ProfilePage;
'use client';

import React, { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { EventMetadata } from '../../utils/contracts/eventController';

const CreateEventForm: React.FC = () => {
  const { isOrganizer, loadingRole, becomeOrganizer, createNewEvent } = useEvents();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationType, setLocationType] = useState<'PHYSICAL' | 'VIRTUAL' | 'HYBRID'>('PHYSICAL');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [virtualLocation, setVirtualLocation] = useState('');
  const [maxTickets, setMaxTickets] = useState(100);
  const [ticketPrice, setTicketPrice] = useState('0.01');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!isOrganizer) {
        throw new Error('You must be an organizer to create events');
      }
      
      // Validate form
      if (!title || !description || !startDate || !endDate) {
        throw new Error('Please fill in all required fields');
      }
      
      // Prepare event data
      const eventData: EventMetadata = {
        title,
        description,
        startDate: new Date(startDate).getTime() / 1000,
        endDate: new Date(endDate).getTime() / 1000,
        location: {
          type: locationType,
          physical: locationType !== 'VIRTUAL' ? physicalLocation : undefined,
          virtual: locationType !== 'PHYSICAL' ? virtualLocation : undefined,
        },
        capacity: maxTickets,
        ticketTypes: [
          {
            name: 'Standard',
            price: ticketPrice,
            supply: maxTickets,
            perWalletLimit: 5
          }
        ]
      };
      
      // Create the event
      const eventId = await createNewEvent(eventData, maxTickets, ticketPrice);
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setPhysicalLocation('');
      setVirtualLocation('');
      setMaxTickets(100);
      setTicketPrice('0.01');
      
      setSuccess(`Event created successfully with ID: ${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBecomeOrganizer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await becomeOrganizer();
      if (!success) {
        throw new Error('Failed to become an organizer. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingRole) {
    return <div className="text-center py-8 text-gray-300">Checking organizer status...</div>;
  }
  
  // If not an organizer, show become organizer button
  if (!isOrganizer) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Create an Event</h2>
        <p className="mb-4 text-gray-300">You need to be an organizer to create events.</p>
        <button
          onClick={handleBecomeOrganizer}
          disabled={loading}
          className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 'Become an Organizer'}
        </button>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">Create a New Event</h2>
      
      {error && <div className="text-red-400 mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">{error}</div>}
      {success && <div className="text-green-400 mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Event Title*</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Description*</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            rows={4}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Start Date/Time*</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">End Date/Time*</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Location Type*</label>
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as 'PHYSICAL' | 'VIRTUAL' | 'HYBRID')}
            className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            required
          >
            <option value="PHYSICAL">Physical Event</option>
            <option value="VIRTUAL">Virtual Event</option>
            <option value="HYBRID">Hybrid Event</option>
          </select>
        </div>
        
        {locationType !== 'VIRTUAL' && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Venue Name</label>
            <input
              type="text"
              value={physicalLocation}
              onChange={(e) => setPhysicalLocation(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            />
          </div>
        )}
        
        {locationType !== 'PHYSICAL' && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Virtual Meeting Link</label>
            <input
              type="text"
              value={virtualLocation}
              onChange={(e) => setVirtualLocation(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Maximum Tickets*</label>
            <input
              type="number"
              value={maxTickets}
              onChange={(e) => setMaxTickets(parseInt(e.target.value))}
              min={1}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Ticket Price (ETH)*</label>
            <input
              type="text"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
              required
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm; 
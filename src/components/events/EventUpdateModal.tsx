'use client';

import React, { useState } from 'react';
import { Event, EventMetadata } from '../../utils/contracts/eventController';

interface EventUpdateModalProps {
  event: Event;
  onClose: () => void;
  onUpdate: (eventData: EventMetadata) => void;
  processing: boolean;
}

const EventUpdateModal: React.FC<EventUpdateModalProps> = ({
  event,
  onClose,
  onUpdate,
  processing
}) => {
  // Parse existing event data
  const originalEventData = JSON.parse(event.metadataURI) as EventMetadata;
  
  // Form state
  const [title, setTitle] = useState(originalEventData.title);
  const [description, setDescription] = useState(originalEventData.description);
  const [startDate, setStartDate] = useState(
    new Date(originalEventData.startDate * 1000).toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    new Date(originalEventData.endDate * 1000).toISOString().slice(0, 16)
  );
  const [locationType, setLocationType] = useState<'PHYSICAL' | 'VIRTUAL' | 'HYBRID'>(
    originalEventData.location.type
  );
  const [physicalLocation, setPhysicalLocation] = useState(
    originalEventData.location.physical || ''
  );
  const [virtualLocation, setVirtualLocation] = useState(
    originalEventData.location.virtual || ''
  );
  const [imageUrl, setImageUrl] = useState(originalEventData.imageUrl || '');
  
  // Has tickets sold - cannot change capacity if tickets have been sold
  const hasTicketsSold = Number(event.ticketsSold) > 0;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare updated event data
    const updatedEventData: EventMetadata = {
      ...originalEventData,
      title,
      description,
      startDate: new Date(startDate).getTime() / 1000,
      endDate: new Date(endDate).getTime() / 1000,
      location: {
        type: locationType,
        physical: locationType !== 'VIRTUAL' ? physicalLocation : undefined,
        virtual: locationType !== 'PHYSICAL' ? virtualLocation : undefined,
      },
      imageUrl: imageUrl || undefined
    };
    
    onUpdate(updatedEventData);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Update Event</h2>
        
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
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Image URL (optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 border bg-gray-700 border-gray-600 rounded text-gray-100"
            />
          </div>
          
          {hasTicketsSold && (
            <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-400">
                <strong>Note:</strong> This event has tickets already sold. 
                You cannot modify the ticket capacity or price.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="border border-gray-600 text-gray-300 px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventUpdateModal; 
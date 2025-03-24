'use client';

import React from 'react';
import Link from 'next/link';
import { useEvents } from '../../context/EventsContext';
import { formatAddress } from '../../utils/ethereum';
import { Event } from '../../utils/contracts/eventController';
import NextImageWrapper from '../NextImageWrapper';

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
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md">
      <div className="relative h-40 bg-gray-700 rounded-t-lg overflow-hidden">
        <NextImageWrapper
          src={eventData.imageUrl || '/event-placeholder.jpg'}
          alt={eventData.title || 'Event'}
          fill={true}
          className="object-cover"
        />
        
        {/* Status badge */}
        <div className={`absolute top-2 right-2 rounded-full px-3 py-1 text-xs font-medium
          ${event.active ? 'bg-green-500' : 'bg-red-500'}`}>
          {event.active ? 'Active' : 'Cancelled'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-100">{eventData.title}</h3>
        <p className="text-gray-400 mb-2">{startDate}</p>
        <p className="text-gray-300 mb-4 line-clamp-2">{eventData.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Organizer: {formatAddress(event.organizer)}
          </span>
          <span className="text-sm font-semibold text-purple-300">
            {event.price} ETH
          </span>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {event.ticketsSold} / {event.maxTickets} tickets sold
          </span>
          <Link 
            href={`/events/${event.id}`}
            className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const EventList: React.FC<{ showUserEventsOnly?: boolean }> = ({ showUserEventsOnly = false }) => {
  const { allEvents, userEvents, loading, error, refreshEvents } = useEvents();
  
  const events = showUserEventsOnly ? userEvents : allEvents;
  
  if (loading) {
    return <div className="text-center py-8 text-gray-300">Loading events...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => refreshEvents()}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300 mb-4">
          {showUserEventsOnly 
            ? "You haven't created any events yet." 
            : "No events found."}
        </p>
        <Link 
          href="/events/create"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Create an Event
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventList; 
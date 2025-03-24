'use client';

import React from 'react';
import { Event } from '../../utils/contracts/eventController';

interface EventCancelModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: () => void;
  processing: boolean;
}

const EventCancelModal: React.FC<EventCancelModalProps> = ({
  event,
  onClose,
  onConfirm,
  processing
}) => {
  // Event data
  const eventData = JSON.parse(event.metadataURI);
  
  // Check if the event has any tickets sold
  const hasTicketsSold = Number(event.ticketsSold) > 0;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Cancel Event</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200">{eventData.title}</h3>
          
          {hasTicketsSold ? (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              <p className="font-semibold mb-2">Cannot Cancel Event</p>
              <p>
                This event already has {event.ticketsSold} tickets sold. 
                Events with sold tickets cannot be cancelled.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-400">
              <p className="font-semibold mb-2">Warning</p>
              <p>
                Are you sure you want to cancel this event? 
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="border border-gray-600 text-gray-300 px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Close
          </button>
          {!hasTicketsSold && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={processing}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : 'Confirm Cancellation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCancelModal; 
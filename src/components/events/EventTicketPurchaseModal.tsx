'use client';

import React, { useState } from 'react';
import { Event } from '../../utils/contracts/eventController';

interface EventTicketPurchaseModalProps {
  event: Event;
  onClose: () => void;
  onPurchase: (quantity: number) => void;
  processing: boolean;
}

const EventTicketPurchaseModal: React.FC<EventTicketPurchaseModalProps> = ({
  event,
  onClose,
  onPurchase,
  processing
}) => {
  const [quantity, setQuantity] = useState(1);
  const availableTickets = Number(event.maxTickets) - Number(event.ticketsSold);
  
  // Calculate total price
  const totalPrice = (parseFloat(event.price) * quantity).toFixed(6);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPurchase(quantity);
  };
  
  // Event data
  const eventData = JSON.parse(event.metadataURI);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Purchase Tickets</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-200">{eventData.title}</h3>
          <p className="text-gray-400 text-sm">
            Price: <span className="text-purple-300">{event.price} ETH</span> per ticket
          </p>
          <p className="text-gray-400 text-sm">
            Available: {availableTickets} tickets
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Quantity</label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={processing || quantity <= 1}
                className="bg-gray-700 text-white px-3 py-2 rounded-l hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= availableTickets) {
                    setQuantity(val);
                  }
                }}
                min={1}
                max={availableTickets}
                className="w-16 p-2 text-center bg-gray-700 border-x border-gray-600 text-gray-100"
                disabled={processing}
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                disabled={processing || quantity >= availableTickets}
                className="bg-gray-700 text-white px-3 py-2 rounded-r hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-300">
              Total: <span className="text-xl font-bold text-purple-300">{totalPrice} ETH</span>
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
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
              disabled={processing || quantity < 1 || quantity > availableTickets}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventTicketPurchaseModal; 
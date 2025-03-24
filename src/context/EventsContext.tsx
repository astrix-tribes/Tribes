'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../app/components/WalletProvider';
import { FUSE_EMBER_DECIMAL } from '../constants/networks';
import { 
  Event, 
  EventMetadata,
  purchaseTickets, 
  cancelEvent,
  createEvent,
  getAllEvents,
  getUserEvents,
  getEvent,
  updateEvent
} from '../utils/contracts/eventController';
import { ROLES, hasRole, assignRole } from '../utils/contracts/roleManager';
import { getServerProvider } from '../utils/server';

interface EventsContextType {
  // Events
  userEvents: Event[];
  allEvents: Event[];
  loading: boolean;
  error: string | null;
  
  // User role
  isOrganizer: boolean;
  loadingRole: boolean;
  
  // Actions
  refreshEvents: () => Promise<void>;
  checkOrganizerRole: () => Promise<boolean>;
  becomeOrganizer: () => Promise<boolean>;
  createNewEvent: (eventData: EventMetadata, maxTickets: number, price: string) => Promise<number>;
  updateEvent: (eventId: string, eventData: EventMetadata) => Promise<boolean>;
  purchaseEventTickets: (eventId: string, amount: number, price: string) => Promise<boolean>;
  cancelUserEvent: (eventId: string) => Promise<boolean>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const { account, isConnected } = useWallet();
  
  // Fixed chainId for contract interactions
  const chainId = FUSE_EMBER_DECIMAL;
  
  // Setup provider and signer
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  // Initialize provider and signer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      if (isConnected && account) {
        provider.getSigner().then(signer => {
          setSigner(signer);
        }).catch(err => {
          console.error('Error getting signer:', err);
          setSigner(null);
        });
      } else {
        setSigner(null);
      }
    }
  }, [isConnected, account]);

  // Check if the user has the organizer role
  const checkOrganizerRole = async (): Promise<boolean> => {
    if (!provider || !account) {
      setIsOrganizer(false);
      setLoadingRole(false);
      return false;
    }
    console.log('Checking organizer role for account:', account);
    
    setLoadingRole(true);
    
    try {
      const hasOrganizerRole = await hasRole(
        provider,
        chainId,
        account,
        ROLES.ORGANIZER_ROLE
      );
      
      setIsOrganizer(hasOrganizerRole);
      setLoadingRole(false);
      return hasOrganizerRole;
    } catch (err) {
      console.error('Error checking organizer role:', err);
      setIsOrganizer(false);
      setLoadingRole(false);
      return false;
    }
  };

  // Become an organizer using admin key directly
  const becomeOrganizer = async (): Promise<boolean> => {
    if (!isConnected || !account) {
      return false;
    }
    
    try {
      // Directly assign role using contract call with admin wallet
      const success = await assignRole(
        getServerProvider(),
        chainId,
        account,
        ROLES.ORGANIZER_ROLE
      );
      
      if (!success) {
        throw new Error('Failed to assign organizer role');
      }
      
      // Wait a bit for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh the role status
      const updated = await checkOrganizerRole();
      return updated;
    } catch (err) {
      console.error('Error becoming organizer:', err);
      return false;
    }
  };

  // Fetch all events
  const refreshEvents = async () => {
    if (!provider) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use our utility functions to get events
      const fetchedEvents = await getAllEvents(provider, chainId);
      setAllEvents(fetchedEvents);
      
      // Get user events if account is connected
      if (account) {
        const userEvts = await getUserEvents(provider, chainId, account);
        setUserEvents(userEvts);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Create a new event directly with contract
  const createNewEvent = async (
    eventData: EventMetadata,
    maxTickets: number,
    price: string
  ): Promise<number> => {
    if (!isConnected || !account || !signer || !isOrganizer) {
      throw new Error('Must be connected and have organizer role');
    }
    
    try {
      // Call the contract directly
      const eventId = await createEvent(
        signer,
        chainId,
        eventData,
        maxTickets,
        price
      );
      
      // Refresh events list
      await refreshEvents();
      
      return eventId;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  // Update an event
  const updateEventFunc = async (
    eventId: string,
    eventData: EventMetadata
  ): Promise<boolean> => {
    if (!isConnected || !account || !signer || !isOrganizer) {
      throw new Error('Must be connected and have organizer role');
    }
    
    try {
      // Call the contract directly
      const success = await updateEvent(
        signer,
        chainId,
        eventId,
        eventData
      );
      
      // Refresh events list
      await refreshEvents();
      
      return success;
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  // Purchase tickets for an event - directly using contract call
  const purchaseEventTickets = async (
    eventId: string,
    amount: number,
    price: string
  ): Promise<boolean> => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // First get the event directly to verify it exists and is valid
      const event = await getEvent(signer.provider as ethers.Provider, chainId, eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} does not exist or is invalid`);
      }
      
      if (!event.active) {
        throw new Error(`Event ${eventId} is not active`);
      }
      
      const success = await purchaseTickets(
        signer,
        chainId,
        eventId,
        amount,
        price
      );
      
      await refreshEvents();
      return success;
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      return false;
    }
  };

  // Cancel an event (organizer only) - directly using contract call
  const cancelUserEvent = async (eventId: string): Promise<boolean> => {
    if (!signer || !isConnected || !isOrganizer) {
      throw new Error('Must be connected and have organizer role');
    }
    
    try {
      // First get the event directly to verify it exists and is valid
      const event = await getEvent(signer.provider as ethers.Provider, chainId, eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} does not exist or is invalid`);
      }
      
      // Verify the user is the organizer of this event
      if (event.organizer.toLowerCase() !== account?.toLowerCase()) {
        throw new Error('You are not the organizer of this event');
      }
      
      const success = await cancelEvent(
        signer,
        chainId,
        eventId
      );
      
      await refreshEvents();
      return success;
    } catch (err) {
      console.error('Error canceling event:', err);
      return false;
    }
  };

  // Check role and load events when connected
  useEffect(() => {
    if (provider && account) {
      checkOrganizerRole();
      refreshEvents();
    }
  }, [provider, account]);

  const value = {
    userEvents,
    allEvents,
    loading,
    error,
    isOrganizer,
    loadingRole,
    refreshEvents,
    checkOrganizerRole,
    becomeOrganizer,
    createNewEvent,
    updateEvent: updateEventFunc,
    purchaseEventTickets,
    cancelUserEvent,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}; 
import { ethers } from 'ethers';
import { getContractAddresses } from '../../constants/contracts';
import EventControllerABI from '../../abi/EventController.json';
import { safeContractCall, ContractWithMethods } from '../ethereum';

// Event interface
export interface Event {
  id: string;
  metadataURI: string;
  organizer: string;
  maxTickets: number;
  ticketsSold: number;
  price: string;
  active: boolean;
  
  // Helper method to check if the event is valid
  isValid(): boolean;
  
  // For better serialization support
  toJSON(): any;
}

// Event implementation
export class EventImpl implements Event {
  id: string;
  metadataURI: string;
  organizer: string;
  maxTickets: number;
  ticketsSold: number;
  price: string;
  active: boolean;
  
  constructor(
    id: string,
    metadataURI: string,
    organizer: string,
    maxTickets: number,
    ticketsSold: number,
    price: string,
    active: boolean
  ) {
    this.id = id;
    this.metadataURI = metadataURI;
    this.organizer = organizer;
    this.maxTickets = maxTickets;
    this.ticketsSold = ticketsSold;
    this.price = price;
    this.active = active;
  }
  
  isValid(): boolean {
    return this.maxTickets > 0;
  }
  
  // For better serialization support
  toJSON() {
    return {
      id: this.id,
      metadataURI: this.metadataURI,
      organizer: this.organizer,
      maxTickets: this.maxTickets,
      ticketsSold: this.ticketsSold,
      price: this.price,
      active: this.active,
      isValid: true // Include a flag for validity
    };
  }
}

// Event metadata interface
export interface EventMetadata {
  title: string;
  description: string;
  startDate: number; // UNIX timestamp
  endDate: number; // UNIX timestamp
  location: {
    type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
    physical?: string;
    virtual?: string;
    address?: string;
    coordinates?: {
      latitude: string;
      longitude: string;
    }
  };
  capacity: number | {
    physical: number;
    virtual: number;
  };
  ticketTypes?: Array<{
    name: string;
    type?: 'PHYSICAL' | 'VIRTUAL';
    price: string;
    supply: number;
    perWalletLimit: number;
  }>;
  imageUrl?: string;
}

// Initialize contract
export const getEventControllerContract = (
  provider: ethers.Provider,
  chainId: number
) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.EVENT_CONTROLLER, EventControllerABI, provider);
};

// Check if an event exists
export const eventExists = async (
  provider: ethers.Provider,
  chainId: number,
  eventId: string
): Promise<boolean> => {
  try {
    // Use getEvent to check if the event exists
    const event = await getEvent(provider, chainId, eventId);
    return event !== null && event.isValid();
  } catch (error) {
    console.error(`Error checking if event ${eventId} exists:`, error);
    return false;
  }
};

// Create a new event
export const createEvent = async (
  signer: ethers.Signer,
  chainId: number,
  eventData: EventMetadata,
  maxTickets: number,
  price: string
): Promise<number> => {
  try {
    const contract = getEventControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Convert event data to JSON string
    const metadataURI = JSON.stringify(eventData);
    
    console.log('Creating event with metadata:', metadataURI);
    
    // Create event
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods,
      'createEvent',
      metadataURI,
      maxTickets,
      ethers.parseEther(price),
      { gasLimit: 500000 }
    );
    
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    // Extract event ID from logs
    // Look for EventCreated event and get the id from it
    const abi = new ethers.Interface(EventControllerABI);
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = abi.parseLog(log as ethers.Log);
        if (parsedLog && parsedLog.name === 'EventCreated') {
          const eventId = parsedLog.args[0];
          console.log('Created event with ID:', eventId);
          return Number(eventId);
        }
      } catch (e) {
        console.log('Error parsing log:', e);
        // Skip logs that can't be parsed
        continue;
      }
    }
    
    // If we couldn't find the event ID, return a placeholder
    // In production, you'd want to handle this more gracefully
    console.warn('Could not determine created event ID from logs');
    return 0;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get an event by ID
export const getEvent = async (
  provider: ethers.Provider,
  chainId: number,
  eventId: string
): Promise<Event | null> => {
  try {
    const contract = getEventControllerContract(provider, chainId);
    
    // Directly call the events function on the contract
    const eventData = await safeContractCall<[string, string, bigint, bigint, bigint, boolean]>(
      contract,
      'events',
      eventId
    );
    
    // Create an EventImpl instance
    const event = new EventImpl(
      eventId,
      eventData[0],
      eventData[1],
      Number(eventData[2]),
      Number(eventData[3]),
      ethers.formatEther(eventData[4]),
      eventData[5]
    );
    
    // Check if this is a valid event (maxTickets > 0)
    if (!event.isValid()) {
      console.log(`Event ${eventId} has maxTickets=0, considered invalid`);
      return null;
    }
    
    return event;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
};

// Purchase tickets for an event
export const purchaseTickets = async (
  signer: ethers.Signer,
  chainId: number,
  eventId: string,
  amount: number,
  price: string
): Promise<boolean> => {
  try {
    const contract = getEventControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Purchase tickets
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods,
      'purchaseTickets',
      eventId,
      amount,
      { 
        value: ethers.parseEther(price),
        gasLimit: 300000 
      }
    );
    
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error purchasing tickets for event ${eventId}:`, error);
    return false;
  }
};

// Cancel an event
export const cancelEvent = async (
  signer: ethers.Signer,
  chainId: number,
  eventId: string
): Promise<boolean> => {
  try {
    const contract = getEventControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Cancel event
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods,
      'cancelEvent',
      eventId,
      { gasLimit: 300000 }
    );
    
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error canceling event ${eventId}:`, error);
    return false;
  }
};

// Check ticket balance for an address
export const getTicketBalance = async (
  provider: ethers.Provider,
  chainId: number,
  address: string,
  eventId: string
): Promise<number> => {
  try {
    const contract = getEventControllerContract(provider, chainId);
    const balance = await safeContractCall<bigint>(
      contract,
      'balanceOf',
      address,
      eventId
    );
    
    return Number(balance);
  } catch (error) {
    console.error(`Error checking ticket balance for event ${eventId}:`, error);
    return 0;
  }
};

// Get all events (up to maxEvents)
export const getAllEvents = async (
  provider: ethers.Provider,
  chainId: number,
  maxEvents: number = 20
): Promise<Event[]> => {
  try {
    const events: Event[] = [];
    const contract = getEventControllerContract(provider, chainId);
    
    // Start from ID 0 and fetch events until reaching an invalid event or maxEvents
    let eventId = 0;
    while (eventId < maxEvents) {
      try {
        // Directly call the events function on the contract
        const eventData = await safeContractCall<[string, string, bigint, bigint, bigint, boolean]>(
          contract,
          'events',
          eventId.toString()
        );
        
        // Create an EventImpl instance
        const event = new EventImpl(
          eventId.toString(),
          eventData[0],
          eventData[1],
          Number(eventData[2]),
          Number(eventData[3]),
          ethers.formatEther(eventData[4]),
          eventData[5]
        );
        
        // Check if this is a valid event (maxTickets > 0)
        if (!event.isValid()) {
          console.log(`Event ${eventId} has maxTickets=0, stopping event fetch`);
          break; // Stop fetching events when encountering an invalid one
        }
        
        // Add the event to our list
        events.push(event);
        
      } catch (error) {
        console.log(`No event found at ID ${eventId}, continuing to next ID`, error);
        // If this event doesn't exist, we keep incrementing to check the next ID
      }
      
      eventId++;
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
};

// Get events created by a specific address
export const getUserEvents = async (
  provider: ethers.Provider,
  chainId: number,
  userAddress: string,
  maxEvents: number = 20
): Promise<Event[]> => {
  try {
    const allEvents = await getAllEvents(provider, chainId, maxEvents);
    
    // Filter to include only events organized by the user
    return allEvents.filter(event => 
      event.organizer.toLowerCase() === userAddress.toLowerCase()
    );
  } catch (error) {
    console.error(`Error fetching events for user ${userAddress}:`, error);
    return [];
  }
};

// Update an event's metadata
export const updateEvent = async (
  signer: ethers.Signer,
  chainId: number,
  eventId: string,
  eventData: EventMetadata
): Promise<boolean> => {
  try {
    const contract = getEventControllerContract(signer.provider as ethers.Provider, chainId);
    const contractWithSigner = contract.connect(signer);
    
    // Get the current event to ensure we can only update valid events
    const currentEvent = await getEvent(signer.provider as ethers.Provider, chainId, eventId);
    
    if (!currentEvent) {
      throw new Error(`Event ${eventId} does not exist or is invalid`);
    }
    
    // Verify the signer is the organizer
    const signerAddress = await signer.getAddress();
    if (currentEvent.organizer.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error('Only the event organizer can update this event');
    }
    
    // Check if event is active
    if (!currentEvent.active) {
      throw new Error('Cannot update an inactive or cancelled event');
    }
    
    // Convert updated event data to JSON string
    const metadataURI = JSON.stringify(eventData);
    console.log('Updating event with metadata:', metadataURI);
    
    // Use the new direct updateEventMetadata function in the contract
    const tx = await safeContractCall<ethers.TransactionResponse>(
      contractWithSigner as unknown as ContractWithMethods,
      'updateEventMetadata',
      eventId,
      metadataURI,
      { gasLimit: 300000 }
    );
    
    console.log('Update event transaction sent:', tx.hash);
    await tx.wait();
    
    console.log(`Successfully updated event ${eventId}`);
    return true;
  } catch (error: unknown) {
    console.error(`Error updating event ${eventId}:`, error);
    return false;
  }
};  
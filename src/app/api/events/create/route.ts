import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { FUSE_EMBER_DECIMAL } from '../../../../constants/networks';
import { getServerConnectedAdminWallet, getServerProvider } from '../../../../utils/server';
import { EventMetadata, createEvent } from '../../../../utils/contracts/eventController';
import { hasRole, ROLES } from '../../../../utils/contracts/roleManager';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { eventData, maxTickets, price, userAddress } = body;
    
    // Validate inputs
    if (!eventData || !maxTickets || !price || !userAddress) {
      return NextResponse.json(
        { error: 'Event data, max tickets, price, and user address are required' },
        { status: 400 }
      );
    }
    
    if (!ethers.isAddress(userAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }
    
    // Get provider
    const provider = getServerProvider();
    
    // First check if the user has the ORGANIZER_ROLE
    const isOrganizer = await hasRole(
      provider,
      FUSE_EMBER_DECIMAL,
      userAddress,
      ROLES.ORGANIZER_ROLE
    );
    
    if (!isOrganizer) {
      return NextResponse.json(
        { error: 'User does not have the ORGANIZER_ROLE' },
        { status: 403 }
      );
    }
    
    // Get admin wallet
    const adminWallet = getServerConnectedAdminWallet();
    
    // Create event using our utility function
    const eventId = await createEvent(
      adminWallet,
      FUSE_EMBER_DECIMAL,
      eventData as EventMetadata,
      maxTickets,
      price
    );
    
    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      eventId
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    
    return NextResponse.json(
      { error: 'Failed to create event', details: (error as Error).message },
      { status: 500 }
    );
  }
} 
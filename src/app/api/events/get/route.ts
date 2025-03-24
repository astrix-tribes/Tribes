import { NextRequest, NextResponse } from 'next/server';
import { getEvent } from '../../../../utils/contracts/eventController';
import { FUSE_EMBER_DECIMAL } from '../../../../constants/networks';
import { getServerProvider } from '../../../../utils/server';

export async function GET(request: NextRequest) {
  // Get event ID from the URL
  const url = new URL(request.url);
  const eventId = url.searchParams.get('id');
  
  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Get provider
    const provider = getServerProvider();
    
    // Get event using our utility function
    const event = await getEvent(provider, FUSE_EMBER_DECIMAL, eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: `Event with ID ${eventId} does not exist or is invalid` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
    
  } catch (error) {
    console.error('Error getting event details:', error);
    
    return NextResponse.json(
      { error: 'Failed to get event details', details: (error as Error).message },
      { status: 500 }
    );
  }
} 
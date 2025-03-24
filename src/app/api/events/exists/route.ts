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
    
    // Check if event exists by trying to get the event
    const event = await getEvent(provider, FUSE_EMBER_DECIMAL, eventId);
    
    return NextResponse.json({
      exists: !!event,
      eventId,
      event: event || undefined
    });
    
  } catch (error) {
    console.error('Error checking if event exists:', error);
    
    return NextResponse.json(
      { error: 'Failed to check if event exists', details: (error as Error).message },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { FUSE_EMBER_DECIMAL } from '../../../../constants/networks';
import { getServerProvider } from '../../../../utils/server';
import { assignRole } from '../../../../utils/contracts/roleManager';

// Role constants for validation
const VALID_ROLES = [
  'DEFAULT_ADMIN_ROLE',
  'FAN_ROLE',
  'ORGANIZER_ROLE',
  'MODERATOR_ROLE',
  'ARTIST_ROLE',
  'BRAND_ROLE',
];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { address, role } = body;
    
    // Validate inputs
    if (!address || !role) {
      return NextResponse.json(
        { error: 'Address and role are required' },
        { status: 400 }
      );
    }
    
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }
    
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ' + VALID_ROLES.join(', ') },
        { status: 400 }
      );
    }
    
    // Get provider
    const provider = getServerProvider();
    
    // Assign role using our utility function
    const success = await assignRole(
      provider,
      FUSE_EMBER_DECIMAL,
      address,
      role
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${role} to ${address}`
    });
    
  } catch (error) {
    console.error('Error assigning role:', error);
    
    return NextResponse.json(
      { error: 'Failed to assign role', details: (error as Error).message },
      { status: 500 }
    );
  }
} 
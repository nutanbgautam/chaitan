import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, googleId } = body;
    
    if (!email) {
      return NextResponse.json({
        message: 'Email is required',
      }, { status: 400 });
    }
    
    const db = getDatabase();
    
    // Check if user already exists
    let existingUser = db.getUserByEmail(email);
    if (!existingUser && googleId) {
      existingUser = db.getUserByGoogleId(googleId);
    }
    
    if (existingUser) {
      console.log('Fix user API - User already exists:', {
        email,
        userId: existingUser.id,
        name: existingUser.name
      });
      
      return NextResponse.json({
        message: 'User already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        }
      });
    }
    
    // Create new user
    const userId = db.createUser({
      email,
      name: name || undefined,
      googleId: googleId || undefined,
    });
    
    console.log('Fix user API - Created new user:', {
      email,
      userId,
      name
    });
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        name,
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Fix user API error:', error);
    return NextResponse.json({
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 
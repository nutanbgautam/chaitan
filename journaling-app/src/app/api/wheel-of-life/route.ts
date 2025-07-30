import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Session data:', session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to save your Wheel of Life data'
      }, { status: 401 });
    }

    const body = await request.json();
    const { lifeAreas, priorities, isFirstTime } = body;

    if (!lifeAreas || !Array.isArray(lifeAreas)) {
      return NextResponse.json({ error: 'Invalid life areas data' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Verify user exists in database
    let user = db.getUserById(session.user.id);
    
    // If user not found by ID, try to find by Google ID
    if (!user && session.user.id.length > 20) {
      console.log('Trying to find user by Google ID:', session.user.id);
      user = db.getUserByGoogleId(session.user.id);
      if (user) {
        console.log('Found user by Google ID:', user.id);
        // Update session user ID to the correct database ID
        session.user.id = user.id;
      }
    }
    
    if (!user) {
      console.error('User not found in database:', session.user.id);
      return NextResponse.json({ 
        error: 'User not found',
        message: 'User account not properly created'
      }, { status: 404 });
    }
    
    console.log('User found:', user.id);
    
    // Save wheel of life data
    const wheelOfLifeData = {
      userId: session.user.id,
      lifeAreas: JSON.stringify(lifeAreas),
      priorities: priorities && Array.isArray(priorities) ? JSON.stringify(priorities) : null,
      isCompleted: true
    };

    const existingWheel = db.getWheelOfLifeByUserId(session.user.id);
    if (existingWheel) {
      db.updateWheelOfLife(session.user.id, wheelOfLifeData);
    } else {
      db.createWheelOfLife(wheelOfLifeData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving wheel of life data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to access your Wheel of Life data'
      }, { status: 401 });
    }

    const db = getDatabase();
    
    // Get wheel of life data
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
    
    if (!wheelOfLife) {
      return NextResponse.json({ wheelOfLife: null, priorities: [] });
    }

    // Parse the data with error handling
    let lifeAreas = [];
    let priorities = [];
    
    try {
      if (wheelOfLife.life_areas) {
        lifeAreas = JSON.parse(wheelOfLife.life_areas);
      }
    } catch (parseError) {
      console.error('Error parsing lifeAreas:', parseError);
      return NextResponse.json({ error: 'Invalid life areas data format' }, { status: 500 });
    }
    
    try {
      if (wheelOfLife.priorities) {
        priorities = JSON.parse(wheelOfLife.priorities);
      }
    } catch (parseError) {
      console.error('Error parsing priorities:', parseError);
      // Don't fail on priorities parse error, just use empty array
      priorities = [];
    }

    return NextResponse.json({
      wheelOfLife: lifeAreas,
      priorities: priorities
    });
  } catch (error) {
    console.error('Error fetching wheel of life data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to update your Wheel of Life data'
      }, { status: 401 });
    }

    const body = await request.json();
    const { priorities } = body;

    if (!priorities || !Array.isArray(priorities)) {
      return NextResponse.json({ error: 'Invalid priorities data' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Get existing wheel of life data
    const existingWheel = db.getWheelOfLifeByUserId(session.user.id);
    
    if (!existingWheel) {
      return NextResponse.json({ error: 'No wheel of life data found' }, { status: 404 });
    }

    // Update only the priorities
    const updatedData = {
      ...existingWheel,
      priorities: JSON.stringify(priorities)
    };

    db.updateWheelOfLife(session.user.id, updatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating wheel of life priorities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 
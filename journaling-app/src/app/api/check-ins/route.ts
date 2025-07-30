import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const checkIns = db.getCheckInsByUserId(session.user.id, limit, offset);
    
    // Transform database fields to camelCase for frontend compatibility
    const transformedCheckIns = checkIns.map((checkIn: any) => ({
      id: checkIn.id,
      mood: checkIn.mood,
      energy: checkIn.energy,
      sleepHours: checkIn.sleep_hours,
      sleepMinutes: checkIn.sleep_minutes,
      note: checkIn.note,
      createdAt: checkIn.created_at
    }));
    
    return NextResponse.json(transformedCheckIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = getDatabase();
    const { mood, energy, sleep, note } = await request.json();
    if (!mood || !energy || !sleep) {
      return NextResponse.json(
        { message: 'Mood, energy, and sleep are required' },
        { status: 400 }
      );
    }
    
    const checkInId = db.createCheckIn({
      userId: session.user.id,
      mood,
      energy: energy, // Keep as string since the form sends "High", "Moderate", "Low"
      movement: 5, // Default value
      sleepHours: typeof sleep === 'string' ? parseInt(sleep.split('h')[0]) : sleep.hours || 7,
      sleepMinutes: typeof sleep === 'string' ? parseInt(sleep.split('m')[0].split('h')[1] || '0') : sleep.minutes || 0,
      note,
    });
    
    const checkIn = db.getCheckInsByUserId(session.user.id, 1, 0)[0];
    
    // Transform database fields to camelCase for frontend compatibility
    const transformedCheckIn = {
      id: checkIn.id,
      mood: checkIn.mood,
      energy: checkIn.energy,
      sleepHours: checkIn.sleep_hours,
      sleepMinutes: checkIn.sleep_minutes,
      note: checkIn.note,
      createdAt: checkIn.created_at
    };
    
    return NextResponse.json(transformedCheckIn, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
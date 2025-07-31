import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Check-ins GET - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('Check-ins GET - No session or user ID');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const checkIns = db.getCheckInsByUserId(session.user.id, limit);

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Check-ins GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Check-ins POST - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('Check-ins POST - No session or user ID');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDatabase();
    
    const checkInId = db.createCheckIn({
      userId: session.user.id,
      mood: body.mood,
      energy: body.energy,
      stress: body.stress,
      notes: body.notes
    });

    console.log('Check-ins POST - Created check-in:', checkInId);
    return NextResponse.json({ id: checkInId }, { status: 201 });
  } catch (error) {
    console.error('Check-ins POST error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 
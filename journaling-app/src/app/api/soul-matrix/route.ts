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
    const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
    
    if (!soulMatrix) {
      return NextResponse.json(null);
    }

    // Parse the traits JSON
    const traits = JSON.parse(soulMatrix.traits);
    const analyzedEntries = soulMatrix.analyzed_entries ? JSON.parse(soulMatrix.analyzed_entries) : [];

    return NextResponse.json({
      id: soulMatrix.id,
      userId: soulMatrix.user_id,
      traits,
      confidence: soulMatrix.confidence,
      lastUpdated: soulMatrix.last_updated,
      nextUpdate: soulMatrix.next_update,
      analyzedEntries
    });

  } catch (error) {
    console.error('Error fetching SoulMatrix:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
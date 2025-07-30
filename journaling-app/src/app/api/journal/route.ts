import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const entries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    
    // Transform entries to match the interface
    const enhancedEntries = entries.map(entry => ({
      id: entry.id,
      content: entry.content,
      transcription: entry.transcription,
      processingStatus: entry.processing_status,
      processingType: entry.processing_type,
      createdAt: entry.created_at
    }));

    return NextResponse.json(enhancedEntries);

  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
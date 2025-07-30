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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDatabase();
    const entries = db.getJournalEntriesByUserId(session.user.id, limit, offset);

    // Transform database fields to camelCase for frontend
    const transformedEntries = entries.map(entry => ({
      id: entry.id,
      content: entry.content,
      transcription: entry.transcription,
      audioUrl: entry.audio_url,
      processingType: entry.processing_type,
      processingStatus: entry.processing_status,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));

    return NextResponse.json(transformedEntries);

  } catch (error) {
    console.error('Error fetching journal entries:', error);
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

    const { content, audioUrl, transcription, processingType, processingStatus } = await request.json();

    if (!content && !audioUrl) {
      return NextResponse.json(
        { message: 'Content or audio URL is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const entryId = db.createJournalEntry({
      userId: session.user.id,
      content: content || '',
      audioUrl,
      transcription,
      processingType: processingType || 'full-analysis',
      processingStatus: processingStatus || 'draft',
    });

    const entry = db.getJournalEntryById(entryId);

    // Transform database fields to camelCase for frontend
    const transformedEntry = {
      id: entry.id,
      content: entry.content,
      transcription: entry.transcription,
      audioUrl: entry.audio_url,
      processingType: entry.processing_type,
      processingStatus: entry.processing_status,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    };

    return NextResponse.json(transformedEntry, { status: 201 });

  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
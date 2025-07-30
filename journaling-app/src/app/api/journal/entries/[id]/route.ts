import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const entry = db.getJournalEntryById(id);
    
    if (!entry) {
      return NextResponse.json(
        { message: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check if user owns this entry
    if (entry.user_id !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get analysis results if they exist
    const analysis = db.getAnalysisResultByJournalEntryId(id);

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

    return NextResponse.json({
      entry: transformedEntry,
      analysis: analysis || null
    });

  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const db = getDatabase();
    
    // Check if entry exists and user owns it
    const entry = db.getJournalEntryById(id);
    if (!entry) {
      return NextResponse.json(
        { message: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.user_id !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the entry
    db.updateJournalEntry(id, updates);
    
    const updatedEntry = db.getJournalEntryById(id);
    return NextResponse.json(updatedEntry);

  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    
    // Check if entry exists and user owns it
    const entry = db.getJournalEntryById(id);
    if (!entry) {
      return NextResponse.json(
        { message: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.user_id !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the entry (this will cascade to analysis results)
    const stmt = db.db.prepare('DELETE FROM journal_entries WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ message: 'Entry deleted successfully' });

  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
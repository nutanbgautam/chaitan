import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Journal entries GET - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('Journal entries GET - No session or user ID');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const entries = db.getJournalEntriesByUserId(session.user.id, limit);

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Journal entries GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Journal entries POST - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('Journal entries POST - No session or user ID');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDatabase();
    
    const entryId = db.createJournalEntry({
      userId: session.user.id,
      content: body.content,
      audioUrl: body.audioUrl,
      transcription: body.transcription,
      processingType: body.processingType || 'full-analysis',
      processingStatus: body.processingStatus || 'draft'
    });

    console.log('Journal entries POST - Created entry:', entryId);
    return NextResponse.json({ id: entryId }, { status: 201 });
  } catch (error) {
    console.error('Journal entries POST error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 
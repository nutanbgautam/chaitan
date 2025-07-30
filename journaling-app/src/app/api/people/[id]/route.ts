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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDatabase();
    const people = db.getPeopleByUserId(session.user.id);
    const person = people.find(p => p.id === id);
    
    if (!person) {
      return NextResponse.json(
        { message: 'Person not found' },
        { status: 404 }
      );
    }

    // Get journal entries that mention this person
    const allEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    const mentions = allEntries.filter(entry => {
      const content = entry.transcription || entry.content || '';
      return content.toLowerCase().includes(person.name.toLowerCase());
    });

    // Calculate sentiment based on mentions
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let sentimentTrend = { positive: 0, neutral: 0, negative: 0 };
    let recentMentions: string[] = [];

    if (mentions.length > 0) {
      const positiveWords = ['love', 'great', 'amazing', 'wonderful', 'happy', 'excited', 'grateful', 'fantastic', 'excellent', 'brilliant'];
      const negativeWords = ['angry', 'sad', 'frustrated', 'disappointed', 'upset', 'worried', 'terrible', 'awful', 'horrible', 'annoying'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;

      mentions.forEach(entry => {
        const content = (entry.transcription || entry.content || '').toLowerCase();
        const positiveMatches = positiveWords.filter(word => content.includes(word)).length;
        const negativeMatches = negativeWords.filter(word => content.includes(word)).length;
        
        if (positiveMatches > negativeMatches) {
          positiveCount++;
        } else if (negativeMatches > positiveMatches) {
          negativeCount++;
        } else {
          neutralCount++;
        }

        // Extract recent mentions (first 100 characters of each entry)
        const mention = content.substring(0, 100) + (content.length > 100 ? '...' : '');
        recentMentions.push(mention);
      });

      const total = mentions.length;
      sentimentTrend = {
        positive: Math.round((positiveCount / total) * 100),
        neutral: Math.round((neutralCount / total) * 100),
        negative: Math.round((negativeCount / total) * 100)
      };

      if (positiveCount > negativeCount) sentiment = 'positive';
      else if (negativeCount > positiveCount) sentiment = 'negative';
    }

    // Calculate interaction frequency (mentions per month)
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const recentMentionsFiltered = mentions.filter(entry => 
      new Date(entry.created_at) >= oneMonthAgo
    );
    const interactionFrequency = recentMentionsFiltered.length;

    // Calculate average mood from mentions
    const moodEntries = mentions.filter(entry => entry.mood);
    const averageMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / moodEntries.length
      : undefined;

    // Transform journal entries for frontend
    const journalEntries = mentions.map(entry => ({
      id: entry.id,
      content: entry.content,
      transcription: entry.transcription,
      createdAt: entry.created_at,
      mood: entry.mood,
      sentiment: entry.sentiment,
      title: entry.title
    }));

    return NextResponse.json({
      person: {
        id: person.id,
        name: person.name,
        relationship: person.relationship,
        avatarUrl: person.avatar_url,
        notes: person.notes,
        createdAt: person.created_at
      },
      analytics: {
        totalMentions: mentions.length,
        sentiment,
        sentimentTrend,
        interactionFrequency,
        averageMood,
        recentMentions: recentMentions.slice(0, 5)
      },
      journalEntries
    });

  } catch (error) {
    console.error('Error fetching person details:', error);
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    const db = getDatabase();
    
    // Check if person exists and belongs to user
    const people = db.getPeopleByUserId(session.user.id);
    const person = people.find(p => p.id === id);
    
    if (!person) {
      return NextResponse.json(
        { message: 'Person not found' },
        { status: 404 }
      );
    }

    // Update person
    db.updatePerson(id, {
      name: body.name,
      relationship: body.relationship,
      displayPicture: body.avatarUrl,
      context: body.notes
    });

    return NextResponse.json({
      message: 'Person updated successfully'
    });

  } catch (error) {
    console.error('Error updating person:', error);
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDatabase();
    
    // Check if person exists and belongs to user
    const people = db.getPeopleByUserId(session.user.id);
    const person = people.find(p => p.id === id);
    
    if (!person) {
      return NextResponse.json(
        { message: 'Person not found' },
        { status: 404 }
      );
    }

    // Delete person
    db.deletePerson(id);

    return NextResponse.json({
      message: 'Person deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
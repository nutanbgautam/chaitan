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
    const people = db.getPeopleByUserId(session.user.id);
    
    // Enhance people data with interaction counts and sentiment
    const enhancedPeople = people.map(person => {
      // Get journal entries that mention this person
      const entries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
      const mentions = entries.filter(entry => {
        const content = entry.transcription || entry.content || '';
        return content.toLowerCase().includes(person.name.toLowerCase());
      });

      // Calculate sentiment based on mentions
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (mentions.length > 0) {
        const positiveWords = ['love', 'great', 'amazing', 'wonderful', 'happy', 'excited', 'grateful'];
        const negativeWords = ['angry', 'sad', 'frustrated', 'disappointed', 'upset', 'worried'];
        
        const content = mentions.map(m => m.transcription || m.content).join(' ').toLowerCase();
        const positiveCount = positiveWords.filter(word => content.includes(word)).length;
        const negativeCount = negativeWords.filter(word => content.includes(word)).length;
        
        if (positiveCount > negativeCount) sentiment = 'positive';
        else if (negativeCount > positiveCount) sentiment = 'negative';
      }

      return {
        id: person.id,
        userId: person.user_id,
        name: person.name,
        relationship: person.relationship,
        displayPicture: person.display_picture,
        createdAt: person.created_at,
        updatedAt: person.updated_at,
        interactionCount: mentions.length,
        lastInteraction: mentions.length > 0 ? mentions[0].created_at : null,
        sentiment
      };
    });

    return NextResponse.json(enhancedPeople);

  } catch (error) {
    console.error('Error fetching people:', error);
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

    const { name, relationship, displayPicture } = await request.json();
    
    if (!name || !relationship) {
      return NextResponse.json(
        { message: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if person already exists
    const existingPeople = db.getPeopleByUserId(session.user.id);
    const existingPerson = existingPeople.find(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingPerson) {
      return NextResponse.json(
        { message: 'Person already exists' },
        { status: 409 }
      );
    }

    // Create new person
    const personId = db.createPerson({
      userId: session.user.id,
      name,
      relationship,
      displayPicture
    });

    return NextResponse.json({
      message: 'Person created successfully',
      id: personId
    });

  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, name, relationship, displayPicture } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Person ID is required' },
        { status: 400 }
      );
    }

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
    const updateData: any = {};
    if (name) updateData.name = name;
    if (relationship) updateData.relationship = relationship;
    if (displayPicture !== undefined) updateData.displayPicture = displayPicture;

    db.updatePerson(id, updateData);

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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'Person ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const person = db.getPeopleByUserId(session.user.id)
      .find((p: any) => p.id === id);
    
    if (!person) {
      return NextResponse.json(
        { message: 'Person not found' },
        { status: 404 }
      );
    }

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
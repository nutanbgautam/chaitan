import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDatabase();
    const { analysis } = await request.json();

    // Get user ID from email
    const user = db.getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the journal entry processing status
    db.updateJournalEntry(id, {
      processingStatus: 'completed'
    });

    // Create or update analysis result
    db.createAnalysisResult({
      journalEntryId: id,
      peopleMentioned: analysis.people ? JSON.stringify(analysis.people) : undefined,
      financeCues: analysis.finance ? JSON.stringify(analysis.finance) : undefined,
      tasksMentioned: analysis.tasks ? JSON.stringify(analysis.tasks) : undefined,
      locations: analysis.locations ? JSON.stringify(analysis.locations) : undefined,
      temporalReferences: analysis.temporal ? JSON.stringify(analysis.temporal) : undefined,
      lifeAreas: analysis.lifeAreas ? JSON.stringify(analysis.lifeAreas) : undefined,
    });

    // Process extracted entities and save them to respective tables
    if (analysis.people) {
      for (const person of analysis.people) {
        if (person.name) {
          // Check if person already exists
          const existingPeople = db.getPeopleByUserId(user.id);
          const existingPerson = existingPeople.find(p => p.name.toLowerCase() === person.name.toLowerCase());

          if (!existingPerson) {
            // Create new person
            db.createPerson({
              userId: user.id,
              name: person.name,
              relationship: person.relationship || 'Unknown',
              context: person.context || '',
              sentiment: person.sentiment || 'neutral'
            });
          }
        }
      }
    }

    if (analysis.finance) {
      for (const finance of analysis.finance) {
        if (finance.description) {
          db.createFinanceEntry({
            userId: user.id,
            amount: finance.amount || 0,
            currency: finance.currency || 'USD',
            category: finance.category || 'expense',
            description: finance.description,
            date: new Date().toISOString(),
            priority: 'medium',
            source: 'journal',
            journalEntryId: id
          });
        }
      }
    }

    if (analysis.tasks) {
      for (const task of analysis.tasks) {
        if (task.description) {
          db.createTask({
            userId: user.id,
            title: task.description,
            description: task.description,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            category: task.category || 'general',
            source: 'journal',
            journalEntryId: id
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Analysis updated successfully' 
    });

  } catch (error) {
    console.error('Error updating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    );
  }
} 
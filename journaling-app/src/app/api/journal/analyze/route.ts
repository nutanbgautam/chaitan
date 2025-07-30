import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { getOpenAIService } from '@/lib/openai';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { entryId, processingType } = await request.json();
    
    if (!entryId) {
      return NextResponse.json(
        { message: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const entry = db.getJournalEntryById(entryId);
    
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

    const openai = getOpenAIService();

    // Update entry status to analyzed (processing)
    db.updateJournalEntry(entryId, {
      processingStatus: 'analyzed'
    });

    try {
      // Get user's SoulMatrix for context
      const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
      
      // Get today's check-ins for context
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const checkIns = db.getCheckInsByUserId(session.user.id, 10, 0)
        .filter(checkIn => {
          const checkInDate = new Date(checkIn.created_at);
          return checkInDate >= startOfDay && checkInDate <= endOfDay;
        });

      // Get Wheel of Life priorities
      const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
      const priorities = wheelOfLife?.priorities ? JSON.parse(wheelOfLife.priorities) : [];

      // Extract content for analysis
      const content = entry.transcription || entry.content;
      
      if (!content) {
        throw new Error('No content available for analysis');
      }

      // Perform analysis based on processing type
      let analysisResult;
      
      if (processingType === 'full-analysis') {
        // Extract all entities
        analysisResult = await openai.extractAllEntities(
          content,
          undefined, // voiceFeatures (not implemented yet)
          soulMatrix,
          checkIns,
          new Date(entry.created_at),
          priorities
        );
      } else {
        // Transcribe only - just update status
        db.updateJournalEntry(entryId, {
          processingStatus: 'transcribed',
          processingType: 'transcribe-only'
        });
        
        return NextResponse.json({
          message: 'Entry transcribed successfully',
          status: 'transcribed'
        });
      }

      // Save analysis results
      const analysisId = db.createAnalysisResult({
        journalEntryId: entryId,
        sentimentAnalysis: JSON.stringify(analysisResult.sentiment),
        peopleMentioned: JSON.stringify(analysisResult.people),
        financeCues: JSON.stringify(analysisResult.finance),
        tasksMentioned: JSON.stringify(analysisResult.tasks),
        locations: JSON.stringify(analysisResult.locations),
        temporalReferences: JSON.stringify(analysisResult.temporal),
        lifeAreas: JSON.stringify(analysisResult.lifeAreas),
        insights: JSON.stringify(analysisResult.insights)
      });

      // Update entry status to completed
      db.updateJournalEntry(entryId, {
        processingStatus: 'completed',
        processingType: 'full-analysis'
      });

      // Process extracted entities for database storage
      await processExtractedEntities(analysisResult, session.user.id, db, entryId);

      return NextResponse.json({
        message: 'Analysis completed successfully',
        analysisId,
        status: 'completed',
        analysis: analysisResult
      });

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update entry status to draft (failed)
      db.updateJournalEntry(entryId, {
        processingStatus: 'draft'
      });

      return NextResponse.json(
        { 
          message: 'Analysis failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing analysis:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processExtractedEntities(
  analysisResult: any,
  userId: string,
  db: any,
  entryId: string
) {
  try {
    // Process people mentioned
    if (analysisResult.people && analysisResult.people.length > 0) {
      for (const person of analysisResult.people) {
        // Check if person already exists
        const existingPerson = db.getPeopleByUserId(userId)
          .find((p: any) => p.name.toLowerCase() === person.name.toLowerCase());
        
        if (!existingPerson) {
          // Create new person
          db.createPerson({
            userId,
            name: person.name,
            relationship: person.relationship,
            displayPicture: null
          });
        }
      }
    }

    // Process finance entries
    if (analysisResult.finance && analysisResult.finance.length > 0) {
      for (const finance of analysisResult.finance) {
        if (finance.amount !== null) {
          db.createFinanceEntry({
            userId,
            amount: finance.amount,
            currency: finance.currency || 'USD',
            category: finance.category,
            subcategory: null,
            description: finance.description,
            date: new Date().toISOString().split('T')[0],
            recurring: false,
            recurringPattern: null,
            priority: 'medium',
            tags: JSON.stringify([]),
            notes: finance.context,
            source: 'journal',
            journalEntryId: entryId
          });
        }
      }
    }

    // Process tasks
    if (analysisResult.tasks && analysisResult.tasks.length > 0) {
      for (const task of analysisResult.tasks) {
        db.createTask({
          userId,
          title: task.description,
          description: task.description,
          status: task.status === 'completed' ? 'completed' : 'pending',
          priority: task.priority,
          startDate: new Date().toISOString().split('T')[0],
          deadline: task.deadline,
          category: task.category,
          assignee: null,
          remarks: null,
          source: 'journal',
          journalEntryId: entryId
        });
      }
    }

  } catch (error) {
    console.error('Error processing extracted entities:', error);
    // Don't throw - this is not critical for the main analysis
  }
} 
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
    
    // Get all journal entries for the user
    const entries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    
    // Get analysis results for each entry
    const analysisResults = entries
      .filter(entry => entry.processing_status === 'completed')
      .map(entry => {
        const analysis = db.getAnalysisResultByJournalEntryId(entry.id);
        if (!analysis) return null;

        return {
          id: analysis.id,
          journalEntryId: entry.id,
          sentimentAnalysis: analysis.sentiment_analysis ? JSON.parse(analysis.sentiment_analysis) : null,
          peopleMentioned: analysis.people_mentioned ? JSON.parse(analysis.people_mentioned) : [],
          financeCues: analysis.finance_cues ? JSON.parse(analysis.finance_cues) : [],
          tasksMentioned: analysis.tasks_mentioned ? JSON.parse(analysis.tasks_mentioned) : [],
          locations: analysis.locations ? JSON.parse(analysis.locations) : [],
          temporalReferences: analysis.temporal_references ? JSON.parse(analysis.temporal_references) : [],
          lifeAreas: analysis.life_areas ? JSON.parse(analysis.life_areas) : [],
          insights: analysis.insights ? JSON.parse(analysis.insights) : [],
          createdAt: analysis.created_at
        };
      })
      .filter(Boolean);

    return NextResponse.json(analysisResults);

  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
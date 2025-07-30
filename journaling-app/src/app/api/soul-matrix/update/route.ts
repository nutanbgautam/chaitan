import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { getOpenAIService } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const openai = getOpenAIService();

    // Get current SoulMatrix
    const currentSoulMatrix = db.getSoulMatrixByUserId(session.user.id);
    
    // Get unanalyzed journal entries
    const entries = db.getJournalEntriesByUserId(session.user.id, 100, 0);
    const analyzedEntries = currentSoulMatrix?.analyzed_entries ? JSON.parse(currentSoulMatrix.analyzed_entries) : [];
    
    const unanalyzedEntries = entries.filter(entry => 
      entry.processing_status === 'completed' && 
      !analyzedEntries.includes(entry.id)
    );

    if (unanalyzedEntries.length === 0) {
      return NextResponse.json({
        message: 'No new entries to analyze',
        updated: false
      });
    }

    // Prepare entries for analysis
    const entryContents = unanalyzedEntries.map(entry => 
      entry.transcription || entry.content
    ).filter(content => content && content.trim().length > 0);

    if (entryContents.length === 0) {
      return NextResponse.json({
        message: 'No content to analyze',
        updated: false
      });
    }

    // Analyze SoulMatrix
    const newSoulMatrix = await openai.analyzeSoulMatrix(
      currentSoulMatrix || {
        traits: JSON.stringify({
          openness: { score: 50, percentile: 50, description: '', keywords: [], trends: 'stable' },
          conscientiousness: { score: 50, percentile: 50, description: '', keywords: [], trends: 'stable' },
          extraversion: { score: 50, percentile: 50, description: '', keywords: [], trends: 'stable' },
          agreeableness: { score: 50, percentile: 50, description: '', keywords: [], trends: 'stable' },
          neuroticism: { score: 50, percentile: 50, description: '', keywords: [], trends: 'stable' }
        }),
        confidence: 0.5,
        analyzedEntries: JSON.stringify([]),
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      entryContents,
      analyzedEntries.length + entryContents.length
    );

    // Update or create SoulMatrix
    const nextUpdate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const allAnalyzedEntries = [...analyzedEntries, ...unanalyzedEntries.map(e => e.id)];

    if (currentSoulMatrix) {
      db.updateSoulMatrix(session.user.id, {
        traits: JSON.stringify(newSoulMatrix.traits),
        confidence: newSoulMatrix.confidence,
        analyzedEntries: JSON.stringify(allAnalyzedEntries),
        nextUpdate
      });
    } else {
      db.createSoulMatrix({
        userId: session.user.id,
        traits: JSON.stringify(newSoulMatrix.traits),
        confidence: newSoulMatrix.confidence,
        analyzedEntries: JSON.stringify(allAnalyzedEntries),
        nextUpdate
      });
    }

    return NextResponse.json({
      message: 'SoulMatrix updated successfully',
      updated: true,
      entriesAnalyzed: entryContents.length,
      newSoulMatrix
    });

  } catch (error) {
    console.error('Error updating SoulMatrix:', error);
    return NextResponse.json(
      { 
        message: 'Failed to update SoulMatrix',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
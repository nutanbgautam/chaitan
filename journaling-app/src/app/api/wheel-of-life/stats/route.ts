import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to access your Wheel of Life data'
      }, { status: 401 });
    }

    const db = getDatabase();
    
    // Get journal entries for analysis
    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    
    // Define life area keywords for analysis
    const areaKeywords = {
      'career': ['work', 'job', 'career', 'profession', 'office', 'business', 'project', 'meeting', 'colleague', 'boss', 'promotion', 'salary', 'workplace', 'deadline', 'presentation'],
      'finances': ['money', 'finance', 'financial', 'budget', 'saving', 'spending', 'expense', 'income', 'investment', 'debt', 'credit', 'bank', 'payment', 'cost', 'price', 'expensive', 'cheap'],
      'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'running', 'diet', 'nutrition', 'doctor', 'medical', 'sick', 'pain', 'energy', 'sleep', 'rest', 'wellness', 'physical'],
      'relationships': ['friend', 'friendship', 'relationship', 'dating', 'romance', 'love', 'partner', 'boyfriend', 'girlfriend', 'social', 'connection', 'people', 'interaction', 'communication'],
      'personal-growth': ['growth', 'learning', 'development', 'skill', 'knowledge', 'education', 'study', 'reading', 'course', 'training', 'improvement', 'goal', 'achievement', 'progress'],
      'recreation': ['fun', 'hobby', 'entertainment', 'leisure', 'recreation', 'game', 'movie', 'music', 'travel', 'vacation', 'party', 'celebration', 'enjoyment', 'pleasure', 'relaxation'],
      'spirituality': ['spiritual', 'religion', 'faith', 'meditation', 'prayer', 'worship', 'belief', 'meaning', 'purpose', 'inner', 'soul', 'mindfulness', 'zen', 'peace', 'tranquility'],
      'environment': ['home', 'house', 'apartment', 'room', 'space', 'environment', 'surroundings', 'neighborhood', 'community', 'city', 'town', 'place', 'location', 'living']
    };

    const stats: Record<string, any> = {};

    // Analyze each life area
    Object.keys(areaKeywords).forEach(areaId => {
      const keywords = areaKeywords[areaId as keyof typeof areaKeywords];
      const relatedEntries = journalEntries.filter(entry => {
        const content = (entry.transcription || entry.content || '').toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      });

      // Calculate sentiment scores
      const sentimentScores = relatedEntries.map(entry => {
        const content = entry.transcription || entry.content || '';
        return calculateSentiment(content);
      });

      const averageSentiment = sentimentScores.length > 0 
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
        : 0;

      // Calculate entry frequency
      const daysSinceFirst = relatedEntries.length > 0 ? 
        (new Date().getTime() - new Date(relatedEntries[relatedEntries.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
      
      const frequency = daysSinceFirst > 0 ? relatedEntries.length / daysSinceFirst : 0;
      let entryFrequency = 'No entries';
      if (frequency >= 1) entryFrequency = 'Daily';
      else if (frequency >= 0.5) entryFrequency = 'Every other day';
      else if (frequency >= 0.25) entryFrequency = 'Weekly';
      else if (frequency >= 0.1) entryFrequency = 'Monthly';
      else if (relatedEntries.length > 0) entryFrequency = 'Occasionally';

      // Calculate improvement trend
      let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
      if (sentimentScores.length >= 2) {
        const recent = sentimentScores.slice(-3);
        const earlier = sentimentScores.slice(0, -3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;
        
        if (recentAvg > earlierAvg + 0.5) improvementTrend = 'up';
        else if (recentAvg < earlierAvg - 0.5) improvementTrend = 'down';
      }

      // Get most active month
      let mostActiveMonth = 'No entries';
      if (relatedEntries.length > 0) {
        const monthCounts = new Map<string, number>();
        relatedEntries.forEach(entry => {
          const date = new Date(entry.created_at);
          const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
        });
        
        const mostActive = Array.from(monthCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        
        mostActiveMonth = mostActive ? mostActive[0] : 'No entries';
      }

      // Calculate recent activity (entries in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = relatedEntries.filter(entry => 
        new Date(entry.created_at) > sevenDaysAgo
      ).length;

      stats[areaId] = {
        totalEntries: relatedEntries.length,
        averageSentiment,
        mostActiveMonth,
        entryFrequency,
        recentActivity,
        improvementTrend
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching wheel of life stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateSentiment(text: string): number {
  const positiveWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'enjoy', 'pleased', 'satisfied', 'grateful', 'blessed', 'fulfilled', 'accomplished'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed', 'tired', 'exhausted', 'upset', 'depressed', 'lonely', 'afraid', 'scared'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = positiveWords.filter(word => words.includes(word)).length;
  const negativeCount = negativeWords.filter(word => words.includes(word)).length;
  
  return positiveCount - negativeCount;
} 
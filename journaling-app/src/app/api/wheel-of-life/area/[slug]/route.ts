import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';
import { DEFAULT_LIFE_AREAS } from '@/types';

// Analysis function for journal entries related to life areas
function analyzeJournalEntriesForLifeArea(journalEntries: any[], lifeAreaSlug: string, defaultArea: any) {
  const areaKeywords = getLifeAreaKeywords(lifeAreaSlug);
  const relatedEntries = journalEntries.filter(entry => {
    const content = (entry.transcription || entry.content || '').toLowerCase();
    return areaKeywords.some(keyword => content.includes(keyword));
  });

  // Analyze sentiment
  const sentimentScores = relatedEntries.map(entry => {
    const content = entry.transcription || entry.content || '';
    return calculateSentiment(content);
  });

  const averageSentiment = sentimentScores.length > 0 
    ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
    : 0;

  // Extract key themes
  const keyThemes = extractKeyThemes(relatedEntries, areaKeywords);

  // Generate insights
  const insights = generateInsights(relatedEntries, averageSentiment, keyThemes, defaultArea);

  // Generate recommendations
  const recommendations = generateRecommendations(averageSentiment, keyThemes, defaultArea);

  // Create progress history (simulated based on entry dates)
  const progressHistory = createProgressHistory(relatedEntries, averageSentiment);

  return {
    insights,
    progressHistory,
    journalAnalysis: {
      totalEntries: relatedEntries.length,
      averageSentiment,
      mostActiveMonth: getMostActiveMonth(relatedEntries),
      entryFrequency: calculateEntryFrequency(relatedEntries)
    },
    relatedEntries: relatedEntries.slice(0, 5).map(entry => ({
      id: entry.id,
      content: entry.content || entry.transcription || '',
      date: entry.created_at,
      sentiment: calculateSentiment(entry.transcription || entry.content || '')
    })),
    sentimentTrend: calculateSentimentTrend(sentimentScores),
    keyThemes,
    recommendations
  };
}

function getLifeAreaKeywords(lifeAreaSlug: string): string[] {
  const keywordMap: { [key: string]: string[] } = {
    'career': ['work', 'job', 'career', 'profession', 'office', 'business', 'project', 'meeting', 'colleague', 'boss', 'promotion', 'salary', 'workplace', 'deadline', 'presentation'],
    'finance': ['money', 'finance', 'financial', 'budget', 'saving', 'spending', 'expense', 'income', 'investment', 'debt', 'credit', 'bank', 'payment', 'cost', 'price', 'expensive', 'cheap'],
    'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'running', 'diet', 'nutrition', 'doctor', 'medical', 'sick', 'pain', 'energy', 'sleep', 'rest', 'wellness', 'physical'],
    'family': ['family', 'parent', 'child', 'son', 'daughter', 'spouse', 'husband', 'wife', 'partner', 'marriage', 'home', 'household', 'domestic', 'parenting', 'kids', 'children'],
    'relationships': ['friend', 'friendship', 'relationship', 'dating', 'romance', 'love', 'partner', 'boyfriend', 'girlfriend', 'social', 'connection', 'people', 'interaction', 'communication'],
    'personal-growth': ['growth', 'learning', 'development', 'skill', 'knowledge', 'education', 'study', 'reading', 'course', 'training', 'improvement', 'goal', 'achievement', 'progress'],
    'recreation': ['fun', 'hobby', 'entertainment', 'leisure', 'recreation', 'game', 'movie', 'music', 'travel', 'vacation', 'party', 'celebration', 'enjoyment', 'pleasure', 'relaxation'],
    'spirituality': ['spiritual', 'religion', 'faith', 'meditation', 'prayer', 'worship', 'belief', 'meaning', 'purpose', 'inner', 'soul', 'mindfulness', 'zen', 'peace', 'tranquility']
  };
  
  return keywordMap[lifeAreaSlug] || [];
}

function calculateSentiment(text: string): number {
  const positiveWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'enjoy', 'pleased', 'satisfied', 'grateful', 'blessed', 'fulfilled', 'accomplished'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed', 'tired', 'exhausted', 'upset', 'depressed', 'lonely', 'afraid', 'scared'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = positiveWords.filter(word => words.includes(word)).length;
  const negativeCount = negativeWords.filter(word => words.includes(word)).length;
  
  return positiveCount - negativeCount;
}

function extractKeyThemes(entries: any[], keywords: string[]): string[] {
  const themeWords = new Map<string, number>();
  
  entries.forEach(entry => {
    const content = (entry.transcription || entry.content || '').toLowerCase();
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        themeWords.set(keyword, (themeWords.get(keyword) || 0) + 1);
      }
    });
  });
  
  return Array.from(themeWords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function generateInsights(entries: any[], sentiment: number, themes: string[], defaultArea: any): any[] {
  const insights = [];
  
  if (entries.length === 0) {
    insights.push({
      id: '1',
      type: 'neutral',
      content: `No journal entries found related to ${defaultArea.name}. Start journaling about this area to get personalized insights.`,
      source: 'ai',
      date: new Date().toISOString(),
      lifeAreaId: defaultArea.id
    });
    return insights;
  }
  
  if (sentiment > 0) {
    insights.push({
      id: '1',
      type: 'positive',
      content: `You've been feeling positive about ${defaultArea.name} recently. Keep up the great work!`,
      source: 'ai',
      date: new Date().toISOString(),
      lifeAreaId: defaultArea.id
    });
  } else if (sentiment < 0) {
    insights.push({
      id: '2',
      type: 'negative',
      content: `You've been experiencing challenges in ${defaultArea.name}. Consider focusing on this area for improvement.`,
      source: 'ai',
      date: new Date().toISOString(),
      lifeAreaId: defaultArea.id
    });
  }
  
  if (themes.length > 0) {
    insights.push({
      id: '3',
      type: 'neutral',
      content: `Key themes in your ${defaultArea.name} entries: ${themes.join(', ')}`,
      source: 'ai',
      date: new Date().toISOString(),
      lifeAreaId: defaultArea.id
    });
  }
  
  return insights;
}

function generateRecommendations(sentiment: number, themes: string[], defaultArea: any): string[] {
  const recommendations = [];
  
  if (sentiment < 0) {
    recommendations.push(`Focus on positive aspects of ${defaultArea.name} in your journaling`);
    recommendations.push(`Set specific goals to improve your ${defaultArea.name} satisfaction`);
  }
  
  if (themes.length > 0) {
    recommendations.push(`Explore deeper insights about: ${themes.join(', ')}`);
  }
  
  recommendations.push(`Journal more frequently about ${defaultArea.name} for better tracking`);
  
  return recommendations;
}

function createProgressHistory(entries: any[], sentiment: number): any[] {
  const history = [];
  const now = new Date();
  
  // Create simulated progress based on entry frequency and sentiment
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate.toDateString() === date.toDateString();
    });
    
    const score = Math.max(1, Math.min(10, 5 + (sentiment * 0.5) + (dayEntries.length * 0.5)));
    
    history.push({
      date: date.toISOString(),
      score: Math.round(score),
      notes: dayEntries.length > 0 ? `${dayEntries.length} entries` : 'No entries'
    });
  }
  
  return history;
}

function getMostActiveMonth(entries: any[]): string {
  if (entries.length === 0) return 'No entries';
  
  const monthCounts = new Map<string, number>();
  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });
  
  const mostActive = Array.from(monthCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];
  
  return mostActive ? mostActive[0] : 'No entries';
}

function calculateEntryFrequency(entries: any[]): string {
  if (entries.length === 0) return 'No entries';
  
  const daysSinceFirst = entries.length > 0 ? 
    (new Date().getTime() - new Date(entries[entries.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
  
  const frequency = daysSinceFirst > 0 ? entries.length / daysSinceFirst : 0;
  
  if (frequency >= 1) return 'Daily';
  if (frequency >= 0.5) return 'Every other day';
  if (frequency >= 0.25) return 'Weekly';
  if (frequency >= 0.1) return 'Monthly';
  return 'Occasionally';
}

function calculateSentimentTrend(sentimentScores: number[]): string {
  if (sentimentScores.length < 2) return 'stable';
  
  const recent = sentimentScores.slice(-3);
  const earlier = sentimentScores.slice(0, -3);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;
  
  if (recentAvg > earlierAvg + 0.5) return 'improving';
  if (recentAvg < earlierAvg - 0.5) return 'declining';
  return 'stable';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to access your Wheel of Life data'
      }, { status: 401 });
    }

    const { slug } = params;
    const db = getDatabase();
    
    // Get wheel of life data
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
    
    if (!wheelOfLife) {
      return NextResponse.json({ error: 'Wheel of Life not found' }, { status: 404 });
    }

    // Parse the data with error handling
    let lifeAreas = [];
    let priorities = [];
    
    try {
          if (wheelOfLife.life_areas) {
      lifeAreas = JSON.parse(wheelOfLife.life_areas);
    }
    } catch (parseError) {
      console.error('Error parsing lifeAreas in area endpoint:', parseError);
      return NextResponse.json({ error: 'Invalid life areas data format' }, { status: 500 });
    }
    
    try {
      if (wheelOfLife.priorities) {
        priorities = JSON.parse(wheelOfLife.priorities);
      }
    } catch (parseError) {
      console.error('Error parsing priorities in area endpoint:', parseError);
      priorities = [];
    }
    
    // Find the specific life area
    const lifeArea = lifeAreas.find((area: any) => area.id === slug);
    
    if (!lifeArea) {
      return NextResponse.json({ error: 'Life area not found' }, { status: 404 });
    }

    // Get default area info
    const defaultArea = DEFAULT_LIFE_AREAS.find(area => area.id === slug);
    
    // Get journal entries for analysis
    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    
    // Get goals for this life area
    const allGoals = db.getGoalsByUserId(session.user.id, 1000, 0);
    const areaGoals = allGoals
      .filter((goal: any) => goal.life_area_id === slug)
      .map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetDate: goal.target_date,
        status: goal.status,
        progress: goal.progress,
        lifeAreaId: goal.life_area_id,
        priority: goal.priority,
        category: goal.category,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at
      }));
    
    // Analyze journal entries for this life area
    const areaAnalysis = analyzeJournalEntriesForLifeArea(journalEntries, slug, defaultArea);
    
    // Combine with default data
    const areaData = {
      ...defaultArea,
      ...lifeArea,
      priority: priorities.indexOf(slug) + 1,
      goals: areaGoals,
      insights: areaAnalysis.insights,
      progressHistory: areaAnalysis.progressHistory,
      journalAnalysis: areaAnalysis.journalAnalysis,
      relatedEntries: areaAnalysis.relatedEntries,
      sentimentTrend: areaAnalysis.sentimentTrend,
      keyThemes: areaAnalysis.keyThemes,
      recommendations: areaAnalysis.recommendations
    };

    return NextResponse.json(areaData);
  } catch (error) {
    console.error('Error fetching life area data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();
    const { currentScore, targetScore, description } = body;
    
    const db = getDatabase();
    
    // Get wheel of life data
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
    
    if (!wheelOfLife) {
      return NextResponse.json({ error: 'Wheel of Life not found' }, { status: 404 });
    }

          const lifeAreas = JSON.parse(wheelOfLife.life_areas);
    
    // Find and update the specific life area
    const areaIndex = lifeAreas.findIndex((area: any) => area.id === slug);
    
    if (areaIndex === -1) {
      return NextResponse.json({ error: 'Life area not found' }, { status: 404 });
    }

    // Update the life area
    lifeAreas[areaIndex] = {
      ...lifeAreas[areaIndex],
      currentScore: currentScore || lifeAreas[areaIndex].currentScore,
      targetScore: targetScore || lifeAreas[areaIndex].targetScore,
      description: description || lifeAreas[areaIndex].description
    };

    // Update the wheel of life data
    const updatedWheelData = {
      userId: session.user.id,
      lifeAreas: JSON.stringify(lifeAreas),
      priorities: wheelOfLife.priorities,
              isCompleted: wheelOfLife.is_completed
    };

    db.updateWheelOfLife(session.user.id, updatedWheelData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating life area data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
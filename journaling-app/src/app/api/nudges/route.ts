import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { getOpenAIService } from '@/lib/openai';

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
    
    // Get user data for nudge generation
    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 50, 0);
    const checkIns = db.getCheckInsByUserId(session.user.id, 30, 0);
    const goals = db.getGoalsByUserId(session.user.id, 100, 0);
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
    const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
    const people = db.getPeopleByUserId(session.user.id);
    const financeEntries = db.getFinanceEntriesByUserId(session.user.id, 50, 0);
    const tasks = db.getTasksByUserId(session.user.id, 50, 0);

    // Generate intelligent nudges
    const nudges = await generateLifeAreaNudges({
      journalEntries,
      checkIns,
      goals,
      wheelOfLife,
      soulMatrix,
      people,
      financeEntries,
      tasks
    });

    return NextResponse.json(nudges);
  } catch (error) {
    console.error('Error generating nudges:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nudgeId, action, feedback } = body;

    const db = getDatabase();
    
    // Save nudge interaction
    const result = db.saveNudgeInteraction({
      userId: session.user.id,
      nudgeId,
      action, // 'dismissed', 'completed', 'snoozed', 'ignored'
      feedback,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error saving nudge interaction:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateLifeAreaNudges(data: {
  journalEntries: any[];
  checkIns: any[];
  goals: any[];
  wheelOfLife: any;
  soulMatrix: any;
  people: any[];
  financeEntries: any[];
  tasks: any[];
}) {
  const openAI = getOpenAIService();
  
  // Generate AI-powered nudges
  const aiNudges = await openAI.generateLifeAreaNudges(data);
  
  // Combine with rule-based nudges
  const ruleBasedNudges = generateRuleBasedNudges(data);
  
  // Merge and prioritize nudges
  const allNudges = [...aiNudges, ...ruleBasedNudges];
  
  // Sort by priority and relevance
  const prioritizedNudges = prioritizeNudges(allNudges, data);
  
  return {
    nudges: prioritizedNudges,
    summary: {
      totalNudges: prioritizedNudges.length,
      highPriority: prioritizedNudges.filter(n => n.priority === 'high').length,
      mediumPriority: prioritizedNudges.filter(n => n.priority === 'medium').length,
      lowPriority: prioritizedNudges.filter(n => n.priority === 'low').length,
      categories: [...new Set(prioritizedNudges.map(n => n.category))]
    }
  };
}

function generateRuleBasedNudges(data: any) {
  const nudges = [];
  
  // Wellness nudges
  if (data.checkIns.length > 0) {
    const recentCheckIns = data.checkIns.slice(-3);
    const avgMood = recentCheckIns.reduce((sum: number, checkIn: any) => 
      sum + getMoodScore(checkIn.mood), 0) / recentCheckIns.length;
    
    if (avgMood < 5) {
      nudges.push({
        id: `wellness-mood-${Date.now()}`,
        type: 'wellness',
        category: 'emotional',
        title: 'Boost Your Mood',
        message: 'Your recent mood has been lower than usual. Consider activities that typically lift your spirits.',
        priority: 'high',
        actionable: true,
        actions: [
          { label: 'Take a walk', impact: 'medium' },
          { label: 'Call a friend', impact: 'high' },
          { label: 'Practice gratitude', impact: 'medium' }
        ],
        timing: 'now',
        frequency: 'daily',
        lifeArea: 'emotional-wellbeing'
      });
    }
  }

  // Goal nudges
  if (data.goals.length > 0) {
    const overdueGoals = data.goals.filter((goal: any) => 
      new Date(goal.targetDate) < new Date() && goal.status !== 'completed'
    );
    
    if (overdueGoals.length > 0) {
      nudges.push({
        id: `goals-overdue-${Date.now()}`,
        type: 'goals',
        category: 'productivity',
        title: 'Overdue Goals',
        message: `You have ${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? 's' : ''}. Consider reviewing and adjusting them.`,
        priority: 'high',
        actionable: true,
        actions: [
          { label: 'Review goals', impact: 'high' },
          { label: 'Break down tasks', impact: 'medium' },
          { label: 'Set new deadlines', impact: 'medium' }
        ],
        timing: 'today',
        frequency: 'weekly',
        lifeArea: 'goals'
      });
    }
  }

  // Relationship nudges
  if (data.people.length > 0) {
    const positiveRelationships = data.people.filter((person: any) => person.sentiment === 'positive');
    const negativeRelationships = data.people.filter((person: any) => person.sentiment === 'negative');
    
    if (negativeRelationships.length > positiveRelationships.length) {
      nudges.push({
        id: `relationships-balance-${Date.now()}`,
        type: 'relationships',
        category: 'social',
        title: 'Relationship Balance',
        message: 'You have more challenging relationships than positive ones. Consider nurturing your positive connections.',
        priority: 'medium',
        actionable: true,
        actions: [
          { label: 'Reach out to positive people', impact: 'high' },
          { label: 'Address conflicts', impact: 'medium' },
          { label: 'Set boundaries', impact: 'medium' }
        ],
        timing: 'this-week',
        frequency: 'weekly',
        lifeArea: 'relationships'
      });
    }
  }

  // Finance nudges
  if (data.financeEntries.length > 0) {
    const highPriorityItems = data.financeEntries.filter((entry: any) => entry.priority === 'high');
    
    if (highPriorityItems.length > 3) {
      nudges.push({
        id: `finance-priorities-${Date.now()}`,
        type: 'finance',
        category: 'financial',
        title: 'Financial Priorities',
        message: 'You have several high-priority financial items. Consider reviewing your spending priorities.',
        priority: 'medium',
        actionable: true,
        actions: [
          { label: 'Review expenses', impact: 'high' },
          { label: 'Create budget', impact: 'medium' },
          { label: 'Set savings goals', impact: 'medium' }
        ],
        timing: 'this-week',
        frequency: 'monthly',
        lifeArea: 'finance'
      });
    }
  }

  // Life balance nudges
  if (data.wheelOfLife) {
    try {
              const lifeAreas = JSON.parse(data.wheelOfLife.life_areas || '[]');
      const lowScoringAreas = lifeAreas.filter((area: any) => area.currentScore < 6);
      
      if (lowScoringAreas.length > 0) {
        const lowestArea = lowScoringAreas[0];
        nudges.push({
          id: `life-balance-${lowestArea.name}-${Date.now()}`,
          type: 'life-balance',
          category: 'holistic',
          title: `Focus on ${lowestArea.name}`,
          message: `Your ${lowestArea.name} area is scoring low (${lowestArea.currentScore}/10). Consider dedicating more attention to this area.`,
          priority: 'high',
          actionable: true,
          actions: [
            { label: 'Set specific goals', impact: 'high' },
            { label: 'Schedule time for this area', impact: 'medium' },
            { label: 'Seek resources or support', impact: 'medium' }
          ],
          timing: 'this-week',
          frequency: 'weekly',
          lifeArea: lowestArea.name
        });
      }
    } catch (error) {
      console.error('Error parsing life areas:', error);
    }
  }

  return nudges;
}

function prioritizeNudges(nudges: any[], data: any) {
  return nudges
    .map(nudge => {
      // Calculate relevance score based on user data
      let relevanceScore = 0;
      
      // Boost score for areas with recent activity
      if (data.journalEntries.length > 0) relevanceScore += 10;
      if (data.checkIns.length > 0) relevanceScore += 10;
      if (data.goals.length > 0) relevanceScore += 10;
      
      // Boost score for urgent issues
      if (nudge.priority === 'high') relevanceScore += 20;
      if (nudge.timing === 'now') relevanceScore += 15;
      if (nudge.timing === 'today') relevanceScore += 10;
      
      // Boost score for actionable nudges
      if (nudge.actionable) relevanceScore += 10;
      if (nudge.actions && nudge.actions.length > 0) relevanceScore += 5;
      
      return { ...nudge, relevanceScore };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10); // Limit to top 10 most relevant nudges
}

// Helper function
function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    '😊': 9, '🙂': 7, '😐': 5, '😞': 3, '😢': 1,
    '😡': 2, '😴': 4, '🤔': 6, '😌': 8, '😤': 4
  };
  return moodScores[mood] || 5;
} 
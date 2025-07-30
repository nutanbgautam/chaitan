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
    
    // Gather user data for analysis
    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 50, 0);
    const checkIns = db.getCheckInsByUserId(session.user.id, 30, 0);
    const goals = db.getGoalsByUserId(session.user.id, 100, 0);
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
    const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
    const people = db.getPeopleByUserId(session.user.id);
    const financeEntries = db.getFinanceEntriesByUserId(session.user.id, 50, 0);
    const tasks = db.getTasksByUserId(session.user.id, 50, 0);

    // Generate enhanced insights with AI analysis
    const insights = await generateEnhancedInsights({
      journalEntries,
      checkIns,
      goals,
      wheelOfLife,
      soulMatrix,
      people,
      financeEntries,
      tasks
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateEnhancedInsights(data: {
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
  
  // Generate AI-powered insights
  const aiAnalysis = await openAI.analyzeWithAI(data);
  
  const insights = {
    priority: [] as any[],
    lifeAreas: [] as any[],
    goals: [] as any[],
    wellness: [] as any[],
    relationships: [] as any[],
    finance: [] as any[],
    productivity: [] as any[],
    personality: [] as any[],
    aiAnalysis: aiAnalysis,
    emotionalInsights: aiAnalysis.emotionalInsights || [],
    behavioralInsights: aiAnalysis.behavioralInsights || [],
    relationshipInsights: aiAnalysis.relationshipInsights || [],
    goalInsights: aiAnalysis.goalInsights || [],
    lifeBalanceInsights: aiAnalysis.lifeBalanceInsights || [],
    growthOpportunities: aiAnalysis.growthOpportunities || [],
    predictiveInsights: aiAnalysis.predictiveInsights || [],
    actionableRecommendations: aiAnalysis.actionableRecommendations || []
  };

  // Analyze Wheel of Life priorities
  if (data.wheelOfLife) {
            const lifeAreas = JSON.parse(data.wheelOfLife.life_areas || '[]');
    const priorities = JSON.parse(data.wheelOfLife.priorities || '[]');
    
    // Find areas needing attention
    const lowScoringAreas = lifeAreas.filter((area: any) => area.currentScore < 6);
    const priorityAreas = priorities.slice(0, 3);
    
    insights.lifeAreas.push({
      type: 'priority_areas',
      title: 'Focus Areas',
      message: `Your top priorities are: ${priorityAreas.map((p: string) => p).join(', ')}`,
      priority: 'high',
      actionable: true
    });

    if (lowScoringAreas.length > 0) {
      insights.lifeAreas.push({
        type: 'low_scoring',
        title: 'Areas Needing Attention',
        message: `${lowScoringAreas.map((area: any) => area.name).join(', ')} are scoring below 6/10`,
        priority: 'high',
        actionable: true
      });
    }
  }

  // Analyze goals
  if (data.goals.length > 0) {
    const overdueGoals = data.goals.filter(goal => 
      new Date(goal.targetDate) < new Date() && goal.status !== 'completed'
    );
    const highPriorityGoals = data.goals.filter(goal => 
      goal.priority === 'high' && goal.status !== 'completed'
    );
    const completionRate = (data.goals.filter(g => g.status === 'completed').length / data.goals.length) * 100;

    if (overdueGoals.length > 0) {
      insights.goals.push({
        type: 'overdue',
        title: 'Overdue Goals',
        message: `You have ${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? 's' : ''}`,
        priority: 'high',
        actionable: true,
        data: overdueGoals
      });
    }

    if (highPriorityGoals.length > 0) {
      insights.goals.push({
        type: 'high_priority',
        title: 'High Priority Goals',
        message: `Focus on ${highPriorityGoals.length} high-priority goal${highPriorityGoals.length > 1 ? 's' : ''}`,
        priority: 'medium',
        actionable: true,
        data: highPriorityGoals
      });
    }

    if (completionRate < 50) {
      insights.goals.push({
        type: 'low_completion',
        title: 'Goal Completion',
        message: `Your goal completion rate is ${completionRate.toFixed(1)}%. Consider breaking down larger goals.`,
        priority: 'medium',
        actionable: true
      });
    }
  }

  // Analyze check-ins and wellness
  if (data.checkIns.length > 0) {
    const recentCheckIns = data.checkIns.slice(0, 7);
    const avgMood = recentCheckIns.reduce((sum, checkIn) => {
      const moodScore = getMoodScore(checkIn.mood);
      return sum + moodScore;
    }, 0) / recentCheckIns.length;

    const avgEnergy = recentCheckIns.reduce((sum, checkIn) => sum + checkIn.energy, 0) / recentCheckIns.length;
    const avgSleep = recentCheckIns.reduce((sum, checkIn) => 
      sum + checkIn.sleepHours + (checkIn.sleepMinutes / 60), 0
    ) / recentCheckIns.length;

    if (avgMood < 6) {
      insights.wellness.push({
        type: 'low_mood',
        title: 'Mood Trend',
        message: 'Your average mood has been lower than usual. Consider activities that boost your mood.',
        priority: 'high',
        actionable: true
      });
    }

    if (avgEnergy < 6) {
      insights.wellness.push({
        type: 'low_energy',
        title: 'Energy Levels',
        message: 'Your energy levels have been low. Focus on sleep, nutrition, and movement.',
        priority: 'medium',
        actionable: true
      });
    }

    if (avgSleep < 7) {
      insights.wellness.push({
        type: 'sleep',
        title: 'Sleep Quality',
        message: `You're averaging ${avgSleep.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal health.`,
        priority: 'medium',
        actionable: true
      });
    }
  }

  // Analyze relationships
  if (data.people.length > 0) {
    const positiveConnections = data.people.filter(person => person.sentiment === 'positive');
    const negativeConnections = data.people.filter(person => person.sentiment === 'negative');

    if (negativeConnections.length > positiveConnections.length) {
      insights.relationships.push({
        type: 'relationship_balance',
        title: 'Relationship Balance',
        message: 'You have more challenging relationships than positive ones. Consider nurturing positive connections.',
        priority: 'medium',
        actionable: true
      });
    }
  }

  // Analyze finances
  if (data.financeEntries.length > 0) {
    const expenses = data.financeEntries.filter(entry => entry.category === 'expense');
    const income = data.financeEntries.filter(entry => entry.category === 'income');
    
    const totalExpenses = expenses.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    const totalIncome = income.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    if (totalExpenses > totalIncome * 0.9) {
      insights.finance.push({
        type: 'spending_high',
        title: 'High Spending',
        message: 'Your expenses are high relative to income. Consider reviewing your spending patterns.',
        priority: 'medium',
        actionable: true
      });
    }
  }

  // Analyze productivity and tasks
  if (data.tasks.length > 0) {
    const completedTasks = data.tasks.filter(task => task.status === 'completed');
    const overdueTasks = data.tasks.filter(task => 
      task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'
    );
    
    const completionRate = (completedTasks.length / data.tasks.length) * 100;
    
    if (overdueTasks.length > 0) {
      insights.productivity.push({
        type: 'overdue_tasks',
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider prioritizing or delegating.`,
        priority: 'high',
        actionable: true
      });
    }

    if (completionRate < 60) {
      insights.productivity.push({
        type: 'low_productivity',
        title: 'Task Completion',
        message: `Your task completion rate is ${completionRate.toFixed(1)}%. Try breaking tasks into smaller steps.`,
        priority: 'medium',
        actionable: true
      });
    }
  }

  // Analyze personality insights if SoulMatrix exists
  if (data.soulMatrix) {
    const traits = JSON.parse(data.soulMatrix.traits || '{}');
    
    // Generate personality-based insights
    if (traits.neuroticism && traits.neuroticism.score > 7) {
      insights.personality.push({
        type: 'stress_management',
        title: 'Stress Management',
        message: 'You may benefit from stress management techniques and mindfulness practices.',
        priority: 'medium',
        actionable: true
      });
    }

    if (traits.extraversion && traits.extraversion.score < 4) {
      insights.personality.push({
        type: 'social_connections',
        title: 'Social Connections',
        message: 'Consider reaching out to friends or joining social activities to boost your well-being.',
        priority: 'low',
        actionable: true
      });
    }
  }

  // Generate priority-based recommendations
  insights.priority = generatePriorityRecommendations(insights);

  return insights;
}

function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    '😊': 9, '🙂': 7, '😐': 5, '😞': 3, '😢': 1,
    '😡': 2, '😴': 4, '🤔': 6, '😌': 8, '😤': 4
  };
  return moodScores[mood] || 5;
}

function generatePriorityRecommendations(insights: any) {
  const allInsights = [
    ...insights.lifeAreas,
    ...insights.goals,
    ...insights.wellness,
    ...insights.relationships,
    ...insights.finance,
    ...insights.productivity,
    ...insights.personality
  ];

  // Sort by priority and actionable
  const priorityInsights = allInsights
    .filter(insight => insight.priority === 'high' && insight.actionable)
    .slice(0, 3);

  const mediumInsights = allInsights
    .filter(insight => insight.priority === 'medium' && insight.actionable)
    .slice(0, 2);

  return [...priorityInsights, ...mediumInsights];
} 
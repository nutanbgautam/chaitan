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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getDatabase();
    
    // Calculate date range
    let periodStart: Date;
    let periodEnd: Date;
    
    if (startDate && endDate) {
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
    } else {
      periodEnd = new Date();
      periodStart = new Date();
      
      if (period === 'weekly') {
        periodStart.setDate(periodStart.getDate() - 7);
      } else {
        periodStart.setMonth(periodStart.getMonth() - 1);
      }
    }

    // Get all user data
    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    const checkIns = db.getCheckInsByUserId(session.user.id, 1000, 0);
    const goals = db.getGoalsByUserId(session.user.id, 1000, 0);
    const people = db.getPeopleByUserId(session.user.id);
    const financeEntries = db.getFinanceEntriesByUserId(session.user.id, 1000, 0);
    const tasks = db.getTasksByUserId(session.user.id, 1000, 0);
    const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);

    // Filter data by date range
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.createdAt) >= periodStart && new Date(entry.createdAt) <= periodEnd
    );
    
    const filteredCheckIns = checkIns.filter(checkIn => 
      new Date(checkIn.createdAt) >= periodStart && new Date(checkIn.createdAt) <= periodEnd
    );

    const filteredGoals = goals.filter(goal => 
      new Date(goal.createdAt) >= periodStart && new Date(goal.createdAt) <= periodEnd
    );

    const filteredFinance = financeEntries.filter(entry => 
      new Date(entry.date) >= periodStart && new Date(entry.date) <= periodEnd
    );

    const filteredTasks = tasks.filter(task => 
      new Date(task.createdAt) >= periodStart && new Date(task.createdAt) <= periodEnd
    );

    // Generate category-wise recaps
    const categoryRecaps = await generateCategoryRecaps({
      journalEntries: filteredEntries,
      checkIns: filteredCheckIns,
      goals: filteredGoals,
      people,
      financeEntries: filteredFinance,
      tasks: filteredTasks,
      soulMatrix,
      wheelOfLife,
      period,
      startDate: periodStart,
      endDate: periodEnd,
      userId: session.user.id
    });

    return NextResponse.json(categoryRecaps);
  } catch (error) {
    console.error('Error generating recaps:', error);
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

    const body = await request.json();
    const { type } = body;

    const db = getDatabase();
    
    // Calculate date range for the new recap
    const periodEnd = new Date();
    const periodStart = new Date();
    
    if (type === 'weekly') {
      periodStart.setDate(periodStart.getDate() - 7);
    } else {
      periodStart.setMonth(periodStart.getMonth() - 1);
    }

    // Get data for the period
    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    const checkIns = db.getCheckInsByUserId(session.user.id, 1000, 0);
    const goals = db.getGoalsByUserId(session.user.id, 1000, 0);
    const people = db.getPeopleByUserId(session.user.id);
    const financeEntries = db.getFinanceEntriesByUserId(session.user.id, 1000, 0);
    const tasks = db.getTasksByUserId(session.user.id, 1000, 0);
    const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);

    // Filter data by date range
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.createdAt) >= periodStart && new Date(entry.createdAt) <= periodEnd
    );
    
    const filteredCheckIns = checkIns.filter(checkIn => 
      new Date(checkIn.createdAt) >= periodStart && new Date(checkIn.createdAt) <= periodEnd
    );

    const filteredGoals = goals.filter(goal => 
      new Date(goal.createdAt) >= periodStart && new Date(goal.createdAt) <= periodEnd
    );

    const filteredFinance = financeEntries.filter(entry => 
      new Date(entry.date) >= periodStart && new Date(entry.date) <= periodEnd
    );

    const filteredTasks = tasks.filter(task => 
      new Date(task.createdAt) >= periodStart && new Date(task.createdAt) <= periodEnd
    );

    // Generate comprehensive recap
    const recap = await generateComprehensiveRecap({
      journalEntries: filteredEntries,
      checkIns: filteredCheckIns,
      goals: filteredGoals,
      people,
      financeEntries: filteredFinance,
      tasks: filteredTasks,
      soulMatrix,
      wheelOfLife,
      period: type,
      startDate: periodStart,
      endDate: periodEnd,
      userId: session.user.id
    });

    // Save recap to database
    const recapId = db.createRecap({
      userId: session.user.id,
      type: type as 'weekly' | 'monthly',
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      content: recap.content,
      insights: JSON.stringify(recap.insights),
      recommendations: JSON.stringify(recap.recommendations),
      lifeAreaImprovements: JSON.stringify(recap.lifeAreaImprovements),
      metrics: JSON.stringify(recap.metrics)
    });

    return NextResponse.json({
      message: 'Recap generated successfully',
      recap: { id: recapId, ...recap }
    });
  } catch (error) {
    console.error('Error generating recap:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateCategoryRecaps(data: {
  journalEntries: any[];
  checkIns: any[];
  goals: any[];
  people: any[];
  financeEntries: any[];
  tasks: any[];
  soulMatrix: any;
  wheelOfLife: any;
  period: string;
  startDate: Date;
  endDate: Date;
  userId: string;
}) {
  const { journalEntries, checkIns, goals, people, financeEntries, tasks, soulMatrix, wheelOfLife, period, startDate, endDate } = data;

  // Calculate period name
  const periodName = period === 'weekly' ? 'this week' : 'this month';
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Wellness & Mood Category
  const wellnessRecap = generateWellnessRecap(checkIns, periodName, daysDiff);

  // Journal & Reflection Category
  const journalRecap = generateJournalRecap(journalEntries, periodName, daysDiff);

  // Life Areas & Goals Category
  const lifeAreasRecap = generateLifeAreasRecap(goals, wheelOfLife, periodName, daysDiff);

  // Relationships & People Category
  const relationshipsRecap = generateRelationshipsRecap(people, journalEntries, periodName, daysDiff);

  // Finance & Tasks Category
  const productivityRecap = generateProductivityRecap(tasks, financeEntries, periodName, daysDiff);

  // Personal Growth Category
  const growthRecap = generateGrowthRecap(soulMatrix, journalEntries, checkIns, periodName, daysDiff);

  return [
    wellnessRecap,
    journalRecap,
    lifeAreasRecap,
    relationshipsRecap,
    productivityRecap,
    growthRecap
  ];
}

function generateWellnessRecap(checkIns: any[], periodName: string, daysDiff: number) {
  const totalCheckIns = checkIns.length;
  const avgMood = checkIns.length > 0 
    ? (checkIns.reduce((sum, checkIn) => sum + getMoodScore(checkIn.mood), 0) / checkIns.length).toFixed(1)
    : 'N/A';
  
  const avgEnergy = checkIns.length > 0 
    ? (checkIns.reduce((sum, checkIn) => sum + (checkIn.energy === 'High' ? 8 : checkIn.energy === 'Moderate' ? 5 : 3), 0) / checkIns.length).toFixed(1)
    : 'N/A';

  const avgSleep = checkIns.length > 0 
    ? (checkIns.reduce((sum, checkIn) => sum + (checkIn.sleepHours || 0), 0) / checkIns.length).toFixed(1)
    : 'N/A';

  const checkInRate = totalCheckIns > 0 ? `${totalCheckIns}/${daysDiff} days` : '0 days';

  const moodTrend = calculateTrend(checkIns.map(c => getMoodScore(c.mood)));
  const energyTrend = calculateTrend(checkIns.map(c => c.energy === 'High' ? 8 : c.energy === 'Moderate' ? 5 : 3));

  return {
    category: 'wellness',
    title: 'Wellness & Mood',
    icon: 'Heart',
    color: 'danger',
    metrics: [
      { label: 'Average Mood', value: `${avgMood}/10`, trend: moodTrend, change: moodTrend === 'up' ? '+0.5' : moodTrend === 'down' ? '-0.3' : '0' },
      { label: 'Energy Level', value: `${avgEnergy}/10`, trend: energyTrend, change: energyTrend === 'up' ? '+0.8' : energyTrend === 'down' ? '-0.4' : '0' },
      { label: 'Sleep Quality', value: `${avgSleep}h avg`, trend: 'up', change: '+0.3h' },
      { label: 'Check-ins', value: checkInRate, trend: totalCheckIns > daysDiff * 0.7 ? 'up' : 'neutral', change: totalCheckIns > daysDiff * 0.7 ? '+2 days' : '0' }
    ],
    insights: [
      totalCheckIns > 0 ? `Your average mood was ${avgMood}/10 ${periodName}` : 'No mood data available for this period',
      totalCheckIns > 0 ? `Energy levels averaged ${avgEnergy}/10` : 'No energy data available for this period',
      totalCheckIns > 0 ? `Average sleep duration was ${avgSleep} hours` : 'No sleep data available for this period'
    ],
    highlights: [
      totalCheckIns > 0 ? `Best mood day: ${getBestMoodDay(checkIns)}` : 'No check-ins recorded',
      totalCheckIns > 0 ? `Most active day: ${getMostActiveDay(checkIns)}` : 'No activity data',
      totalCheckIns > 0 ? `Consistent check-in rate: ${checkInRate}` : 'No check-ins recorded'
    ]
  };
}

function generateJournalRecap(journalEntries: any[], periodName: string, daysDiff: number) {
  const totalEntries = journalEntries.length;
  const totalWords = journalEntries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0);
  const voiceEntries = journalEntries.filter(entry => entry.audioUrl).length;
  const avgWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

  const entryTrend = calculateTrend(journalEntries.map((_, i) => i + 1));
  const wordTrend = calculateTrend(journalEntries.map(entry => entry.content?.length || 0));

  return {
    category: 'journal',
    title: 'Journal & Reflection',
    icon: 'BookOpen',
    color: 'primary',
    metrics: [
      { label: 'Entries Written', value: totalEntries.toString(), trend: entryTrend, change: entryTrend === 'up' ? '+3' : entryTrend === 'down' ? '-1' : '0' },
      { label: 'Words Written', value: totalWords.toLocaleString(), trend: wordTrend, change: wordTrend === 'up' ? '+456' : wordTrend === 'down' ? '-120' : '0' },
      { label: 'Reflection Depth', value: avgWordsPerEntry > 100 ? 'High' : avgWordsPerEntry > 50 ? 'Medium' : 'Low', trend: avgWordsPerEntry > 100 ? 'up' : 'neutral', change: avgWordsPerEntry > 100 ? '+15%' : '0' },
      { label: 'Voice Entries', value: voiceEntries.toString(), trend: voiceEntries > 0 ? 'up' : 'neutral', change: voiceEntries > 0 ? '+1' : '0' }
    ],
    insights: [
      totalEntries > 0 ? `Writing frequency: ${totalEntries} entries ${periodName}` : 'No journal entries for this period',
      totalEntries > 0 ? `Average entry length: ${avgWordsPerEntry} words` : 'No content to analyze',
      totalEntries > 0 ? `Voice vs text ratio: ${Math.round((voiceEntries / totalEntries) * 100)}% voice entries` : 'No entries recorded'
    ],
    highlights: [
      totalEntries > 0 ? `Longest entry: ${Math.max(...journalEntries.map(e => e.content?.length || 0))} words` : 'No entries to highlight',
      totalEntries > 0 ? `Most active day: ${getMostActiveJournalDay(journalEntries)}` : 'No journal activity',
      totalEntries > 0 ? `Voice entries: ${voiceEntries} recorded` : 'No voice entries'
    ]
  };
}

function generateLifeAreasRecap(goals: any[], wheelOfLife: any, periodName: string, daysDiff: number) {
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const lifeBalanceScore = wheelOfLife ? calculateLifeBalanceScore(wheelOfLife) : 'N/A';
  const priorityShifts = goals.filter(goal => goal.status === 'in-progress').length;
  const growthAreas = wheelOfLife ? getGrowthAreas(wheelOfLife) : ['No data available'];

  return {
    category: 'life-areas',
    title: 'Life Areas & Goals',
    icon: 'Target',
    color: 'success',
    metrics: [
      { label: 'Goals Completed', value: `${completedGoals}/${totalGoals}`, trend: completedGoals > 0 ? 'up' : 'neutral', change: completedGoals > 0 ? `+${completedGoals}` : '0' },
      { label: 'Life Balance', value: typeof lifeBalanceScore === 'number' ? `${lifeBalanceScore}/10` : lifeBalanceScore, trend: typeof lifeBalanceScore === 'number' && lifeBalanceScore > 7 ? 'up' : 'neutral', change: typeof lifeBalanceScore === 'number' && lifeBalanceScore > 7 ? '+0.4' : '0' },
      { label: 'Priority Shifts', value: priorityShifts.toString(), trend: priorityShifts > 0 ? 'up' : 'neutral', change: priorityShifts > 0 ? `+${priorityShifts}` : '0' },
      { label: 'Growth Areas', value: growthAreas[0] || 'None', trend: growthAreas.length > 0 ? 'up' : 'neutral', change: growthAreas.length > 0 ? '+1' : '0' }
    ],
    insights: [
      totalGoals > 0 ? `Goal completion rate: ${completionRate}%` : 'No goals set for this period',
      typeof lifeBalanceScore === 'number' ? `Life balance score: ${lifeBalanceScore}/10` : 'No life balance data available',
      priorityShifts > 0 ? `${priorityShifts} goals in progress` : 'No active goals'
    ],
    highlights: [
      completedGoals > 0 ? `Completed: ${completedGoals} goals` : 'No goals completed',
      typeof lifeBalanceScore === 'number' && lifeBalanceScore > 7 ? 'Improved: Life balance' : 'Life balance needs attention',
      growthAreas.length > 0 ? `Focus needed: ${growthAreas.join(', ')}` : 'All areas balanced'
    ]
  };
}

function generateRelationshipsRecap(people: any[], journalEntries: any[], periodName: string, daysDiff: number) {
  const totalPeople = people.length;
  const mentionedPeople = people.filter(person => 
    journalEntries.some(entry => 
      entry.content?.toLowerCase().includes(person.name.toLowerCase())
    )
  ).length;

  const positiveInteractions = mentionedPeople > 0 ? Math.round((mentionedPeople / totalPeople) * 100) : 0;
  const newConnections = people.filter(person => {
    const personCreated = new Date(person.createdAt);
    return personCreated >= new Date(Date.now() - daysDiff * 24 * 60 * 60 * 1000);
  }).length;

  const qualityTime = mentionedPeople * 2; // Estimate based on mentions

  return {
    category: 'relationships',
    title: 'Relationships & People',
    icon: 'Users',
    color: 'info',
    metrics: [
      { label: 'People Mentioned', value: mentionedPeople.toString(), trend: mentionedPeople > 0 ? 'up' : 'neutral', change: mentionedPeople > 0 ? `+${mentionedPeople}` : '0' },
      { label: 'Positive Interactions', value: `${positiveInteractions}%`, trend: positiveInteractions > 50 ? 'up' : 'neutral', change: positiveInteractions > 50 ? '+10%' : '0' },
      { label: 'New Connections', value: newConnections.toString(), trend: newConnections > 0 ? 'up' : 'neutral', change: newConnections > 0 ? `+${newConnections}` : '0' },
      { label: 'Quality Time', value: `${qualityTime}h`, trend: qualityTime > 0 ? 'up' : 'neutral', change: qualityTime > 0 ? '+3h' : '0' }
    ],
    insights: [
      totalPeople > 0 ? `Relationship network: ${totalPeople} people tracked` : 'No people tracked',
      mentionedPeople > 0 ? `Active relationships: ${mentionedPeople} people mentioned` : 'No relationship activity recorded',
      newConnections > 0 ? `New connections: ${newConnections} people added` : 'No new connections'
    ],
    highlights: [
      mentionedPeople > 0 ? `Most mentioned: ${getMostMentionedPerson(people, journalEntries)}` : 'No mentions recorded',
      newConnections > 0 ? `New connection: ${getNewestPerson(people)}` : 'No new connections',
      qualityTime > 0 ? `Quality time: ${qualityTime} hours estimated` : 'No interaction time recorded'
    ]
  };
}

function generateProductivityRecap(tasks: any[], financeEntries: any[], periodName: string, daysDiff: number) {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalIncome = financeEntries.filter(entry => entry.category === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = financeEntries.filter(entry => entry.category === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const productivityScore = calculateProductivityScore(tasks, financeEntries);

  return {
    category: 'productivity',
    title: 'Finance & Tasks',
    icon: 'DollarSign',
    color: 'warning',
    metrics: [
      { label: 'Tasks Completed', value: `${completedTasks}/${totalTasks}`, trend: completedTasks > 0 ? 'up' : 'neutral', change: completedTasks > 0 ? `+${completedTasks}` : '0' },
      { label: 'Financial Goals', value: savingsRate > 20 ? 'On Track' : 'Needs Attention', trend: savingsRate > 20 ? 'up' : 'neutral', change: savingsRate > 20 ? '+5%' : '0' },
      { label: 'Savings Rate', value: `${savingsRate}%`, trend: savingsRate > 20 ? 'up' : 'neutral', change: savingsRate > 20 ? '+5%' : '0' },
      { label: 'Productivity Score', value: `${productivityScore}/10`, trend: productivityScore > 7 ? 'up' : 'neutral', change: productivityScore > 7 ? '+0.8' : '0' }
    ],
    insights: [
      totalTasks > 0 ? `Task completion rate: ${taskCompletionRate}%` : 'No tasks for this period',
      financeEntries.length > 0 ? `Financial tracking: ${financeEntries.length} entries` : 'No financial data',
      savingsRate > 0 ? `Savings rate: ${savingsRate}%` : 'No income/expense data'
    ],
    highlights: [
      completedTasks > 0 ? `Completed: ${completedTasks} tasks` : 'No tasks completed',
      savingsRate > 20 ? `Achieved: Savings goal` : 'Savings goal needs attention',
      productivityScore > 7 ? `Improved: Productivity patterns` : 'Productivity needs improvement'
    ]
  };
}

function generateGrowthRecap(soulMatrix: any, journalEntries: any[], checkIns: any[], periodName: string, daysDiff: number) {
  const selfAwarenessScore = soulMatrix ? calculateSelfAwarenessScore(soulMatrix) : 'N/A';
  const learningMoments = journalEntries.filter(entry => 
    entry.content?.toLowerCase().includes('learn') || 
    entry.content?.toLowerCase().includes('discover') ||
    entry.content?.toLowerCase().includes('realize')
  ).length;

  const challengesOvercome = journalEntries.filter(entry => 
    entry.content?.toLowerCase().includes('challenge') || 
    entry.content?.toLowerCase().includes('overcome') ||
    entry.content?.toLowerCase().includes('difficult')
  ).length;

  const growthMindset = calculateGrowthMindset(journalEntries, checkIns);

  return {
    category: 'growth',
    title: 'Personal Growth',
    icon: 'Brain',
    color: 'purple',
    metrics: [
      { label: 'Self-Awareness', value: typeof selfAwarenessScore === 'number' ? `${selfAwarenessScore}/10` : selfAwarenessScore, trend: typeof selfAwarenessScore === 'number' && selfAwarenessScore > 7 ? 'up' : 'neutral', change: typeof selfAwarenessScore === 'number' && selfAwarenessScore > 7 ? '+0.7' : '0' },
      { label: 'Learning Moments', value: learningMoments.toString(), trend: learningMoments > 0 ? 'up' : 'neutral', change: learningMoments > 0 ? `+${learningMoments}` : '0' },
      { label: 'Challenges Overcome', value: challengesOvercome.toString(), trend: challengesOvercome > 0 ? 'up' : 'neutral', change: challengesOvercome > 0 ? `+${challengesOvercome}` : '0' },
      { label: 'Growth Mindset', value: growthMindset, trend: growthMindset === 'Strong' ? 'up' : 'neutral', change: growthMindset === 'Strong' ? '+15%' : '0' }
    ],
    insights: [
      typeof selfAwarenessScore === 'number' ? `Self-awareness score: ${selfAwarenessScore}/10` : 'No personality data available',
      learningMoments > 0 ? `Learning moments: ${learningMoments} recorded` : 'No learning moments recorded',
      challengesOvercome > 0 ? `Challenges overcome: ${challengesOvercome}` : 'No challenges recorded'
    ],
    highlights: [
      typeof selfAwarenessScore === 'number' && selfAwarenessScore > 7 ? 'Improved: Self-awareness' : 'Self-awareness needs development',
      learningMoments > 0 ? `Learned: ${learningMoments} new insights` : 'No learning moments',
      challengesOvercome > 0 ? `Overcame: ${challengesOvercome} challenges` : 'No challenges recorded'
    ]
  };
}

async function generateComprehensiveRecap(data: {
  journalEntries: any[];
  checkIns: any[];
  goals: any[];
  people: any[];
  financeEntries: any[];
  tasks: any[];
  soulMatrix: any;
  wheelOfLife: any;
  period: string;
  startDate: Date;
  endDate: Date;
  userId: string;
}) {
  // Generate category recaps
  const categoryRecaps = await generateCategoryRecaps(data);
  
  // Create comprehensive content
  const content = generateComprehensiveContent(data, categoryRecaps);
  
  // Generate insights and recommendations
  const insights = generateComprehensiveInsights(categoryRecaps);
  const recommendations = generateComprehensiveRecommendations(categoryRecaps);
  const lifeAreaImprovements = generateLifeAreaImprovements(categoryRecaps);
  const metrics = generateComprehensiveMetrics(categoryRecaps);

  return {
    content,
    insights,
    recommendations,
    lifeAreaImprovements,
    metrics
  };
}

// Helper functions
function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    'excited': 9, 'happy': 8, 'content': 7, 'calm': 6, 'neutral': 5,
    'tired': 4, 'stressed': 3, 'anxious': 2, 'sad': 1, 'angry': 0
  };
  return moodScores[mood.toLowerCase()] || 5;
}

function calculateTrend(values: number[]): 'up' | 'down' | 'neutral' {
  if (values.length < 2) return 'neutral';
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (secondAvg > firstAvg * 1.1) return 'up';
  if (secondAvg < firstAvg * 0.9) return 'down';
  return 'neutral';
}

function getBestMoodDay(checkIns: any[]): string {
  if (checkIns.length === 0) return 'No data';
  const bestCheckIn = checkIns.reduce((best, current) => 
    getMoodScore(current.mood) > getMoodScore(best.mood) ? current : best
  );
  return new Date(bestCheckIn.createdAt).toLocaleDateString();
}

function getMostActiveDay(checkIns: any[]): string {
  if (checkIns.length === 0) return 'No data';
  const mostActive = checkIns.reduce((best, current) => 
    (current.energy === 'High' ? 8 : current.energy === 'Moderate' ? 5 : 3) > 
    (best.energy === 'High' ? 8 : best.energy === 'Moderate' ? 5 : 3) ? current : best
  );
  return new Date(mostActive.createdAt).toLocaleDateString();
}

function getMostActiveJournalDay(journalEntries: any[]): string {
  if (journalEntries.length === 0) return 'No data';
  const entryCounts: { [key: string]: number } = {};
  journalEntries.forEach(entry => {
    const date = new Date(entry.createdAt).toDateString();
    entryCounts[date] = (entryCounts[date] || 0) + 1;
  });
  const mostActiveDate = Object.entries(entryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return new Date(mostActiveDate).toLocaleDateString();
}

function calculateLifeBalanceScore(wheelOfLife: any): number {
  if (!wheelOfLife || !wheelOfLife.lifeAreas) return 0;
  try {
    const areas = JSON.parse(wheelOfLife.lifeAreas);
    const scores = Object.values(areas).map((score: any) => parseInt(score) || 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  } catch {
    return 0;
  }
}

function getGrowthAreas(wheelOfLife: any): string[] {
  if (!wheelOfLife || !wheelOfLife.lifeAreas) return [];
  try {
    const areas = JSON.parse(wheelOfLife.lifeAreas);
    const lowAreas = Object.entries(areas)
      .filter(([_, score]) => (parseInt(score as string) || 0) < 6)
      .map(([area, _]) => area);
    return lowAreas;
  } catch {
    return [];
  }
}

function getMostMentionedPerson(people: any[], journalEntries: any[]): string {
  if (people.length === 0 || journalEntries.length === 0) return 'No data';
  const mentionCounts: { [key: string]: number } = {};
  people.forEach(person => {
    mentionCounts[person.name] = journalEntries.filter(entry => 
      entry.content?.toLowerCase().includes(person.name.toLowerCase())
    ).length;
  });
  const mostMentioned = Object.entries(mentionCounts).reduce((a, b) => a[1] > b[1] ? a : b);
  return mostMentioned[1] > 0 ? mostMentioned[0] : 'No mentions';
}

function getNewestPerson(people: any[]): string {
  if (people.length === 0) return 'No data';
  const newest = people.reduce((a, b) => 
    new Date(a.createdAt) > new Date(b.createdAt) ? a : b
  );
  return newest.name;
}

function calculateProductivityScore(tasks: any[], financeEntries: any[]): number {
  const taskScore = tasks.length > 0 ? 
    (tasks.filter(t => t.status === 'completed').length / tasks.length) * 10 : 5;
  const financeScore = financeEntries.length > 0 ? 8 : 5;
  return Math.round((taskScore + financeScore) / 2);
}

function calculateSelfAwarenessScore(soulMatrix: any): number {
  if (!soulMatrix || !soulMatrix.traits) return 0;
  try {
    const traits = JSON.parse(soulMatrix.traits);
    return Math.round(Object.keys(traits).length * 2); // Simple scoring
  } catch {
    return 0;
  }
}

function calculateGrowthMindset(journalEntries: any[], checkIns: any[]): string {
  const growthKeywords = ['learn', 'grow', 'improve', 'develop', 'progress'];
  const growthMentions = journalEntries.filter(entry => 
    growthKeywords.some(keyword => entry.content?.toLowerCase().includes(keyword))
  ).length;
  
  if (growthMentions > 5) return 'Strong';
  if (growthMentions > 2) return 'Moderate';
  return 'Developing';
}

function generateComprehensiveContent(data: any, categoryRecaps: any[]): string {
  const { journalEntries, checkIns, period } = data;
  const periodName = period === 'weekly' ? 'this week' : 'this month';
  
  return `Your ${periodName} has been a journey of ${journalEntries.length} reflections and ${checkIns.length} check-ins. 
  Across all life areas, you've shown consistent growth and awareness. 
  The data reveals patterns of improvement in wellness, relationships, and personal development.`;
}

function generateComprehensiveInsights(categoryRecaps: any[]): string[] {
  return categoryRecaps.flatMap(recap => recap.insights);
}

function generateComprehensiveRecommendations(categoryRecaps: any[]): string[] {
  return [
    'Continue your current wellness routine',
    'Maintain regular journaling habits',
    'Focus on identified growth areas',
    'Nurture important relationships',
    'Track financial goals consistently',
    'Embrace learning opportunities'
  ];
}

function generateLifeAreaImprovements(categoryRecaps: any[]): any[] {
  return categoryRecaps.map(recap => ({
    area: recap.title,
    improvement: recap.metrics[0]?.trend === 'up' ? 'Improving' : 'Needs attention'
  }));
}

function generateComprehensiveMetrics(categoryRecaps: any[]): any {
  return {
    totalCategories: categoryRecaps.length,
    improvingAreas: categoryRecaps.filter(r => r.metrics.some((m: any) => m.trend === 'up')).length,
    areasNeedingAttention: categoryRecaps.filter(r => r.metrics.some((m: any) => m.trend === 'down')).length
  };
} 
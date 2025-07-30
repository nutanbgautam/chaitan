import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'weekly', userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Calculate date range
    const periodEnd = new Date();
    const periodStart = new Date();
    
    if (type === 'weekly') {
      periodStart.setDate(periodStart.getDate() - 7);
    } else {
      periodStart.setMonth(periodStart.getMonth() - 1);
    }

    // Get data for the specified period
    const journalEntries = db.getJournalEntriesByUserId(userId, 1000, 0);
    const checkIns = db.getCheckInsByUserId(userId, 1000, 0);
    const goals = db.getGoalsByUserId(userId, 1000, 0);
    const soulMatrix = db.getSoulMatrixByUserId(userId);
    const wheelOfLife = db.getWheelOfLifeByUserId(userId);

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

    // Generate recap
    const recap = await generateRecap({
      journalEntries: filteredEntries,
      checkIns: filteredCheckIns,
      goals: filteredGoals,
      soulMatrix,
      wheelOfLife,
      period: type,
      startDate: periodStart,
      endDate: periodEnd
    });

    // Save recap to database
    const recapId = db.createRecap({
      userId: userId,
      type: type as 'weekly' | 'monthly',
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      content: JSON.stringify({
        title: recap.title,
        summary: recap.summary,
        highlights: recap.highlights,
        insights: recap.insights,
        recommendations: recap.recommendations
      }),
      insights: JSON.stringify(recap.insights),
      recommendations: JSON.stringify(recap.recommendations),
      lifeAreaImprovements: JSON.stringify({}),
      metrics: JSON.stringify({})
    });

    return NextResponse.json({ 
      id: recapId, 
      message: `${type} recap generated successfully`,
      recap: recap
    });
  } catch (error) {
    console.error('Error generating automatic recap:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateRecap(data: {
  journalEntries: any[];
  checkIns: any[];
  goals: any[];
  soulMatrix: any;
  wheelOfLife: any;
  period: string;
  startDate: Date;
  endDate: Date;
}) {
  const recap = {
    period: data.period,
    startDate: data.startDate,
    endDate: data.endDate,
    title: generateRecapTitle(data),
    summary: generateSummary(data),
    highlights: generateHighlights(data),
    insights: generateInsights(data),
    goals: generateGoalSummary(data),
    wellness: generateWellnessSummary(data),
    themes: generateThemeAnalysis(data),
    recommendations: generateRecommendations(data),
    story: generateStoryFormat(data)
  };

  return recap;
}

function generateRecapTitle(data: any): string {
  const periodName = data.period === 'weekly' ? 'Week' : 'Month';
  const startDate = data.startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  const endDate = data.endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${periodName} of ${startDate} - ${endDate}`;
}

function generateSummary(data: any): string {
  const entryCount = data.journalEntries.length;
  const checkInCount = data.checkIns.length;
  const goalCount = data.goals.length;
  
  const avgMood = data.checkIns.length > 0 ? 
    data.checkIns.reduce((sum: number, checkIn: any) => sum + getMoodScore(checkIn.mood), 0) / data.checkIns.length : 0;
  
  const totalWords = data.journalEntries.reduce((sum: number, entry: any) => 
    sum + (entry.content?.length || entry.transcription?.length || 0), 0
  );

  return `This ${data.period} was filled with ${entryCount} journal entries totaling ${totalWords} words. You completed ${checkInCount} wellness check-ins with an average mood of ${avgMood.toFixed(1)}/10. ${goalCount} goals were active during this period.`;
}

function generateHighlights(data: any): any[] {
  const highlights = [];
  
  // Journal entry highlights
  if (data.journalEntries.length > 0) {
    const longestEntry = data.journalEntries.reduce((longest: any, entry: any) => {
      const length = entry.content?.length || entry.transcription?.length || 0;
      return length > (longest.content?.length || longest.transcription?.length || 0) ? entry : longest;
    });
    
    highlights.push({
      type: 'journal',
      title: 'Most Detailed Entry',
      description: `Your longest entry was ${longestEntry.content?.length || longestEntry.transcription?.length || 0} characters long`,
      date: longestEntry.createdAt,
      impact: 'high'
    });
  }

  // Mood highlights
  if (data.checkIns.length > 0) {
    const moodScores = data.checkIns.map((checkIn: any) => getMoodScore(checkIn.mood));
    const bestMood = Math.max(...moodScores);
    const worstMood = Math.min(...moodScores);
    
    if (bestMood >= 8) {
      highlights.push({
        type: 'mood',
        title: 'Peak Happiness',
        description: `You experienced your highest mood of ${bestMood}/10`,
        date: data.checkIns[moodScores.indexOf(bestMood)].createdAt,
        impact: 'positive'
      });
    }
    
    if (worstMood <= 3) {
      highlights.push({
        type: 'mood',
        title: 'Challenging Moment',
        description: `You faced a difficult day with mood of ${worstMood}/10`,
        date: data.checkIns[moodScores.indexOf(worstMood)].createdAt,
        impact: 'learning'
      });
    }
  }

  // Goal highlights
  const completedGoals = data.goals.filter((goal: any) => goal.status === 'completed');
  if (completedGoals.length > 0) {
    highlights.push({
      type: 'goal',
      title: 'Goal Achievement',
      description: `You completed ${completedGoals.length} goal${completedGoals.length > 1 ? 's' : ''}`,
      date: completedGoals[0].updatedAt,
      impact: 'achievement'
    });
  }

  return highlights;
}

function generateInsights(data: any): any[] {
  const insights = [];
  
  // Writing patterns
  const avgEntryLength = data.journalEntries.length > 0 ? 
    data.journalEntries.reduce((sum: number, entry: any) => 
      sum + (entry.content?.length || entry.transcription?.length || 0), 0
    ) / data.journalEntries.length : 0;
  
  if (avgEntryLength > 500) {
    insights.push({
      type: 'writing',
      title: 'Deep Reflection',
      message: 'You engaged in detailed journaling this period, showing a commitment to self-reflection.',
      priority: 'medium'
    });
  } else if (avgEntryLength < 200) {
    insights.push({
      type: 'writing',
      title: 'Concise Expression',
      message: 'Your entries were brief but focused, indicating efficient self-expression.',
      priority: 'low'
    });
  }

  // Mood patterns
  if (data.checkIns.length > 0) {
    const moodScores = data.checkIns.map((checkIn: any) => getMoodScore(checkIn.mood));
    const avgMood = moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length;
    
    if (avgMood > 7) {
      insights.push({
        type: 'wellness',
        title: 'Positive Outlook',
        message: 'Your average mood was high, indicating good emotional well-being.',
        priority: 'positive'
      });
    } else if (avgMood < 4) {
      insights.push({
        type: 'wellness',
        title: 'Emotional Challenges',
        message: 'You experienced lower mood levels, suggesting a need for self-care.',
        priority: 'high'
      });
    }
  }

  // Goal progress
  const activeGoals = data.goals.filter((goal: any) => goal.status === 'in-progress');
  if (activeGoals.length > 0) {
    const avgProgress = activeGoals.reduce((sum: number, goal: any) => sum + goal.progress, 0) / activeGoals.length;
    
    if (avgProgress > 70) {
      insights.push({
        type: 'goals',
        title: 'Strong Progress',
        message: 'You made excellent progress on your goals this period.',
        priority: 'positive'
      });
    } else if (avgProgress < 30) {
      insights.push({
        type: 'goals',
        title: 'Goal Focus Needed',
        message: 'Consider revisiting your goals and breaking them into smaller steps.',
        priority: 'medium'
      });
    }
  }

  return insights;
}

function generateGoalSummary(data: any): any {
  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter((goal: any) => goal.status === 'completed');
  const inProgressGoals = data.goals.filter((goal: any) => goal.status === 'in-progress');
  const pendingGoals = data.goals.filter((goal: any) => goal.status === 'pending');

  const avgProgress = inProgressGoals.length > 0 ? 
    inProgressGoals.reduce((sum: number, goal: any) => sum + goal.progress, 0) / inProgressGoals.length : 0;

  return {
    total: totalGoals,
    completed: completedGoals.length,
    inProgress: inProgressGoals.length,
    pending: pendingGoals.length,
    averageProgress: avgProgress,
    completionRate: totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0
  };
}

function generateWellnessSummary(data: any): any {
  if (data.checkIns.length === 0) {
    return {
      averageMood: 0,
      averageEnergy: 0,
      averageSleep: 0,
      moodTrend: 'stable',
      energyTrend: 'stable',
      sleepTrend: 'stable'
    };
  }

  const moodScores = data.checkIns.map((checkIn: any) => getMoodScore(checkIn.mood));
  const energyScores = data.checkIns.map((checkIn: any) => checkIn.energy);
  const sleepHours = data.checkIns.map((checkIn: any) => checkIn.sleepHours + (checkIn.sleepMinutes / 60));

  const avgMood = moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length;
  const avgEnergy = energyScores.reduce((a: number, b: number) => a + b, 0) / energyScores.length;
  const avgSleep = sleepHours.reduce((a: number, b: number) => a + b, 0) / sleepHours.length;

  return {
    averageMood: avgMood,
    averageEnergy: avgEnergy,
    averageSleep: avgSleep,
    moodTrend: calculateTrend(moodScores),
    energyTrend: calculateTrend(energyScores),
    sleepTrend: calculateTrend(sleepHours)
  };
}

function generateThemeAnalysis(data: any): any {
  const themes = {
    work: 0,
    relationships: 0,
    health: 0,
    finance: 0,
    personal: 0
  };

  data.journalEntries.forEach((entry: any) => {
    const content = entry.content || entry.transcription || '';
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('career')) {
      themes.work++;
    }
    if (lowerContent.includes('family') || lowerContent.includes('friend') || lowerContent.includes('relationship')) {
      themes.relationships++;
    }
    if (lowerContent.includes('health') || lowerContent.includes('exercise') || lowerContent.includes('diet')) {
      themes.health++;
    }
    if (lowerContent.includes('money') || lowerContent.includes('finance') || lowerContent.includes('budget')) {
      themes.finance++;
    }
    if (lowerContent.includes('learn') || lowerContent.includes('grow') || lowerContent.includes('develop')) {
      themes.personal++;
    }
  });

  const dominantTheme = Object.entries(themes).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0];
  
  return {
    themes,
    dominantTheme,
    totalMentions: Object.values(themes).reduce((a: number, b: number) => a + b, 0)
  };
}

function generateRecommendations(data: any): any[] {
  const recommendations = [];
  
  // Based on mood
  const wellness = generateWellnessSummary(data);
  if (wellness.averageMood < 5) {
    recommendations.push({
      type: 'wellness',
      title: 'Boost Your Mood',
      description: 'Consider activities that bring you joy, such as spending time with loved ones or pursuing hobbies.',
      priority: 'high'
    });
  }

  // Based on goals
  const goalSummary = generateGoalSummary(data);
  if (goalSummary.completionRate < 0.3) {
    recommendations.push({
      type: 'productivity',
      title: 'Goal Setting Review',
      description: 'Review your goals and break them into smaller, more manageable tasks.',
      priority: 'medium'
    });
  }

  // Based on writing patterns
  if (data.journalEntries.length < 3) {
    recommendations.push({
      type: 'reflection',
      title: 'Increase Journaling',
      description: 'Try to journal more regularly to better track your thoughts and progress.',
      priority: 'medium'
    });
  }

  return recommendations;
}

function generateStoryFormat(data: any): any {
  const periodName = data.period === 'weekly' ? 'week' : 'month';
  const entryCount = data.journalEntries.length;
  const wellness = generateWellnessSummary(data);
  const goalSummary = generateGoalSummary(data);
  const themeAnalysis = generateThemeAnalysis(data);

  // Generate multiple story formats
  const stories = {
    narrative: generateNarrativeStory(data, periodName, entryCount, wellness, goalSummary, themeAnalysis),
    timeline: generateTimelineStory(data),
    character: generateCharacterStory(data, wellness, goalSummary),
    journey: generateJourneyStory(data, periodName, entryCount, wellness, goalSummary, themeAnalysis),
    reflection: generateReflectionStory(data, periodName, entryCount, wellness, goalSummary, themeAnalysis)
  };

  return stories;
}

function generateNarrativeStory(data: any, periodName: string, entryCount: number, wellness: any, goalSummary: any, themeAnalysis: any): string {
  let story = `This ${periodName} was a journey of ${entryCount} moments captured in your journal. `;
  
  if (wellness.averageMood > 7) {
    story += `Your spirits were high, with an average mood of ${wellness.averageMood.toFixed(1)}/10, reflecting a period of positivity and contentment. `;
  } else if (wellness.averageMood < 4) {
    story += `You faced some challenges, with an average mood of ${wellness.averageMood.toFixed(1)}/10, showing resilience through difficult times. `;
  } else {
    story += `Your mood remained balanced at ${wellness.averageMood.toFixed(1)}/10, showing steady emotional well-being. `;
  }

  if (goalSummary.completed > 0) {
    story += `You celebrated ${goalSummary.completed} achievement${goalSummary.completed > 1 ? 's' : ''}, marking significant progress in your personal growth. `;
  }

  if (themeAnalysis.dominantTheme) {
    const themeNames = {
      work: 'professional development',
      relationships: 'personal connections',
      health: 'wellness and self-care',
      finance: 'financial planning',
      personal: 'personal growth'
    };
    story += `Your reflections often centered around ${themeNames[themeAnalysis.dominantTheme as keyof typeof themeNames]}, showing where your focus and energy were directed. `;
  }

  story += `As this ${periodName} comes to a close, you've created ${entryCount} opportunities for self-reflection and growth. `;

  return story;
}

function generateTimelineStory(data: any): any[] {
  const timeline: any[] = [];
  
  // Group entries by day
  const entriesByDay = data.journalEntries.reduce((acc: any, entry: any) => {
    const date = new Date(entry.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  // Create timeline entries
  Object.entries(entriesByDay).forEach(([date, entries]: [string, any]) => {
    const dayEntries = entries as any[];
    const totalWords = dayEntries.reduce((sum: number, entry: any) => 
      sum + (entry.content?.length || entry.transcription?.length || 0), 0
    );
    
    timeline.push({
      date: new Date(date),
      entries: dayEntries.length,
      totalWords,
      mood: data.checkIns.find((checkIn: any) => 
        new Date(checkIn.createdAt).toDateString() === date
      )?.mood || '😐',
      highlight: dayEntries.length > 2 ? 'Most Active Day' : 
                 totalWords > 500 ? 'Deep Reflection Day' : 'Regular Day'
    });
  });

  return timeline.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
}

function generateCharacterStory(data: any, wellness: any, goalSummary: any): any {
  const character = {
    name: 'Your Journey',
    traits: [] as string[],
    growth: [] as string[],
    challenges: [] as string[],
    achievements: [] as string[]
  };

  // Analyze character traits based on data
  if (wellness.averageMood > 7) {
    character.traits.push('Optimistic', 'Resilient', 'Content');
  } else if (wellness.averageMood < 4) {
    character.traits.push('Persevering', 'Strong', 'Learning');
  } else {
    character.traits.push('Balanced', 'Steady', 'Reflective');
  }

  if (goalSummary.completionRate > 70) {
    character.traits.push('Determined', 'Focused', 'Achiever');
  }

  if (data.journalEntries.length > 10) {
    character.traits.push('Thoughtful', 'Self-aware', 'Dedicated');
  }

  // Growth areas
  if (wellness.averageMood < 6) {
    character.growth.push('Emotional resilience', 'Self-care practices');
  }
  if (goalSummary.completionRate < 50) {
    character.growth.push('Goal setting', 'Time management');
  }

  // Challenges
  if (wellness.averageMood < 4) {
    character.challenges.push('Managing difficult emotions', 'Finding balance');
  }
  if (data.journalEntries.length < 3) {
    character.challenges.push('Maintaining consistent reflection');
  }

  // Achievements
  if (goalSummary.completed > 0) {
    character.achievements.push(`Completed ${goalSummary.completed} goal${goalSummary.completed > 1 ? 's' : ''}`);
  }
  if (data.journalEntries.length > 5) {
    character.achievements.push('Maintained regular journaling practice');
  }

  return character;
}

function generateJourneyStory(data: any, periodName: string, entryCount: number, wellness: any, goalSummary: any, themeAnalysis: any): any {
  const journey = {
    title: `Your ${periodName.charAt(0).toUpperCase() + periodName.slice(1)} Journey`,
    chapters: [] as any[],
    milestones: [] as any[],
    lessons: [] as any[]
  };

  // Create journey chapters
  const weekCount = data.period === 'weekly' ? 1 : 4;
  for (let i = 0; i < weekCount; i++) {
    const weekStart = new Date(data.startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekEntries = data.journalEntries.filter((entry: any) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    journey.chapters.push({
      week: i + 1,
      title: `Week ${i + 1}: ${weekEntries.length > 0 ? 'Active Reflection' : 'Quiet Contemplation'}`,
      entries: weekEntries.length,
      theme: weekEntries.length > 0 ? 'Growth' : 'Rest',
      summary: weekEntries.length > 0 ? 
        `A week of ${weekEntries.length} reflections and insights` : 
        'A period of quiet observation and internal processing'
    });
  }

  // Identify milestones
  if (goalSummary.completed > 0) {
    journey.milestones.push({
      type: 'achievement',
      title: 'Goal Completion',
      description: `Reached ${goalSummary.completed} milestone${goalSummary.completed > 1 ? 's' : ''}`,
      impact: 'high'
    });
  }

  if (wellness.averageMood > 7) {
    journey.milestones.push({
      type: 'wellness',
      title: 'Emotional Peak',
      description: 'Experienced sustained positive mood',
      impact: 'positive'
    });
  }

  if (data.journalEntries.length > 10) {
    journey.milestones.push({
      type: 'practice',
      title: 'Consistent Reflection',
      description: 'Maintained regular journaling practice',
      impact: 'growth'
    });
  }

  // Extract lessons
  if (wellness.averageMood < 5) {
    journey.lessons.push({
      lesson: 'Resilience in challenging times',
      insight: 'Difficult periods often lead to the most growth',
      application: 'Use these experiences to build emotional strength'
    });
  }

  if (goalSummary.completionRate > 70) {
    journey.lessons.push({
      lesson: 'The power of focused effort',
      insight: 'Clear goals and consistent action lead to achievement',
      application: 'Apply this focus to other areas of life'
    });
  }

  return journey;
}

function generateReflectionStory(data: any, periodName: string, entryCount: number, wellness: any, goalSummary: any, themeAnalysis: any): any {
  const reflection = {
    questions: [] as string[],
    insights: [] as any[],
    patterns: [] as string[],
    growth: [] as string[]
  };

  // Generate reflection questions
  reflection.questions = [
    'What was the most significant moment of this period?',
    'How did your mood patterns reflect your overall well-being?',
    'What goals did you make progress on, and what helped or hindered you?',
    'What themes emerged in your thoughts and reflections?',
    'How have you grown or changed during this time?'
  ];

  // Generate insights based on data
  if (wellness.averageMood > 7) {
    reflection.insights.push({
      category: 'Emotional Well-being',
      insight: 'You experienced sustained positive emotions',
      reflection: 'Consider what contributed to this positive state and how to maintain it'
    });
  }

  if (goalSummary.completionRate > 70) {
    reflection.insights.push({
      category: 'Goal Achievement',
      insight: 'You demonstrated strong follow-through on your goals',
      reflection: 'What strategies worked well for you? How can you apply them to future goals?'
    });
  }

  if (themeAnalysis.dominantTheme) {
    reflection.insights.push({
      category: 'Focus Areas',
      insight: `Your attention was primarily focused on ${themeAnalysis.dominantTheme}`,
      reflection: 'Is this alignment with your priorities? What might need adjustment?'
    });
  }

  // Identify patterns
  if (data.journalEntries.length > 0) {
    const avgLength = data.journalEntries.reduce((sum: number, entry: any) => 
      sum + (entry.content?.length || entry.transcription?.length || 0), 0
    ) / data.journalEntries.length;

    if (avgLength > 500) {
      reflection.patterns.push('Deep reflection style', 'Detailed self-exploration');
    } else if (avgLength < 200) {
      reflection.patterns.push('Concise expression', 'Focused thinking');
    }
  }

  // Growth areas
  if (wellness.averageMood < 6) {
    reflection.growth.push('Emotional regulation', 'Stress management');
  }
  if (goalSummary.completionRate < 50) {
    reflection.growth.push('Goal setting strategies', 'Action planning');
  }

  return reflection;
}

// Helper functions
function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    '😊': 9, '🙂': 7, '😐': 5, '😞': 3, '😢': 1,
    '😡': 2, '😴': 4, '🤔': 6, '😌': 8, '😤': 4
  };
  return moodScores[mood] || 5;
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
} 
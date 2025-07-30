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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '90'; // days
    const granularity = searchParams.get('granularity') || 'weekly'; // daily, weekly, monthly

    const db = getDatabase();
    
    // Get data for the specified period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    const checkIns = db.getCheckInsByUserId(session.user.id, 1000, 0);
    const soulMatrix = db.getSoulMatrixByUserId(session.user.id);
    const wheelOfLife = db.getWheelOfLifeByUserId(session.user.id);
    const goals = db.getGoalsByUserId(session.user.id, 1000, 0);

    // Filter data by date range
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.createdAt) >= startDate && new Date(entry.createdAt) <= endDate
    );
    
    const filteredCheckIns = checkIns.filter(checkIn => 
      new Date(checkIn.createdAt) >= startDate && new Date(checkIn.createdAt) <= endDate
    );

    // Generate personality evolution analysis
    const evolution = await generatePersonalityEvolution({
      journalEntries: filteredEntries,
      checkIns: filteredCheckIns,
      soulMatrix,
      wheelOfLife,
      goals,
      period: parseInt(period),
      granularity
    });

    return NextResponse.json(evolution);
  } catch (error) {
    console.error('Error generating personality evolution:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generatePersonalityEvolution(data: {
  journalEntries: any[];
  checkIns: any[];
  soulMatrix: any;
  wheelOfLife: any;
  goals: any[];
  period: number;
  granularity: string;
}) {
  const evolution = {
    timeline: [] as any[],
    traitEvolution: {} as any,
    lifeEvents: [] as any[],
    personalityInsights: [] as any[],
    growthAreas: [] as any[],
    stabilityMetrics: {} as any
  };

  // Generate timeline data
  evolution.timeline = generateTimeline(data, data.granularity);
  
  // Analyze trait evolution
  evolution.traitEvolution = analyzeTraitEvolution(data);
  
  // Identify life events and their impact
  evolution.lifeEvents = identifyLifeEvents(data);
  
  // Generate personality insights
  evolution.personalityInsights = generatePersonalityInsights(data, evolution);
  
  // Identify growth areas
  evolution.growthAreas = identifyGrowthAreas(data, evolution);
  
  // Calculate stability metrics
  evolution.stabilityMetrics = calculateStabilityMetrics(evolution);

  return evolution;
}

function generateTimeline(data: any, granularity: string) {
  const timeline = [];
  const entries = data.journalEntries.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (granularity === 'weekly') {
    // Group by weeks
    const weeklyGroups = groupByWeek(entries);
    
    weeklyGroups.forEach((week, index) => {
      const weekData = analyzeWeekData(week, data.checkIns);
      timeline.push({
        period: week.weekStart,
        type: 'weekly',
        index,
        metrics: weekData,
        personalitySnapshot: generatePersonalitySnapshot(weekData)
      });
    });
  } else if (granularity === 'monthly') {
    // Group by months
    const monthlyGroups = groupByMonth(entries);
    
    monthlyGroups.forEach((month, index) => {
      const monthData = analyzeMonthData(month, data.checkIns);
      timeline.push({
        period: month.monthStart,
        type: 'monthly',
        index,
        metrics: monthData,
        personalitySnapshot: generatePersonalitySnapshot(monthData)
      });
    });
  } else {
    // Daily granularity
    entries.forEach((entry, index) => {
      const dayData = analyzeDayData(entry, data.checkIns);
      timeline.push({
        period: new Date(entry.createdAt),
        type: 'daily',
        index,
        metrics: dayData,
        personalitySnapshot: generatePersonalitySnapshot(dayData)
      });
    });
  }

  return timeline;
}

function analyzeTraitEvolution(data: any) {
  const traits = {
    extraversion: [] as any[],
    neuroticism: [] as any[],
    openness: [] as any[],
    conscientiousness: [] as any[],
    agreeableness: [] as any[]
  };

  // Analyze each journal entry for personality indicators
  data.journalEntries.forEach(entry => {
    const content = entry.content || entry.transcription || '';
    const date = new Date(entry.createdAt);
    
    const traitScores = analyzeContentForTraits(content);
    
    Object.keys(traits).forEach(trait => {
      traits[trait as keyof typeof traits].push({
        date,
        score: traitScores[trait as keyof typeof traitScores],
        confidence: calculateConfidence(content.length),
        context: extractContext(content, trait)
      });
    });
  });

  // Calculate trend lines for each trait
  Object.keys(traits).forEach(trait => {
    const traitData = traits[trait as keyof typeof traits];
    if (traitData.length > 1) {
      const trend = calculateTrend(traitData.map(d => d.score));
      traits[trait as keyof typeof traits] = traitData.map((data, index) => ({
        ...data,
        trend: trend,
        change: index > 0 ? data.score - traitData[index - 1].score : 0
      }));
    }
  });

  return traits;
}

function identifyLifeEvents(data: any) {
  const events = [];
  
  // Analyze journal entries for significant events
  data.journalEntries.forEach(entry => {
    const content = entry.content || entry.transcription || '';
    const date = new Date(entry.createdAt);
    
    const eventTypes = detectLifeEvents(content);
    
    eventTypes.forEach(eventType => {
      events.push({
        date,
        type: eventType.type,
        impact: eventType.impact,
        description: eventType.description,
        personalityImpact: estimatePersonalityImpact(eventType, content)
      });
    });
  });

  // Sort by date and add cumulative impact
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function generatePersonalityInsights(data: any, evolution: any) {
  const insights = [];
  
  // Analyze trait stability
  const traitStability = analyzeTraitStability(evolution.traitEvolution);
  
  Object.entries(traitStability).forEach(([trait, stability]) => {
    if (stability.variance > 0.5) {
      insights.push({
        type: 'trait_volatility',
        trait,
        message: `Your ${trait} shows significant variation, suggesting you're adapting to changing circumstances.`,
        priority: 'medium'
      });
    } else if (stability.variance < 0.1) {
      insights.push({
        type: 'trait_stability',
        trait,
        message: `Your ${trait} remains remarkably stable, indicating a strong core personality trait.`,
        priority: 'low'
      });
    }
  });

  // Analyze growth patterns
  const growthPatterns = analyzeGrowthPatterns(evolution.timeline);
  
  if (growthPatterns.positiveGrowth > growthPatterns.negativeGrowth) {
    insights.push({
      type: 'positive_evolution',
      message: 'Your personality shows positive evolution with increasing emotional maturity and self-awareness.',
      priority: 'high'
    });
  }

  // Analyze life event impact
  const significantEvents = evolution.lifeEvents.filter(e => e.impact > 0.7);
  if (significantEvents.length > 0) {
    insights.push({
      type: 'life_event_impact',
      message: `${significantEvents.length} significant life events have influenced your personality development.`,
      priority: 'medium'
    });
  }

  return insights;
}

function identifyGrowthAreas(data: any, evolution: any) {
  const growthAreas = [];
  
  // Analyze trait development opportunities
  const traitAverages = calculateTraitAverages(evolution.traitEvolution);
  const idealTraits = getIdealTraitProfile(data.soulMatrix);
  
  Object.entries(traitAverages).forEach(([trait, average]) => {
    const ideal = idealTraits[trait as keyof typeof idealTraits];
    const gap = ideal - average;
    
    if (gap > 0.3) {
      growthAreas.push({
        trait,
        currentLevel: average,
        idealLevel: ideal,
        gap,
        suggestions: generateGrowthSuggestions(trait, gap)
      });
    }
  });

  return growthAreas;
}

function calculateStabilityMetrics(evolution: any) {
  const stability = {
    overallStability: 0,
    traitStability: {} as any,
    growthRate: 0,
    adaptationScore: 0
  };

  // Calculate overall stability
  const traitVariances = Object.values(evolution.traitEvolution).map((trait: any) => 
    trait.length > 0 ? calculateVariance(trait.map((t: any) => t.score)) : 0
  );
  
  stability.overallStability = 1 - (traitVariances.reduce((a, b) => a + b, 0) / traitVariances.length);
  
  // Calculate trait-specific stability
  Object.entries(evolution.traitEvolution).forEach(([trait, data]) => {
    stability.traitStability[trait] = 1 - calculateVariance(data.map((d: any) => d.score));
  });

  // Calculate growth rate
  const timeline = evolution.timeline;
  if (timeline.length > 1) {
    const firstSnapshot = timeline[0].personalitySnapshot;
    const lastSnapshot = timeline[timeline.length - 1].personalitySnapshot;
    stability.growthRate = calculateGrowthRate(firstSnapshot, lastSnapshot);
  }

  // Calculate adaptation score
  stability.adaptationScore = calculateAdaptationScore(evolution.lifeEvents, evolution.traitEvolution);

  return stability;
}

// Helper functions
function groupByWeek(entries: any[]) {
  const weeks = new Map();
  
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toDateString();
    
    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, { weekStart, entries: [] });
    }
    weeks.get(weekKey).entries.push(entry);
  });
  
  return Array.from(weeks.values());
}

function groupByMonth(entries: any[]) {
  const months = new Map();
  
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthKey = monthStart.toDateString();
    
    if (!months.has(monthKey)) {
      months.set(monthKey, { monthStart, entries: [] });
    }
    months.get(monthKey).entries.push(entry);
  });
  
  return Array.from(months.values());
}

function analyzeWeekData(week: any, checkIns: any[]) {
  const weekEntries = week.entries;
  const weekCheckIns = checkIns.filter(checkIn => {
    const checkInDate = new Date(checkIn.createdAt);
    const weekEnd = new Date(week.weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return checkInDate >= week.weekStart && checkInDate < weekEnd;
  });

  return {
    entryCount: weekEntries.length,
    totalWords: weekEntries.reduce((sum, entry) => 
      sum + (entry.content?.length || entry.transcription?.length || 0), 0
    ),
    avgMood: weekCheckIns.length > 0 ? 
      weekCheckIns.reduce((sum, checkIn) => sum + getMoodScore(checkIn.mood), 0) / weekCheckIns.length : 0,
    avgEnergy: weekCheckIns.length > 0 ? 
      weekCheckIns.reduce((sum, checkIn) => sum + checkIn.energy, 0) / weekCheckIns.length : 0,
    themes: extractWeeklyThemes(weekEntries)
  };
}

function analyzeMonthData(month: any, checkIns: any[]) {
  const monthEntries = month.entries;
  const monthCheckIns = checkIns.filter(checkIn => {
    const checkInDate = new Date(checkIn.createdAt);
    const monthEnd = new Date(month.monthStart.getFullYear(), month.monthStart.getMonth() + 1, 0);
    return checkInDate >= month.monthStart && checkInDate <= monthEnd;
  });

  return {
    entryCount: monthEntries.length,
    totalWords: monthEntries.reduce((sum, entry) => 
      sum + (entry.content?.length || entry.transcription?.length || 0), 0
    ),
    avgMood: monthCheckIns.length > 0 ? 
      monthCheckIns.reduce((sum, checkIn) => sum + getMoodScore(checkIn.mood), 0) / monthCheckIns.length : 0,
    avgEnergy: monthCheckIns.length > 0 ? 
      monthCheckIns.reduce((sum, checkIn) => sum + checkIn.energy, 0) / monthCheckIns.length : 0,
    themes: extractMonthlyThemes(monthEntries)
  };
}

function analyzeDayData(entry: any, checkIns: any[]) {
  const entryDate = new Date(entry.createdAt);
  const dayCheckIns = checkIns.filter(checkIn => 
    new Date(checkIn.createdAt).toDateString() === entryDate.toDateString()
  );

  return {
    entryCount: 1,
    totalWords: entry.content?.length || entry.transcription?.length || 0,
    avgMood: dayCheckIns.length > 0 ? 
      dayCheckIns.reduce((sum, checkIn) => sum + getMoodScore(checkIn.mood), 0) / dayCheckIns.length : 0,
    avgEnergy: dayCheckIns.length > 0 ? 
      dayCheckIns.reduce((sum, checkIn) => sum + checkIn.energy, 0) / dayCheckIns.length : 0,
    themes: extractDailyThemes(entry)
  };
}

function generatePersonalitySnapshot(data: any) {
  return {
    extraversion: calculateExtraversionScore(data),
    neuroticism: calculateNeuroticismScore(data),
    openness: calculateOpennessScore(data),
    conscientiousness: calculateConscientiousnessScore(data),
    agreeableness: calculateAgreeablenessScore(data)
  };
}

function analyzeContentForTraits(content: string) {
  const lowerContent = content.toLowerCase();
  
  return {
    extraversion: calculateExtraversionFromContent(lowerContent),
    neuroticism: calculateNeuroticismFromContent(lowerContent),
    openness: calculateOpennessFromContent(lowerContent),
    conscientiousness: calculateConscientiousnessFromContent(lowerContent),
    agreeableness: calculateAgreeablenessFromContent(lowerContent)
  };
}

function calculateExtraversionFromContent(content: string): number {
  const socialWords = ['friend', 'party', 'social', 'meet', 'talk', 'people', 'group', 'team'];
  const socialCount = socialWords.filter(word => content.includes(word)).length;
  const isolationWords = ['alone', 'quiet', 'solitude', 'introvert', 'shy'];
  const isolationCount = isolationWords.filter(word => content.includes(word)).length;
  
  return Math.min(10, Math.max(1, 5 + (socialCount - isolationCount) * 0.5));
}

function calculateNeuroticismFromContent(content: string): number {
  const negativeWords = ['stress', 'anxiety', 'worry', 'fear', 'sad', 'angry', 'frustrated', 'overwhelmed'];
  const negativeCount = negativeWords.filter(word => content.includes(word)).length;
  const positiveWords = ['happy', 'calm', 'peaceful', 'relaxed', 'content', 'satisfied'];
  const positiveCount = positiveWords.filter(word => content.includes(word)).length;
  
  return Math.min(10, Math.max(1, 5 + (negativeCount - positiveCount) * 0.3));
}

function calculateOpennessFromContent(content: string): number {
  const openWords = ['explore', 'learn', 'new', 'creative', 'imagine', 'curious', 'adventure', 'experience'];
  const openCount = openWords.filter(word => content.includes(word)).length;
  const closedWords = ['routine', 'same', 'boring', 'predictable', 'traditional'];
  const closedCount = closedWords.filter(word => content.includes(word)).length;
  
  return Math.min(10, Math.max(1, 5 + (openCount - closedCount) * 0.4));
}

function calculateConscientiousnessFromContent(content: string): number {
  const organizedWords = ['plan', 'organize', 'goal', 'achieve', 'complete', 'responsible', 'diligent'];
  const organizedCount = organizedWords.filter(word => content.includes(word)).length;
  const disorganizedWords = ['procrastinate', 'messy', 'forget', 'late', 'chaos'];
  const disorganizedCount = disorganizedWords.filter(word => content.includes(word)).length;
  
  return Math.min(10, Math.max(1, 5 + (organizedCount - disorganizedCount) * 0.4));
}

function calculateAgreeablenessFromContent(content: string): number {
  const agreeableWords = ['help', 'kind', 'compassionate', 'understanding', 'forgive', 'support'];
  const agreeableCount = agreeableWords.filter(word => content.includes(word)).length;
  const disagreeableWords = ['conflict', 'argue', 'angry', 'hostile', 'critical', 'judge'];
  const disagreeableCount = disagreeableWords.filter(word => content.includes(word)).length;
  
  return Math.min(10, Math.max(1, 5 + (agreeableCount - disagreeableCount) * 0.4));
}

function calculateConfidence(contentLength: number): number {
  return Math.min(1, Math.max(0.1, contentLength / 1000));
}

function extractContext(content: string, trait: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const traitKeywords = getTraitKeywords(trait);
  
  const relevantSentences = sentences.filter(sentence => 
    traitKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  
  return relevantSentences.slice(0, 2).join(' ').substring(0, 200) + '...';
}

function getTraitKeywords(trait: string): string[] {
  const keywords: { [key: string]: string[] } = {
    extraversion: ['friend', 'social', 'party', 'people', 'talk', 'meet'],
    neuroticism: ['stress', 'anxiety', 'worry', 'fear', 'sad', 'angry'],
    openness: ['explore', 'learn', 'new', 'creative', 'imagine', 'curious'],
    conscientiousness: ['plan', 'goal', 'achieve', 'complete', 'responsible'],
    agreeableness: ['help', 'kind', 'compassionate', 'understanding', 'support']
  };
  
  return keywords[trait] || [];
}

function calculateTrend(scores: number[]): string {
  if (scores.length < 2) return 'stable';
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 0.5) return 'increasing';
  if (difference < -0.5) return 'decreasing';
  return 'stable';
}

function detectLifeEvents(content: string) {
  const events = [];
  const lowerContent = content.toLowerCase();
  
  // Career events
  if (lowerContent.includes('job') || lowerContent.includes('work') || lowerContent.includes('career')) {
    events.push({
      type: 'career',
      impact: 0.6,
      description: 'Career-related event'
    });
  }
  
  // Relationship events
  if (lowerContent.includes('relationship') || lowerContent.includes('marriage') || lowerContent.includes('breakup')) {
    events.push({
      type: 'relationship',
      impact: 0.8,
      description: 'Relationship event'
    });
  }
  
  // Health events
  if (lowerContent.includes('health') || lowerContent.includes('illness') || lowerContent.includes('recovery')) {
    events.push({
      type: 'health',
      impact: 0.7,
      description: 'Health-related event'
    });
  }
  
  // Personal growth events
  if (lowerContent.includes('learn') || lowerContent.includes('grow') || lowerContent.includes('change')) {
    events.push({
      type: 'personal_growth',
      impact: 0.5,
      description: 'Personal growth event'
    });
  }
  
  return events;
}

function estimatePersonalityImpact(event: any, content: string): any {
  const impact = {
    extraversion: 0,
    neuroticism: 0,
    openness: 0,
    conscientiousness: 0,
    agreeableness: 0
  };
  
  // Estimate impact based on event type and content sentiment
  const sentiment = analyzeSentiment(content);
  
  switch (event.type) {
    case 'career':
      impact.conscientiousness += event.impact * 0.3;
      impact.neuroticism += sentiment === 'negative' ? event.impact * 0.2 : -event.impact * 0.1;
      break;
    case 'relationship':
      impact.agreeableness += event.impact * 0.2;
      impact.extraversion += event.impact * 0.2;
      impact.neuroticism += sentiment === 'negative' ? event.impact * 0.3 : -event.impact * 0.2;
      break;
    case 'health':
      impact.neuroticism += sentiment === 'negative' ? event.impact * 0.4 : -event.impact * 0.2;
      impact.conscientiousness += event.impact * 0.2;
      break;
    case 'personal_growth':
      impact.openness += event.impact * 0.3;
      impact.conscientiousness += event.impact * 0.2;
      break;
  }
  
  return impact;
}

function analyzeSentiment(content: string): string {
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'enjoy'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'stress', 'anxiety'];
  
  const positiveCount = positiveWords.filter(word => content.toLowerCase().includes(word)).length;
  const negativeCount = negativeWords.filter(word => content.toLowerCase().includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    '😊': 9, '🙂': 7, '😐': 5, '😞': 3, '😢': 1,
    '😡': 2, '😴': 4, '🤔': 6, '😌': 8, '😤': 4
  };
  return moodScores[mood] || 5;
}

function extractWeeklyThemes(entries: any[]): string[] {
  const themes = new Set<string>();
  
  entries.forEach(entry => {
    const content = entry.content || entry.transcription || '';
    const entryThemes = extractDailyThemes(entry);
    entryThemes.forEach(theme => themes.add(theme));
  });
  
  return Array.from(themes);
}

function extractMonthlyThemes(entries: any[]): string[] {
  const themes = new Set<string>();
  
  entries.forEach(entry => {
    const content = entry.content || entry.transcription || '';
    const entryThemes = extractDailyThemes(entry);
    entryThemes.forEach(theme => themes.add(theme));
  });
  
  return Array.from(themes);
}

function extractDailyThemes(entry: any): string[] {
  const content = entry.content || entry.transcription || '';
  const themes = [];
  
  if (content.toLowerCase().includes('work') || content.toLowerCase().includes('job')) {
    themes.push('work');
  }
  if (content.toLowerCase().includes('family') || content.toLowerCase().includes('friend')) {
    themes.push('relationships');
  }
  if (content.toLowerCase().includes('health') || content.toLowerCase().includes('exercise')) {
    themes.push('health');
  }
  if (content.toLowerCase().includes('money') || content.toLowerCase().includes('finance')) {
    themes.push('finance');
  }
  
  return themes;
}

function calculateExtraversionScore(data: any): number {
  return 5 + (data.avgMood - 5) * 0.2 + (data.entryCount > 3 ? 0.5 : 0);
}

function calculateNeuroticismScore(data: any): number {
  return 5 + (5 - data.avgMood) * 0.3 + (data.avgEnergy < 5 ? 0.3 : 0);
}

function calculateOpennessScore(data: any): number {
  return 5 + (data.themes.length > 2 ? 0.5 : 0) + (data.totalWords > 1000 ? 0.3 : 0);
}

function calculateConscientiousnessScore(data: any): number {
  return 5 + (data.entryCount > 2 ? 0.4 : 0) + (data.totalWords > 500 ? 0.3 : 0);
}

function calculateAgreeablenessScore(data: any): number {
  return 5 + (data.avgMood > 6 ? 0.3 : 0) + (data.themes.includes('relationships') ? 0.4 : 0);
}

function analyzeTraitStability(traitEvolution: any) {
  const stability = {};
  
  Object.entries(traitEvolution).forEach(([trait, data]) => {
    const scores = data.map((d: any) => d.score);
    stability[trait] = {
      variance: calculateVariance(scores),
      mean: scores.reduce((a, b) => a + b, 0) / scores.length,
      range: Math.max(...scores) - Math.min(...scores)
    };
  });
  
  return stability;
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

function analyzeGrowthPatterns(timeline: any[]) {
  let positiveGrowth = 0;
  let negativeGrowth = 0;
  
  for (let i = 1; i < timeline.length; i++) {
    const current = timeline[i].personalitySnapshot;
    const previous = timeline[i - 1].personalitySnapshot;
    
    const currentAvg = Object.values(current).reduce((a: any, b: any) => a + b, 0) / 5;
    const previousAvg = Object.values(previous).reduce((a: any, b: any) => a + b, 0) / 5;
    
    if (currentAvg > previousAvg) positiveGrowth++;
    else if (currentAvg < previousAvg) negativeGrowth++;
  }
  
  return { positiveGrowth, negativeGrowth };
}

function calculateTraitAverages(traitEvolution: any) {
  const averages = {};
  
  Object.entries(traitEvolution).forEach(([trait, data]) => {
    const scores = data.map((d: any) => d.score);
    averages[trait] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });
  
  return averages;
}

function getIdealTraitProfile(soulMatrix: any) {
  // This would be based on the user's SoulMatrix analysis
  // For now, return balanced ideal scores
  return {
    extraversion: 7,
    neuroticism: 3,
    openness: 8,
    conscientiousness: 7,
    agreeableness: 8
  };
}

function generateGrowthSuggestions(trait: string, gap: number) {
  const suggestions = {
    extraversion: [
      'Try joining a social group or club',
      'Practice initiating conversations',
      'Attend social events regularly'
    ],
    neuroticism: [
      'Practice mindfulness and meditation',
      'Develop stress management techniques',
      'Consider therapy or counseling'
    ],
    openness: [
      'Try new hobbies or activities',
      'Read diverse books and articles',
      'Travel to new places'
    ],
    conscientiousness: [
      'Set clear goals and deadlines',
      'Create daily routines and schedules',
      'Practice time management skills'
    ],
    agreeableness: [
      'Practice active listening',
      'Show empathy in conversations',
      'Volunteer or help others'
    ]
  };
  
  return suggestions[trait as keyof typeof suggestions] || [];
}

function calculateGrowthRate(firstSnapshot: any, lastSnapshot: any) {
  const firstAvg = Object.values(firstSnapshot).reduce((a: any, b: any) => a + b, 0) / 5;
  const lastAvg = Object.values(lastSnapshot).reduce((a: any, b: any) => a + b, 0) / 5;
  
  return (lastAvg - firstAvg) / 10; // Normalize to 0-1 range
}

function calculateAdaptationScore(lifeEvents: any[], traitEvolution: any) {
  if (lifeEvents.length === 0) return 0;
  
  const significantEvents = lifeEvents.filter(e => e.impact > 0.5);
  const adaptationResponses = significantEvents.length;
  
  return Math.min(1, adaptationResponses / 10); // Normalize to 0-1 range
} 
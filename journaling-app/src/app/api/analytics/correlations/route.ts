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
    const period = searchParams.get('period') || '30'; // days
    const analysisType = searchParams.get('type') || 'all'; // mood, energy, sleep, content

    const db = getDatabase();
    
    // Get data for the specified period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const journalEntries = db.getJournalEntriesByUserId(session.user.id, 1000, 0);
    const checkIns = db.getCheckInsByUserId(session.user.id, 1000, 0);
    const analysisResults = [];

    // Transform check-ins to camelCase for consistency
    const transformedCheckIns = checkIns.map((checkIn: any) => ({
      id: checkIn.id,
      mood: checkIn.mood,
      energy: checkIn.energy,
      sleepHours: checkIn.sleep_hours,
      sleepMinutes: checkIn.sleep_minutes,
      note: checkIn.note,
      createdAt: checkIn.created_at
    }));

    // Filter data by date range
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.createdAt) >= startDate && new Date(entry.createdAt) <= endDate
    );
    
    const filteredCheckIns = transformedCheckIns.filter(checkIn => 
      new Date(checkIn.createdAt) >= startDate && new Date(checkIn.createdAt) <= endDate
    );

    // Generate correlation analysis
    const correlations = await generateCorrelationAnalysis({
      journalEntries: filteredEntries,
      checkIns: filteredCheckIns,
      analysisType
    });

    return NextResponse.json(correlations);
  } catch (error) {
    console.error('Error generating correlation analysis:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateCorrelationAnalysis(data: {
  journalEntries: any[];
  checkIns: any[];
  analysisType: string;
}) {
  const analysis = {
    moodCorrelations: [] as any[],
    energyCorrelations: [] as any[],
    sleepCorrelations: [] as any[],
    contentPatterns: [] as any[],
    trends: [] as any[],
    insights: [] as any[]
  };

  if (data.analysisType === 'all' || data.analysisType === 'mood') {
    analysis.moodCorrelations = analyzeMoodCorrelations(data);
  }

  if (data.analysisType === 'all' || data.analysisType === 'energy') {
    analysis.energyCorrelations = analyzeEnergyCorrelations(data);
  }

  if (data.analysisType === 'all' || data.analysisType === 'sleep') {
    analysis.sleepCorrelations = analyzeSleepCorrelations(data);
  }

  if (data.analysisType === 'all' || data.analysisType === 'content') {
    analysis.contentPatterns = analyzeContentPatterns(data);
  }

  analysis.trends = analyzeTrends(data);
  analysis.insights = generateInsights(analysis);

  return analysis;
}

function analyzeMoodCorrelations(data: { journalEntries: any[]; checkIns: any[] }) {
  const correlations = [];
  
  // Group check-ins by date and calculate average mood
  const moodByDate = new Map();
  data.checkIns.forEach(checkIn => {
    const date = new Date(checkIn.createdAt).toDateString();
    if (!moodByDate.has(date)) {
      moodByDate.set(date, { total: 0, count: 0, moods: [] });
    }
    const moodScore = getMoodScore(checkIn.mood);
    moodByDate.get(date).total += moodScore;
    moodByDate.get(date).count += 1;
    moodByDate.get(date).moods.push(checkIn.mood);
  });

  // Calculate average mood per day
  const dailyMoods = Array.from(moodByDate.entries()).map(([date, data]: [string, any]) => ({
    date,
    averageMood: data.total / data.count,
    moodCount: data.count,
    dominantMood: getDominantMood(data.moods)
  }));

  // Find days with journal entries and correlate with mood
  data.journalEntries.forEach(entry => {
    const entryDate = new Date(entry.createdAt).toDateString();
    const dayMood = dailyMoods.find(mood => mood.date === entryDate);
    
    if (dayMood) {
      const entryLength = entry.content?.length || entry.transcription?.length || 0;
      const hasAnalysis = entry.processingStatus === 'analyzed' || entry.processingStatus === 'completed';
      
      correlations.push({
        date: entryDate,
        mood: dayMood.averageMood,
        dominantMood: dayMood.dominantMood,
        entryLength,
        hasAnalysis,
        correlation: {
          highMoodLongEntries: dayMood.averageMood > 7 && entryLength > 500,
          lowMoodShortEntries: dayMood.averageMood < 4 && entryLength < 200,
          moodWritingPattern: getMoodWritingPattern(dayMood.averageMood, entryLength)
        }
      });
    }
  });

  return correlations;
}

function analyzeEnergyCorrelations(data: { journalEntries: any[]; checkIns: any[] }) {
  const correlations = [];
  
  // Group check-ins by date and calculate average energy
  const energyByDate = new Map();
  data.checkIns.forEach(checkIn => {
    const date = new Date(checkIn.createdAt).toDateString();
    if (!energyByDate.has(date)) {
      energyByDate.set(date, { total: 0, count: 0, energies: [] });
    }
    energyByDate.get(date).total += checkIn.energy;
    energyByDate.get(date).count += 1;
    energyByDate.get(date).energies.push(checkIn.energy);
  });

  // Calculate average energy per day
  const dailyEnergies = Array.from(energyByDate.entries()).map(([date, data]: [string, any]) => ({
    date,
    averageEnergy: data.total / data.count,
    energyCount: data.count,
    energyRange: { min: Math.min(...data.energies), max: Math.max(...data.energies) }
  }));

  // Correlate energy with journal activity
  data.journalEntries.forEach(entry => {
    const entryDate = new Date(entry.createdAt).toDateString();
    const dayEnergy = dailyEnergies.find(energy => energy.date === entryDate);
    
    if (dayEnergy) {
      const entryLength = entry.content?.length || entry.transcription?.length || 0;
      const processingType = entry.processingType;
      
      correlations.push({
        date: entryDate,
        energy: dayEnergy.averageEnergy,
        energyRange: dayEnergy.energyRange,
        entryLength,
        processingType,
        correlation: {
          highEnergyFullAnalysis: dayEnergy.averageEnergy > 7 && processingType === 'full-analysis',
          lowEnergyBasicProcessing: dayEnergy.averageEnergy < 4 && processingType === 'transcribe-only',
          energyWritingPattern: getEnergyWritingPattern(dayEnergy.averageEnergy, entryLength)
        }
      });
    }
  });

  return correlations;
}

function analyzeSleepCorrelations(data: { journalEntries: any[]; checkIns: any[] }) {
  const correlations = [];
  
  // Group check-ins by date and calculate sleep metrics
  const sleepByDate = new Map();
  data.checkIns.forEach(checkIn => {
    const date = new Date(checkIn.createdAt).toDateString();
    if (!sleepByDate.has(date)) {
      sleepByDate.set(date, { totalHours: 0, count: 0, sleepHours: [] });
    }
    const totalSleepHours = checkIn.sleepHours + (checkIn.sleepMinutes / 60);
    sleepByDate.get(date).totalHours += totalSleepHours;
    sleepByDate.get(date).count += 1;
    sleepByDate.get(date).sleepHours.push(totalSleepHours);
  });

  // Calculate average sleep per day
  const dailySleep = Array.from(sleepByDate.entries()).map(([date, data]: [string, any]) => ({
    date,
    averageSleep: data.totalHours / data.count,
    sleepCount: data.count,
    sleepQuality: getSleepQuality(data.totalHours / data.count)
  }));

  // Correlate sleep with next day's journal activity
  data.journalEntries.forEach(entry => {
    const entryDate = new Date(entry.createdAt).toDateString();
    const previousDay = new Date(entry.createdAt);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayString = previousDay.toDateString();
    
    const daySleep = dailySleep.find(sleep => sleep.date === previousDayString);
    
    if (daySleep) {
      const entryLength = entry.content?.length || entry.transcription?.length || 0;
      const entryTime = new Date(entry.createdAt).getHours();
      
      correlations.push({
        date: entryDate,
        previousDaySleep: daySleep.averageSleep,
        sleepQuality: daySleep.sleepQuality,
        entryLength,
        entryTime,
        correlation: {
          goodSleepLongEntries: daySleep.averageSleep >= 7 && entryLength > 400,
          poorSleepShortEntries: daySleep.averageSleep < 6 && entryLength < 200,
          sleepWritingPattern: getSleepWritingPattern(daySleep.averageSleep, entryLength, entryTime)
        }
      });
    }
  });

  return correlations;
}

function analyzeContentPatterns(data: { journalEntries: any[]; checkIns: any[] }) {
  const patterns = [];
  
  // Analyze content themes and patterns
  data.journalEntries.forEach(entry => {
    const content = entry.content || entry.transcription || '';
    const entryDate = new Date(entry.createdAt).toDateString();
    
    // Find check-ins for the same day
    const dayCheckIns = data.checkIns.filter(checkIn => 
      new Date(checkIn.createdAt).toDateString() === entryDate
    );
    
    if (dayCheckIns.length > 0) {
      const avgMood = dayCheckIns.reduce((sum, checkIn) => sum + getMoodScore(checkIn.mood), 0) / dayCheckIns.length;
      const avgEnergy = dayCheckIns.reduce((sum, checkIn) => sum + checkIn.energy, 0) / dayCheckIns.length;
      
      patterns.push({
        date: entryDate,
        contentLength: content.length,
        wordCount: content.split(' ').length,
        sentiment: analyzeContentSentiment(content),
        themes: extractContentThemes(content),
        mood: avgMood,
        energy: avgEnergy,
        patterns: {
          positiveContent: content.toLowerCase().includes('happy') || content.toLowerCase().includes('good') || content.toLowerCase().includes('great'),
          negativeContent: content.toLowerCase().includes('sad') || content.toLowerCase().includes('bad') || content.toLowerCase().includes('stress'),
          workContent: content.toLowerCase().includes('work') || content.toLowerCase().includes('job') || content.toLowerCase().includes('project'),
          personalContent: content.toLowerCase().includes('family') || content.toLowerCase().includes('friend') || content.toLowerCase().includes('relationship')
        }
      });
    }
  });

  return patterns;
}

function analyzeTrends(data: { journalEntries: any[]; checkIns: any[] }) {
  const trends = [];
  
  // Weekly trends
  const weeklyData = groupDataByWeek(data);
  
  weeklyData.forEach(week => {
    trends.push({
      period: week.week,
      type: 'weekly',
      metrics: {
        averageMood: week.averageMood,
        averageEnergy: week.averageEnergy,
        averageSleep: week.averageSleep,
        journalFrequency: week.journalCount,
        averageEntryLength: week.averageEntryLength,
        trend: getTrendDirection(week)
      }
    });
  });

  return trends;
}

function generateInsights(analysis: any) {
  const insights = [];
  
  // Mood insights
  const highMoodDays = analysis.moodCorrelations.filter(c => c.mood > 7).length;
  const lowMoodDays = analysis.moodCorrelations.filter(c => c.mood < 4).length;
  
  if (highMoodDays > lowMoodDays) {
    insights.push({
      type: 'mood_trend',
      title: 'Positive Mood Trend',
      message: `You've had ${highMoodDays} high-mood days vs ${lowMoodDays} low-mood days. Your overall mood trend is positive.`,
      priority: 'low'
    });
  } else if (lowMoodDays > highMoodDays) {
    insights.push({
      type: 'mood_trend',
      title: 'Mood Improvement Opportunity',
      message: `You've had ${lowMoodDays} low-mood days vs ${highMoodDays} high-mood days. Consider activities that boost your mood.`,
      priority: 'high'
    });
  }

  // Energy insights
  const highEnergyEntries = analysis.energyCorrelations.filter(c => c.energy > 7).length;
  const lowEnergyEntries = analysis.energyCorrelations.filter(c => c.energy < 4).length;
  
  if (highEnergyEntries > lowEnergyEntries) {
    insights.push({
      type: 'energy_trend',
      title: 'Good Energy Levels',
      message: `You tend to journal more when your energy is high (${highEnergyEntries} vs ${lowEnergyEntries} low-energy entries).`,
      priority: 'low'
    });
  }

  // Sleep insights
  const goodSleepDays = analysis.sleepCorrelations.filter(c => c.previousDaySleep >= 7).length;
  const poorSleepDays = analysis.sleepCorrelations.filter(c => c.previousDaySleep < 6).length;
  
  if (poorSleepDays > goodSleepDays) {
    insights.push({
      type: 'sleep_trend',
      title: 'Sleep Quality Impact',
      message: `Poor sleep (${poorSleepDays} days) seems to affect your journaling more than good sleep (${goodSleepDays} days).`,
      priority: 'medium'
    });
  }

  return insights;
}

// Helper functions
function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    '😊': 9, '🙂': 7, '😐': 5, '😞': 3, '😢': 1,
    '😡': 2, '😴': 4, '🤔': 6, '😌': 8, '😤': 4
  };
  return moodScores[mood] || 5;
}

function getDominantMood(moods: string[]): string {
  const moodCounts = moods.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  return Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '😐';
}

function getMoodWritingPattern(mood: number, entryLength: number): string {
  if (mood > 7 && entryLength > 500) return 'high_mood_long_writing';
  if (mood < 4 && entryLength < 200) return 'low_mood_short_writing';
  if (mood > 7 && entryLength < 200) return 'high_mood_concise';
  if (mood < 4 && entryLength > 500) return 'low_mood_detailed';
  return 'balanced';
}

function getEnergyWritingPattern(energy: number, entryLength: number): string {
  if (energy > 7 && entryLength > 500) return 'high_energy_detailed';
  if (energy < 4 && entryLength < 200) return 'low_energy_brief';
  if (energy > 7 && entryLength < 200) return 'high_energy_focused';
  if (energy < 4 && entryLength > 500) return 'low_energy_rambling';
  return 'balanced';
}

function getSleepQuality(sleepHours: number): string {
  if (sleepHours >= 8) return 'excellent';
  if (sleepHours >= 7) return 'good';
  if (sleepHours >= 6) return 'fair';
  return 'poor';
}

function getSleepWritingPattern(sleep: number, entryLength: number, entryTime: number): string {
  if (sleep >= 7 && entryLength > 400) return 'well_rested_detailed';
  if (sleep < 6 && entryLength < 200) return 'tired_brief';
  if (sleep >= 7 && entryTime < 12) return 'well_rested_morning';
  if (sleep < 6 && entryTime > 22) return 'tired_late_night';
  return 'balanced';
}

function analyzeContentSentiment(content: string): string {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'enjoy'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'stress', 'anxiety', 'worried'];
  
  const positiveCount = positiveWords.filter(word => content.toLowerCase().includes(word)).length;
  const negativeCount = negativeWords.filter(word => content.toLowerCase().includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function extractContentThemes(content: string): string[] {
  const themes = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('project')) {
    themes.push('work');
  }
  if (lowerContent.includes('family') || lowerContent.includes('friend') || lowerContent.includes('relationship')) {
    themes.push('relationships');
  }
  if (lowerContent.includes('health') || lowerContent.includes('exercise') || lowerContent.includes('diet')) {
    themes.push('health');
  }
  if (lowerContent.includes('money') || lowerContent.includes('finance') || lowerContent.includes('budget')) {
    themes.push('finance');
  }
  
  return themes;
}

function groupDataByWeek(data: { journalEntries: any[]; checkIns: any[] }) {
  const weeklyData = new Map();
  
  // Group check-ins by week
  data.checkIns.forEach(checkIn => {
    const date = new Date(checkIn.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toDateString();
    
    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, {
        week: weekKey,
        moods: [],
        energies: [],
        sleepHours: [],
        journalCount: 0,
        entryLengths: []
      });
    }
    
    const weekData = weeklyData.get(weekKey);
    weekData.moods.push(getMoodScore(checkIn.mood));
    weekData.energies.push(checkIn.energy);
    weekData.sleepHours.push(checkIn.sleepHours + (checkIn.sleepMinutes / 60));
  });
  
  // Group journal entries by week
  data.journalEntries.forEach(entry => {
    const date = new Date(entry.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toDateString();
    
    if (weeklyData.has(weekKey)) {
      const weekData = weeklyData.get(weekKey);
      weekData.journalCount += 1;
      weekData.entryLengths.push(entry.content?.length || entry.transcription?.length || 0);
    }
  });
  
  // Calculate averages
  return Array.from(weeklyData.values()).map(week => ({
    week: week.week,
    averageMood: week.moods.length > 0 ? week.moods.reduce((a, b) => a + b, 0) / week.moods.length : 0,
    averageEnergy: week.energies.length > 0 ? week.energies.reduce((a, b) => a + b, 0) / week.energies.length : 0,
    averageSleep: week.sleepHours.length > 0 ? week.sleepHours.reduce((a, b) => a + b, 0) / week.sleepHours.length : 0,
    journalCount: week.journalCount,
    averageEntryLength: week.entryLengths.length > 0 ? week.entryLengths.reduce((a, b) => a + b, 0) / week.entryLengths.length : 0
  }));
}

function getTrendDirection(week: any): string {
  // This would be calculated based on previous weeks' data
  // For now, return a placeholder
  return 'stable';
} 
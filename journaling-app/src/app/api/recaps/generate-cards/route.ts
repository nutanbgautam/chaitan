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

    const db = getDatabase();
    const userId = session.user.id;

    // Get user data for the last week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const journalEntries = db.getJournalEntriesByUserId(userId, 1000, 0);
    const checkIns = db.getCheckInsByUserId(userId, 1000, 0);
    const people = db.getPeopleByUserId(userId);
    const financeEntries = db.getFinanceEntriesByUserId(userId, 1000, 0);
    const tasks = db.getTasksByUserId(userId, 1000, 0);
    const goals = db.getGoalsByUserId(userId, 1000, 0);

    // Filter data for the last week
    const filteredEntries = journalEntries.filter(entry => 
      new Date(entry.createdAt) >= startDate && new Date(entry.createdAt) <= endDate
    );
    
    const filteredCheckIns = checkIns.filter(checkIn => 
      new Date(checkIn.createdAt) >= startDate && new Date(checkIn.createdAt) <= endDate
    );

    const filteredFinance = financeEntries.filter(entry => 
      new Date(entry.date) >= startDate && new Date(entry.date) <= endDate
    );

    const filteredTasks = tasks.filter(task => 
      new Date(task.createdAt) >= startDate && new Date(task.createdAt) <= endDate
    );

    const cards = [];

    // Generate People Card
    const peopleCard = generatePeopleCard(people, filteredEntries, startDate, endDate);
    if (peopleCard) cards.push(peopleCard);

    // Generate Mood Card
    const moodCard = generateMoodCard(filteredCheckIns, startDate, endDate);
    if (moodCard) cards.push(moodCard);

    // Generate Places Card
    const placesCard = generatePlacesCard(filteredEntries, startDate, endDate);
    if (placesCard) cards.push(placesCard);

    // Generate Growth Card
    const growthCard = generateGrowthCard(filteredEntries, filteredCheckIns, startDate, endDate);
    if (growthCard) cards.push(growthCard);

    // Generate Goals Card
    const goalsCard = generateGoalsCard(goals, filteredTasks, startDate, endDate);
    if (goalsCard) cards.push(goalsCard);

    // Generate Finance Card
    const financeCard = generateFinanceCard(filteredFinance, startDate, endDate);
    if (financeCard) cards.push(financeCard);

    return NextResponse.json(cards);

  } catch (error) {
    console.error('Error generating recap cards:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for generating cards
function generatePeopleCard(people: any[], journalEntries: any[], startDate: Date, endDate: Date) {
  if (people.length === 0) return null;

  // Find most mentioned people
  const peopleMentions = people.map(person => {
    const mentions = journalEntries.filter(entry => 
      entry.content?.toLowerCase().includes(person.name.toLowerCase())
    ).length;
    return { ...person, mentions };
  }).filter(p => p.mentions > 0).sort((a, b) => b.mentions - a.mentions);

  // Find new people added this week
  const newPeople = people.filter(person => {
    const personCreated = new Date(person.createdAt);
    return personCreated >= startDate && personCreated <= endDate;
  });

  if (peopleMentions.length === 0 && newPeople.length === 0) return null;

  const mostMentioned = peopleMentions[0];
  const totalMentions = peopleMentions.reduce((sum, p) => sum + p.mentions, 0);

  return {
    id: 'people-card',
    category: 'people',
    title: mostMentioned ? `You talked about ${mostMentioned.name} the most` : 'Your social connections',
    subtitle: 'People & Relationships',
    content: generatePeopleContent(mostMentioned, newPeople, totalMentions, peopleMentions.length),
    insights: [
      newPeople.length > 0 ? `You added ${newPeople.length} new person${newPeople.length > 1 ? 's' : ''} to your network` : null,
      totalMentions > 0 ? `You mentioned ${totalMentions} people in your journal entries` : null,
      peopleMentions.length > 1 ? `You interacted with ${peopleMentions.length} different people this week` : null
    ].filter(Boolean),
    highlights: [
      mostMentioned ? `${mostMentioned.name} was mentioned ${mostMentioned.mentions} times` : null,
      newPeople.length > 0 ? `New connection: ${newPeople[0]?.name}` : null,
      peopleMentions.length > 0 ? `Most active day for social interactions: ${getMostActiveDay(journalEntries)}` : null
    ].filter(Boolean),
    data: { peopleMentions, newPeople, totalMentions }
  };
}

function generateMoodCard(checkIns: any[], startDate: Date, endDate: Date) {
  if (checkIns.length === 0) return null;

  const moodScores = checkIns.map(checkIn => ({
    ...checkIn,
    score: getMoodScore(checkIn.mood)
  }));

  const avgMood = moodScores.reduce((sum, checkIn) => sum + checkIn.score, 0) / moodScores.length;
  const bestMood = Math.max(...moodScores.map(c => c.score));
  const worstMood = Math.min(...moodScores.map(c => c.score));
  const bestDay = moodScores.find(c => c.score === bestMood);
  const worstDay = moodScores.find(c => c.score === worstMood);

  const moodTrend = calculateMoodTrend(moodScores.map(c => c.score));
  const dominantMood = getDominantMood(moodScores.map(c => c.mood));

  return {
    id: 'mood-card',
    category: 'mood',
    title: `Your mood was mostly ${dominantMood} this week`,
    subtitle: 'Emotional Journey',
    content: generateMoodContent(avgMood, dominantMood, bestDay, worstDay, moodTrend),
    insights: [
      `Your average mood was ${avgMood.toFixed(1)}/10 this week`,
      bestDay ? `You felt your best on ${new Date(bestDay.createdAt).toLocaleDateString()}` : null,
      worstDay ? `You had a challenging day on ${new Date(worstDay.createdAt).toLocaleDateString()}` : null,
      `You completed ${checkIns.length} mood check-ins`
    ].filter(Boolean),
    highlights: [
      `Best mood: ${bestMood}/10`,
      `Mood trend: ${moodTrend}`,
      `Most frequent mood: ${dominantMood}`
    ],
    data: { moodScores, avgMood, dominantMood, moodTrend }
  };
}

function generatePlacesCard(journalEntries: any[], startDate: Date, endDate: Date) {
  if (journalEntries.length === 0) return null;

  // Extract places from journal entries
  const places = extractPlacesFromEntries(journalEntries);
  
  if (places.length === 0) return null;

  const mostFrequentPlace = places[0];
  const totalPlaces = places.length;

  return {
    id: 'places-card',
    category: 'places',
    title: `You visited ${mostFrequentPlace.name} the most`,
    subtitle: 'Places & Activities',
    content: generatePlacesContent(mostFrequentPlace, places, totalPlaces),
    insights: [
      `You mentioned ${totalPlaces} different places this week`,
      `Your most frequent location was ${mostFrequentPlace.name} (${mostFrequentPlace.count} times)`,
      `You were most active on ${getMostActiveDay(journalEntries)}`
    ],
    highlights: [
      `Favorite place: ${mostFrequentPlace.name}`,
      `Total places visited: ${totalPlaces}`,
      `Most active day: ${getMostActiveDay(journalEntries)}`
    ],
    data: { places, mostFrequentPlace, totalPlaces }
  };
}

function generateGrowthCard(journalEntries: any[], checkIns: any[], startDate: Date, endDate: Date) {
  if (journalEntries.length === 0) return null;

  const learningMoments = findLearningMoments(journalEntries);
  const challengesOvercome = findChallengesOvercome(journalEntries);
  const growthKeywords = findGrowthKeywords(journalEntries);

  const totalGrowth = learningMoments.length + challengesOvercome.length + growthKeywords.length;

  if (totalGrowth === 0) return null;

  return {
    id: 'growth-card',
    category: 'growth',
    title: `You grew in ${totalGrowth} different ways this week`,
    subtitle: 'Personal Development',
    content: generateGrowthContent(learningMoments, challengesOvercome, growthKeywords),
    insights: [
      learningMoments.length > 0 ? `You had ${learningMoments.length} learning moments` : null,
      challengesOvercome.length > 0 ? `You overcame ${challengesOvercome.length} challenges` : null,
      growthKeywords.length > 0 ? `You used ${growthKeywords.length} growth-related words` : null
    ].filter(Boolean),
    highlights: [
      learningMoments.length > 0 ? `Learned: ${learningMoments[0]?.content?.substring(0, 50)}...` : null,
      challengesOvercome.length > 0 ? `Overcame: ${challengesOvercome[0]?.content?.substring(0, 50)}...` : null,
      `Growth mindset: ${calculateGrowthMindset(journalEntries)}`
    ].filter(Boolean),
    data: { learningMoments, challengesOvercome, growthKeywords, totalGrowth }
  };
}

function generateGoalsCard(goals: any[], tasks: any[], startDate: Date, endDate: Date) {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const totalGoals = goals.length;

  if (totalTasks === 0 && totalGoals === 0) return null;

  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return {
    id: 'goals-card',
    category: 'goals',
    title: `You completed ${completedTasks} tasks and ${completedGoals} goals`,
    subtitle: 'Achievements & Progress',
    content: generateGoalsContent(completedTasks, totalTasks, completedGoals, totalGoals, taskCompletionRate, goalCompletionRate),
    insights: [
      totalTasks > 0 ? `Task completion rate: ${taskCompletionRate.toFixed(1)}%` : null,
      totalGoals > 0 ? `Goal completion rate: ${goalCompletionRate.toFixed(1)}%` : null,
      `You made progress on ${totalTasks + totalGoals} items this week`
    ].filter(Boolean),
    highlights: [
      completedTasks > 0 ? `Completed ${completedTasks} tasks` : null,
      completedGoals > 0 ? `Achieved ${completedGoals} goals` : null,
      `Most productive day: ${getMostActiveDay(tasks)}`
    ].filter(Boolean),
    data: { completedTasks, totalTasks, completedGoals, totalGoals, taskCompletionRate, goalCompletionRate }
  };
}

function generateFinanceCard(financeEntries: any[], startDate: Date, endDate: Date) {
  if (financeEntries.length === 0) return null;

  const income = financeEntries.filter(entry => entry.category === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = financeEntries.filter(entry => entry.category === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const topExpense = financeEntries
    .filter(entry => entry.category === 'expense')
    .sort((a, b) => b.amount - a.amount)[0];

  return {
    id: 'finance-card',
    category: 'finance',
    title: savings >= 0 ? `You saved $${savings.toFixed(2)} this week` : `You spent $${Math.abs(savings).toFixed(2)} more than you earned`,
    subtitle: 'Financial Journey',
    content: generateFinanceContent(income, expenses, savings, savingsRate, topExpense),
    insights: [
      `Total income: $${income.toFixed(2)}`,
      `Total expenses: $${expenses.toFixed(2)}`,
      savingsRate > 0 ? `Savings rate: ${savingsRate.toFixed(1)}%` : null,
      `You tracked ${financeEntries.length} financial entries`
    ].filter(Boolean),
    highlights: [
      savings >= 0 ? `Saved $${savings.toFixed(2)}` : `Overspent by $${Math.abs(savings).toFixed(2)}`,
      topExpense ? `Biggest expense: ${topExpense.description} ($${topExpense.amount})` : null,
      `Financial tracking: ${financeEntries.length} entries`
    ].filter(Boolean),
    data: { income, expenses, savings, savingsRate, topExpense, totalEntries: financeEntries.length }
  };
}

// Content generation helper functions
function generatePeopleContent(mostMentioned: any, newPeople: any[], totalMentions: number, uniquePeople: number): string {
  let content = '';
  
  if (mostMentioned) {
    content += `This week, you talked about ${mostMentioned.name} the most in your journal entries. `;
  }
  
  if (newPeople.length > 0) {
    content += `You also added ${newPeople.length} new person${newPeople.length > 1 ? 's' : ''} to your network. `;
  }
  
  content += `In total, you mentioned ${totalMentions} people across ${uniquePeople} different connections. `;
  
  if (uniquePeople > 3) {
    content += `You're maintaining a diverse social network!`;
  } else if (uniquePeople > 0) {
    content += `You're building meaningful relationships.`;
  }
  
  return content;
}

function generateMoodContent(avgMood: number, dominantMood: string, bestDay: any, worstDay: any, trend: string): string {
  let content = '';
  
  if (avgMood >= 7) {
    content += `You had a great week emotionally! Your average mood was ${avgMood.toFixed(1)}/10. `;
  } else if (avgMood >= 5) {
    content += `You had a balanced week with an average mood of ${avgMood.toFixed(1)}/10. `;
  } else {
    content += `You had some challenging moments this week, with an average mood of ${avgMood.toFixed(1)}/10. `;
  }
  
  if (bestDay) {
    content += `Your best day was ${new Date(bestDay.createdAt).toLocaleDateString()} when you felt ${bestDay.mood}. `;
  }
  
  if (trend === 'improving') {
    content += `Your mood trended upward throughout the week!`;
  } else if (trend === 'declining') {
    content += `You faced some emotional challenges this week.`;
  } else {
    content += `Your mood remained relatively stable.`;
  }
  
  return content;
}

function generatePlacesContent(mostFrequentPlace: any, places: any[], totalPlaces: number): string {
  let content = '';
  
  content += `This week, you visited ${mostFrequentPlace.name} the most (${mostFrequentPlace.count} times). `;
  
  if (totalPlaces > 3) {
    content += `You were quite active, visiting ${totalPlaces} different places. `;
  } else if (totalPlaces > 1) {
    content += `You visited ${totalPlaces} different places this week. `;
  }
  
  if (mostFrequentPlace.count > 3) {
    content += `It seems like ${mostFrequentPlace.name} is becoming a regular part of your routine!`;
  } else {
    content += `You're exploring different places and activities.`;
  }
  
  return content;
}

function generateGrowthContent(learningMoments: any[], challengesOvercome: any[], growthKeywords: any[]): string {
  let content = '';
  
  if (learningMoments.length > 0) {
    content += `You had ${learningMoments.length} learning moment${learningMoments.length > 1 ? 's' : ''} this week. `;
  }
  
  if (challengesOvercome.length > 0) {
    content += `You overcame ${challengesOvercome.length} challenge${challengesOvercome.length > 1 ? 's' : ''}. `;
  }
  
  if (growthKeywords.length > 0) {
    content += `You used ${growthKeywords.length} growth-related words in your reflections. `;
  }
  
  const totalGrowth = learningMoments.length + challengesOvercome.length + growthKeywords.length;
  
  if (totalGrowth > 5) {
    content += `You're showing excellent personal development this week!`;
  } else if (totalGrowth > 2) {
    content += `You're making steady progress in your personal growth.`;
  } else {
    content += `Every small step counts towards your growth.`;
  }
  
  return content;
}

function generateGoalsContent(completedTasks: number, totalTasks: number, completedGoals: number, totalGoals: number, taskRate: number, goalRate: number): string {
  let content = '';
  
  if (completedTasks > 0) {
    content += `You completed ${completedTasks} out of ${totalTasks} tasks this week. `;
  }
  
  if (completedGoals > 0) {
    content += `You achieved ${completedGoals} out of ${totalGoals} goals. `;
  }
  
  if (taskRate >= 80) {
    content += `You had an excellent task completion rate of ${taskRate.toFixed(1)}%! `;
  } else if (taskRate >= 60) {
    content += `You had a good task completion rate of ${taskRate.toFixed(1)}%. `;
  } else if (totalTasks > 0) {
    content += `You completed ${taskRate.toFixed(1)}% of your tasks. `;
  }
  
  if (goalRate >= 80) {
    content += `You're making excellent progress on your goals!`;
  } else if (goalRate >= 60) {
    content += `You're making steady progress on your goals.`;
  } else if (totalGoals > 0) {
    content += `Keep working towards your goals!`;
  }
  
  return content;
}

function generateFinanceContent(income: number, expenses: number, savings: number, savingsRate: number, topExpense: any): string {
  let content = '';
  
  if (savings >= 0) {
    content += `Great job! You saved $${savings.toFixed(2)} this week. `;
  } else {
    content += `You spent $${Math.abs(savings).toFixed(2)} more than you earned this week. `;
  }
  
  if (income > 0) {
    content += `Your total income was $${income.toFixed(2)}. `;
  }
  
  if (expenses > 0) {
    content += `Your total expenses were $${expenses.toFixed(2)}. `;
  }
  
  if (savingsRate >= 20) {
    content += `You're maintaining an excellent savings rate of ${savingsRate.toFixed(1)}%!`;
  } else if (savingsRate >= 10) {
    content += `You're building good savings habits with a ${savingsRate.toFixed(1)}% savings rate.`;
  } else if (savingsRate > 0) {
    content += `You're starting to build your savings with a ${savingsRate.toFixed(1)}% rate.`;
  } else {
    content += `Consider reviewing your spending patterns.`;
  }
  
  return content;
}

// Utility functions
function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    'excited': 9, 'happy': 8, 'content': 7, 'calm': 6, 'neutral': 5,
    'tired': 4, 'stressed': 3, 'anxious': 2, 'sad': 1, 'angry': 0
  };
  return moodScores[mood.toLowerCase()] || 5;
}

function getDominantMood(moods: string[]): string {
  const moodCounts: { [key: string]: number } = {};
  moods.forEach(mood => {
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });
  return Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function calculateMoodTrend(moodScores: number[]): string {
  if (moodScores.length < 2) return 'stable';
  const firstHalf = moodScores.slice(0, Math.floor(moodScores.length / 2));
  const secondHalf = moodScores.slice(Math.floor(moodScores.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg * 1.1) return 'improving';
  if (secondAvg < firstAvg * 0.9) return 'declining';
  return 'stable';
}

function extractPlacesFromEntries(entries: any[]): any[] {
  const places: { [key: string]: number } = {};
  const placeKeywords = ['home', 'work', 'office', 'gym', 'store', 'restaurant', 'cafe', 'park', 'school', 'hospital'];
  
  entries.forEach(entry => {
    const content = entry.content?.toLowerCase() || '';
    placeKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        places[keyword] = (places[keyword] || 0) + 1;
      }
    });
  });
  
  return Object.entries(places)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function findLearningMoments(entries: any[]): any[] {
  const learningKeywords = ['learn', 'learned', 'discovered', 'realized', 'understood', 'figured out'];
  return entries.filter(entry => 
    learningKeywords.some(keyword => 
      entry.content?.toLowerCase().includes(keyword)
    )
  );
}

function findChallengesOvercome(entries: any[]): any[] {
  const challengeKeywords = ['challenge', 'overcame', 'difficult', 'struggled', 'managed', 'solved'];
  return entries.filter(entry => 
    challengeKeywords.some(keyword => 
      entry.content?.toLowerCase().includes(keyword)
    )
  );
}

function findGrowthKeywords(entries: any[]): any[] {
  const growthKeywords = ['grow', 'growth', 'improve', 'develop', 'progress', 'better'];
  return entries.filter(entry => 
    growthKeywords.some(keyword => 
      entry.content?.toLowerCase().includes(keyword)
    )
  );
}

function calculateGrowthMindset(entries: any[]): string {
  const growthKeywords = ['learn', 'grow', 'improve', 'develop', 'progress'];
  const growthMentions = entries.filter(entry => 
    growthKeywords.some(keyword => entry.content?.toLowerCase().includes(keyword))
  ).length;
  
  if (growthMentions > 5) return 'Strong';
  if (growthMentions > 2) return 'Moderate';
  return 'Developing';
}

function getMostActiveDay(items: any[]): string {
  if (items.length === 0) return 'No data';
  const dayCounts: { [key: string]: number } = {};
  items.forEach(item => {
    const date = new Date(item.createdAt).toDateString();
    dayCounts[date] = (dayCounts[date] || 0) + 1;
  });
  const mostActiveDate = Object.entries(dayCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return new Date(mostActiveDate).toLocaleDateString();
} 
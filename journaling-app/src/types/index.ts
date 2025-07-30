// Core Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  avatarUrl?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
  processingType: 'transcribe-only' | 'full-analysis';
}

// Journal Entry Types
export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  audioUrl?: string;
  transcription?: string;
  processingType: 'transcribe-only' | 'full-analysis';
  processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  analysis?: AnalysisResult;
  tags: string[];
  mood?: string;
  canBeAnalyzed: boolean;
  userConfirmed: {
    transcription: boolean;
    analysis: boolean;
  };
  processingHistory: ProcessingStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingStep {
  step: 'transcription' | 'analysis' | 'entity-extraction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
  retryCount: number;
}

export interface AnalysisResult {
  sentiment: SentimentAnalysis;
  people: PeopleMentioned[];
  finance: FinanceCues[];
  tasks: TasksMentioned[];
  locations: LocationData[];
  temporal: TemporalReferences[];
  lifeAreas: LifeAreaAnalysis[];
  insights: InsightsData;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
  intensity: number;
  moodIndicators: string[];
  emotionalTone: string;
}

export interface PeopleMentioned {
  id: string;
  name: string;
  relationship: string;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  interactionType: string;
  confidence: number;
  frequency: 'first_mention' | 'recurring' | 'frequent';
}

export interface FinanceCues {
  id: string;
  amount: number | null;
  currency: string;
  category: 'income' | 'expense' | 'investment' | 'debt';
  description: string;
  context: string;
  confidence: number;
  type: 'transaction' | 'decision' | 'plan' | 'reflection';
}

export interface TasksMentioned {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string | null;
  status: 'pending' | 'completed' | 'in-progress';
  category: string;
  confidence: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface LocationData {
  id: string;
  name: string;
  type: 'work' | 'home' | 'travel' | 'leisure' | 'other';
  context: string;
  confidence: number;
  significance: 'primary' | 'secondary' | 'passing_mention';
}

export interface TemporalReferences {
  id: string;
  date: string | null;
  time: string | null;
  duration: string | null;
  context: string;
  confidence: number;
  type: 'past' | 'present' | 'future' | 'recurring';
}

export interface LifeAreaAnalysis {
  area: string;
  relevance: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  insights: string;
  confidence: number;
  priorityAlignment: 'high' | 'medium' | 'low';
}

export interface InsightsData {
  themes: string[];
  patterns: string[];
  recommendations: string[];
  growthOpportunities: string[];
  actionItems: string[];
  reflectionPoints: string[];
}

// Quick Check In Types
export interface QuickCheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  mood: '😊' | '😐' | '😞' | '😡' | '😴' | '🤔' | '😌' | '😤';
  energy: number;
  movement: number;
  sleep: {
    hours: number;
    minutes: number;
  };
  note?: string;
  createdAt: Date;
}

// SoulMatrix Types
export interface SoulMatrix {
  id: string;
  userId: string;
  lastUpdated: Date;
  nextUpdate: Date;
  traits: BigFiveTraits;
  evolution: PersonalityEvolution[];
  confidence: number;
  analyzedEntries: string[];
}

export interface BigFiveTraits {
  openness: TraitScore;
  conscientiousness: TraitScore;
  extraversion: TraitScore;
  agreeableness: TraitScore;
  neuroticism: TraitScore;
}

export interface TraitScore {
  score: number;
  confidence: number;
  description: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PersonalityEvolution {
  date: Date;
  traits: BigFiveTraits;
  overallChange: string;
  keyInsights: string[];
  lifeEventsCorrelation: string[];
  personalityStability: 'high' | 'medium' | 'low';
}

// Voice Features Types
export interface VoiceFeatures {
  pitch: {
    mean: number;
    std: number;
    range: number;
  };
  tempo: {
    wordsPerMinute: number;
    speechRate: number;
  };
  volume: {
    mean: number;
    variance: number;
    dynamicRange: number;
  };
  pauses: {
    totalPauseTime: number;
    averagePauseLength: number;
    pauseFrequency: number;
  };
  emotionalIndicators: {
    stress: number;
    excitement: number;
    calmness: number;
    confidence: number;
  };
  quality: {
    clarity: number;
    consistency: number;
    fluency: number;
  };
}

// Wheel of Life Types
export interface WheelOfLife {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lifeAreas: LifeArea[];
  priorities: string[];
  isCompleted: boolean;
}

export interface LifeArea {
  id: string;
  name: string;
  description: string;
  currentScore: number;
  targetScore: number;
  color: string;
  icon: string;
  entries: string[];
  goals: Goal[];
  insights: Insight[];
  progressHistory: ProgressEntry[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  lifeAreaId: string;
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  source: 'ai' | 'user';
  date: Date;
  lifeAreaId: string;
}

export interface ProgressEntry {
  date: Date;
  score: number;
  notes?: string;
}

// People Management Types
export interface Person {
  id: string;
  userId: string;
  name: string;
  displayPicture?: string;
  pictures: string[];
  relationship: string;
  contactDetails: ContactDetail[];
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  frequency: number;
  lastMentioned: Date;
  journalMentions: JournalMention[];
  relationshipAnalysis: RelationshipAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactDetail {
  id: string;
  type: 'email' | 'phone' | 'address';
  value: string;
  label?: string;
  isPrimary: boolean;
}

export interface JournalMention {
  journalId: string;
  timestamp: Date;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  excerpt: string;
}

export interface RelationshipAnalysis {
  strength: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  trends: 'improving' | 'declining' | 'stable';
  insights: string[];
  recommendations: string[];
  lastUpdated: Date;
}

// Finance Types
export interface FinanceEntry {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: 'income' | 'expense' | 'investment' | 'debt';
  subcategory?: string;
  description: string;
  date: Date;
  recurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  notes?: string;
  createdAt: Date;
}

export interface FinancialSummary {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalInvestments: number;
  netWorth: number;
  categoryBreakdown: CategoryBreakdown[];
  trends: FinancialTrend[];
  insights: FinancialInsight[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface FinancialTrend {
  period: string;
  income: number;
  expenses: number;
  savings: number;
  netWorth: number;
}

export interface FinancialInsight {
  type: 'spending' | 'saving' | 'income' | 'investment';
  message: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

// Task Types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  startDate: Date;
  deadline?: Date;
  dependencies: string[];
  category: string;
  assignee?: string;
  remarks?: string;
  isCompleted: boolean;
  completedDate?: Date;
  googleCalendarId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Recap Types
export interface Recap {
  id: string;
  userId: string;
  type: 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  content: RecapContent;
  insights: RecapInsights;
  recommendations: RecapRecommendations;
  lifeAreaImprovements: LifeAreaImprovement[];
  metrics: RecapMetrics;
  generatedAt: Date;
  viewedAt?: Date;
}

export interface RecapContent {
  title: string;
  narrative: string;
  highlights: string[];
  challenges: string[];
  achievements: string[];
}

export interface RecapInsights {
  emotionalTrends: string;
  relationshipInsights: string;
  financialInsights: string;
  productivityInsights: string;
  personalGrowth: string;
}

export interface RecapRecommendations {
  immediateActions: string[];
  longTermGoals: string[];
  habitSuggestions: string[];
  lifeBalanceTips: string[];
}

export interface LifeAreaImprovement {
  area: string;
  currentStatus: string;
  suggestedActions: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface RecapMetrics {
  entriesCount: number;
  moodAverage: number;
  energyAverage: number;
  peopleInteracted: number;
  tasksCompleted: number;
  financialInsightsCount: number;
}

// Check In Trends Types
export interface CheckInTrends {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  moodTrend: MoodTrendData[];
  energyTrend: TrendData[];
  movementTrend: TrendData[];
  sleepTrend: SleepTrendData[];
  correlations: CorrelationData[];
}

export interface TrendData {
  date: Date;
  value: number;
  average: number;
}

export interface MoodTrendData {
  date: Date;
  mood: string;
  frequency: number;
}

export interface SleepTrendData {
  date: Date;
  totalMinutes: number;
  average: number;
}

export interface CorrelationData {
  type: 'mood-energy' | 'sleep-energy' | 'movement-mood' | 'journal-mood';
  strength: number;
  description: string;
}

// Default Life Areas
export const DEFAULT_LIFE_AREAS = [
  { id: 'career', name: 'Career & Work', description: 'Job satisfaction, professional growth', color: '#3B82F6', icon: '💼' },
  { id: 'finances', name: 'Finances', description: 'Financial security, money management', color: '#10B981', icon: '💰' },
  { id: 'health', name: 'Health & Fitness', description: 'Physical health, exercise, nutrition', color: '#EF4444', icon: '🏃‍♂️' },
  { id: 'relationships', name: 'Relationships', description: 'Family, friends, romantic relationships', color: '#F59E0B', icon: '❤️' },
  { id: 'personal-growth', name: 'Personal Growth', description: 'Learning, skills development', color: '#8B5CF6', icon: '📚' },
  { id: 'recreation', name: 'Recreation & Fun', description: 'Hobbies, entertainment, leisure', color: '#EC4899', icon: '🎮' },
  { id: 'spirituality', name: 'Spirituality', description: 'Faith, purpose, meaning', color: '#6366F1', icon: '🕊️' },
  { id: 'environment', name: 'Environment', description: 'Living space, surroundings', color: '#059669', icon: '🏠' }
];

// API Response Types
export interface OpenAIResponse {
  sentiment?: SentimentAnalysis;
  people?: PeopleMentioned[];
  finance?: FinanceCues[];
  tasks?: TasksMentioned[];
  locations?: LocationData[];
  temporal?: TemporalReferences[];
  lifeAreas?: LifeAreaAnalysis[];
  insights?: InsightsData;
}

export interface WheelOfLifeAssessment {
  assessment: {
    overallSatisfaction: number;
    lifeBalanceScore: number;
    areasOfStrength: string[];
    areasForImprovement: string[];
    priorityRecommendations: string[];
  };
  lifeAreas: {
    id: string;
    currentScore: number;
    targetScore: number;
    confidence: number;
    reasoning: string;
    keyInsights: string[];
    immediateGoals: string[];
    longTermVision: string;
  }[];
  recommendations: {
    focusAreas: string[];
    quickWins: string[];
    longTermStrategies: string[];
    balanceImprovements: string[];
  };
}

// Utility Types
export type TimeRange = {
  start: Date;
  end: Date;
};

export type ProcessingType = 'transcribe-only' | 'full-analysis';
export type EntryType = 'voice' | 'text' | 'check-in'; 
// OpenAI API Service with Individual Entity Extraction
import { 
  AnalysisResult, 
  SentimentAnalysis, 
  PeopleMentioned, 
  FinanceCues, 
  TasksMentioned, 
  LocationData, 
  TemporalReferences, 
  LifeAreaAnalysis, 
  InsightsData,
  SoulMatrix,
  WheelOfLifeAssessment,
  VoiceFeatures,
  QuickCheckIn,
  DEFAULT_LIFE_AREAS
} from '../types';
import { config } from './config';

// Hardcoded Prompts for Individual Entity Extraction
const SENTIMENT_ANALYSIS_PROMPT = `Analyze the sentiment and emotional content of this journal entry:

JOURNAL ENTRY:
{transcription}

VOICE FEATURES (if voice entry):
{voiceFeatures}

USER'S PERSONALITY PROFILE (SoulMatrix):
{soulMatrix}

TODAY'S CHECK-INS:
{checkIns}

ENTRY TIMESTAMP:
{timestamp}

Return ONLY sentiment analysis in this JSON format:
{
  "sentiment": {
    "overall": "positive|negative|neutral",
    "confidence": 0.0-1.0,
    "emotions": ["joy", "sadness", "anger", "fear", "surprise", "disgust"],
    "intensity": 1-10,
    "mood_indicators": ["string"],
    "emotional_tone": "string"
  }
}

Focus on emotional patterns, mood shifts, and sentiment accuracy.`;

const PEOPLE_EXTRACTION_PROMPT = `Extract all people mentioned in this journal entry:

JOURNAL ENTRY:
{transcription}

CONTEXT:
- User's personality: {soulMatrix}
- Entry timestamp: {timestamp}
- Today's check-ins: {checkIns}

Return ONLY people mentioned in this JSON format:
{
  "people": [
    {
      "name": "string",
      "relationship": "string",
      "context": "string",
      "sentiment": "positive|negative|neutral",
      "interactionType": "string",
      "confidence": 0.0-1.0,
      "frequency": "first_mention|recurring|frequent"
    }
  ]
}

Focus on accuracy. If no people are mentioned, return empty array.`;

const FINANCE_EXTRACTION_PROMPT = `Extract all financial information from this journal entry:

JOURNAL ENTRY:
{transcription}

Return ONLY financial data in this JSON format:
{
  "finance": [
    {
      "amount": "number|null",
      "currency": "string",
      "category": "income|expense|investment|debt",
      "description": "string",
      "context": "string",
      "confidence": 0.0-1.0,
      "type": "transaction|decision|plan|reflection"
    }
  ]
}

Focus on monetary amounts, financial decisions, expenses, income, investments, debts. If no financial data, return empty array.`;

const TASKS_EXTRACTION_PROMPT = `Extract all tasks, to-dos, and action items from this journal entry:

JOURNAL ENTRY:
{transcription}

Return ONLY tasks in this JSON format:
{
  "tasks": [
    {
      "description": "string",
      "priority": "high|medium|low",
      "deadline": "YYYY-MM-DD|null",
      "status": "pending|completed|in-progress",
      "category": "string",
      "confidence": 0.0-1.0,
      "complexity": "simple|moderate|complex"
    }
  ]
}

Focus on actionable items, deadlines, goals, and completed tasks. If no tasks mentioned, return empty array.`;

const LOCATION_EXTRACTION_PROMPT = `Extract all locations and places mentioned in this journal entry:

JOURNAL ENTRY:
{transcription}

Return ONLY locations in this JSON format:
{
  "locations": [
    {
      "name": "string",
      "type": "work|home|travel|leisure|other",
      "context": "string",
      "confidence": 0.0-1.0,
      "significance": "primary|secondary|passing_mention"
    }
  ]
}

Focus on physical places, travel destinations, work locations, home references. If no locations mentioned, return empty array.`;

const TEMPORAL_EXTRACTION_PROMPT = `Extract all date, time, and temporal references from this journal entry:

JOURNAL ENTRY:
{transcription}

ENTRY TIMESTAMP: {timestamp}

Return ONLY temporal data in this JSON format:
{
  "temporal": [
    {
      "date": "YYYY-MM-DD|null",
      "time": "HH:MM|null",
      "duration": "string|null",
      "context": "string",
      "confidence": 0.0-1.0,
      "type": "past|present|future|recurring"
    }
  ]
}

Focus on dates, times, durations, deadlines, past/future references. If no temporal data, return empty array.`;

const LIFE_AREAS_ANALYSIS_PROMPT = `Analyze which life areas are relevant to this journal entry:

JOURNAL ENTRY:
{transcription}

USER'S WHEEL OF LIFE PRIORITIES:
{wheelOfLifePriorities}

Return ONLY life areas analysis in this JSON format:
{
  "lifeAreas": [
    {
      "area": "career|relationships|health|finance|personal_growth|recreation|spirituality|environment",
      "relevance": 1-10,
      "sentiment": "positive|negative|neutral",
      "insights": "string",
      "confidence": 0.0-1.0,
      "priority_alignment": "high|medium|low"
    }
  ]
}

Focus on life area relevance and alignment with user's priorities.`;

const INSIGHTS_GENERATION_PROMPT = `Generate insights and recommendations based on this journal entry:

JOURNAL ENTRY:
{transcription}

EXTRACTED ENTITIES:
- People: {people}
- Finance: {finance}
- Tasks: {tasks}
- Locations: {locations}
- Temporal: {temporal}
- Life Areas: {lifeAreas}

USER'S PERSONALITY PROFILE (SoulMatrix):
{soulMatrix}

Return ONLY insights in this JSON format:
{
  "insights": {
    "themes": ["string"],
    "patterns": ["string"],
    "recommendations": ["string"],
    "growth_opportunities": ["string"],
    "action_items": ["string"],
    "reflection_points": ["string"]
  }
}

Focus on actionable insights and personal growth opportunities.`;

// SoulMatrix Analysis Prompt
const SOULMATRIX_ANALYSIS_PROMPT = `You are an AI personality analyst updating a user's Big Five personality profile based on their journal entries.

PREVIOUS PERSONALITY PROFILE:
{previousSoulMatrix}

NEW JOURNAL ENTRIES TO ANALYZE:
{newJournalEntries}

TOTAL ENTRIES ANALYZED: {totalEntries}

Please analyze the personality evolution and provide an updated Big Five profile in the following JSON format:

{
  "traits": {
    "openness": {
      "score": 0.0-1.0,
      "confidence": 0.0-1.0,
      "description": "string",
      "trend": "increasing|decreasing|stable"
    },
    "conscientiousness": {
      "score": 0.0-1.0,
      "confidence": 0.0-1.0,
      "description": "string",
      "trend": "increasing|decreasing|stable"
    },
    "extraversion": {
      "score": 0.0-1.0,
      "confidence": 0.0-1.0,
      "description": "string",
      "trend": "increasing|decreasing|stable"
    },
    "agreeableness": {
      "score": 0.0-1.0,
      "confidence": 0.0-1.0,
      "description": "string",
      "trend": "increasing|decreasing|stable"
    },
    "neuroticism": {
      "score": 0.0-1.0,
      "confidence": 0.0-1.0,
      "description": "string",
      "trend": "increasing|decreasing|stable"
    }
  },
  "evolution": {
    "overall_change": "string",
    "key_insights": ["string"],
    "life_events_correlation": ["string"],
    "personality_stability": "high|medium|low"
  },
  "confidence": 0.0-1.0,
  "analyzedEntries": ["entry_id_1", "entry_id_2", ...]
}

Consider the user's writing style, emotional patterns, social interactions, and life experiences when updating the personality profile.`;

// Wheel of Life Assessment Prompt
const WHEEL_OF_LIFE_ASSESSMENT_PROMPT = `You are an AI life coach conducting an initial Wheel of Life assessment for a new user.

USER'S PERSONALITY PROFILE (SoulMatrix):
{soulMatrix}

AVAILABLE LIFE AREAS:
{lifeAreas}

Please conduct a comprehensive Wheel of Life assessment and return the results in this JSON format:

{
  "assessment": {
    "overall_satisfaction": 1-10,
    "life_balance_score": 1-10,
    "areas_of_strength": ["area_id"],
    "areas_for_improvement": ["area_id"],
    "priority_recommendations": ["area_id"]
  },
  "life_areas": [
    {
      "id": "string",
      "current_score": 1-10,
      "target_score": 1-10,
      "confidence": 0.0-1.0,
      "reasoning": "string",
      "key_insights": ["string"],
      "immediate_goals": ["string"],
      "long_term_vision": "string"
    }
  ],
  "recommendations": {
    "focus_areas": ["area_id"],
    "quick_wins": ["string"],
    "long_term_strategies": ["string"],
    "balance_improvements": ["string"]
  }
}

Focus on creating a balanced, realistic assessment that encourages growth while being achievable.`;

// Recap Generation Prompt
const RECAP_GENERATION_PROMPT = `You are an AI life coach creating a personalized weekly/monthly recap for a user based on their journal entries and data.

RECAP PERIOD: {periodType} ({startDate} to {endDate})

JOURNAL ENTRIES:
{journalEntries}

CHECK-INS DATA:
{checkInsData}

PEOPLE MENTIONED:
{peopleData}

FINANCE DATA:
{financeData}

TASKS DATA:
{tasksData}

CURRENT PERSONALITY PROFILE:
{soulMatrix}

WHEEL OF LIFE PRIORITIES:
{wheelOfLifePriorities}

Please create an engaging, story-format recap in the following JSON format:

{
  "story": {
    "title": "string",
    "narrative": "string (engaging story format)",
    "highlights": ["string"],
    "challenges": ["string"],
    "achievements": ["string"]
  },
  "insights": {
    "emotional_trends": "string",
    "relationship_insights": "string",
    "financial_insights": "string",
    "productivity_insights": "string",
    "personal_growth": "string"
  },
  "recommendations": {
    "immediate_actions": ["string"],
    "long_term_goals": ["string"],
    "habit_suggestions": ["string"],
    "life_balance_tips": ["string"]
  },
  "life_area_improvements": [
    {
      "area": "career|relationships|health|finance|personal_growth|recreation|spirituality|environment",
      "current_status": "string",
      "suggested_actions": ["string"],
      "priority": "high|medium|low"
    }
  ],
  "metrics": {
    "entries_count": "number",
    "mood_average": "number",
    "energy_average": "number",
    "people_interacted": "number",
    "tasks_completed": "number",
    "financial_insights_count": "number"
  }
}

Make the recap engaging, practical, and actionable while maintaining a warm, encouraging tone. Focus on growth opportunities and celebrate achievements.`;

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = config.openai.apiKey;
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  private async callOpenAI(prompt: string, model: string = 'gpt-4o-mini') {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that analyzes journal entries and provides insights. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  // Individual Entity Extraction Methods
  async analyzeSentiment(
    transcription: string,
    voiceFeatures?: VoiceFeatures,
    soulMatrix?: SoulMatrix,
    checkIns?: QuickCheckIn[],
    timestamp?: Date
  ): Promise<SentimentAnalysis> {
    const prompt = SENTIMENT_ANALYSIS_PROMPT
      .replace('{transcription}', transcription)
      .replace('{voiceFeatures}', voiceFeatures ? JSON.stringify(voiceFeatures) : 'N/A')
      .replace('{soulMatrix}', soulMatrix ? JSON.stringify(soulMatrix) : 'N/A')
      .replace('{checkIns}', checkIns ? JSON.stringify(checkIns) : '[]')
      .replace('{timestamp}', timestamp ? timestamp.toISOString() : 'N/A');

    const result = await this.callOpenAI(prompt);
    return result.sentiment;
  }

  async extractPeople(
    transcription: string,
    soulMatrix?: SoulMatrix,
    checkIns?: QuickCheckIn[],
    timestamp?: Date
  ): Promise<PeopleMentioned[]> {
    const prompt = PEOPLE_EXTRACTION_PROMPT
      .replace('{transcription}', transcription)
      .replace('{soulMatrix}', soulMatrix ? JSON.stringify(soulMatrix) : 'N/A')
      .replace('{checkIns}', checkIns ? JSON.stringify(checkIns) : '[]')
      .replace('{timestamp}', timestamp ? timestamp.toISOString() : 'N/A');

    const result = await this.callOpenAI(prompt);
    return result.people || [];
  }

  async extractFinance(transcription: string): Promise<FinanceCues[]> {
    const prompt = FINANCE_EXTRACTION_PROMPT
      .replace('{transcription}', transcription);

    const result = await this.callOpenAI(prompt);
    return result.finance || [];
  }

  async extractTasks(transcription: string): Promise<TasksMentioned[]> {
    const prompt = TASKS_EXTRACTION_PROMPT
      .replace('{transcription}', transcription);

    const result = await this.callOpenAI(prompt);
    return result.tasks || [];
  }

  async extractLocations(transcription: string): Promise<LocationData[]> {
    const prompt = LOCATION_EXTRACTION_PROMPT
      .replace('{transcription}', transcription);

    const result = await this.callOpenAI(prompt);
    return result.locations || [];
  }

  async extractTemporal(
    transcription: string,
    timestamp?: Date
  ): Promise<TemporalReferences[]> {
    const prompt = TEMPORAL_EXTRACTION_PROMPT
      .replace('{transcription}', transcription)
      .replace('{timestamp}', timestamp ? timestamp.toISOString() : 'N/A');

    const result = await this.callOpenAI(prompt);
    return result.temporal || [];
  }

  async analyzeLifeAreas(
    transcription: string,
    wheelOfLifePriorities?: string[]
  ): Promise<LifeAreaAnalysis[]> {
    const prompt = LIFE_AREAS_ANALYSIS_PROMPT
      .replace('{transcription}', transcription)
      .replace('{wheelOfLifePriorities}', wheelOfLifePriorities ? JSON.stringify(wheelOfLifePriorities) : '[]');

    const result = await this.callOpenAI(prompt);
    return result.lifeAreas || [];
  }

  async generateInsights(
    transcription: string,
    extractedEntities: {
      people: PeopleMentioned[];
      finance: FinanceCues[];
      tasks: TasksMentioned[];
      locations: LocationData[];
      temporal: TemporalReferences[];
      lifeAreas: LifeAreaAnalysis[];
    },
    soulMatrix?: SoulMatrix
  ): Promise<InsightsData> {
    const prompt = INSIGHTS_GENERATION_PROMPT
      .replace('{transcription}', transcription)
      .replace('{people}', JSON.stringify(extractedEntities.people))
      .replace('{finance}', JSON.stringify(extractedEntities.finance))
      .replace('{tasks}', JSON.stringify(extractedEntities.tasks))
      .replace('{locations}', JSON.stringify(extractedEntities.locations))
      .replace('{temporal}', JSON.stringify(extractedEntities.temporal))
      .replace('{lifeAreas}', JSON.stringify(extractedEntities.lifeAreas))
      .replace('{soulMatrix}', soulMatrix ? JSON.stringify(soulMatrix) : 'N/A');

    const result = await this.callOpenAI(prompt);
    return result.insights;
  }

  // Parallel Entity Extraction
  async extractAllEntities(
    transcription: string,
    voiceFeatures?: VoiceFeatures,
    soulMatrix?: SoulMatrix,
    checkIns?: QuickCheckIn[],
    timestamp?: Date,
    wheelOfLifePriorities?: string[]
  ): Promise<AnalysisResult> {
    const entities = [
      'sentiment',
      'people',
      'finance',
      'tasks',
      'locations',
      'temporal',
      'lifeAreas',
      'insights'
    ];

    const promises = entities.map(async (entity) => {
      try {
        switch (entity) {
          case 'sentiment':
            return { entity, result: await this.analyzeSentiment(transcription, voiceFeatures, soulMatrix, checkIns, timestamp) };
          case 'people':
            return { entity, result: await this.extractPeople(transcription, soulMatrix, checkIns, timestamp) };
          case 'finance':
            return { entity, result: await this.extractFinance(transcription) };
          case 'tasks':
            return { entity, result: await this.extractTasks(transcription) };
          case 'locations':
            return { entity, result: await this.extractLocations(transcription) };
          case 'temporal':
            return { entity, result: await this.extractTemporal(transcription, timestamp) };
          case 'lifeAreas':
            return { entity, result: await this.analyzeLifeAreas(transcription, wheelOfLifePriorities) };
          default:
            return { entity, result: null };
        }
      } catch (error) {
        console.error(`Failed to extract ${entity}:`, error);
        return { entity, result: null, error };
      }
    });

    const results = await Promise.all(promises);
    const analysisResult: Partial<AnalysisResult> = {};

    results.forEach(({ entity, result, error }) => {
      if (!error && result) {
        switch (entity) {
          case 'sentiment':
            analysisResult.sentiment = result;
            break;
          case 'people':
            analysisResult.people = result;
            break;
          case 'finance':
            analysisResult.finance = result;
            break;
          case 'tasks':
            analysisResult.tasks = result;
            break;
          case 'locations':
            analysisResult.locations = result;
            break;
          case 'temporal':
            analysisResult.temporal = result;
            break;
          case 'lifeAreas':
            analysisResult.lifeAreas = result;
            break;
        }
      }
    });

    // Generate insights after all entities are extracted
    if (analysisResult.people && analysisResult.finance && analysisResult.tasks && 
        analysisResult.locations && analysisResult.temporal && analysisResult.lifeAreas) {
      try {
        analysisResult.insights = await this.generateInsights(transcription, {
          people: analysisResult.people,
          finance: analysisResult.finance,
          tasks: analysisResult.tasks,
          locations: analysisResult.locations,
          temporal: analysisResult.temporal,
          lifeAreas: analysisResult.lifeAreas
        }, soulMatrix);
      } catch (error) {
        console.error('Failed to generate insights:', error);
      }
    }

    return analysisResult as AnalysisResult;
  }

  // SoulMatrix Analysis
  async analyzeSoulMatrix(
    previousSoulMatrix: SoulMatrix,
    newJournalEntries: string[],
    totalEntries: number
  ): Promise<SoulMatrix> {
    const prompt = SOULMATRIX_ANALYSIS_PROMPT
      .replace('{previousSoulMatrix}', JSON.stringify(previousSoulMatrix))
      .replace('{newJournalEntries}', JSON.stringify(newJournalEntries))
      .replace('{totalEntries}', totalEntries.toString());

    const result = await this.callOpenAI(prompt);
    return result;
  }

  // Wheel of Life Assessment
  async assessWheelOfLife(soulMatrix?: SoulMatrix): Promise<WheelOfLifeAssessment> {
    const prompt = WHEEL_OF_LIFE_ASSESSMENT_PROMPT
      .replace('{soulMatrix}', soulMatrix ? JSON.stringify(soulMatrix) : 'N/A')
      .replace('{lifeAreas}', JSON.stringify(DEFAULT_LIFE_AREAS));

    const result = await this.callOpenAI(prompt);
    return result;
  }

  // Recap Generation
  async generateRecap(data: {
    periodType: 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    journalEntries: string[];
    checkInsData: string[];
    peopleData: string[];
    financeData: string[];
    tasksData: string[];
    soulMatrix?: SoulMatrix;
    wheelOfLifePriorities?: string[];
  }) {
    const prompt = RECAP_GENERATION_PROMPT
      .replace('{periodType}', data.periodType)
      .replace('{startDate}', data.startDate)
      .replace('{endDate}', data.endDate)
      .replace('{journalEntries}', data.journalEntries.join('\n\n'))
      .replace('{checkInsData}', Array.isArray(data.checkInsData) ? data.checkInsData.join('\n') : data.checkInsData)
      .replace('{peopleData}', Array.isArray(data.peopleData) ? data.peopleData.join('\n') : data.peopleData)
      .replace('{financeData}', Array.isArray(data.financeData) ? data.financeData.join('\n') : data.financeData)
      .replace('{tasksData}', Array.isArray(data.tasksData) ? data.tasksData.join('\n') : data.tasksData)
      .replace('{soulMatrix}', data.soulMatrix ? JSON.stringify(data.soulMatrix) : 'N/A')
      .replace('{wheelOfLifePriorities}', data.wheelOfLifePriorities ? JSON.stringify(data.wheelOfLifePriorities) : '[]');

    const result = await this.callOpenAI(prompt);
    return result;
  }

  // Retry mechanism for failed extractions
  async retryEntityExtraction(
    entity: string,
    transcription: string,
    maxRetries: number = 3
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        switch (entity) {
          case 'sentiment':
            return await this.analyzeSentiment(transcription);
          case 'people':
            return await this.extractPeople(transcription);
          case 'finance':
            return await this.extractFinance(transcription);
          case 'tasks':
            return await this.extractTasks(transcription);
          case 'locations':
            return await this.extractLocations(transcription);
          case 'temporal':
            return await this.extractTemporal(transcription);
          case 'lifeAreas':
            return await this.analyzeLifeAreas(transcription);
          default:
            throw new Error(`Unknown entity type: ${entity}`);
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Failed to extract ${entity} after ${maxRetries} attempts: ${error}`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async analyzeWithAI(data: {
    journalEntries: any[];
    checkIns: any[];
    goals: any[];
    soulMatrix?: SoulMatrix;
    wheelOfLife?: any;
    people: any[];
    financeEntries: any[];
    tasks: any[];
  }) {
    const prompt = `Analyze this user's comprehensive personal data and provide deep, actionable insights. Focus on:

1. Emotional patterns and triggers
2. Behavioral trends and habits
3. Relationship dynamics and social patterns
4. Goal achievement patterns and barriers
5. Life balance and priorities
6. Growth opportunities and potential challenges
7. Specific, actionable recommendations

DATA:
Journal Entries: ${data.journalEntries.length} entries
Check-ins: ${data.checkIns.length} entries
Goals: ${data.goals.length} goals
People: ${data.people.length} relationships
Finance: ${data.financeEntries.length} entries
Tasks: ${data.tasks.length} tasks

SAMPLE JOURNAL CONTENT:
${data.journalEntries.slice(0, 3).map(entry => entry.content || entry.transcription || '').join('\n\n')}

CHECK-IN PATTERNS:
${data.checkIns.slice(0, 5).map(checkIn => `Mood: ${checkIn.mood}, Energy: ${checkIn.energy}, Sleep: ${checkIn.sleepHours}h`).join('\n')}

GOAL STATUS:
${data.goals.map(goal => `${goal.title}: ${goal.status} (${goal.progress}%)`).join('\n')}

PERSONALITY PROFILE:
${data.soulMatrix ? JSON.stringify(data.soulMatrix, null, 2) : 'Not available'}

LIFE AREAS:
${data.wheelOfLife ? JSON.stringify(data.wheelOfLife, null, 2) : 'Not available'}

Provide insights in JSON format with the following structure:
{
  "emotionalInsights": [{"title": "", "message": "", "confidence": 0.0-1.0, "impact": "high|medium|low"}],
  "behavioralInsights": [{"title": "", "message": "", "confidence": 0.0-1.0, "impact": "high|medium|low"}],
  "relationshipInsights": [{"title": "", "message": "", "confidence": 0.0-1.0, "impact": "high|medium|low"}],
  "goalInsights": [{"title": "", "message": "", "confidence": 0.0-1.0, "impact": "high|medium|low"}],
  "lifeBalanceInsights": [{"title": "", "message": "", "confidence": 0.0-1.0, "impact": "high|medium|low"}],
  "growthOpportunities": [{"title": "", "description": "", "steps": [], "expectedOutcome": "", "difficulty": "easy|medium|hard"}],
  "predictiveInsights": [{"title": "", "prediction": "", "confidence": 0.0-1.0, "timeframe": "", "probability": "high|medium|low"}],
  "actionableRecommendations": [{"title": "", "description": "", "priority": "high|medium|low", "steps": [], "expectedOutcome": ""}]
}`;

    try {
      const response = await this.callOpenAI(prompt, 'gpt-4o-mini');
      return JSON.parse(response);
    } catch (error) {
      console.error('Error in AI analysis:', error);
      return {
        emotionalInsights: [],
        behavioralInsights: [],
        relationshipInsights: [],
        goalInsights: [],
        lifeBalanceInsights: [],
        growthOpportunities: [],
        predictiveInsights: [],
        actionableRecommendations: []
      };
    }
  }

  async generateLifeAreaNudges(data: {
    journalEntries: any[];
    checkIns: any[];
    goals: any[];
    soulMatrix?: SoulMatrix;
    wheelOfLife?: any;
    people: any[];
    financeEntries: any[];
    tasks: any[];
  }) {
    const prompt = `Generate intelligent life area improvement nudges based on this user's data. Focus on:

1. Areas needing attention based on low scores or patterns
2. Opportunities for growth and improvement
3. Specific, actionable recommendations
4. Timing and frequency considerations
5. Personalization based on user patterns

DATA:
Journal Entries: ${data.journalEntries.length} entries
Check-ins: ${data.checkIns.length} entries
Goals: ${data.goals.length} goals
People: ${data.people.length} relationships
Finance: ${data.financeEntries.length} entries
Tasks: ${data.tasks.length} tasks

SAMPLE JOURNAL CONTENT:
${data.journalEntries.slice(0, 2).map(entry => entry.content || entry.transcription || '').join('\n\n')}

CHECK-IN PATTERNS:
${data.checkIns.slice(0, 3).map(checkIn => `Mood: ${checkIn.mood}, Energy: ${checkIn.energy}, Sleep: ${checkIn.sleepHours}h`).join('\n')}

GOAL STATUS:
${data.goals.map(goal => `${goal.title}: ${goal.status} (${goal.progress}%)`).join('\n')}

PERSONALITY PROFILE:
${data.soulMatrix ? JSON.stringify(data.soulMatrix, null, 2) : 'Not available'}

LIFE AREAS:
${data.wheelOfLife ? JSON.stringify(data.wheelOfLife, null, 2) : 'Not available'}

Generate nudges in JSON format with the following structure:
{
  "nudges": [
    {
      "id": "unique-id",
      "type": "wellness|goals|relationships|finance|life-balance|productivity",
      "category": "emotional|physical|social|financial|professional|personal",
      "title": "Nudge title",
      "message": "Detailed message explaining the nudge",
      "priority": "high|medium|low",
      "actionable": true,
      "actions": [
        {
          "label": "Action description",
          "impact": "high|medium|low"
        }
      ],
      "timing": "now|today|this-week|this-month",
      "frequency": "once|daily|weekly|monthly",
      "lifeArea": "specific-life-area",
      "confidence": 0.0-1.0,
      "expectedOutcome": "What will happen if followed"
    }
  ]
}

Focus on creating nudges that are:
- Specific and actionable
- Timely and relevant
- Personalized to the user's patterns
- Realistic and achievable
- Focused on positive change`;

    try {
      const response = await this.callOpenAI(prompt, 'gpt-4o-mini');
      const result = JSON.parse(response);
      return result.nudges || [];
    } catch (error) {
      console.error('Error generating life area nudges:', error);
      return [];
    }
  }
}

// Create singleton instance
let openAIInstance: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!openAIInstance) {
    openAIInstance = new OpenAIService();
  }
  return openAIInstance;
}

export default getOpenAIService; 
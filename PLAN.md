# Journaling App - Comprehensive Planning Document

## 🎯 Project Overview
A modern web application that allows users to journal their thoughts through voice or text input, transcribes the content, and provides AI-powered analysis using OpenAI API.

## 🚀 Core Features Analysis

### 1. User Interface Features
- [ ] **Modern, minimal wellness-focused design**
  - Clean, minimalist interface with ample white space
  - Soft, calming color palette (sage green, soft blue, warm beige)
  - Typography: Serif fonts for headings, sans-serif for body text
  - Subtle shadows and rounded corners for depth
  - Dark/light mode toggle with wellness-optimized themes
  - Mobile-first responsive design
  - Accessibility compliance (WCAG 2.1)

- [ ] **First-time User Experience**
  - No signup/login required for first entry
  - Simple, focused interface for new users
  - Clear call-to-action after analysis
  - Smooth transition to signup/login
  - Data preservation during signup process

- [ ] **Processing Options Interface**
  - Toggle between "Transcribe Only" and "Full Analysis"
  - Cost and time indicators for each option
  - Clear explanation of what each option provides
  - Visual feedback during processing
  - Option to analyze transcribed-only entries later

- [ ] **Engaging Processing Flow**
  - Animated progress indicators with wellness-themed animations
  - Step-by-step processing cards with calming visuals
  - Gentle loading animations with nature-inspired elements
  - Encouraging messages during processing
  - Mindfulness-inspired waiting experience

- [ ] **Wheel of Life Integration**
  - Mandatory onboarding wheel of life assessment (after signup)
  - Interactive wheel visualization
  - Mandatory priority selection for life areas
  - Dedicated pages for each life area
  - Progress tracking and trends

- [ ] **Voice recording functionality**
  - Real-time microphone access
  - Audio visualization (waveform/spectrum)
  - Recording controls (start/stop/pause/resume)
  - Audio playback with speed control
  - Recording duration display

- [ ] **Text input area**
  - Rich text editor with formatting
  - Auto-save functionality
  - Character/word count
  - Markdown support
  - Spell check integration

- [ ] **Journal entry display**
  - Timeline view of entries
  - Calendar view
  - Search and filter capabilities
  - Entry preview with snippets
  - Tags and categories

- [ ] **Analysis results display**
  - Sentiment analysis visualization
  - Theme extraction and display
  - Mood tracking over time
  - Insights and recommendations
  - Export analysis reports

### 2. Voice & Text Input Features
- [ ] **Voice recording capabilities**
  - Web Audio API integration
  - MediaRecorder API for recording
  - Audio format support (WAV, MP3, WebM)
  - Noise reduction and audio enhancement
  - Recording quality settings

- [ ] **Text input enhancements**
  - Auto-complete suggestions
  - Voice-to-text real-time conversion
  - Multiple language support
  - Text formatting toolbar
  - Image attachment support

- [ ] **Processing options**
  - "Transcribe Only" option (no AI analysis)
  - "Full Analysis" option (transcribe + AI analysis)
  - Toggle between processing modes
  - Cost and time indicators for each option

- [ ] **Quick Check In feature**
  - Mood selection (emoji-based)
  - Energy level (1-10 scale)
  - Movement level (1-10 scale)
  - Sleep duration (hours and minutes)
  - Optional brief note/text
  - No transcription or AI analysis
  - Unlimited frequency

### 3. Transcription Service Features
- [ ] **Voice-to-text conversion**
  - Web Speech API (primary)
  - OpenAI Whisper API (fallback)
  - Real-time transcription
  - Offline transcription capabilities
  - Multiple language support

- [ ] **Voice feature extraction**
  - Librosa library integration for audio analysis
  - Pitch, tempo, volume, and speech pattern analysis
  - Emotional indicators from voice characteristics
  - Speech rate and pause analysis
  - Voice quality metrics

- [ ] **Transcription management**
  - Edit transcribed text
  - Confidence score display
  - Manual corrections
  - Transcription history
  - Export transcriptions

### 4. OpenAI Integration Features
- [ ] **Content analysis**
  - Sentiment analysis (positive/negative/neutral)
  - Emotion detection (joy, sadness, anger, fear, etc.)
  - Theme extraction and categorization
  - Writing style analysis
  - Personal growth insights

- [ ] **Advanced Entity Extraction**
  - **People mentioned**: Extract names, relationships, interactions
  - **Finance cues**: Extract monetary amounts, financial decisions, expenses, income
  - **Tasks mentioned**: Extract to-dos, deadlines, completed tasks, goals
  - **Location data**: Extract places mentioned, travel plans
  - **Date/time references**: Extract temporal information

- [ ] **SoulMatrix - Big Five Personality Analysis**
  - Continuous personality trait analysis based on journal entries
  - Big Five traits: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
  - 24-hour update cycle with new unanalyzed entries
  - Personality evolution tracking over time
  - Correlation with life events and changes

- [ ] **Wheel of Life Analysis**
  - Automatic life area categorization
  - Satisfaction level assessment from journal content
  - Progress tracking across life areas
  - AI-powered insights for each life area
  - Goal achievement correlation

- [ ] **AI-powered features**
  - Personalized journaling prompts based on personality
  - Mood pattern recognition
  - Writing improvement suggestions
  - Goal tracking and recommendations
  - Mental health insights (with disclaimers)
  - Financial tracking and insights
  - Task management integration
  - Relationship tracking and insights
  - Life balance recommendations
  - Personality-based insights and recommendations

### 5. Data Management Features
- [ ] **Storage solutions**
  - SQLite3 database for all persistent data
  - Session storage (for first-time users)
  - Local storage (IndexedDB) for temporary data
  - Cloud sync (optional)
  - Data encryption
  - Backup and restore
  - Export to various formats (PDF, JSON, CSV)

- [ ] **Entry management**
  - Create, read, update, delete entries
  - Bulk operations
  - Entry templates
  - Scheduled reminders
  - Entry statistics and analytics
  - Analyze transcribed-only entries later

- [ ] **Check In management**
  - Create, read, update, delete check-ins
  - Trend tracking and analytics
  - Dashboard widgets and visualizations
  - Correlation with journal entries
  - Export check-in data

- [ ] **Recap management**
  - Weekly and monthly recap generation
  - Story-format narrative recaps
  - Interactive recap elements
  - AI-generated insights and recommendations
  - Life area improvement nudges
  - Actionable improvement suggestions

- [ ] **User flow management**
  - Temporary data storage for first entry
  - Automatic data transfer from session to permanent storage
  - User authentication state management (Email/password + Google)
  - Seamless transition from trial to full app
  - Mandatory Wheel of Life completion

## 🛠 Technology Stack Analysis

### Frontend Framework Options

#### Option 1: Next.js 14 (Recommended)
**Pros:**
- Server-side rendering for better SEO
- Built-in API routes for backend functionality
- Excellent TypeScript support
- Great developer experience
- Easy deployment on Vercel
- Built-in optimizations

**Cons:**
- Learning curve for complex features
- Overkill for simple apps

#### Option 2: React + Vite
**Pros:**
- Faster development server
- Simpler setup
- More control over configuration
- Lighter bundle size

**Cons:**
- Manual setup for routing
- No built-in API routes
- More configuration needed

#### Option 3: SvelteKit
**Pros:**
- Excellent performance
- Less boilerplate code
- Great developer experience
- Built-in animations

**Cons:**
- Smaller ecosystem
- Less community support

### Styling Framework Options

#### Option 1: Tailwind CSS (Recommended)
**Pros:**
- Utility-first approach
- Highly customizable
- Excellent responsive design
- Great documentation
- Large community

#### Option 2: Styled Components
**Pros:**
- CSS-in-JS approach
- Dynamic styling
- Component-scoped styles

**Cons:**
- Runtime overhead
- Bundle size impact

#### Option 3: CSS Modules
**Pros:**
- Scoped styles
- No runtime overhead
- Simple and straightforward

**Cons:**
- Less dynamic capabilities

### State Management Options

#### Option 1: React Context + Hooks (Recommended)
**Pros:**
- Built into React
- Simple for small-medium apps
- No additional dependencies
- Easy to understand

#### Option 2: Zustand
**Pros:**
- Lightweight
- Simple API
- TypeScript support
- Great performance

#### Option 3: Redux Toolkit
**Pros:**
- Powerful and flexible
- Great dev tools
- Large ecosystem

**Cons:**
- Overkill for this app
- More boilerplate

### Audio Processing Options

#### Option 1: Web Audio API + MediaRecorder (Recommended)
**Pros:**
- Native browser APIs
- No external dependencies
- Full control over audio processing
- Real-time capabilities

#### Option 2: RecordRTC
**Pros:**
- Cross-browser compatibility
- Multiple format support
- Easy to use

**Cons:**
- Additional dependency
- Less control

### Transcription Service Options

#### Option 1: OpenAI Whisper API (Selected)
**Pros:**
- High accuracy and reliability
- Multiple language support
- Consistent quality across browsers
- Advanced audio processing capabilities
- Better handling of accents and background noise

**Cons:**
- API costs per transcription
- Requires internet connection
- Slight delay for processing

**Implementation:**
- Direct integration with OpenAI Whisper API
- Audio file upload and processing
- Real-time status updates during transcription
- Error handling and retry mechanisms

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup and configuration
- [ ] SQLite3 database setup and schema implementation
- [ ] Design system implementation (colors, typography, spacing)
- [ ] Basic UI components and layout
- [ ] Routing and navigation
- [ ] Responsive design implementation
- [ ] Basic state management
- [ ] First-time user experience flow
- [ ] Session storage implementation
- [ ] User authentication system (Email/password + Google OAuth)
- [ ] NextAuth.js integration
- [ ] Wheel of Life onboarding flow (post-signup, mandatory)
- [ ] Default life areas configuration

### Phase 2: Core Features (Week 2)
- [ ] Voice recording implementation
- [ ] Text input with rich editor
- [ ] Entry type selection (Voice/Text/Quick Check In)
- [ ] Processing options selection (Transcribe Only vs Full Analysis)
- [ ] Quick Check In implementation
- [ ] OpenAI Whisper API integration
- [ ] Enhanced processing flow with step-by-step confirmation
- [ ] Wellness-themed animations and visual feedback
- [ ] Entity confirmation and editing interface
- [ ] Error handling and retry mechanisms
- [ ] Entry creation and storage
- [ ] Entry display and management
- [ ] Later analysis option for transcribed-only entries

### Phase 3: AI Integration (Week 3)
- [ ] OpenAI GPT-4 API integration
- [ ] Voice feature extraction with Librosa
- [ ] Entity extraction implementation:
  - People mentioned extraction
  - Finance cues extraction
  - Tasks mentioned extraction
  - Location data extraction
  - Temporal references extraction
- [ ] SoulMatrix implementation:
  - Big Five personality analysis
  - 24-hour update cycle
  - Personality evolution tracking
- [ ] Life area categorization and scoring
- [ ] Wheel of Life automatic updates
- [ ] Analysis results display with individual object views
- [ ] Error handling and fallbacks
- [ ] API key management

### Phase 4: Enhancement (Week 4)
- [ ] Wheel of Life dashboard and individual area pages
- [ ] Progress tracking and visualization
- [ ] Goal setting and tracking within life areas
- [ ] Priority-based insights and recommendations
- [ ] Check-in trends and analytics
- [ ] Dashboard widgets for check-ins
- [ ] Correlation analysis between check-ins and journal entries
- [ ] SoulMatrix dashboard and personality insights
- [ ] Personality evolution visualization
- [ ] People management system with profiles and relationship analysis
- [ ] Finance management with summaries and analytics
- [ ] Task management with Google Calendar integration
- [x] Monthly and Weekly recap system implementation (automated recap generation, story format narratives, insights and recommendations)
- [x] Story-format narrative recaps with interactive elements (multiple story formats, interactive timeline, character analysis, journey chapters, reflection questions)
- [x] AI-generated insights and actionable recommendations (enhanced AI analysis, confidence scores, impact levels, predictive insights, growth opportunities)
- [x] Life area improvement nudges and progress tracking (intelligent nudges, priority-based recommendations, interactive actions, progress analytics)
- [x] Advanced features (search, filter, export)
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Deployment preparation

## 🔧 Technical Architecture

### Component Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── AuthGuard.tsx
│   ├── onboarding/
│   │   ├── WheelOfLifeAssessment.tsx
│   │   ├── WheelVisualization.tsx
│   │   └── PrioritySelection.tsx
│   ├── wheel-of-life/
│   │   ├── WheelOfLifeDashboard.tsx
│   │   ├── LifeAreaPage.tsx
│   │   ├── ProgressTracker.tsx
│   │   ├── LifeAreaInsights.tsx
│   │   └── GoalTracker.tsx
│   ├── voice/
│   │   ├── VoiceRecorder.tsx
│   │   ├── AudioVisualizer.tsx
│   │   └── RecordingControls.tsx
│   ├── text/
│   │   ├── TextEditor.tsx
│   │   ├── RichTextToolbar.tsx
│   │   └── AutoSave.tsx
│   ├── journal/
│   │   ├── JournalEntry.tsx
│   │   ├── EntryList.tsx
│   │   ├── EntryCard.tsx
│   │   ├── EntryForm.tsx
│   │   ├── ProcessingOptions.tsx
│   │   ├── EntryTypeSelector.tsx
│   │   ├── ProcessingFlow.tsx
│   │   ├── TranscriptionConfirmation.tsx
│   │   ├── AnalysisConfirmation.tsx
│   │   └── EntityEditor.tsx
│   ├── check-in/
│   │   ├── QuickCheckIn.tsx
│   │   ├── CheckInForm.tsx
│   │   ├── CheckInList.tsx
│   │   ├── CheckInTrends.tsx
│   │   └── CheckInWidgets.tsx
│   ├── analysis/
│   │   ├── AnalysisResults.tsx
│   │   ├── SentimentChart.tsx
│   │   ├── EntityExtractor.tsx
│   │   ├── PeopleMentioned.tsx
│   │   ├── FinanceCues.tsx
│   │   ├── TasksMentioned.tsx
│   │   ├── LocationData.tsx
│   │   └── InsightsDisplay.tsx
│   ├── soul-matrix/
│   │   ├── SoulMatrixDashboard.tsx
│   │   ├── PersonalityTraits.tsx
│   │   ├── TraitEvolution.tsx
│   │   ├── PersonalityInsights.tsx
│   │   └── SoulMatrixWidget.tsx
│   ├── people/
│   │   ├── PeopleList.tsx
│   │   ├── PersonProfile.tsx
│   │   ├── ContactManager.tsx
│   │   ├── RelationshipAnalysis.tsx
│   │   └── PeopleWidget.tsx
│   ├── finance/
│   │   ├── FinanceOverview.tsx
│   │   ├── FinancialSummary.tsx
│   │   ├── FinanceEntry.tsx
│   │   ├── FinancialCharts.tsx
│   │   └── FinanceWidget.tsx
│   ├── tasks/
│   │   ├── TasksList.tsx
│   │   ├── TaskDetails.tsx
│   │   ├── TaskForm.tsx
│   │   ├── GoogleCalendarSync.tsx
│   │   └── TasksWidget.tsx
│   ├── recaps/
│   │   ├── RecapsOverview.tsx
│   │   ├── WeeklyRecap.tsx
│   │   ├── MonthlyRecap.tsx
│   │   ├── RecapStory.tsx
│   │   ├── RecapInsights.tsx
│   │   ├── LifeAreaNudges.tsx
│   │   └── RecapWidget.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── useVoiceRecorder.ts
│   ├── useWhisper.ts
│   ├── useOpenAI.ts
│   ├── useLocalStorage.ts
│   ├── useSessionStorage.ts
│   ├── useDatabase.ts
│   ├── useAuth.ts
│   ├── useJournal.ts
│   ├── useCheckIn.ts
│   ├── useSoulMatrix.ts
│   ├── usePeople.ts
│   ├── useFinance.ts
│   ├── useTasks.ts
│   ├── useProcessingFlow.ts
│   ├── useRecaps.ts
│   └── useWheelOfLife.ts
├── services/
│   ├── whisper.ts
│   ├── openai.ts
│   ├── database.ts
│   ├── storage.ts
│   ├── audio.ts
│   ├── auth.ts
│   ├── checkIn.ts
│   ├── soulMatrix.ts
│   ├── people.ts
│   ├── finance.ts
│   ├── tasks.ts
│   ├── recaps.ts
│   └── wheelOfLife.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── types.ts
│   └── validation.ts
└── styles/
    ├── globals.css
    └── components.css
```

### Data Flow
1. **First-time User** → No signup/login required
2. **Entry Type Choice** → User selects:
   - Voice Entry (with processing options)
   - Text Entry (with processing options)
   - Quick Check In
3. **Processing Flow**:
   - **Step 1**: Transcribe audio/text → Show transcription → User confirms/edits
   - **Step 2**: Analyze content → Show analysis → User confirms/edits entities
   - **Step 3**: Save entry → Final save with all confirmed data
4. **Processing Options**:
   - **Transcribe Only**: Skip analysis step, save as draft
   - **Full Analysis**: Complete processing with confirmation steps
5. **Analysis Input** (for GPT-4):
   - Confirmed transcription or text content
   - Voice features (if voice entry)
   - Latest SoulMatrix
   - Today's check-ins
   - Entry timestamp
6. **Error Handling**: Retry failed steps, save as draft if persistent failure
7. **Storage** → Session storage (for first entry)
8. **Post-Processing** → Prompt user to save and signup/login
9. **After Signup** → Transfer data to SQLite3 database + Wheel of Life Assessment
10. **Regular Flow** → Full app features with SQLite3 persistent storage
11. **SoulMatrix Updates** → 24-hour cycle updates with new entries
12. **Trend Analysis** → Check-in trends and correlations

### API Integration Details

#### OpenAI Whisper API
- **Endpoint**: `https://api.openai.com/v1/audio/transcriptions`
- **Audio Formats**: mp3, mp4, mpeg, mpga, m4a, wav, webm
- **Max File Size**: 25 MB
- **Response**: JSON with transcribed text

#### OpenAI GPT-4 Analysis
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: gpt-4-turbo-preview
- **Purpose**: Content analysis, entity extraction, and personality analysis
- **Structured Output**: JSON format with specific objects

#### Analysis Input Data Structure
```typescript
interface AnalysisInput {
  transcription: string; // Voice transcription or text content
  voiceFeatures?: VoiceFeatures; // Extracted voice features (if voice entry)
  soulMatrix: SoulMatrix; // Latest personality analysis
  checkIns: QuickCheckIn[]; // Check-ins from the same day
  timestamp: Date; // Time and date of journal entry
  userId: string;
}
```

#### Hardcoded Prompts

##### 1. Journal Entry Analysis - Individual Entity Extraction (Primary Approach)

###### 1.1. Sentiment Analysis Prompt
```typescript
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
```

###### 1.2. People Extraction Prompt
```typescript
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
```

###### 1.3. Finance Extraction Prompt
```typescript
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
```

###### 1.4. Tasks Extraction Prompt
```typescript
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
```

###### 1.5. Location Extraction Prompt
```typescript
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
```

###### 1.6. Temporal Extraction Prompt
```typescript
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
```

###### 1.7. Life Areas Analysis Prompt
```typescript
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
```

###### 1.8. Insights Generation Prompt
```typescript
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
```
```typescript
// People Extraction Prompt
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
      "confidence": 0.0-1.0
    }
  ]
}

Focus on accuracy. If no people are mentioned, return empty array.`;

##### 1.2. Individual Entity Extraction Strategy (Primary Approach)
```typescript
// Strategy for individual entity extraction
interface IndividualExtractionStrategy {
  // Extract all entities for new journal entries
  extractAllEntities: (entry: JournalEntry) => Promise<AnalysisResult>;
  
  // Extract specific entities only
  extractSpecificEntities: (entry: JournalEntry, entities: string[]) => Promise<Partial<AnalysisResult>>;
  
  // Retry failed entity extraction
  retryFailedEntity: (entry: JournalEntry, entity: string) => Promise<any>;
  
  // Parallel processing for better performance
  extractEntitiesParallel: (entry: JournalEntry, entities: string[]) => Promise<AnalysisResult>;
}

// Implementation logic:
const individualExtractionStrategy: IndividualExtractionStrategy = {
  extractAllEntities: async (entry) => {
    const entities = ['sentiment', 'people', 'finance', 'tasks', 'locations', 'temporal', 'lifeAreas', 'insights'];
    return await individualExtractionStrategy.extractEntitiesParallel(entry, entities);
  },
  
  extractSpecificEntities: async (entry, entities) => {
    const results = {};
    for (const entity of entities) {
      try {
        const prompt = getEntityPrompt(entity);
        const result = await callOpenAI(prompt, entry);
        results[entity] = result;
      } catch (error) {
        console.error(`Failed to extract ${entity}:`, error);
        results[entity] = null;
      }
    }
    return results;
  },
  
  retryFailedEntity: async (entry, entity) => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = getEntityPrompt(entity);
        return await callOpenAI(prompt, entry);
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Failed to extract ${entity} after ${maxRetries} attempts`);
        }
        await delay(1000 * attempt); // Exponential backoff
      }
    }
  },
  
  extractEntitiesParallel: async (entry, entities) => {
    const promises = entities.map(async (entity) => {
      try {
        const prompt = getEntityPrompt(entity);
        const result = await callOpenAI(prompt, entry);
        return { entity, result, success: true };
      } catch (error) {
        console.error(`Failed to extract ${entity}:`, error);
        return { entity, result: null, success: false, error };
      }
    });
    
    const results = await Promise.all(promises);
    const analysisResult = {};
    
    results.forEach(({ entity, result, success }) => {
      if (success) {
        analysisResult[entity] = result;
      } else {
        analysisResult[entity] = null;
      }
    });
    
    return analysisResult;
  }
};

// Helper function to get the appropriate prompt for each entity
const getEntityPrompt = (entity: string) => {
  const prompts = {
    sentiment: SENTIMENT_ANALYSIS_PROMPT,
    people: PEOPLE_EXTRACTION_PROMPT,
    finance: FINANCE_EXTRACTION_PROMPT,
    tasks: TASKS_EXTRACTION_PROMPT,
    locations: LOCATION_EXTRACTION_PROMPT,
    temporal: TEMPORAL_EXTRACTION_PROMPT,
    lifeAreas: LIFE_AREAS_ANALYSIS_PROMPT,
    insights: INSIGHTS_GENERATION_PROMPT
  };
  return prompts[entity] || null;
};

##### 1.3. Benefits of Individual Entity Extraction Approach

**🎯 Primary Advantages:**
- **Higher Accuracy**: Focused prompts for each entity type
- **Better Error Handling**: Individual failures don't affect other entities
- **Parallel Processing**: Multiple entities can be extracted simultaneously
- **Cost Optimization**: Only extract needed entities
- **Retry Capability**: Failed entities can be retried independently
- **Modularity**: Easy to add/remove entity types

**📊 Performance Benefits:**
- **Faster Response**: Parallel API calls vs. single large call
- **Better UX**: Progressive loading of analysis results
- **Scalability**: Handles large entries without token limits
- **Reliability**: Graceful degradation when some entities fail

**🛠 Implementation Benefits:**
- **Maintainability**: Each prompt is focused and testable
- **Flexibility**: Can extract specific entities on demand
- **Debugging**: Easier to identify and fix issues
- **Monitoring**: Better tracking of success rates per entity type

##### 2. Wheel of Life Management & Analysis Prompts

###### 2.1. Initial Wheel of Life Assessment Prompt
```typescript
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
```

###### 2.2. Life Area Categorization Prompt
```typescript
const LIFE_AREA_CATEGORIZATION_PROMPT = `Categorize this journal entry into relevant life areas:

JOURNAL ENTRY:
{transcription}

EXTRACTED ENTITIES:
- People: {people}
- Finance: {finance}
- Tasks: {tasks}
- Locations: {locations}
- Temporal: {temporal}

USER'S WHEEL OF LIFE PRIORITIES:
{wheelOfLifePriorities}

AVAILABLE LIFE AREAS:
{lifeAreas}

Return ONLY life area categorization in this JSON format:
{
  "categorization": [
    {
      "area_id": "string",
      "relevance_score": 1-10,
      "sentiment": "positive|negative|neutral",
      "confidence": 0.0-1.0,
      "key_themes": ["string"],
      "impact_level": "high|medium|low",
      "actionable_insights": ["string"]
    }
  ]
}

Focus on accurate categorization based on content themes and user priorities.`;
```

###### 2.3. Life Area Progress Analysis Prompt
```typescript
const LIFE_AREA_PROGRESS_PROMPT = `Analyze progress and trends for a specific life area:

LIFE AREA: {lifeAreaName}

CURRENT WHEEL OF LIFE DATA:
{currentWheelOfLife}

RECENT JOURNAL ENTRIES (Last 30 days):
{recentJournalEntries}

CHECK-INS DATA (Last 30 days):
{checkInsData}

GOALS FOR THIS AREA:
{goals}

PROGRESS HISTORY:
{progressHistory}

Return ONLY progress analysis in this JSON format:
{
  "progress_analysis": {
    "current_score": 1-10,
    "trend": "improving|declining|stable",
    "confidence": 0.0-1.0,
    "key_achievements": ["string"],
    "challenges": ["string"],
    "momentum": "positive|negative|neutral"
  },
  "insights": {
    "patterns": ["string"],
    "triggers": ["string"],
    "barriers": ["string"],
    "opportunities": ["string"]
  },
  "recommendations": {
    "immediate_actions": ["string"],
    "goal_adjustments": ["string"],
    "habit_suggestions": ["string"],
    "milestone_celebrations": ["string"]
  },
  "goals_status": [
    {
      "goal_id": "string",
      "progress": 0-100,
      "status": "on_track|behind|ahead|completed",
      "next_steps": ["string"],
      "estimated_completion": "YYYY-MM-DD|null"
    }
  ]
}

Focus on actionable insights and celebrating progress while identifying growth opportunities.`;
```

###### 2.4. Life Area Goal Generation Prompt
```typescript
const LIFE_AREA_GOAL_GENERATION_PROMPT = `Generate SMART goals for a specific life area:

LIFE AREA: {lifeAreaName}

CURRENT STATUS:
- Current Score: {currentScore}/10
- Target Score: {targetScore}/10
- Recent Activity: {recentActivity}

USER'S PERSONALITY PROFILE (SoulMatrix):
{soulMatrix}

EXISTING GOALS:
{existingGoals}

JOURNAL PATTERNS:
{journalPatterns}

Return ONLY goal recommendations in this JSON format:
{
  "goals": [
    {
      "title": "string",
      "description": "string",
      "type": "short_term|medium_term|long_term",
      "target_date": "YYYY-MM-DD",
      "priority": "high|medium|low",
      "difficulty": "easy|moderate|challenging",
      "measurable_metrics": ["string"],
      "action_steps": ["string"],
      "motivation_factors": ["string"],
      "potential_barriers": ["string"],
      "support_needed": ["string"]
    }
  ],
  "goal_strategy": {
    "focus_areas": ["string"],
    "timeline_recommendation": "string",
    "success_indicators": ["string"],
    "celebration_milestones": ["string"]
  }
}

Focus on realistic, achievable goals that align with the user's personality and current situation.`;
```

###### 2.5. Life Balance Analysis Prompt
```typescript
const LIFE_BALANCE_ANALYSIS_PROMPT = `Analyze the overall balance across all life areas:

WHEEL OF LIFE CURRENT STATE:
{currentWheelOfLife}

RECENT ACTIVITY (Last 30 days):
- Journal Entries: {journalEntries}
- Check-ins: {checkIns}
- Goals Progress: {goalsProgress}

USER'S PRIORITIES:
{userPriorities}

Return ONLY balance analysis in this JSON format:
{
  "balance_assessment": {
    "overall_balance_score": 1-10,
    "balance_trend": "improving|declining|stable",
    "most_balanced_areas": ["area_id"],
    "least_balanced_areas": ["area_id"],
    "priority_alignment": "high|medium|low"
  },
  "imbalances": [
    {
      "area_id": "string",
      "issue": "string",
      "impact": "high|medium|low",
      "suggested_adjustments": ["string"]
    }
  ],
  "balance_recommendations": {
    "immediate_actions": ["string"],
    "priority_adjustments": ["string"],
    "time_allocation_suggestions": ["string"],
    "boundary_setting": ["string"]
  },
  "celebration_points": {
    "well_balanced_aspects": ["string"],
    "recent_improvements": ["string"],
    "strengths_to_leverage": ["string"]
  }
}

Focus on identifying imbalances while celebrating areas of strength and providing actionable balance improvements.`;
```

###### 2.6. Wheel of Life Update Prompt
```typescript
const WHEEL_OF_LIFE_UPDATE_PROMPT = `Update the Wheel of Life based on recent activity and progress:

CURRENT WHEEL OF LIFE:
{currentWheelOfLife}

NEW ACTIVITY SINCE LAST UPDATE:
- New Journal Entries: {newJournalEntries}
- New Check-ins: {newCheckIns}
- Goal Progress: {goalProgress}
- Time Period: {timePeriod}

USER'S PERSONALITY PROFILE (SoulMatrix):
{soulMatrix}

Return ONLY Wheel of Life updates in this JSON format:
{
  "updated_scores": [
    {
      "area_id": "string",
      "previous_score": 1-10,
      "new_score": 1-10,
      "change": "positive|negative|neutral",
      "confidence": 0.0-1.0,
      "reasoning": "string",
      "key_factors": ["string"]
    }
  ],
  "overall_changes": {
    "total_satisfaction_change": "number",
    "balance_improvement": "number",
    "priority_alignment_change": "number",
    "momentum": "positive|negative|stable"
  },
  "insights": {
    "positive_trends": ["string"],
    "areas_needing_attention": ["string"],
    "unexpected_changes": ["string"],
    "goal_impact": ["string"]
  },
  "recommendations": {
    "score_adjustments": ["string"],
    "priority_revisions": ["string"],
    "goal_updates": ["string"],
    "focus_areas": ["string"]
  }
}

Focus on accurate score updates based on evidence from recent activity and maintaining realistic assessments.`;

##### 2.7. Wheel of Life Management Strategy
```typescript
// Strategy for Wheel of Life management and analysis
interface WheelOfLifeStrategy {
  // Initial assessment for new users
  conductInitialAssessment: (userData: UserData) => Promise<WheelOfLife>;
  
  // Categorize journal entries into life areas
  categorizeJournalEntry: (entry: JournalEntry, wheelOfLife: WheelOfLife) => Promise<LifeAreaCategorization>;
  
  // Analyze progress for specific life area
  analyzeLifeAreaProgress: (areaId: string, timeRange: TimeRange) => Promise<ProgressAnalysis>;
  
  // Generate goals for life area
  generateLifeAreaGoals: (areaId: string, currentStatus: LifeAreaStatus) => Promise<Goal[]>;
  
  // Analyze overall life balance
  analyzeLifeBalance: (wheelOfLife: WheelOfLife) => Promise<BalanceAnalysis>;
  
  // Update Wheel of Life based on new activity
  updateWheelOfLife: (wheelOfLife: WheelOfLife, newActivity: ActivityData) => Promise<WheelOfLifeUpdate>;
  
  // Get insights for specific life area
  getLifeAreaInsights: (areaId: string, data: LifeAreaData) => Promise<Insight[]>;
}

// Implementation logic:
const wheelOfLifeStrategy: WheelOfLifeStrategy = {
  conductInitialAssessment: async (userData) => {
    const prompt = WHEEL_OF_LIFE_ASSESSMENT_PROMPT;
    const result = await callOpenAI(prompt, { soulMatrix: userData.soulMatrix, lifeAreas: DEFAULT_LIFE_AREAS });
    return createWheelOfLifeFromAssessment(result, userData.userId);
  },
  
  categorizeJournalEntry: async (entry, wheelOfLife) => {
    const prompt = LIFE_AREA_CATEGORIZATION_PROMPT;
    const result = await callOpenAI(prompt, {
      transcription: entry.content,
      people: entry.analysis?.people,
      finance: entry.analysis?.finance,
      tasks: entry.analysis?.tasks,
      locations: entry.analysis?.locations,
      temporal: entry.analysis?.temporal,
      wheelOfLifePriorities: wheelOfLife.priorities,
      lifeAreas: wheelOfLife.lifeAreas
    });
    return result.categorization;
  },
  
  analyzeLifeAreaProgress: async (areaId, timeRange) => {
    const prompt = LIFE_AREA_PROGRESS_PROMPT;
    const data = await getLifeAreaData(areaId, timeRange);
    const result = await callOpenAI(prompt, data);
    return result.progress_analysis;
  },
  
  generateLifeAreaGoals: async (areaId, currentStatus) => {
    const prompt = LIFE_AREA_GOAL_GENERATION_PROMPT;
    const data = await getGoalGenerationData(areaId, currentStatus);
    const result = await callOpenAI(prompt, data);
    return result.goals;
  },
  
  analyzeLifeBalance: async (wheelOfLife) => {
    const prompt = LIFE_BALANCE_ANALYSIS_PROMPT;
    const data = await getBalanceAnalysisData(wheelOfLife);
    const result = await callOpenAI(prompt, data);
    return result.balance_assessment;
  },
  
  updateWheelOfLife: async (wheelOfLife, newActivity) => {
    const prompt = WHEEL_OF_LIFE_UPDATE_PROMPT;
    const result = await callOpenAI(prompt, {
      currentWheelOfLife: wheelOfLife,
      newJournalEntries: newActivity.journalEntries,
      newCheckIns: newActivity.checkIns,
      goalProgress: newActivity.goalProgress,
      timePeriod: newActivity.timePeriod,
      soulMatrix: newActivity.soulMatrix
    });
    return applyWheelOfLifeUpdates(wheelOfLife, result);
  },
  
  getLifeAreaInsights: async (areaId, data) => {
    // Generate insights based on patterns, progress, and goals
    const insights = [];
    // Implementation for generating insights
    return insights;
  }
};

// Helper functions for data preparation
const getLifeAreaData = async (areaId: string, timeRange: TimeRange) => {
  // Fetch relevant data for life area analysis
  const recentEntries = await getJournalEntriesForArea(areaId, timeRange);
  const checkIns = await getCheckInsForPeriod(timeRange);
  const goals = await getGoalsForArea(areaId);
  const progressHistory = await getProgressHistory(areaId, timeRange);
  
  return {
    lifeAreaName: getLifeAreaName(areaId),
    currentWheelOfLife: await getCurrentWheelOfLife(),
    recentJournalEntries: recentEntries,
    checkInsData: checkIns,
    goals: goals,
    progressHistory: progressHistory
  };
};

const getGoalGenerationData = async (areaId: string, currentStatus: LifeAreaStatus) => {
  const soulMatrix = await getCurrentSoulMatrix();
  const existingGoals = await getExistingGoals(areaId);
  const journalPatterns = await getJournalPatternsForArea(areaId);
  
  return {
    lifeAreaName: getLifeAreaName(areaId),
    currentScore: currentStatus.currentScore,
    targetScore: currentStatus.targetScore,
    recentActivity: currentStatus.recentActivity,
    soulMatrix: soulMatrix,
    existingGoals: existingGoals,
    journalPatterns: journalPatterns
  };
};
```
```typescript
const JOURNAL_ANALYSIS_PROMPT = `You are an AI journaling assistant analyzing a user's journal entry. 

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

Please analyze this journal entry and provide a comprehensive response in the following JSON format:

{
  "sentiment": {
    "overall": "positive|negative|neutral",
    "confidence": 0.0-1.0,
    "emotions": ["joy", "sadness", "anger", "fear", "surprise", "disgust"],
    "intensity": 1-10
  },
  "people": [
    {
      "name": "string",
      "relationship": "string",
      "context": "string",
      "sentiment": "positive|negative|neutral",
      "interactionType": "string"
    }
  ],
  "finance": [
    {
      "amount": "number|null",
      "currency": "string",
      "category": "income|expense|investment|debt",
      "description": "string",
      "context": "string"
    }
  ],
  "tasks": [
    {
      "description": "string",
      "priority": "high|medium|low",
      "deadline": "YYYY-MM-DD|null",
      "status": "pending|completed|in-progress",
      "category": "string"
    }
  ],
  "locations": [
    {
      "name": "string",
      "type": "work|home|travel|leisure|other",
      "context": "string"
    }
  ],
  "temporal": [
    {
      "date": "YYYY-MM-DD|null",
      "time": "HH:MM|null",
      "duration": "string|null",
      "context": "string"
    }
  ],
  "lifeAreas": [
    {
      "area": "career|relationships|health|finance|personal_growth|recreation|spirituality|environment",
      "relevance": 1-10,
      "sentiment": "positive|negative|neutral",
      "insights": "string"
    }
  ],
  "insights": {
    "themes": ["string"],
    "patterns": ["string"],
    "recommendations": ["string"],
    "growth_opportunities": ["string"]
  }
}

Focus on extracting meaningful insights while maintaining accuracy and avoiding over-interpretation.`;

##### 2. SoulMatrix Analysis Prompt
```typescript
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

##### 3. Recap Generation Prompt
```typescript
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

### Data Structures

#### Journal Entry Object
```typescript
interface JournalEntry {
  id: string;
  timestamp: Date;
  content: string;
  audioUrl?: string;
  transcription?: string;
  processingType: 'transcribe-only' | 'full-analysis';
  processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  analysis?: {
    sentiment: SentimentAnalysis;
    people: PeopleMentioned[];
    finance: FinanceCues[];
    tasks: TasksMentioned[];
    locations: LocationData[];
    temporal: TemporalReferences[];
  };
  tags: string[];
  mood?: string;
  canBeAnalyzed: boolean; // true if transcribed-only and not yet analyzed
  userConfirmed: {
    transcription: boolean;
    analysis: boolean;
  };
  processingHistory: ProcessingStep[];
}

interface ProcessingStep {
  step: 'transcription' | 'analysis' | 'entity-extraction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
  retryCount: number;
}
```

#### Quick Check In Object
```typescript
interface QuickCheckIn {
  id: string;
  timestamp: Date;
  mood: '😊' | '😐' | '😞' | '😡' | '😴' | '🤔' | '😌' | '😤';
  energy: number; // 1-10
  movement: number; // 1-10
  sleep: {
    hours: number;
    minutes: number;
  };
  note?: string; // Optional brief text
  userId: string;
}
```

#### SoulMatrix Object
```typescript
interface SoulMatrix {
  id: string;
  userId: string;
  lastUpdated: Date;
  nextUpdate: Date;
  traits: BigFiveTraits;
  evolution: PersonalityEvolution[];
  confidence: number; // 0-1, confidence in analysis
  analyzedEntries: string[]; // Journal entry IDs used in analysis
}

interface BigFiveTraits {
  openness: TraitScore;
  conscientiousness: TraitScore;
  extraversion: TraitScore;
  agreeableness: TraitScore;
  neuroticism: TraitScore;
}

interface TraitScore {
  score: number; // 0-100
  percentile: number; // 0-100
  description: string;
  keywords: string[];
  trends: 'increasing' | 'decreasing' | 'stable';
}

interface PersonalityEvolution {
  date: Date;
  traits: BigFiveTraits;
  significantChanges: string[];
  lifeEvents: string[];
}
```

#### Voice Features Object
```typescript
interface VoiceFeatures {
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
    stress: number; // 0-1
    excitement: number; // 0-1
    calmness: number; // 0-1
    confidence: number; // 0-1
  };
  quality: {
    clarity: number; // 0-1
    consistency: number; // 0-1
    fluency: number; // 0-1
  };
}
```

#### Check In Trends Object
```typescript
interface CheckInTrends {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  moodTrend: MoodTrendData[];
  energyTrend: TrendData[];
  movementTrend: TrendData[];
  sleepTrend: SleepTrendData[];
  correlations: CorrelationData[];
}

interface TrendData {
  date: Date;
  value: number;
  average: number;
}

interface MoodTrendData {
  date: Date;
  mood: string;
  frequency: number;
}

interface SleepTrendData {
  date: Date;
  totalMinutes: number;
  average: number;
}

interface CorrelationData {
  type: 'mood-energy' | 'sleep-energy' | 'movement-mood' | 'journal-mood';
  strength: number; // -1 to 1
  description: string;
}
```

#### People Mentioned Object
```typescript
interface PeopleMentioned {
  id: string;
  name: string;
  displayPicture?: string;
  pictures: string[]; // Gallery of pictures
  relationship: string;
  contactDetails: ContactDetail[];
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  frequency: number;
  lastMentioned: Date;
  journalMentions: JournalMention[];
  relationshipAnalysis: RelationshipAnalysis;
  userId: string;
}

interface ContactDetail {
  type: 'email' | 'phone' | 'address';
  value: string;
  label?: string; // e.g., "Work", "Home", "Mobile"
  isPrimary: boolean;
}

interface JournalMention {
  journalId: string;
  timestamp: Date;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  excerpt: string;
}

interface RelationshipAnalysis {
  strength: number; // 0-100
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  trends: 'improving' | 'declining' | 'stable';
  insights: string[];
  recommendations: string[];
  lastUpdated: Date;
}
```

#### Finance Cues Object
```typescript
interface FinanceCues {
  id: string;
  amount: number;
  currency: string;
  category: 'income' | 'expense' | 'investment' | 'savings';
  subcategory?: string; // e.g., "groceries", "salary", "rent"
  description: string;
  date: Date;
  recurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  notes?: string;
  userId: string;
}

interface FinancialSummary {
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

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

interface FinancialTrend {
  period: string;
  income: number;
  expenses: number;
  savings: number;
  netWorth: number;
}

interface FinancialInsight {
  type: 'spending' | 'saving' | 'income' | 'investment';
  message: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}
```

#### Tasks Mentioned Object
```typescript
interface TasksMentioned {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  startDate: Date;
  deadline?: Date;
  dependencies: string[]; // IDs of dependent tasks
  category: string;
  assignee?: string;
  remarks?: string;
  isCompleted: boolean;
  completedDate?: Date;
  googleCalendarId?: string; // If synced with Google Calendar
  userId: string;
}

interface TaskDependency {
  taskId: string;
  dependentTaskId: string;
  type: 'blocks' | 'requires' | 'related';
}

interface GoogleCalendarSync {
  taskId: string;
  calendarEventId: string;
  lastSync: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}
```

#### Wheel of Life Object
```typescript
interface WheelOfLife {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lifeAreas: LifeArea[];
  priorities: string[]; // Array of life area IDs in priority order
  isCompleted: boolean;
}

interface LifeArea {
  id: string;
  name: string;
  description: string;
  currentScore: number; // 1-10
  targetScore: number; // 1-10
  color: string;
  icon: string;
  entries: string[]; // Journal entry IDs related to this area
  goals: Goal[];
  insights: Insight[];
  progressHistory: ProgressEntry[];
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number; // 0-100
  lifeAreaId: string;
}

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  source: 'ai' | 'user';
  date: Date;
  lifeAreaId: string;
}

interface ProgressEntry {
  date: Date;
  score: number;
  notes?: string;
}
```

#### Default Life Areas
```typescript
const DEFAULT_LIFE_AREAS = [
  { id: 'career', name: 'Career & Work', description: 'Job satisfaction, professional growth', color: '#3B82F6', icon: '💼' },
  { id: 'finances', name: 'Finances', description: 'Financial security, money management', color: '#10B981', icon: '💰' },
  { id: 'health', name: 'Health & Fitness', description: 'Physical health, exercise, nutrition', color: '#EF4444', icon: '🏃‍♂️' },
  { id: 'relationships', name: 'Relationships', description: 'Family, friends, romantic relationships', color: '#F59E0B', icon: '❤️' },
  { id: 'personal-growth', name: 'Personal Growth', description: 'Learning, skills development', color: '#8B5CF6', icon: '📚' },
  { id: 'recreation', name: 'Recreation & Fun', description: 'Hobbies, entertainment, leisure', color: '#EC4899', icon: '🎮' },
  { id: 'spirituality', name: 'Spirituality', description: 'Faith, purpose, meaning', color: '#6366F1', icon: '🕊️' },
  { id: 'environment', name: 'Environment', description: 'Living space, surroundings', color: '#059669', icon: '🏠' }
];
```

## 👤 User Flow & Experience

### First-time User Journey
1. **Landing Page** → User sees app overview and "Try Now" button
2. **Try Experience** → No signup required, direct to entry choice
3. **Entry Type Selection** → User chooses Voice Entry, Text Entry, or Quick Check In
4. **Processing**:
   - **Voice/Text**: OpenAI Whisper + optional GPT-4 analysis
   - **Quick Check In**: Direct storage (no AI processing)
5. **Results Display** → Show transcription/analysis or check-in summary
6. **Save Prompt** → "Save your entry and unlock full features"
7. **Signup/Login** → User creates account or logs in (Email/password or Google)
8. **Data Transfer** → First entry automatically saved to permanent storage
9. **Wheel of Life** → Mandatory onboarding assessment with priority setting
10. **Full App Access** → All features unlocked

### Returning User Journey
1. **Login** → User authenticates (Email/password or Google)
2. **Dashboard** → Overview of recent entries and insights
3. **Full Features** → Access to all journaling and analysis features

### Guest User Limitations
- **One entry only** - Can create and analyze one journal entry
- **Temporary storage** - Data stored in session storage only
- **No persistence** - Data lost on browser close
- **Limited features** - No Wheel of Life, no entry history
- **No additional entries** - Must signup/login for more entries

## 🗂 App Routing Structure

### Page Routes
```
/                           # Home/Dashboard (with first-time user flow)
/try                        # First-time user experience
/analysis/[id]              # Analysis results (temporary)
/signup                     # User registration
/login                      # User login
/onboarding                 # Wheel of Life assessment (after signup)
/onboarding/wheel-of-life   # Wheel of Life setup
/journal                    # Journal entries list
/journal/new                # New journal entry
/journal/[id]               # Individual journal entry
/check-ins                  # Check-ins list
/check-ins/new              # New check-in
/check-ins/trends           # Check-in trends and analytics
/people                     # People mentioned list
/people/[id]                # Individual person profile
/finance                    # Finance overview
/finance/summary            # Financial summary and analytics
/finance/[id]               # Individual financial entry
/tasks                      # Tasks list
/tasks/[id]                 # Individual task details
/recaps                     # Recaps overview
/recaps/weekly              # Weekly recaps list
/recaps/monthly             # Monthly recaps list
/recaps/[id]                # Individual recap view
/soul-matrix                # SoulMatrix dashboard
/soul-matrix/evolution      # Personality evolution tracking
/wheel-of-life              # Wheel of Life dashboard
/wheel-of-life/[area]       # Individual life area page
/analysis                   # Analysis overview
/settings                   # App settings
```

### Life Area Routes
```
/wheel-of-life/career       # Career & Work
/wheel-of-life/finances     # Finances
/wheel-of-life/health       # Health & Fitness
/wheel-of-life/relationships # Relationships
/wheel-of-life/personal-growth # Personal Growth
/wheel-of-life/recreation   # Recreation & Fun
/wheel-of-life/spirituality # Spirituality
/wheel-of-life/environment  # Environment
```

## 🔧 Environment Variables
- `OPENAI_API_KEY`: OpenAI API key
- `NEXT_PUBLIC_APP_NAME`: Application name
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: NextAuth.js URL

## 🔐 Authentication System

### Authentication Methods
- **Email/Password**: Traditional signup and login
- **Google OAuth**: Social login using Google account
- **NextAuth.js**: Authentication framework for Next.js

### User Flow
1. **Guest User**: Can try one entry without authentication
2. **Signup Required**: After first entry analysis, user must signup/login
3. **Automatic Save**: First entry automatically transferred to user account
4. **Mandatory Onboarding**: Wheel of Life assessment required after signup
5. **Priority Setting**: User must set priorities for life areas during onboarding

## 🧠 SoulMatrix Update System

### Update Cycle
- **Frequency**: Every 24 hours
- **Trigger**: New unanalyzed journal entries
- **Process**: 
  1. Collect all journal entries since last SoulMatrix update
  2. Combine with previous SoulMatrix data
  3. Send to OpenAI for Big Five personality analysis
  4. Update personality traits and evolution tracking
  5. Store new SoulMatrix with timestamp

### Analysis Input for SoulMatrix
- **Previous SoulMatrix**: Current personality baseline
- **New Journal Entries**: All entries since last update
- **Check-in Data**: Wellness metrics correlation
- **Life Events**: Significant changes and milestones
- **Time Period**: 24-hour cycle data

### Personality Evolution Tracking
- **Trait Changes**: Monitor shifts in Big Five traits
- **Significant Events**: Link personality changes to life events
- **Trend Analysis**: Long-term personality development
- **Insights**: AI-generated insights about personality growth

## 👥 People Management System

### Individual Person Profile Features
- **Display Picture**: Profile photo upload and management
- **Picture Gallery**: Multiple photos with captions and dates
- **Relationship Management**: Define and track relationship types
- **Contact Details**: Multiple contact methods (email, phone, address)
- **Journal Mentions**: All journal entries mentioning this person
- **Relationship Analysis**: AI-powered insights about the relationship

### Contact Management
- **Multiple Contact Types**: Email, phone, address
- **Contact Labels**: Work, home, mobile, etc.
- **Primary Contact**: Designate primary contact method
- **Contact History**: Track communication frequency

### Relationship Analysis
- **Relationship Strength**: 0-100 scoring system
- **Quality Assessment**: Excellent, good, fair, poor
- **Trend Tracking**: Improving, declining, stable
- **AI Insights**: Personalized relationship recommendations
- **Communication Patterns**: Frequency and sentiment analysis

## 💰 Finance Management System

### Financial Entry Features
- **Amount & Currency**: Monetary values with currency support
- **Categories & Subcategories**: Detailed categorization
- **Recurring Patterns**: Daily, weekly, monthly, yearly
- **Priority Levels**: High, medium, low priority
- **Tags & Notes**: Custom tagging and detailed notes
- **Date Tracking**: Precise date and time recording

### Financial Summary & Analytics
- **Period Summaries**: Week, month, quarter, year views
- **Category Breakdown**: Spending by category analysis
- **Trend Analysis**: Income, expenses, savings trends
- **Net Worth Tracking**: Overall financial position
- **AI Insights**: Spending patterns and recommendations
- **Financial Goals**: Goal setting and progress tracking

### Data Visualization
- **Charts & Graphs**: Visual representation of financial data
- **Trend Lines**: Historical data analysis
- **Category Pie Charts**: Spending distribution
- **Income vs Expenses**: Comparative analysis
- **Savings Progress**: Goal achievement tracking

## ✅ Task Management System

### Task Features
- **Description**: Detailed task description
- **Start Date**: When the task begins
- **Deadline**: Due date and time
- **Dependencies**: Related tasks and dependencies
- **Categories**: Task categorization
- **Remarks**: Additional notes and comments
- **Completion Status**: Checkbox for task completion
- **Priority Levels**: High, medium, low priority

### Google Calendar Integration
- **Calendar Sync**: Add tasks to Google Calendar
- **Bidirectional Sync**: Updates reflect in both systems
- **Event Creation**: Automatic calendar event creation
- **Completion Sync**: Mark complete in both systems
- **Reminder Settings**: Calendar-based reminders
- **Availability Check**: Check calendar availability

### Task Management Features
- **Task Dependencies**: Blocking and required relationships
- **Task Categories**: Organize by project or type
- **Assignee Management**: Assign tasks to people
- **Progress Tracking**: Track completion progress
- **Task History**: Historical task data
- **Bulk Operations**: Multiple task management

## 🌟 Enhanced Processing Flow

### Step-by-Step Processing Experience
1. **Transcription Step**:
   - Animated progress indicator with wellness-themed visuals
   - Encouraging messages: "Listening to your thoughts..."
   - Show transcription result for user confirmation/editing
   - Option to retry if transcription fails

2. **Analysis Step** (if Full Analysis selected):
   - Animated analysis progress with calming animations
   - Encouraging messages: "Understanding your insights..."
   - Show extracted entities for user confirmation/editing
   - Entity linking options (existing vs new people)

3. **Confirmation Step**:
   - Review all processed data
   - Edit any extracted information
   - Final confirmation before saving

### Wellness-Focused Visual Design
- **Nature-Inspired Animations**: Gentle waves, flowing water, growing plants
- **Calming Color Palette**: Soft blues, greens, and earth tones
- **Mindfulness Messages**: Encouraging, supportive language
- **Breathing-Inspired Loading**: Gentle pulse animations
- **Progress Visualization**: Organic, flowing progress indicators

### Entity Confirmation Features
- **People Linking**: Choose from existing people or create new
- **Smart Suggestions**: AI-suggested matches for existing entities
- **Quick Edit**: Inline editing of extracted information
- **Bulk Operations**: Edit multiple entities at once
- **Validation**: Real-time validation of user edits

### Error Handling & Recovery
- **Graceful Failures**: Calming error messages with solutions
- **Retry Options**: Multiple retry attempts with different approaches
- **Draft Saving**: Save partial progress if processing fails
- **Manual Override**: Allow users to proceed with partial data
- **Recovery Options**: Resume processing from any step

## 📊 Monthly & Weekly Recap System

### Recap Content & Data Sources

#### People Insights
- **New People Met**: First-time mentions in journal entries
- **Most Mentioned**: People with highest frequency
- **Relationship Changes**: Sentiment shifts and interaction patterns
- **Social Network Growth**: Expanding connections and relationships
- **Communication Patterns**: Frequency and quality of interactions

#### Financial Insights
- **Spending Patterns**: Category breakdown and trends
- **Income Tracking**: Revenue sources and stability
- **Budget vs Actual**: Goal achievement and overspending areas
- **Financial Goals**: Progress towards savings and investment targets
- **Recurring Expenses**: Subscription and regular payment analysis

#### Emotional & Wellness Insights
- **Mood Trends**: Emotional patterns and fluctuations
- **Energy Levels**: Daily and weekly energy patterns
- **Stress Indicators**: High-stress periods and triggers
- **Sleep Quality**: Sleep patterns and correlations
- **Movement Patterns**: Physical activity and exercise trends

#### Task & Productivity Insights
- **Completed Tasks**: Achievement tracking and productivity
- **Goal Progress**: Progress towards personal and professional goals
- **Time Management**: How time was spent and efficiency
- **Priority Alignment**: Focus on high-priority activities
- **Productivity Patterns**: Best performing days and times

#### Journal & Reflection Insights
- **Writing Patterns**: Frequency and consistency
- **Topics Covered**: Most discussed themes and subjects
- **Insights Discovered**: Key learnings and revelations
- **Growth Areas**: Personal development and learning
- **Reflection Quality**: Depth and meaningfulness of entries

#### SoulMatrix Evolution
- **Personality Changes**: Shifts in Big Five traits
- **Growth Areas**: Traits showing improvement
- **Stability Patterns**: Consistent personality aspects
- **Life Event Impact**: How events affected personality
- **Self-Awareness**: Increased understanding of self

#### Wheel of Life Progress
- **Life Area Scores**: Changes in satisfaction levels
- **Balance Improvements**: Better life area distribution
- **Priority Achievement**: Progress on high-priority areas
- **Neglected Areas**: Areas needing attention
- **Overall Life Satisfaction**: Holistic well-being trends

### Story-Format Narrative Structure

#### Weekly Recap Story
1. **Opening**: "This week, you focused on..."
2. **People Chapter**: "Your social connections..."
3. **Finance Chapter**: "Your financial journey..."
4. **Wellness Chapter**: "Your emotional well-being..."
5. **Productivity Chapter**: "Your achievements and goals..."
6. **Insights Chapter**: "Key learnings and discoveries..."
7. **Life Areas Chapter**: "Your life balance progress..."
8. **Closing**: "Looking ahead to next week..."

#### Monthly Recap Story
1. **Monthly Overview**: "This month, you experienced..."
2. **Growth Chapters**: Deep dive into each life area
3. **Achievement Highlights**: Major accomplishments
4. **Challenge Reflections**: Overcoming difficulties
5. **Pattern Recognition**: Long-term trends and insights
6. **Future Planning**: Goals and intentions for next month

### Interactive Elements

#### Clickable Sections
- **Deep Dive**: Expand any section for detailed analysis
- **Historical Comparison**: Compare with previous periods
- **Trend Visualization**: Interactive charts and graphs
- **Goal Tracking**: Progress towards specific goals
- **Insight Details**: Expand AI-generated insights

#### Engagement Features
- **Achievement Badges**: Milestones and accomplishments
- **Progress Celebrations**: Recognition of improvements
- **Personalized Messages**: Encouraging, supportive language
- **Interactive Charts**: Hover for details, click for actions
- **Share Options**: Export or share recaps

### AI-Generated Insights & Recommendations

#### Personalized Insights
- **Pattern Recognition**: AI identifies recurring themes
- **Correlation Analysis**: Links between different life areas
- **Growth Opportunities**: Areas for improvement
- **Strength Recognition**: Acknowledgment of progress
- **Personalized Language**: Tailored to user's communication style

#### Actionable Recommendations
- **Specific Actions**: Concrete steps for improvement
- **Goal Setting**: Suggested goals for next period
- **Habit Formation**: Recommendations for new habits
- **Time Management**: Suggestions for better scheduling
- **Relationship Building**: Ways to strengthen connections

#### Life Area Improvement Nudges
- **Priority-Based**: Focus on high-priority life areas
- **Gentle Reminders**: Encouraging, not pushy
- **Specific Suggestions**: Actionable improvement ideas
- **Progress Recognition**: Acknowledgment of efforts
- **Future Planning**: Preparation for upcoming challenges

### Visual Design & Engagement

#### Wellness-Focused Presentation
- **Celebration Design**: Positive, encouraging visuals
- **Achievement Highlights**: Prominent display of accomplishments
- **Progress Visualization**: Beautiful charts and graphs
- **Storytelling Elements**: Narrative flow with supporting visuals
- **Interactive Animations**: Engaging, calming animations

#### Practical Features
- **Export Options**: PDF, image, or shareable formats
- **Reminder System**: Notifications when recaps are ready
- **Customization**: User preferences for recap content
- **Historical Access**: View past recaps anytime
- **Goal Integration**: Link recaps to personal goals

### Frequency & Timing
- **Weekly Recaps**: Generated every Sunday evening
- **Monthly Recaps**: Generated on the first day of each month
- **On-Demand**: Generate recaps for any time period
- **Notification System**: Gentle reminders to view recaps
- **Archive System**: Access to all historical recaps

## 🗄️ Database Design (SQLite3)

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  google_id TEXT,
  avatar_url TEXT,
  settings TEXT -- JSON string for user preferences
);
```

#### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT,
  audio_url TEXT,
  transcription TEXT,
  processing_type TEXT CHECK(processing_type IN ('transcribe-only', 'full-analysis')),
  processing_status TEXT CHECK(processing_status IN ('draft', 'transcribed', 'analyzed', 'completed')),
  user_confirmed_transcription BOOLEAN DEFAULT FALSE,
  user_confirmed_analysis BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Analysis Results Table
```sql
CREATE TABLE analysis_results (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL,
  sentiment_analysis TEXT, -- JSON string
  people_mentioned TEXT, -- JSON string
  finance_cues TEXT, -- JSON string
  tasks_mentioned TEXT, -- JSON string
  locations TEXT, -- JSON string
  temporal_references TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
);
```

#### Check Ins Table
```sql
CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  energy INTEGER CHECK(energy >= 1 AND energy <= 10),
  movement INTEGER CHECK(movement >= 1 AND movement <= 10),
  sleep_hours INTEGER,
  sleep_minutes INTEGER,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### People Table
```sql
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_picture TEXT,
  relationship TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Contact Details Table
```sql
CREATE TABLE contact_details (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('email', 'phone', 'address')),
  value TEXT NOT NULL,
  label TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);
```

#### Finance Entries Table
```sql
CREATE TABLE finance_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT,
  priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
  tags TEXT, -- JSON string
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')),
  priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
  start_date DATE,
  deadline DATE,
  category TEXT,
  assignee TEXT,
  remarks TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATETIME,
  google_calendar_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### SoulMatrix Table
```sql
CREATE TABLE soul_matrix (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  traits TEXT NOT NULL, -- JSON string for Big Five traits
  confidence DECIMAL(3,2) CHECK(confidence >= 0 AND confidence <= 1),
  analyzed_entries TEXT, -- JSON string of entry IDs
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  next_update DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Wheel of Life Table
```sql
CREATE TABLE wheel_of_life (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  life_areas TEXT NOT NULL, -- JSON string for life areas
  priorities TEXT, -- JSON string for priority order
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Recaps Table
```sql
CREATE TABLE recaps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content TEXT NOT NULL, -- JSON string for recap data
  insights TEXT, -- JSON string for AI insights
  recommendations TEXT, -- JSON string for actionable recommendations
  life_area_improvements TEXT, -- JSON string for life area nudges
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  viewed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Database Features
- **ACID Compliance**: Full transaction support
- **Data Integrity**: Foreign key constraints and check constraints
- **Performance**: Indexed queries for fast retrieval
- **Backup**: Automatic backup and recovery
- **Encryption**: Optional database encryption for sensitive data

## 🎨 UI/UX Design System

### Design Philosophy
- **Minimalism**: Clean, uncluttered interfaces with ample white space
- **Wellness-Focused**: Calming, supportive visual language
- **Accessibility**: Inclusive design for all users
- **Responsive**: Seamless experience across all devices

### Color Palette

#### Light Theme
- **Primary**: Sage Green (#9CAF88) - Calming, natural
- **Secondary**: Soft Blue (#A8C6DF) - Peaceful, trustworthy
- **Accent**: Warm Beige (#F5F1E8) - Comforting, neutral
- **Text**: Charcoal (#2C3E50) - Readable, not harsh
- **Background**: Pure White (#FFFFFF) - Clean, spacious
- **Surface**: Light Gray (#F8F9FA) - Subtle depth

#### Dark Theme
- **Primary**: Muted Sage (#7A8B6A) - Softer in dark mode
- **Secondary**: Deep Blue (#5A7A9A) - Rich, calming
- **Accent**: Warm Taupe (#8B7355) - Comforting in dark
- **Text**: Soft White (#F8F9FA) - Easy on eyes
- **Background**: Deep Charcoal (#1A1A1A) - Not pure black
- **Surface**: Medium Gray (#2D2D2D) - Subtle contrast

### Typography

#### Font Stack
- **Headings**: "Playfair Display", serif - Elegant, trustworthy
- **Body**: "Inter", sans-serif - Clean, highly readable
- **Monospace**: "JetBrains Mono" - For code/technical content

#### Font Sizes
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Subsection headers
- **H4**: 1.25rem (20px) - Card titles
- **Body**: 1rem (16px) - Main content
- **Small**: 0.875rem (14px) - Captions, metadata

### Spacing System
- **4px**: Tiny spacing (between related elements)
- **8px**: Small spacing (between elements in a group)
- **16px**: Medium spacing (between sections)
- **24px**: Large spacing (between major sections)
- **32px**: Extra large spacing (page margins)
- **48px**: Huge spacing (between pages)

### Component Design

#### Cards
- **Border Radius**: 12px - Soft, friendly
- **Shadow**: Subtle drop shadow (0 2px 8px rgba(0,0,0,0.1))
- **Padding**: 24px - Comfortable breathing room
- **Background**: White/Light Gray - Clean surface

#### Buttons
- **Primary**: Sage green background, white text
- **Secondary**: Transparent with sage border
- **Tertiary**: Text-only with hover effects
- **Border Radius**: 8px - Consistent with cards
- **Padding**: 12px 24px - Comfortable touch targets

#### Input Fields
- **Border**: 1px solid light gray
- **Focus**: Sage green border with subtle glow
- **Border Radius**: 8px - Consistent with buttons
- **Padding**: 12px 16px - Comfortable text input

### Animation & Interactions

#### Micro-interactions
- **Hover Effects**: Subtle scale (1.02) and shadow increase
- **Focus States**: Gentle glow and border color change
- **Loading States**: Smooth skeleton screens
- **Transitions**: 200ms ease-in-out for all interactions

#### Wellness Animations
- **Breathing Effect**: Gentle pulse for loading states
- **Nature Flow**: Smooth wave animations for progress
- **Gentle Fade**: Soft transitions between states
- **Mindful Loading**: Calming, non-distracting animations

### Layout Principles

#### Grid System
- **12-column grid**: Flexible, responsive layout
- **Gutters**: 24px between columns
- **Margins**: 32px on desktop, 16px on mobile
- **Breakpoints**: Mobile-first responsive design

#### Content Hierarchy
- **Clear Visual Flow**: Logical reading order
- **Consistent Spacing**: Predictable layout patterns
- **Focused Content**: One primary action per screen
- **Progressive Disclosure**: Show details when needed

### Accessibility Features
- **Color Contrast**: WCAG AA compliant (4.5:1 ratio)
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Focus Indicators**: Clear focus states for all interactive elements
- **Text Scaling**: Support for up to 200% text scaling

## 🔐 Security & Privacy Considerations

### Data Protection
- [ ] Local storage encryption
- [ ] API key secure storage
- [ ] No sensitive data logging
- [ ] GDPR compliance
- [ ] Data export/deletion options
- [ ] OAuth token security
- [ ] Password hashing and salting

### User Privacy
- [ ] No data collection without consent
- [ ] Clear privacy policy
- [ ] Data retention policies
- [ ] User control over data

## 📊 Performance Considerations

### Optimization Strategies
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Audio compression
- [ ] Caching strategies
- [ ] Bundle size optimization

### Monitoring
- [ ] Performance metrics tracking
- [ ] Error monitoring
- [ ] User analytics (privacy-compliant)
- [ ] API usage monitoring

## 🚀 Deployment Strategy

### Platform Options
1. **Vercel** (Recommended for Next.js)
2. **Netlify** (Alternative)
3. **AWS Amplify** (Enterprise)

### Environment Setup
- [ ] Development environment
- [ ] Staging environment
- [ ] Production environment
- [ ] CI/CD pipeline

## 📝 Next Steps

1. **Finalize Technology Stack** - Confirm framework and tool choices
2. **Design System** - Create UI/UX mockups and design system
3. **API Planning** - Define exact API endpoints and data structures
4. **Database Schema** - Plan local storage structure
5. **Security Review** - Finalize security measures
6. **Development Timeline** - Create detailed sprint planning

---

**Status**: 📋 Planning Phase Complete
## ✅ COMPLETED FEATURES

### Phase 1: Foundation ✅
- [x] Project setup and configuration (Next.js 14, TypeScript, Tailwind CSS)
- [x] SQLite3 database setup and schema implementation
- [x] Design system implementation (wellness-focused colors, typography, spacing)
- [x] Basic UI components and layout
- [x] Routing and navigation
- [x] Responsive design implementation
- [x] Basic state management
- [x] First-time user experience flow
- [x] Session storage implementation
- [x] User authentication system (Email/password + Google OAuth)
- [x] NextAuth.js integration
- [x] Database schema with all required tables
- [x] API endpoints for authentication, journal entries, and check-ins

### Phase 2: Core Features ✅
- [x] Voice recording implementation (VoiceRecorder component)
- [x] Text input with rich editor (TextEditor component)
- [x] Entry type selection (Voice/Text/Quick Check In)
- [x] Processing options selection (Transcribe Only vs Full Analysis)
- [x] Quick Check In implementation (QuickCheckIn component)
- [x] OpenAI Whisper API integration (whisper.ts)
- [x] Enhanced processing flow with step-by-step confirmation
- [x] Wellness-themed animations and visual feedback
- [x] Error handling and retry mechanisms
- [x] Entry creation and storage
- [x] Entry display and management
- [x] Journal entries list page with filtering and search
- [x] Journal entry detail page with analysis display
- [x] Dashboard with recent activity and quick actions

### Authentication System ✅
- [x] Email/password registration and login
- [x] Google OAuth integration
- [x] Password hashing with bcryptjs
- [x] Session management with NextAuth.js
- [x] Protected routes and authentication guards
- [x] User profile management

### Database Implementation ✅
- [x] SQLite3 database with comprehensive schema
- [x] Users table with password support
- [x] Journal entries table with processing status
- [x] Analysis results table for AI insights
- [x] Check-ins table for wellness tracking
- [x] People, finance, tasks, and other entity tables
- [x] SoulMatrix and Wheel of Life tables
- [x] Recaps table for weekly/monthly summaries

### API Endpoints ✅
- [x] Authentication endpoints (signup, login, OAuth)
- [x] Journal entries CRUD operations
- [x] Check-ins CRUD operations
- [x] Individual entry retrieval with analysis
- [x] User data management

### UI Components ✅
- [x] VoiceRecorder with audio visualization
- [x] TextEditor with auto-save and formatting
- [x] QuickCheckIn with mood and wellness tracking
- [x] Wellness-focused design system
- [x] Responsive layouts and animations
- [x] Loading states and error handling

## 🚧 IN PROGRESS

### Phase 3: AI Integration (Complete ✅)
- [x] OpenAI Whisper API integration for transcription
- [x] Individual entity extraction system design
- [x] Hardcoded prompts for all entity types
- [x] OpenAI service with retry mechanisms
- [x] Environment variables setup (.env.local)
- [x] OpenAI API key configuration
- [x] Analysis processing API endpoint (/api/journal/analyze)
- [x] SoulMatrix implementation (Big Five personality analysis)
- [x] SoulMatrix dashboard with personality insights
- [x] SoulMatrix API endpoints (GET and UPDATE)
- [x] Integration with journal entry creation flow
- [x] Wheel of Life onboarding assessment
- [x] Wheel of Life dashboard with life balance insights
- [x] Wheel of Life API endpoints (GET, POST, PUT)
- [x] Voice feature extraction with Librosa (basic structure ready)
- [x] Life area categorization and scoring
- [x] Wheel of Life automatic updates
- [x] Analysis results display with individual object views
- [x] Complete OpenAI GPT-4 integration for analysis
- [x] Add missing database methods (deletePerson, deleteFinanceEntry, deleteTask, updateFinanceEntry)
- [x] Implement DELETE API endpoints for People, Finance, and Tasks
- [x] Add delete functionality to UI components

## 📋 REMAINING FEATURES

### Phase 3: AI Integration (Complete ✅)
- [x] Complete OpenAI GPT-4 integration for analysis
- [x] Implement voice feature extraction (basic structure ready)
- [x] Add analysis processing queue and background jobs
- [x] Implement entity confirmation and editing interface

### Phase 4: Enhancement (Partially Complete)
- [x] Wheel of Life dashboard and individual area pages
- [x] Progress tracking and visualization (dashboard widgets, charts, trends)
- [x] Goal setting and tracking within life areas (CRUD operations, life area integration, progress tracking)
- [x] Priority-based insights and recommendations (AI-powered analysis, actionable recommendations, priority filtering)
- [x] Check-in trends and analytics (dashboard widgets)
- [x] Dashboard widgets for check-ins
- [x] Correlation analysis between check-ins and journal entries (mood, energy, sleep correlations, content patterns, trend analysis)
- [x] SoulMatrix dashboard and personality insights
- [x] Personality evolution visualization (trait evolution tracking, life events impact, growth areas, stability metrics)
- [x] People management system with profiles
- [x] Finance management with summaries and analytics
- [x] Task management with Google Calendar integration
- [x] Comprehensive analysis dashboard
- [x] Monthly and Weekly recap system (automated recap generation, story format narratives, insights and recommendations)
- [x] Story-format narrative recaps (multiple story formats, interactive timeline, character analysis, journey chapters, reflection questions)
- [x] AI-generated insights and actionable recommendations (enhanced AI analysis, confidence scores, impact levels, predictive insights, growth opportunities)
- [x] Life area improvement nudges (intelligent nudges, priority-based recommendations, interactive actions, progress analytics)
- [ ] Advanced features (search, filter, export)
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Deployment preparation

### Additional Features Needed
- [x] Environment variables setup (.env.local)
- [x] OpenAI API key configuration
- [ ] Google OAuth credentials setup
- [x] Error boundary implementation
- [x] Loading states for all async operations
- [x] Form validation and error handling
- [ ] Accessibility improvements
- [ ] Mobile responsiveness testing
- [ ] Security hardening
- [ ] Performance monitoring
- [x] User onboarding flow
- [x] Profile settings page
- [x] Data export functionality
- [ ] Backup and restore features

## 🎯 NEXT PRIORITIES

1. **Complete AI Integration**: Finish OpenAI GPT-4 integration and analysis processing
2. **Voice Feature Extraction**: Implement Librosa for voice analysis
3. **UI Structure & Polish**: Improve overall UI structure and user experience
4. **Testing & Performance**: Fix bugs, optimize loading times, add error handling
5. **Advanced Features**: Monthly/weekly recaps, story-format narratives

**Current Status**: Core journaling functionality complete, AI integration complete, Wheel of Life, People, Finance, Tasks, and Analysis complete
**Next Action**: Focus on UI improvements and Phase 4 enhancements 
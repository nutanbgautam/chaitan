# Supabase Migration Guide for Chaitan Journaling App

## 🚀 **Step-by-Step Migration to Supabase**

### **Step 1: Create Supabase Project**

1. **Go to Supabase**: https://supabase.com
2. **Sign up/Login** with your GitHub account
3. **Create New Project**:
   - Click "New Project"
   - Choose your organization
   - **Project Name**: `chaitan-journaling`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - Click "Create new project"

### **Step 2: Get Supabase Credentials**

1. **Go to Settings** → **API** in your Supabase dashboard
2. **Copy these values**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Step 3: Install Supabase Dependencies**

```bash
cd journaling-app
npm install @supabase/supabase-js
```

### **Step 4: Create Database Schema**

1. **Go to SQL Editor** in Supabase dashboard
2. **Run this SQL** to create all tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  audio_url TEXT,
  transcription TEXT,
  processing_type TEXT CHECK(processing_type IN ('transcribe-only', 'full-analysis')),
  processing_status TEXT CHECK(processing_status IN ('draft', 'transcribed', 'analyzed', 'completed')),
  user_confirmed_transcription BOOLEAN DEFAULT FALSE,
  user_confirmed_analysis BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  sentiment_analysis TEXT,
  people_mentioned TEXT,
  finance_cues TEXT,
  tasks_mentioned TEXT,
  locations TEXT,
  temporal_references TEXT,
  life_areas TEXT,
  insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  energy TEXT,
  movement INTEGER CHECK(movement >= 1 AND movement <= 10),
  sleep_hours INTEGER,
  sleep_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- People table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_picture TEXT,
  relationship TEXT,
  context TEXT,
  sentiment TEXT,
  frequency INTEGER DEFAULT 0,
  last_mentioned TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance entries table
CREATE TABLE IF NOT EXISTS finance_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT,
  priority TEXT DEFAULT 'medium',
  tags TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  deadline DATE,
  category TEXT DEFAULT 'general',
  assignee TEXT,
  remarks TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'manual',
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  life_area_id TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nudge interactions table
CREATE TABLE IF NOT EXISTS nudge_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nudge_id TEXT NOT NULL,
  action TEXT NOT NULL,
  feedback TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Soul matrix table
CREATE TABLE IF NOT EXISTS soul_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  traits TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0,
  analyzed_entries TEXT,
  next_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wheel of life table
CREATE TABLE IF NOT EXISTS wheel_of_life (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_areas JSONB NOT NULL,
  priorities JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recaps table
CREATE TABLE IF NOT EXISTS recaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('weekly', 'monthly')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content TEXT NOT NULL,
  insights TEXT,
  recommendations TEXT,
  life_area_improvements TEXT,
  metrics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at);
CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_entries_user_id ON finance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_soul_matrix_user_id ON soul_matrix(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_of_life_user_id ON wheel_of_life(user_id);
CREATE INDEX IF NOT EXISTS idx_recaps_user_id ON recaps(user_id);
```

### **Step 5: Create Supabase Client**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for server-side operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for client-side operations (with anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### **Step 6: Update Environment Variables**

Add to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep existing variables
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
```

### **Step 7: Update Vercel Environment Variables**

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add these variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### **Step 8: Create Database Service**

Create `src/lib/supabase-database.ts`:

```typescript
import { supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseDatabase {
  // User operations
  async createUser(user: { email: string; name?: string; avatarUrl?: string }) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: uuidv4(),
        email: user.email,
        name: user.name,
        avatar_url: user.avatarUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  // Journal entries
  async createJournalEntry(entry: {
    userId: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
    processingType: 'transcribe-only' | 'full-analysis';
    processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  }) {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        id: uuidv4(),
        user_id: entry.userId,
        content: entry.content,
        audio_url: entry.audioUrl,
        transcription: entry.transcription,
        processing_type: entry.processingType,
        processing_status: entry.processingStatus
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getJournalEntriesByUserId(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async getJournalEntryById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updateJournalEntry(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Check-ins
  async createCheckIn(checkIn: {
    userId: string;
    mood: string;
    energy: string;
    movement: number;
    sleepHours: number;
    sleepMinutes: number;
    note?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .insert({
        id: uuidv4(),
        user_id: checkIn.userId,
        mood: checkIn.mood,
        energy: checkIn.energy,
        movement: checkIn.movement,
        sleep_hours: checkIn.sleepHours,
        sleep_minutes: checkIn.sleepMinutes,
        note: checkIn.note
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getCheckInsByUserId(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // People
  async createPerson(person: {
    userId: string;
    name: string;
    displayPicture?: string;
    relationship?: string;
    context?: string;
    sentiment?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('people')
      .insert({
        id: uuidv4(),
        user_id: person.userId,
        name: person.name,
        display_picture: person.displayPicture,
        relationship: person.relationship,
        context: person.context,
        sentiment: person.sentiment
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getPeopleByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('people')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Tasks
  async createTask(task: {
    userId: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    startDate?: string;
    deadline?: string;
    category?: string;
    assignee?: string;
    remarks?: string;
    source?: string;
    journalEntryId?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        id: uuidv4(),
        user_id: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        start_date: task.startDate,
        deadline: task.deadline,
        category: task.category,
        assignee: task.assignee,
        remarks: task.remarks,
        source: task.source,
        journal_entry_id: task.journalEntryId
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getTasksByUserId(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async updateTask(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Wheel of Life
  async createWheelOfLife(wheelOfLife: {
    userId: string;
    lifeAreas: string;
    priorities?: string | null;
    isCompleted?: boolean;
  }) {
    const { data, error } = await supabaseAdmin
      .from('wheel_of_life')
      .insert({
        id: uuidv4(),
        user_id: wheelOfLife.userId,
        life_areas: wheelOfLife.lifeAreas,
        priorities: wheelOfLife.priorities,
        is_completed: wheelOfLife.isCompleted
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getWheelOfLifeByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('wheel_of_life')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateWheelOfLife(userId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('wheel_of_life')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analysis results
  async createAnalysisResult(result: {
    journalEntryId: string;
    sentimentAnalysis?: string;
    peopleMentioned?: string;
    financeCues?: string;
    tasksMentioned?: string;
    locations?: string;
    temporalReferences?: string;
    lifeAreas?: string;
    insights?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('analysis_results')
      .insert({
        id: uuidv4(),
        journal_entry_id: result.journalEntryId,
        sentiment_analysis: result.sentimentAnalysis,
        people_mentioned: result.peopleMentioned,
        finance_cues: result.financeCues,
        tasks_mentioned: result.tasksMentioned,
        locations: result.locations,
        temporal_references: result.temporalReferences,
        life_areas: result.lifeAreas,
        insights: result.insights
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getAnalysisResultByJournalEntryId(journalEntryId: string) {
    const { data, error } = await supabaseAdmin
      .from('analysis_results')
      .select('*')
      .eq('journal_entry_id', journalEntryId)
      .single();

    if (error) return null;
    return data;
  }
}

// Singleton instance
let supabaseDatabaseInstance: SupabaseDatabase | null = null;

export function getSupabaseDatabase(): SupabaseDatabase {
  if (!supabaseDatabaseInstance) {
    supabaseDatabaseInstance = new SupabaseDatabase();
  }
  return supabaseDatabaseInstance;
}
```

### **Step 9: Update Database Import**

Update `src/lib/database.ts` to use Supabase in production:

```typescript
import { getSupabaseDatabase } from './supabase-database';

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

export function getDatabase() {
  if (isVercel || isProduction) {
    // Use Supabase in production/Vercel
    return getSupabaseDatabase();
  } else {
    // Use SQLite in development
    return getSQLiteDatabase();
  }
}

// Keep your existing SQLite implementation for development
function getSQLiteDatabase() {
  // Your existing SQLite database implementation
  // ... (keep your existing code)
}
```

### **Step 10: Update API Routes**

Update your API routes to use the new database interface. For example:

```typescript
// src/app/api/check-ins/route.ts
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDatabase();
    
    const checkInId = await db.createCheckIn({
      userId: session.user.id,
      mood: body.mood,
      energy: body.energy,
      movement: body.movement,
      sleepHours: body.sleepHours,
      sleepMinutes: body.sleepMinutes,
      note: body.note
    });

    return NextResponse.json({ id: checkInId }, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
```

### **Step 11: Test Locally**

```bash
npm run dev
```

### **Step 12: Deploy to Vercel**

```bash
git add .
git commit -m "Migrate to Supabase database"
git push origin main
```

Vercel will automatically redeploy with the new database.

### **Step 13: Verify Deployment**

1. **Check Vercel logs** for any errors
2. **Test authentication** on your live site
3. **Create a test journal entry** to verify data persistence

## 🎯 **Benefits of Supabase Migration:**

- ✅ **Persistent Data**: Data survives between requests
- ✅ **Production Ready**: Suitable for real users
- ✅ **Scalable**: Handles multiple users
- ✅ **Real-time**: Can add real-time features later
- ✅ **Backup**: Automatic backups
- ✅ **Security**: Row Level Security (RLS)

## 🚨 **Important Notes:**

1. **Data Migration**: Existing data in SQLite won't automatically transfer
2. **Authentication**: You may need to update NextAuth configuration
3. **Testing**: Test thoroughly before going live
4. **Backup**: Always backup your data

## 📞 **Need Help?**

- **Supabase Docs**: https://supabase.com/docs
- **Discord**: Join Supabase Discord for support
- **Issues**: Check GitHub for common problems

---

**Your app will now have persistent data storage on Vercel! 🎉** 
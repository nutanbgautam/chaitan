import { supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseDatabase {
  constructor() {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized. Please check your environment variables.');
    }
  }

  // User operations
  async createUser(user: { email: string; name?: string; avatarUrl?: string }) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getUserByEmail(email: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  async getUserByGoogleId(googleId: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('google_id', googleId)
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updateJournalEntry(id: string, updates: any) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('people')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updatePerson(id: string, updates: any) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('people')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePerson(id: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { error } = await supabaseAdmin
      .from('people')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async getTaskById(id: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updateTask(id: string, updates: any) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Finance entries
  async createFinanceEntry(entry: {
    userId: string;
    amount: number;
    currency: string;
    category: string;
    subcategory?: string;
    description: string;
    date: string;
    recurring?: boolean;
    recurringPattern?: string;
    priority: string;
    tags?: string;
    notes?: string;
    source?: string;
    journalEntryId?: string;
  }) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('finance_entries')
      .insert({
        id: uuidv4(),
        user_id: entry.userId,
        amount: entry.amount,
        currency: entry.currency,
        category: entry.category,
        subcategory: entry.subcategory,
        description: entry.description,
        date: entry.date,
        recurring: entry.recurring,
        recurring_pattern: entry.recurringPattern,
        priority: entry.priority,
        tags: entry.tags,
        notes: entry.notes,
        source: entry.source,
        journal_entry_id: entry.journalEntryId
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getFinanceEntriesByUserId(userId: string, limit = 50, offset = 0) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('finance_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // Goals
  async createGoal(goal: {
    userId: string;
    title: string;
    description: string;
    targetDate: string;
    lifeAreaId: string;
    priority: string;
    category: string;
    status: string;
    progress: number;
  }) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('goals')
      .insert({
        id: uuidv4(),
        user_id: goal.userId,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate,
        life_area_id: goal.lifeAreaId,
        priority: goal.priority,
        category: goal.category,
        status: goal.status,
        progress: goal.progress
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getGoalsByUserId(userId: string, limit = 50, offset = 0) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async updateGoal(id: string, updates: any) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('goals')
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('wheel_of_life')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateWheelOfLife(userId: string, updates: any) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
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
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('analysis_results')
      .select('*')
      .eq('journal_entry_id', journalEntryId)
      .single();

    if (error) return null;
    return data;
  }

  // Recaps
  async createRecap(recap: {
    userId: string;
    type: 'weekly' | 'monthly';
    periodStart: string;
    periodEnd: string;
    content: string;
    insights?: string;
    recommendations?: string;
    lifeAreaImprovements?: string;
    metrics?: string;
  }) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('recaps')
      .insert({
        id: uuidv4(),
        user_id: recap.userId,
        type: recap.type,
        period_start: recap.periodStart,
        period_end: recap.periodEnd,
        content: recap.content,
        insights: recap.insights,
        recommendations: recap.recommendations,
        life_area_improvements: recap.lifeAreaImprovements,
        metrics: recap.metrics
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getRecapsByUserId(userId: string, type?: 'weekly' | 'monthly', limit = 20, offset = 0) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    let query = supabaseAdmin
      .from('recaps')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // Soul Matrix
  async createSoulMatrix(soulMatrix: {
    userId: string;
    traits: string;
    confidence: number;
    analyzedEntries?: string;
    nextUpdate?: string;
  }) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('soul_matrix')
      .insert({
        id: uuidv4(),
        user_id: soulMatrix.userId,
        traits: soulMatrix.traits,
        confidence: soulMatrix.confidence,
        analyzed_entries: soulMatrix.analyzedEntries,
        next_update: soulMatrix.nextUpdate
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getSoulMatrixByUserId(userId: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('soul_matrix')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateSoulMatrix(userId: string, updates: any) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('soul_matrix')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Nudge interactions
  async saveNudgeInteraction(data: {
    userId: string;
    nudgeId: string;
    action: string;
    feedback?: string;
    timestamp: string;
  }) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { error } = await supabaseAdmin
      .from('nudge_interactions')
      .insert({
        id: uuidv4(),
        user_id: data.userId,
        nudge_id: data.nudgeId,
        action: data.action,
        feedback: data.feedback,
        timestamp: data.timestamp
      });

    if (error) throw error;
  }

  async getNudgeInteractions(userId: string) {
    if (!supabaseAdmin) throw new Error('Supabase client not available');
    
    const { data, error } = await supabaseAdmin
      .from('nudge_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
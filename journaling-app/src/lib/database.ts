import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { getSupabaseDatabase } from './supabase-database';

// Database types
interface DatabaseInstance {
  db?: Database.Database;
  init?: () => void;
  close?: () => void;
}

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

let dbPath: string;
let dbDir: string;

if (isVercel) {
  // In Vercel, we can't write to filesystem, so we'll use in-memory database
  // Note: This means data will be lost between function invocations
  console.warn('⚠️  Running in Vercel environment - using in-memory database. Data will not persist between requests.');
  dbPath = ':memory:';
} else {
  // In development or other environments, use file-based database
  dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  dbPath = path.join(dbDir, 'journaling-app.db');
}

class SQLiteDatabase implements DatabaseInstance {
  db: Database.Database;

  constructor() {
    try {
      this.db = new Database(dbPath);
      this.init();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      if (isVercel) {
        throw new Error('Database initialization failed in Vercel environment. Consider using a cloud database service like PlanetScale, Supabase, or Neon for production deployments.');
      }
      throw error;
    }
  }

  init() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        google_id TEXT,
        avatar_url TEXT,
        settings TEXT
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
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

      CREATE TABLE IF NOT EXISTS analysis_results (
        id TEXT PRIMARY KEY,
        journal_entry_id TEXT NOT NULL,
        entities TEXT,
        sentiment TEXT,
        topics TEXT,
        summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mood INTEGER CHECK(mood >= 1 AND mood <= 10),
        energy INTEGER CHECK(energy >= 1 AND energy <= 10),
        stress INTEGER CHECK(stress >= 1 AND stress <= 10),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT,
        display_picture TEXT,
        context TEXT,
        sentiment TEXT,
        frequency INTEGER DEFAULT 0,
        last_mentioned DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS finance_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT DEFAULT 'other',
        type TEXT CHECK(type IN ('income', 'expense')) DEFAULT 'expense',
        date TEXT,
        journal_entry_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        due_date TEXT,
        journal_entry_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'personal',
        target_date TEXT,
        progress INTEGER DEFAULT 0,
        status TEXT CHECK(status IN ('active', 'completed', 'paused')) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS soul_matrix (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        physical_health INTEGER DEFAULT 5,
        mental_health INTEGER DEFAULT 5,
        emotional_health INTEGER DEFAULT 5,
        spiritual_health INTEGER DEFAULT 5,
        social_health INTEGER DEFAULT 5,
        financial_health INTEGER DEFAULT 5,
        career_health INTEGER DEFAULT 5,
        environmental_health INTEGER DEFAULT 5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS wheel_of_life (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        career INTEGER DEFAULT 5,
        finances INTEGER DEFAULT 5,
        health INTEGER DEFAULT 5,
        family INTEGER DEFAULT 5,
        relationships INTEGER DEFAULT 5,
        personal_growth INTEGER DEFAULT 5,
        recreation INTEGER DEFAULT 5,
        spirituality INTEGER DEFAULT 5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS recaps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        period_start TEXT,
        period_end TEXT,
        content TEXT,
        category TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS nudge_interactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        nudge_type TEXT,
        interaction_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  // User operations
  createUser(user: { email: string; name?: string; password?: string; googleId?: string; avatarUrl?: string }): string {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, password, google_id, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, user.email, user.name || null, user.password || null, user.googleId || null, user.avatarUrl || null);
    return id;
  }

  getUserById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as any;
  }

  getUserByEmail(email: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as any;
  }

  getUserByGoogleId(googleId: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE google_id = ?');
    return stmt.get(googleId) as any;
  }

  getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as any[];
  }

  updateUser(id: string, updates: Partial<{ name: string; avatarUrl: string; settings: string }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  // Journal entry operations
  createJournalEntry(entry: {
    userId: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
    processingType: 'transcribe-only' | 'full-analysis';
    processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO journal_entries (id, user_id, content, audio_url, transcription, processing_type, processing_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, entry.userId, entry.content, entry.audioUrl, entry.transcription, entry.processingType, entry.processingStatus);
    return id;
  }

  getJournalEntryById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM journal_entries WHERE id = ?');
    return stmt.get(id) as any;
  }

  getJournalEntriesByUserId(userId: string, limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit) as any[];
  }

  updateJournalEntry(id: string, updates: Partial<{
    content: string;
    transcription: string;
    processingStatus: string;
    processingType: string;
    userConfirmedTranscription: boolean;
    userConfirmedAnalysis: boolean;
  }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE journal_entries SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  // Analysis results operations
  createAnalysisResult(result: {
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
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO analysis_results (
        id, journal_entry_id, sentiment_analysis, people_mentioned, 
        finance_cues, tasks_mentioned, locations, temporal_references, 
        life_areas, insights
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, result.journalEntryId, result.sentimentAnalysis, result.peopleMentioned,
      result.financeCues, result.tasksMentioned, result.locations, result.temporalReferences,
      result.lifeAreas, result.insights
    );
    return id;
  }

  getAnalysisResultByJournalEntryId(journalEntryId: string) {
    const stmt = this.db.prepare('SELECT * FROM analysis_results WHERE journal_entry_id = ?');
    return stmt.get(journalEntryId) as any;
  }

  // Check-in operations
  createCheckIn(checkIn: {
    userId: string;
    mood: number;
    energy: number;
    stress: number;
    notes?: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO check_ins (id, user_id, mood, energy, stress, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, checkIn.userId, checkIn.mood, checkIn.energy, checkIn.stress, checkIn.notes || null);
    return id;
  }

  getCheckInsByUserId(userId: string, limit = 10) {
    const stmt = this.db.prepare('SELECT * FROM check_ins WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit) as any[];
  }

  // People operations
  createPerson(person: {
    userId: string;
    name: string;
    displayPicture?: string;
    relationship?: string;
    context?: string;
    sentiment?: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO people (id, user_id, name, display_picture, relationship, context, sentiment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, person.userId, person.name, person.displayPicture, person.relationship, person.context, person.sentiment);
    return id;
  }

  getPeopleByUserId(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM people WHERE user_id = ? ORDER BY last_mentioned DESC');
    return stmt.all(userId) as any[];
  }

  updatePerson(id: string, updates: Partial<{
    name: string;
    displayPicture: string;
    relationship: string;
    context: string;
    sentiment: string;
    frequency: number;
    lastMentioned: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE people SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deletePerson(id: string) {
    const stmt = this.db.prepare('DELETE FROM people WHERE id = ?');
    stmt.run(id);
  }

  // Finance operations
    createFinanceEntry(entry: {
    userId: string;
    amount: number;
    description: string;
    category?: string;
    type?: string;
    date?: string;
    journalEntryId?: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO finance_entries (id, user_id, amount, description, category, type, date, journal_entry_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      entry.userId,
      entry.amount,
      entry.description,
      entry.category || 'other',
      entry.type || 'expense',
      entry.date || null,
      entry.journalEntryId || null
    );
    return id;
  }

  getFinanceEntriesByUserId(userId: string, limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM finance_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit) as any[];
  }

  getFinanceEntryById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM finance_entries WHERE id = ?');
    return stmt.get(id) as any;
  }

  updateFinanceEntry(id: string, updates: Partial<{
    amount: number;
    currency: string;
    category: string;
    subcategory: string;
    description: string;
    date: string;
    recurring: boolean;
    recurringPattern: string;
    priority: string;
    tags: string;
    notes: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE finance_entries SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteFinanceEntry(id: string) {
    const stmt = this.db.prepare('DELETE FROM finance_entries WHERE id = ?');
    stmt.run(id);
  }

  // Task operations
  createTask(task: {
    userId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    journalEntryId?: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, journal_entry_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      task.userId,
      task.title,
      task.description || null,
      task.status || 'pending',
      task.priority || 'medium',
      task.dueDate || null,
      task.journalEntryId || null
    );
    return id;
  }

  getTasksByUserId(userId: string, limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit) as any[];
  }

  getTaskById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as any;
  }

  updateTask(id: string, updates: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    deadline: string;
    category: string;
    assignee: string;
    remarks: string;
    isCompleted: boolean;
    completedDate: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteTask(id: string) {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
  }

  // Goal operations
  createGoal(goal: {
    userId: string;
    title: string;
    description?: string;
    category?: string;
    targetDate?: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO goals (id, user_id, title, description, category, target_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      goal.userId,
      goal.title,
      goal.description || null,
      goal.category || 'personal',
      goal.targetDate || null
    );
    return id;
  }

  getGoalsByUserId(userId: string, limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit) as any[];
  }

  updateGoal(id: string, updates: Partial<{
    title: string;
    description: string;
    targetDate: string;
    lifeAreaId: string;
    priority: string;
    category: string;
    status: string;
    progress: number;
  }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE goals SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteGoal(id: string) {
    const stmt = this.db.prepare('DELETE FROM goals WHERE id = ?');
    stmt.run(id);
  }

  saveNudgeInteraction(data: {
    userId: string;
    nudgeId: string;
    action: string;
    feedback?: string;
    timestamp: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO nudge_interactions (user_id, nudge_id, action, feedback, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(data.userId, data.nudgeId, data.action, data.feedback || null, data.timestamp);
  }

  getNudgeInteractions(userId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM nudge_interactions 
      WHERE user_id = ? 
      ORDER BY timestamp DESC
    `);
    return stmt.all(userId) as any[];
  }

  // SoulMatrix operations
  createSoulMatrix(soulMatrix: {
    userId: string;
    traits: string;
    confidence: number;
    analyzedEntries?: string;
    nextUpdate?: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO soul_matrix (id, user_id, traits, confidence, analyzed_entries, next_update)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, soulMatrix.userId, soulMatrix.traits, soulMatrix.confidence, soulMatrix.analyzedEntries, soulMatrix.nextUpdate);
    return id;
  }

  getSoulMatrixByUserId(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM soul_matrix WHERE user_id = ? ORDER BY last_updated DESC LIMIT 1');
    return stmt.get(userId) as any;
  }

  updateSoulMatrix(userId: string, updates: Partial<{
    traits: string;
    confidence: number;
    analyzedEntries: string;
    nextUpdate: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE soul_matrix SET ${fields}, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?`);
    stmt.run(...values, userId);
  }

  // Wheel of Life operations
  createWheelOfLife(wheelOfLife: {
    userId: string;
    lifeAreas: string;
    priorities?: string | null;
    isCompleted?: boolean;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO wheel_of_life (id, user_id, life_areas, priorities, is_completed)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, 
      wheelOfLife.userId, 
      wheelOfLife.lifeAreas, 
      wheelOfLife.priorities || null, 
      wheelOfLife.isCompleted ? 1 : 0
    );
    return id;
  }

  getWheelOfLifeByUserId(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM wheel_of_life WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
    return stmt.get(userId) as any;
  }

  updateWheelOfLife(userId: string, updates: Partial<{
    lifeAreas: string;
    priorities: string | null;
    isCompleted: boolean;
  }>) {
    if (!updates || Object.keys(updates).length === 0) {
      return; // No updates to make
    }
    
    const fields = Object.keys(updates).map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
    const values = Object.values(updates).map(value => {
      if (value === undefined) return null;
      if (typeof value === 'boolean') return value ? 1 : 0;
      return value;
    });
    const stmt = this.db.prepare(`UPDATE wheel_of_life SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`);
    stmt.run(...values, userId);
  }

  // Recap operations
  createRecap(recap: {
    userId: string;
    periodStart: string;
    periodEnd: string;
    content: string;
    category: string;
  }) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO recaps (id, user_id, period_start, period_end, content, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, recap.userId, recap.periodStart, recap.periodEnd, recap.content, recap.category);
    return id;
  }

  getRecapsByUserId(userId: string, limit = 50) {
    const stmt = this.db.prepare('SELECT * FROM recaps WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit) as any[];
  }

  // Utility operations
  close() {
    if (this.db) {
      this.db.close();
    }
  }

  // Backup and restore
  backup(backupPath: string) {
    const backup = new Database(backupPath);
    this.db.backup(backup as any);
    backup.close();
  }

  // Get statistics
  getStats(userId: string) {
    const journalCount = this.db.prepare('SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?').get(userId) as { count: number };
    const checkInCount = this.db.prepare('SELECT COUNT(*) as count FROM check_ins WHERE user_id = ?').get(userId) as { count: number };
    const peopleCount = this.db.prepare('SELECT COUNT(*) as count FROM people WHERE user_id = ?').get(userId) as { count: number };
    const taskCount = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(userId) as { count: number };
    const financeCount = this.db.prepare('SELECT COUNT(*) as count FROM finance_entries WHERE user_id = ?').get(userId) as { count: number };

    return {
      journalEntries: journalCount?.count || 0,
      checkIns: checkInCount?.count || 0,
      people: peopleCount?.count || 0,
      tasks: taskCount?.count || 0,
      financeEntries: financeCount?.count || 0,
    };
  }
}

// Create singleton instance
let databaseInstance: SQLiteDatabase | null = null;

export function getDatabase() {
  // Always use Supabase in production/Vercel
  if (isVercel || isProduction) {
    console.log('Using Supabase database for production');
    return getSupabaseDatabase();
  } else {
    console.log('Using SQLite database for development');
    if (!databaseInstance) {
      try {
        databaseInstance = new SQLiteDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
        if (process.env.VERCEL === '1') {
          throw new Error(
            'Database initialization failed in Vercel environment. ' +
            'This app uses SQLite which cannot write to Vercel\'s read-only filesystem. ' +
            'Please see VERCEL_DEPLOYMENT_LIMITATIONS.md for solutions.'
          );
        }
        throw error;
      }
    }
    return databaseInstance;
  }
}

export function closeDatabase() {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = null;
  }
} 
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Database types
interface DatabaseInstance {
  db: Database.Database;
  init: () => void;
  close: () => void;
}

// Create database directory if it doesn't exist
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'journaling-app.db');

class JournalingDatabase implements DatabaseInstance {
  db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables
    this.createTables();
  }

  createTables() {
    // Users table
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
      )
    `);

    // Journal entries table
    this.db.exec(`
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
      )
    `);

    // Analysis results table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id TEXT PRIMARY KEY,
        journal_entry_id TEXT NOT NULL,
        sentiment_analysis TEXT,
        people_mentioned TEXT,
        finance_cues TEXT,
        tasks_mentioned TEXT,
        locations TEXT,
        temporal_references TEXT,
        life_areas TEXT,
        insights TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
      )
    `);

    // Check ins table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mood TEXT NOT NULL,
        energy TEXT,
        movement INTEGER CHECK(movement >= 1 AND movement <= 10),
        sleep_hours INTEGER,
        sleep_minutes INTEGER,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // People table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        display_picture TEXT,
        relationship TEXT,
        context TEXT,
        sentiment TEXT,
        frequency INTEGER DEFAULT 0,
        last_mentioned DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Contact details table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contact_details (
        id TEXT PRIMARY KEY,
        person_id TEXT NOT NULL,
        type TEXT CHECK(type IN ('email', 'phone', 'address')),
        value TEXT NOT NULL,
        label TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
      )
    `);

    // Finance entries table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS finance_entries (
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
        tags TEXT,
        notes TEXT,
        source TEXT DEFAULT 'manual',
        journal_entry_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
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
        source TEXT DEFAULT 'manual',
        journal_entry_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Goals table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        target_date DATE NOT NULL,
        life_area_id TEXT NOT NULL,
        priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
        category TEXT,
        status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
        progress INTEGER CHECK(progress >= 0 AND progress <= 100) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // SoulMatrix table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS soul_matrix (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        traits TEXT NOT NULL,
        confidence DECIMAL(3,2) CHECK(confidence >= 0 AND confidence <= 1),
        analyzed_entries TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        next_update DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Wheel of Life table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS wheel_of_life (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        life_areas TEXT NOT NULL,
        priorities TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Recaps table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recaps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT CHECK(type IN ('weekly', 'monthly')),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        content TEXT NOT NULL,
        insights TEXT,
        recommendations TEXT,
        life_area_improvements TEXT,
        metrics TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        viewed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Nudge interactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS nudge_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        nudge_id TEXT NOT NULL,
        action TEXT NOT NULL,
        feedback TEXT,
        timestamp TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
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
    `);
  }

  // User operations
  createUser(user: { email: string; name?: string; password?: string; googleId?: string; avatarUrl?: string }) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, password, google_id, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, user.email, user.name, user.password, user.googleId, user.avatarUrl);
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
    const id = uuidv4();
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

  getJournalEntriesByUserId(userId: string, limit = 50, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM journal_entries 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as any[];
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
    const id = uuidv4();
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
    mood: string;
    energy: string;
    movement: number;
    sleepHours: number;
    sleepMinutes: number;
    note?: string;
  }) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO check_ins (id, user_id, mood, energy, movement, sleep_hours, sleep_minutes, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, checkIn.userId, checkIn.mood, checkIn.energy, checkIn.movement, checkIn.sleepHours, checkIn.sleepMinutes, checkIn.note);
    return id;
  }

  getCheckInsByUserId(userId: string, limit = 50, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM check_ins 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as any[];
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
    const id = uuidv4();
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
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO finance_entries (
        id, user_id, amount, currency, category, subcategory, description,
        date, recurring, recurring_pattern, priority, tags, notes, source, journal_entry_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, entry.userId, entry.amount, entry.currency, entry.category, entry.subcategory, entry.description,
      entry.date, entry.recurring, entry.recurringPattern, entry.priority, entry.tags, entry.notes,
      entry.source || 'manual', entry.journalEntryId
    );
    return id;
  }

  getFinanceEntriesByUserId(userId: string, limit = 50, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM finance_entries 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as any[];
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
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, user_id, title, description, status, priority, start_date, 
        deadline, category, assignee, remarks, source, journal_entry_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, task.userId, task.title, task.description, task.status, task.priority, task.startDate,
      task.deadline, task.category, task.assignee, task.remarks, task.source || 'manual', task.journalEntryId
    );
    return id;
  }

  getTasksByUserId(userId: string, limit = 50, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as any[];
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
    description: string;
    targetDate: string;
    lifeAreaId: string;
    priority: string;
    category: string;
    status: string;
    progress: number;
  }) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO goals (id, user_id, title, description, target_date, life_area_id, priority, category, status, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, goal.userId, goal.title, goal.description, goal.targetDate, goal.lifeAreaId, goal.priority, goal.category, goal.status, goal.progress);
    return id;
  }

  getGoalsByUserId(userId: string, limit = 50, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM goals 
      WHERE user_id = ? 
      ORDER BY target_date ASC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as any[];
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
    const id = uuidv4();
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
    const id = uuidv4();
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
    type: 'weekly' | 'monthly';
    periodStart: string;
    periodEnd: string;
    content: string;
    insights?: string;
    recommendations?: string;
    lifeAreaImprovements?: string;
    metrics?: string;
  }) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO recaps (
        id, user_id, type, period_start, period_end, content, 
        insights, recommendations, life_area_improvements, metrics
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, recap.userId, recap.type, recap.periodStart, recap.periodEnd, recap.content,
      recap.insights, recap.recommendations, recap.lifeAreaImprovements, recap.metrics
    );
    return id;
  }

  getRecapsByUserId(userId: string, type?: 'weekly' | 'monthly', limit = 20, offset = 0) {
    let query = 'SELECT * FROM recaps WHERE user_id = ?';
    const params: (string | number)[] = [userId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY generated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as any[];
  }

  // Utility operations
  close() {
    this.db.close();
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
let dbInstance: JournalingDatabase | null = null;

export function getDatabase(): JournalingDatabase {
  if (!dbInstance) {
    dbInstance = new JournalingDatabase();
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export default getDatabase; 
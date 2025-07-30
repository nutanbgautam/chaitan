import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    
    // Test if we can access the database
    const testResult = {
      databaseType: db.constructor.name,
      isSupabase: db.constructor.name === 'SupabaseDatabase',
      isSQLite: db.constructor.name === 'SQLiteDatabase',
      hasDb: !!db,
    };

    return NextResponse.json({
      message: 'Database test successful',
      result: testResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 
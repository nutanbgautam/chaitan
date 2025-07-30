import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    
    // Get all users (for recap generation purposes)
    const users = db.getAllUsers();
    
    // Return only necessary user information
    const userList = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at
    }));
    
    return NextResponse.json(userList);
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
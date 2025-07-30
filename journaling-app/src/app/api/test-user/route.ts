import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Test endpoint - Session:', session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        session: null
      });
    }

    const db = getDatabase();
    const user = db.getUserById(session.user.id);
    
    console.log('Test endpoint - User from DB:', user);
    
    return NextResponse.json({
      session: session,
      user: user,
      sessionUserId: session.user.id,
      dbUserId: user?.id
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
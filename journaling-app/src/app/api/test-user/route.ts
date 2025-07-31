import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = request.nextUrl.searchParams.get('email');
    
    console.log('Test user API - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });
    
    if (!email) {
      return NextResponse.json({
        message: 'Email parameter required',
        session: session ? {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        } : null
      });
    }
    
    try {
      const db = getDatabase();
      const user = db.getUserByEmail(email);
      
      console.log('Test user API - Database lookup:', {
        email,
        found: !!user,
        userId: user?.id
      });
      
      return NextResponse.json({
        message: 'User lookup test',
        email,
        user: user ? {
          id: user.id,
          email: user.email,
          name: user.name,
        } : null,
        session: session ? {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        } : null
      });
    } catch (dbError) {
      console.error('Test user API - Database error:', dbError);
      return NextResponse.json({
        message: 'Database error',
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        email,
        session: session ? {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        } : null
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test user API error:', error);
    return NextResponse.json({
      message: 'Test user API failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 
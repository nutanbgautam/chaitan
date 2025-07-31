import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const sessionInfo = {
      hasSession: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      userName: session?.user?.name || null,
      sessionData: session ? {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
      } : null,
    };

    console.log('Test session API - Session info:', sessionInfo);

    return NextResponse.json({
      message: 'Session test',
      session: sessionInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test session API error:', error);
    return NextResponse.json({
      message: 'Session test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 
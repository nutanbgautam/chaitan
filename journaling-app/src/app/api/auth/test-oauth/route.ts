import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  const oauthCheck = {
    googleClientId: config.google.clientId ? 'SET' : 'MISSING',
    googleClientSecret: config.google.clientSecret ? 'SET' : 'MISSING',
    nextAuthUrl: config.nextAuth.url,
    nextAuthSecret: config.nextAuth.secret ? 'SET' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  };

  return NextResponse.json({
    message: 'Google OAuth configuration check',
    oauth: oauthCheck,
    timestamp: new Date().toISOString(),
  });
} 
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
  }, [session, status]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn('google', { callbackUrl: '/dashboard' });
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: '/welcome' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Authentication Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Session Status:</h2>
            <p>Status: <span className="font-mono">{status}</span></p>
            <p>Loading: <span className="font-mono">{loading ? 'true' : 'false'}</span></p>
          </div>

          {session ? (
            <div className="p-4 bg-green-100 rounded">
              <h2 className="font-semibold mb-2">✅ Logged In</h2>
              <p>User ID: <span className="font-mono">{session.user?.id}</span></p>
              <p>Email: <span className="font-mono">{session.user?.email}</span></p>
              <p>Name: <span className="font-mono">{session.user?.name}</span></p>
              
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-100 rounded">
              <h2 className="font-semibold mb-2">❌ Not Logged In</h2>
              <p>No active session found.</p>
              
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In with Google'}
              </button>
            </div>
          )}

          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-semibold mb-2">Debug Info:</h2>
            <p>Environment: <span className="font-mono">{process.env.NODE_ENV}</span></p>
            <p>NEXTAUTH_URL: <span className="font-mono">{process.env.NEXTAUTH_URL || 'Not set'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
} 
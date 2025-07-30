'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Leaf, Sparkles } from 'lucide-react';


export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      if (session) {
        // Logged in - redirect to check-in page
        router.push('/check-in');
      } else {
        router.push('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [session, status, router]);

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Logo and Brand */}
      <div className="d-flex align-items-center mb-5">
        <div className="position-relative me-4">
          <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}>
            <span className="text-white fw-bold fs-4">C</span>
          </div>
          <div className="position-absolute top-0 end-0 bg-success rounded-circle border border-white" style={{ width: '12px', height: '12px' }}></div>
        </div>
        <span className="text-white fs-3 fw-bold">chaitan.ai</span>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-5">
        <div className="badge bg-light bg-opacity-25 text-white px-4 py-2 mb-4 rounded-pill">
          <Sparkles className="me-2" />
          Welcome
        </div>
        <h1 className="text-white display-4 fw-bold mb-3">
          Welcome to
        </h1>
        <div className="d-flex align-items-center justify-content-center mb-4">
          <h2 className="text-white display-2 fw-bold me-3">
            Chaitan.ai
          </h2>
          <Leaf className="text-success" style={{ fontSize: '2.5rem' }} />
        </div>
        <p className="text-white opacity-75 fs-5">
          Your AI-powered wellness companion
        </p>
      </div>

      {/* Loading Indicator */}
      <div className="text-center">
        <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-white opacity-75 mb-0">Preparing your experience...</p>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Link from 'next/link';
import { Mic, List, PenTool, SkipForward, ArrowLeft, Sparkles, Heart, Zap } from 'lucide-react';

export default function CheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Remove auto-redirect to quick check-in
  // useEffect(() => {
  //   if (status === 'authenticated' && session) {
  //     // Small delay to show the page briefly, then redirect
  //     const timer = setTimeout(() => {
  //       localStorage.setItem('last_check_in_date', new Date().toISOString());
  //       router.push('/check-in/quick');
  //     }, 100);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [status, session, router]);

  const handleVoiceInput = () => {
    localStorage.setItem('last_check_in_date', new Date().toISOString());
    router.push('/journal/new?mode=voice');
  };

  const handleQuickCheckIn = () => {
    localStorage.setItem('last_check_in_date', new Date().toISOString());
    router.push('/check-in/quick');
  };

  const handleWriteReflect = () => {
    localStorage.setItem('last_check_in_date', new Date().toISOString());
    router.push('/journal/new?mode=text');
  };

  const handleSkip = () => {
    localStorage.setItem('last_check_in_date', new Date().toISOString());
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        showBackButton={true}
        backHref="/dashboard"
        title="Check-in"
      />

      {/* Main Content */}
      <div className="container-fluid d-flex flex-column justify-content-center align-items-center py-5 pb-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center mb-5">
          {/* Greeting and Prompt */}
          <div className="mb-4">
            <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
              <Sparkles className="me-2" />
              Daily Check-in
            </div>
            <h1 className="text-white display-4 fw-bold mb-3">
              Hi {userName},
            </h1>
            <p className="text-white fs-4 opacity-75">
              how are you feeling today?
            </p>
          </div>

          {/* Central Microphone Input */}
          <div className="mb-5">
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className="btn btn-link p-0 border-0 position-relative"
            >
              {/* Outer glow */}
              <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-warning bg-opacity-25" 
                   style={{ width: '160px', height: '160px', filter: 'blur(20px)' }}></div>
              
              {/* Main button */}
              <div className="position-relative rounded-circle bg-gradient d-flex align-items-center justify-content-center border border-white border-3 shadow-lg"
                   style={{ 
                     width: '128px', 
                     height: '128px', 
                     background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
                   }}>
                <Mic className="text-white" style={{ fontSize: '3rem' }} />
              </div>
              
              {/* Pulse animation */}
              <div className="position-absolute top-50 start-50 translate-middle rounded-circle border border-white border-2 animate-pulse"
                   style={{ width: '128px', height: '128px' }}></div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="row g-3 justify-content-center" style={{ maxWidth: '400px' }}>
            <div className="col-12">
              <button
                onClick={handleQuickCheckIn}
                disabled={isLoading}
                className="btn btn-light bg-opacity-75 text-dark border border-white border-opacity-25 w-100 py-3 rounded-3 fw-semibold hover-lift"
              >
                <div className="d-flex align-items-center justify-content-center">
                  <div className="bg-danger rounded p-2 me-3">
                    <List className="text-white" />
                  </div>
                  <span className="fs-5 text-dark">Quick Check-In</span>
                </div>
              </button>
            </div>

            <div className="col-12">
              <button
                onClick={handleWriteReflect}
                disabled={isLoading}
                className="btn btn-light bg-opacity-75 text-dark border border-white border-opacity-25 w-100 py-3 rounded-3 fw-semibold hover-lift"
              >
                <div className="d-flex align-items-center justify-content-center">
                  <div className="bg-primary rounded p-2 me-3">
                    <PenTool className="text-white" />
                  </div>
                  <span className="fs-5 text-dark">Write or Reflect</span>
                </div>
              </button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="mt-4">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="btn btn-link text-white opacity-75 text-decoration-none hover-lift"
            >
              <SkipForward className="me-2" />
              Skip
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          <div className="text-center">
            <div className="spinner-border text-light mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-light mb-0">Processing...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .backdrop-blur {
          backdrop-filter: blur(10px);
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { 
  Smile, 
  Meh, 
  Frown, 
  Zap, 
  Battery, 
  Moon, 
  ArrowRight, 
  Save,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Heart,
  Activity
} from 'lucide-react';

const MOOD_OPTIONS = [
  { value: 'Great', icon: <Smile className="fs-1" />, color: 'success', bg: 'bg-success', border: 'border-success' },
  { value: 'Good', icon: <Smile className="fs-1" />, color: 'primary', bg: 'bg-primary', border: 'border-primary' },
  { value: 'Okay', icon: <Meh className="fs-1" />, color: 'warning', bg: 'bg-warning', border: 'border-warning' },
  { value: 'Bad', icon: <Frown className="fs-1" />, color: 'danger', bg: 'bg-danger', border: 'border-danger' },
];

const ENERGY_OPTIONS = [
  { value: 'High', icon: <Zap className="fs-1" />, color: 'warning', bg: 'bg-warning', border: 'border-warning' },
  { value: 'Moderate', icon: <Battery className="fs-1" />, color: 'primary', bg: 'bg-primary', border: 'border-primary' },
  { value: 'Low', icon: <Moon className="fs-1" />, color: 'info', bg: 'bg-info', border: 'border-info' },
];

const SLEEP_OPTIONS = [
  { value: '8h+', label: '8+ hours' },
  { value: '7h', label: '7 hours' },
  { value: '6h', label: '6 hours' },
  { value: '5h', label: '5 hours' },
  { value: '<5h', label: '< 5 hours' },
];

export default function QuickCheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState({
    mood: '',
    energy: '',
    sleep: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn.mood || !checkIn.energy || !checkIn.sleep) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkIn),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Mark check-in as completed
        localStorage.setItem('last_check_in_date', new Date().toISOString());
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to save check-in');
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  if (isSubmitted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
            <CheckCircle className="text-white fs-1" />
          </div>
          <h1 className="text-white display-6 fw-bold mb-3">Check-in Saved!</h1>
          <p className="text-white opacity-75 fs-5">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-25 backdrop-blur">
        <div className="container-fluid">
          <Link href="/check-in" className="btn btn-outline-light btn-sm rounded-circle">
            <ArrowLeft className="fs-5" />
          </Link>
          <div className="navbar-brand d-flex align-items-center mx-auto">
            <div className="position-relative me-3">
              <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}>
                <span className="text-white fw-bold small">C</span>
              </div>
              <div className="position-absolute top-0 end-0 bg-success rounded-circle border border-white" style={{ width: '10px', height: '10px' }}></div>
            </div>
            <span className="text-white fw-bold">chaitan.ai</span>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-75 text-dark px-3 py-2 mb-3 rounded-pill">
                <Heart className="me-2" />
                Quick Check-in
              </div>
              <h1 className="text-dark display-5 fw-bold mb-3">
                How are you feeling?
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mood Selection */}
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <label className="form-label text-dark fw-semibold fs-5 text-center d-block mb-4">
                    How are you feeling?
                  </label>
                  <div className="row g-3">
                    {MOOD_OPTIONS.map((option) => (
                      <div key={option.value} className="col-6">
                        <button
                          type="button"
                          onClick={() => setCheckIn({ ...checkIn, mood: option.value })}
                          className={`btn w-100 h-100 p-4 rounded-3 border-2 transition-all ${
                            checkIn.mood === option.value
                              ? `${option.bg} ${option.border} border-white shadow-lg`
                              : 'btn-light bg-opacity-75 text-dark border-white border-opacity-25 hover-lift'
                          }`}
                        >
                          <div className={`text-${option.color} mb-3 d-flex justify-content-center`}>
                            {option.icon}
                          </div>
                          <div className="text-dark fw-semibold fs-6">
                            {option.value}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Energy Level */}
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <label className="form-label text-dark fw-semibold fs-5 text-center d-block mb-4">
                    Energy Level
                  </label>
                  <div className="row g-3">
                    {ENERGY_OPTIONS.map((option) => (
                      <div key={option.value} className="col-4">
                        <button
                          type="button"
                          onClick={() => setCheckIn({ ...checkIn, energy: option.value })}
                          className={`btn w-100 h-100 p-4 rounded-3 border-2 transition-all ${
                            checkIn.energy === option.value
                              ? `${option.bg} ${option.border} border-white shadow-lg`
                              : 'btn-light bg-opacity-75 text-dark border-white border-opacity-25 hover-lift'
                          }`}
                        >
                          <div className={`text-${option.color} mb-3 d-flex justify-content-center`}>
                            {option.icon}
                          </div>
                          <div className="text-dark fw-semibold small">
                            {option.value}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sleep */}
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <label className="form-label text-dark fw-semibold fs-5 text-center d-block mb-4">
                    How much sleep did you get?
                  </label>
                  <div className="row g-3">
                    {SLEEP_OPTIONS.map((option) => (
                      <div key={option.value} className="col-6">
                        <button
                          type="button"
                          onClick={() => setCheckIn({ ...checkIn, sleep: option.value })}
                          className={`btn w-100 p-3 rounded-3 border-2 transition-all ${
                            checkIn.sleep === option.value
                              ? 'bg-light bg-opacity-75 border-white shadow-lg'
                              : 'btn-light bg-opacity-75 text-dark border-white border-opacity-25 hover-lift'
                          }`}
                        >
                          <div className="text-dark fw-semibold fs-6">
                            {option.label}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <label className="form-label text-dark fw-semibold fs-5 text-center d-block mb-3">
                    Any notes? (optional)
                  </label>
                  <textarea
                    value={checkIn.note}
                    onChange={(e) => setCheckIn({ ...checkIn, note: e.target.value })}
                    placeholder="How was your day?"
                    className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-dark placeholder-dark placeholder-opacity-60 rounded-3"
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !checkIn.mood || !checkIn.energy || !checkIn.sleep}
                className="btn btn-primary btn-lg w-100 rounded-3 shadow-lg hover-lift disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="me-3" />
                    Save Check-in
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

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
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
} 
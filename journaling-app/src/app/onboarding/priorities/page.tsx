'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { 
  Heart, 
  Target, 
  User, 
  DollarSign, 
  Sprout, 
  Flower, 
  Users, 
  ArrowRight, 
  SkipForward,
  ArrowLeft,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const PRIORITY_OPTIONS = [
  {
    id: 'relationships',
    title: 'Relationships',
    icon: <Heart className="fs-2" />,
    description: 'Family, friends, and connections',
    color: 'danger'
  },
  {
    id: 'career',
    title: 'Career & Purpose',
    icon: <Target className="fs-2" />,
    description: 'Work, goals, and life mission',
    color: 'primary'
  },
  {
    id: 'health',
    title: 'Physical Health',
    icon: <User className="fs-2" />,
    description: 'Fitness, nutrition, and wellness',
    color: 'success'
  },
  {
    id: 'finance',
    title: 'Money & Security',
    icon: <DollarSign className="fs-2" />,
    description: 'Financial stability and growth',
    color: 'warning'
  },
  {
    id: 'growth',
    title: 'Growth & Learning',
    icon: <Sprout className="fs-2" />,
    description: 'Personal development and skills',
    color: 'info'
  },
  {
    id: 'spirituality',
    title: 'Inner Life',
    icon: <Flower className="fs-2" />,
    description: 'Spirituality and self-reflection',
    color: 'secondary'
  },
  {
    id: 'community',
    title: 'Community & Impact',
    icon: <Users className="fs-2" />,
    description: 'Making a difference in the world',
    color: 'dark'
  }
];

export default function PrioritySelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has already completed onboarding
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    checkOnboardingStatus();
  }, [session, status, router]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/wheel-of-life?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        if (data.wheelOfLife && Array.isArray(data.wheelOfLife) && data.wheelOfLife.length > 0) {
          // User has already completed onboarding, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityToggle = (priorityId: string) => {
    setSelectedPriorities(prev => {
      if (prev.includes(priorityId)) {
        return prev.filter(id => id !== priorityId);
      } else {
        return [...prev, priorityId];
      }
    });
  };

  const handleSave = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (selectedPriorities.length === 0) {
      alert('Please select at least one priority');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map priority IDs to match the life areas structure
      const priorityMapping: { [key: string]: string } = {
        'relationships': 'relationships',
        'career': 'career',
        'health': 'health',
        'finance': 'finances',
        'growth': 'personal-growth',
        'spirituality': 'spirituality',
        'community': 'environment'
      };

      // Create wheel of life data with the correct format
      const lifeAreasData = [
        { id: 'career', name: 'Career & Work', value: 7, priority: selectedPriorities.indexOf('career') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('career')), color: '#3B82F6', icon: '💼' },
        { id: 'finances', name: 'Financial Life', value: 6, priority: selectedPriorities.indexOf('finance') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('finance')), color: '#10B981', icon: '💰' },
        { id: 'health', name: 'Health & Fitness', value: 7, priority: selectedPriorities.indexOf('health') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('health')), color: '#EF4444', icon: '🏃‍♂️' },
        { id: 'relationships', name: 'Relationships', value: 9, priority: selectedPriorities.indexOf('relationships') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('relationships')), color: '#F59E0B', icon: '❤️' },
        { id: 'personal-growth', name: 'Personal Growth', value: 8, priority: selectedPriorities.indexOf('growth') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('growth')), color: '#8B5CF6', icon: '📚' },
        { id: 'recreation', name: 'Recreation & Fun', value: 6, priority: selectedPriorities.indexOf('recreation') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('recreation')), color: '#EC4899', icon: '🎮' },
        { id: 'spirituality', name: 'Spirituality', value: 7, priority: selectedPriorities.indexOf('spirituality') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('spirituality')), color: '#6366F1', icon: '🕊️' },
        { id: 'environment', name: 'Environment', value: 6, priority: selectedPriorities.indexOf('community') + 1, weightage: Math.max(1, 10 - selectedPriorities.indexOf('community')), color: '#059669', icon: '🏠' }
      ];

      // Map selected priorities to the correct IDs
      const mappedPriorities = selectedPriorities.map(priority => priorityMapping[priority] || priority);

      const response = await fetch('/api/wheel-of-life', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lifeAreas: lifeAreasData,
          priorities: mappedPriorities,
          isFirstTime: true
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Mark that user has created data
        localStorage.setItem('has_any_data', 'true');
        // Add a longer delay to ensure data is committed
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save priorities');
      }
    } catch (error) {
      console.error('Error saving priorities:', error);
      alert('Failed to save priorities. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create default wheel of life data with the correct format
      const defaultLifeAreasData = [
        { id: 'career', name: 'Career & Work', value: 5, priority: 1, weightage: 10, color: '#3B82F6', icon: '💼' },
        { id: 'finances', name: 'Financial Life', value: 5, priority: 2, weightage: 9, color: '#10B981', icon: '💰' },
        { id: 'health', name: 'Health & Fitness', value: 5, priority: 3, weightage: 8, color: '#EF4444', icon: '🏃‍♂️' },
        { id: 'relationships', name: 'Relationships', value: 5, priority: 4, weightage: 7, color: '#F59E0B', icon: '❤️' },
        { id: 'personal-growth', name: 'Personal Growth', value: 5, priority: 5, weightage: 6, color: '#8B5CF6', icon: '📚' },
        { id: 'recreation', name: 'Recreation & Fun', value: 5, priority: 6, weightage: 5, color: '#EC4899', icon: '🎮' },
        { id: 'spirituality', name: 'Spirituality', value: 5, priority: 7, weightage: 4, color: '#6366F1', icon: '🕊️' },
        { id: 'environment', name: 'Environment', value: 5, priority: 8, weightage: 3, color: '#059669', icon: '🏠' }
      ];

      const defaultPriorities = ['career', 'finances', 'health', 'relationships', 'personal-growth', 'recreation', 'spirituality', 'environment'];

      const response = await fetch('/api/wheel-of-life', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lifeAreas: defaultLifeAreasData,
          priorities: defaultPriorities,
          isFirstTime: true
        }),
      });

      if (response.ok) {
        // Mark that user has created data
        localStorage.setItem('has_any_data', 'true');
        // Add a small delay to ensure data is committed
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save default data');
      }
    } catch (error) {
      console.error('Error saving default data:', error);
      alert('Failed to save default data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">
            {status === 'loading' ? 'Checking authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
            <CheckCircle className="text-white fs-1" />
          </div>
          <h1 className="text-white display-6 fw-bold mb-3">Priorities Saved!</h1>
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
          <Link href="/dashboard" className="btn btn-outline-light btn-sm rounded-circle">
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
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Set Your Priorities
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">
                What matters most to you right now?
              </h1>
              <p className="text-white opacity-75 fs-5">
                There's no right order — just what feels true to you today.
              </p>
            </div>

            {/* Priority Grid */}
            <div className="row g-3 mb-4">
              {PRIORITY_OPTIONS.map((priority) => (
                <div key={priority.id} className="col-6">
                  <button
                    onClick={() => handlePriorityToggle(priority.id)}
                    className={`card w-100 h-100 border-2 transition-all hover-lift ${
                      selectedPriorities.includes(priority.id)
                        ? `bg-${priority.color} bg-opacity-25 border-white shadow-lg`
                        : 'bg-dark bg-opacity-25 border-white border-opacity-25'
                    }`}
                  >
                    <div className="card-body text-center p-3">
                      <div className={`text-${priority.color} mb-3 d-flex justify-content-center`}>
                        {priority.icon}
                      </div>
                      <div className="text-white fw-semibold fs-6 mb-1">
                        {priority.title}
                      </div>
                      <div className="text-white opacity-75 small">
                        {priority.description}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isSubmitting || selectedPriorities.length === 0}
                className="btn btn-primary w-100 py-3 fw-semibold rounded-3 shadow-lg hover-lift"
              >
                {isSubmitting ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm me-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center">
                    <ArrowRight className="me-2" />
                    Save My Priorities
                  </div>
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="btn btn-link text-white opacity-75 text-decoration-none hover-lift w-100"
              >
                <SkipForward className="me-2" />
                Skip · Use Default Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
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
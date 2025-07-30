'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';

import WheelOfLife3D from '@/components/dashboard/WheelOfLife3D';
import WheelOfLifeRadar from '@/components/dashboard/WheelOfLifeRadar';
import { 
  Heart, 
  Zap, 
  Moon,
  Leaf,
  Plus,
  BookOpen,
  Target,
  Users,
  DollarSign,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
  Home,
  Calendar,
  TrendingUp,
  ChevronRight,
  Star,
  Clock,
  Sparkles,
  Activity,
  Award
} from 'lucide-react';

interface CheckIn {
  id: string;
  mood: string;
  energy: number;
  sleepHours: number;
  sleepMinutes: number;
  note?: string;
  createdAt: string;
}

interface WheelOfLife {
  lifeAreas: string;
  priorities?: string;
  isCompleted: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkInData, setCheckInData] = useState<CheckIn | null>(null);
  const [wheelOfLife, setWheelOfLife] = useState<WheelOfLife | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Add a small delay to ensure any previous data operations are completed
    const timer = setTimeout(() => {
      loadUserData();
    }, 500);

    return () => clearTimeout(timer);
  }, [session, status, router]);

  const loadUserData = async () => {
    try {
      // Load today's check-in data - fetch more check-ins to ensure we get today's
      const checkInsResponse = await fetch('/api/check-ins?limit=10');
      if (checkInsResponse.ok) {
        const checkIns = await checkInsResponse.json();
        
        if (checkIns.length > 0) {
          // Use UTC dates to match database timezone
          const today = new Date();
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
          const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);
          
          const todayCheckIn = checkIns.find((checkIn: CheckIn) => {
            const checkInDate = new Date(checkIn.createdAt);
            // Check if the check-in is from today (UTC)
            return checkInDate >= todayUTC && checkInDate < tomorrowUTC;
          });
          
          if (todayCheckIn) {
            setCheckInData(todayCheckIn);
          }
          // Don't redirect if no check-in today - just show the dashboard
        }
      }

      // Load wheel of life data with cache busting
      const wheelResponse = await fetch('/api/wheel-of-life?t=' + Date.now());
      if (wheelResponse.ok) {
        const wheelData = await wheelResponse.json();
        // If no wheel of life data, redirect to onboarding
        if (!wheelData.wheelOfLife || !Array.isArray(wheelData.wheelOfLife) || wheelData.wheelOfLife.length === 0) {
          router.push('/onboarding/priorities');
          return;
        }
        
        setWheelOfLife({
          lifeAreas: wheelData.wheelOfLife ? JSON.stringify(wheelData.wheelOfLife) : '',
          priorities: wheelData.priorities ? JSON.stringify(wheelData.priorities) : '',
          isCompleted: !!wheelData.wheelOfLife
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userName = session?.user?.name?.split(' ')[0] || 'there';
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good morning' : currentTime < 17 ? 'Good afternoon' : 'Good evening';

  // Parse wheel of life data with error handling
  let lifeAreas: any = null;
  let priorities: string[] = [];
  
  try {
    if (wheelOfLife?.lifeAreas && typeof wheelOfLife.lifeAreas === 'string' && wheelOfLife.lifeAreas.trim() !== '') {
      lifeAreas = JSON.parse(wheelOfLife.lifeAreas);
    }
    if (wheelOfLife?.priorities) {
      if (typeof wheelOfLife.priorities === 'string' && wheelOfLife.priorities.trim() !== '') {
        priorities = JSON.parse(wheelOfLife.priorities);
      } else if (Array.isArray(wheelOfLife.priorities)) {
        priorities = wheelOfLife.priorities;
      }
    }
  } catch (error) {
    console.error('Error parsing wheel of life data:', error);
    // Use default values if parsing fails
    lifeAreas = null;
    priorities = [];
  }

  // Default wheel data if none exists
  const defaultWheelData = [
    { id: 'career', name: 'Career & Work', value: 7, priority: 1, weightage: 20, color: '#3B82F6', icon: '💼' },
    { id: 'finances', name: 'Finances', value: 6, priority: 2, weightage: 18, color: '#10B981', icon: '💰' },
    { id: 'health', name: 'Health & Fitness', value: 8, priority: 3, weightage: 16, color: '#EF4444', icon: '🏃‍♂️' },
    { id: 'relationships', name: 'Relationships', value: 9, priority: 4, weightage: 15, color: '#F59E0B', icon: '❤️' },
    { id: 'personal-growth', name: 'Personal Growth', value: 7, priority: 5, weightage: 12, color: '#8B5CF6', icon: '📚' },
    { id: 'recreation', name: 'Recreation & Fun', value: 6, priority: 6, weightage: 10, color: '#EC4899', icon: '🎮' },
    { id: 'spirituality', name: 'Spirituality', value: 5, priority: 7, weightage: 6, color: '#6366F1', icon: '🕊️' },
    { id: 'environment', name: 'Environment', value: 7, priority: 8, weightage: 3, color: '#059669', icon: '🏠' }
  ];

  // Process wheel data with priorities and weightages
  let wheelData: any[] = lifeAreas || defaultWheelData;
  
  // If we have priorities, sort by priority order
  if (priorities && priorities.length > 0) {
    wheelData = wheelData.map((area: any) => {
      const priorityIndex = priorities.indexOf(area.id);
      return {
        ...area,
        priority: priorityIndex >= 0 ? priorityIndex + 1 : 999, // Higher number = lower priority
        weightage: area.weightage || (100 / wheelData.length) // Default equal weightage
      };
    }).sort((a: any, b: any) => a.priority - b.priority);
  } else {
    // If no priorities, use default order but ensure weightages exist
    wheelData = wheelData.map((area: any) => ({
      ...area,
      priority: area.priority || 1,
      weightage: area.weightage || (100 / wheelData.length)
    }));
  }

  const totalValue = wheelData.reduce((sum: number, item: any) => sum + item.value, 0);
  const maxValue = 10;
  const overallBalance = (totalValue / wheelData.length).toFixed(1);

  const quickActions = [
    { title: 'Voice Journal', icon: <Plus className="fs-4" />, href: '/journal/new?mode=voice', color: 'primary', bg: 'bg-primary' },
    { title: 'Quick Check-in', icon: <Heart className="fs-4" />, href: '/check-in', color: 'danger', bg: 'bg-danger' },
    { title: 'Add Task', icon: <CheckSquare className="fs-4" />, href: '/tasks', color: 'warning', bg: 'bg-warning' },
    { title: 'Add Person', icon: <Users className="fs-4" />, href: '/people/new', color: 'info', bg: 'bg-info' },
  ];



  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation />

      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row">
          <div className="col-12">
            {/* Welcome Section */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Welcome back!
              </div>
              <h1 className="text-white display-6 fw-bold mb-2">
                {greeting}, {userName}! ✨
              </h1>
            </div>



            {/* Life Balance Section */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary bg-opacity-75 rounded p-2 me-3">
                    <Activity className="text-white" />
                  </div>
                  <h3 className="text-white mb-0">Life Balance</h3>
                </div>
                
                {/* Interactive Radar Wheel of Life Chart */}
                <div className="text-center mb-4">
                  <WheelOfLifeRadar 
                    wheelData={wheelData} 
                    overallBalance={overallBalance}
                  />
                </div>

                {/* Life Area Labels with Priority Indicators */}
                <div className="row g-2">
                  {wheelData.map((item: any, index: number) => (
                    <div key={item.name} className="col-6">
                      <Link 
                        href={`/wheel-of-life/${item.id}`}
                        className="text-decoration-none"
                      >
                        <div className={`bg-opacity-25 rounded p-2 text-center border border-white border-opacity-25 hover-lift position-relative`}
                             style={{ 
                               backgroundColor: `hsl(${(index * 60) % 360}, 70%, ${50 + (item.value / 10) * 20}%)`,
                               cursor: 'pointer'
                             }}>
                          {/* Priority badge for top 3 */}
                          {item.priority <= 3 && (
                            <div className="position-absolute top-0 start-0 translate-middle badge bg-warning text-dark rounded-pill" style={{ fontSize: '0.6rem' }}>
                              #{item.priority}
                            </div>
                          )}
                          <small className="text-white fw-medium d-block">{item.name}</small>
                          <div className="text-white fw-bold">{item.value}/10</div>
                          <small className="text-white opacity-75">{item.weightage}% weight</small>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Check-in Metrics */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <div className="bg-danger bg-opacity-75 rounded p-2 me-3">
                      <Heart className="text-white" />
                    </div>
                    <h3 className="text-white mb-0">Today's Check-in</h3>
                  </div>
                  <Link href="/check-in/quick" className="btn btn-outline-light btn-sm">
                    {checkInData ? 'Update' : 'Start'} <ChevronRight className="ms-1" />
                  </Link>
                </div>
                
                {checkInData ? (
                  <div className="row g-3 dashboard-stats">
                    <div className="col-4">
                      <div className="card bg-danger bg-opacity-25 border-0 text-center h-100">
                        <div className="card-body">
                          <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '48px', height: '48px' }}>
                            <Heart className="text-white" />
                          </div>
                          <div className="text-white fw-bold fs-5">
                            {checkInData.mood}
                          </div>
                          <div className="text-white opacity-75 small">Mood</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="card bg-warning bg-opacity-25 border-0 text-center h-100">
                        <div className="card-body">
                          <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '48px', height: '48px' }}>
                            <Zap className="text-white" />
                          </div>
                          <div className="text-white fw-bold fs-5">
                            {checkInData.energy}
                          </div>
                          <div className="text-white opacity-75 small">Energy</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="card bg-info bg-opacity-25 border-0 text-center h-100">
                        <div className="card-body">
                          <div className="bg-info rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '48px', height: '48px' }}>
                            <Moon className="text-white" />
                          </div>
                          <div className="text-white fw-bold fs-5">
                            {checkInData.sleepHours}h {checkInData.sleepMinutes}m
                          </div>
                          <div className="text-white opacity-75 small">Sleep</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <Heart className="text-white fs-2" />
                    </div>
                    <p className="text-white opacity-75 mb-3">No check-in today yet</p>
                    <Link href="/check-in" className="btn btn-danger">
                      <Heart className="me-2" />
                      Start Daily Check-in
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-success bg-opacity-75 rounded p-2 me-3">
                    <Plus className="text-white" />
                  </div>
                  <h3 className="text-white mb-0">Quick Actions</h3>
                </div>
                <div className="row g-3 quick-actions">
                  {quickActions.map((action, index) => (
                    <div key={action.title} className="col-6">
                      <Link href={action.href} className="text-decoration-none">
                        <div className={`card ${action.bg} bg-opacity-25 border-0 text-center h-100 hover-lift`}>
                          <div className="card-body">
                            <div className={`bg-${action.color} rounded d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: '48px', height: '48px' }}>
                              {action.icon}
                            </div>
                            <div className="text-white fw-semibold">{action.title}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
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

      `}</style>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { 
  PieChart, 
  TrendingUp, 
  Target, 
  Star,
  Edit,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Lightbulb,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  Heart,
  Zap,
  BookOpen,
  Users,
  DollarSign,
  Home,
  Music,
  TreePine
} from 'lucide-react';
import Link from 'next/link';

interface LifeArea {
  id: string;
  name: string;
  score: number;
  icon: string;
  color: string;
  description: string;
}

interface WheelOfLife {
  id: string;
  userId: string;
  lifeAreas: LifeArea[];
  priorities: string[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LifeAreaStats {
  totalEntries: number;
  averageSentiment: number;
  mostActiveMonth: string;
  entryFrequency: string;
  recentActivity: number;
  improvementTrend: 'up' | 'down' | 'stable';
}

export default function WheelOfLifePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wheelOfLife, setWheelOfLife] = useState<WheelOfLife | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [areaStats, setAreaStats] = useState<Record<string, LifeAreaStats>>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadWheelOfLife();
    loadAreaStats();
  }, [session, status, router]);

  const loadWheelOfLife = async () => {
    try {
      const response = await fetch('/api/wheel-of-life');
      if (response.ok) {
        const data = await response.json();
        
        // Parse the JSON strings from the database
        let parsedData = { ...data };
        
        try {
          if (data.lifeAreas && typeof data.lifeAreas === 'string') {
            parsedData.lifeAreas = JSON.parse(data.lifeAreas);
          } else if (!data.lifeAreas) {
            parsedData.lifeAreas = [];
          }
          if (data.priorities && typeof data.priorities === 'string') {
            parsedData.priorities = JSON.parse(data.priorities);
          } else if (!data.priorities) {
            parsedData.priorities = [];
          }
        } catch (parseError) {
          console.error('Error parsing wheel of life data:', parseError);
          // Use default values if parsing fails
          parsedData.lifeAreas = [];
          parsedData.priorities = [];
        }
        
        setWheelOfLife(parsedData);
      }
    } catch (error) {
      console.error('Error loading Wheel of Life:', error);
      // Set default empty state if loading fails
      setWheelOfLife({
        id: '',
        userId: '',
        lifeAreas: [],
        priorities: [],
        isCompleted: false,
        createdAt: '',
        updatedAt: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAreaStats = async () => {
    try {
      const response = await fetch('/api/wheel-of-life/stats');
      if (response.ok) {
        const stats = await response.json();
        setAreaStats(stats);
      }
    } catch (error) {
      console.error('Error loading area stats:', error);
    }
  };

  const handleUpdateScores = async () => {
    setIsUpdating(true);
    try {
      router.push('/onboarding/priorities');
    } catch (error) {
      console.error('Error updating scores:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getOverallScore = () => {
    if (!wheelOfLife?.lifeAreas) return 0;
    const total = wheelOfLife.lifeAreas.reduce((sum, area) => sum + area.score, 0);
    return Math.round(total / wheelOfLife.lifeAreas.length);
  };

  const getBalanceScore = () => {
    if (!wheelOfLife?.lifeAreas) return 0;
    const scores = wheelOfLife.lifeAreas.map(area => area.score);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    return Math.round(((max - min) / 10) * 100);
  };

  const getPriorityAreas = () => {
    if (!wheelOfLife?.lifeAreas) return [];
    return wheelOfLife.lifeAreas.filter(area => 
      wheelOfLife.priorities.includes(area.id)
    );
  };

  const getLowScoreAreas = () => {
    if (!wheelOfLife?.lifeAreas) return [];
    return wheelOfLife.lifeAreas.filter(area => area.score <= 5);
  };

  const getHighScoreAreas = () => {
    if (!wheelOfLife?.lifeAreas) return [];
    return wheelOfLife.lifeAreas.filter(area => area.score >= 8);
  };

  const getImprovementAreas = () => {
    if (!wheelOfLife?.lifeAreas) return [];
    return wheelOfLife.lifeAreas.filter(area => area.score >= 6 && area.score <= 7);
  };

  const getLifeBalanceInsights = () => {
    const insights = [];
    const overallScore = getOverallScore();
    const balanceScore = getBalanceScore();
    const lowAreas = getLowScoreAreas();
    const highAreas = getHighScoreAreas();

    if (overallScore >= 8) {
      insights.push({
        type: 'success',
        icon: '🌟',
        title: 'Excellent Life Balance',
        message: 'You\'re doing great! Your overall satisfaction is high.',
        action: 'Focus on maintaining this balance and supporting others.'
      });
    } else if (overallScore >= 6) {
      insights.push({
        type: 'warning',
        icon: '📈',
        title: 'Good Foundation',
        message: 'You have a solid foundation with room for improvement.',
        action: 'Identify 2-3 areas to focus on for the next month.'
      });
    } else {
      insights.push({
        type: 'danger',
        icon: '🎯',
        title: 'Time for Focus',
        message: 'Your life balance needs attention. This is normal and fixable!',
        action: 'Start with one area and build momentum gradually.'
      });
    }

    if (balanceScore <= 30) {
      insights.push({
        type: 'info',
        icon: '⚖️',
        title: 'Well Balanced',
        message: 'Your life areas are well distributed.',
        action: 'Maintain this balance while improving individual areas.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '📊',
        title: 'Imbalanced Areas',
        message: 'Some areas are much stronger than others.',
        action: 'Focus on your weakest areas to create better balance.'
      });
    }

    if (lowAreas.length > 0) {
      insights.push({
        type: 'danger',
        icon: '🔧',
        title: `${lowAreas.length} Area${lowAreas.length > 1 ? 's' : ''} Need Attention`,
        message: `Focus on: ${lowAreas.map(a => a.name).join(', ')}`,
        action: 'Set specific goals for these areas.'
      });
    }

    if (highAreas.length > 0) {
      insights.push({
        type: 'success',
        icon: '💪',
        title: `${highAreas.length} Strong Area${highAreas.length > 1 ? 's' : ''}`,
        message: `You excel in: ${highAreas.map(a => a.name).join(', ')}`,
        action: 'Use these strengths to support other areas.'
      });
    }

    return insights;
  };

  const getAreaIcon = (areaId: string) => {
    const iconMap: Record<string, any> = {
      'career': <Target className="w-5 h-5" />,
      'finances': <DollarSign className="w-5 h-5" />,
      'health': <Activity className="w-5 h-5" />,
      'relationships': <Heart className="w-5 h-5" />,
      'personal-growth': <BookOpen className="w-5 h-5" />,
      'recreation': <Music className="w-5 h-5" />,
      'spirituality': <Heart className="w-5 h-5" />,
      'environment': <Home className="w-5 h-5" />
    };
    return iconMap[areaId] || <Star className="w-5 h-5" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'danger';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🌟';
    if (score >= 8) return '😊';
    if (score >= 7) return '🙂';
    if (score >= 6) return '😐';
    if (score >= 5) return '😕';
    if (score >= 4) return '😟';
    if (score >= 3) return '😔';
    if (score >= 2) return '😢';
    return '😭';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading your life balance...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const insights = getLifeBalanceInsights();

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        title="Wheel of Life"
        showAddButton={true}
        addButtonText={isUpdating ? 'Updating...' : 'Update Scores'}
        onAddClick={handleUpdateScores}
      />

      <div className="container py-5 pb-5">
        {wheelOfLife ? (
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Hero Section */}
              <div className="text-center mb-5">
                <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                  <Sparkles className="me-2" />
                  Life Balance Assessment
                </div>
                <h1 className="text-white display-4 fw-bold mb-3">Your Wheel of Life</h1>
                <p className="text-white opacity-75 fs-5">
                  Discover your life balance and unlock insights for personal growth
                </p>
              </div>

              {/* Overview Stats */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-white fw-bold mb-4">
                    <BarChart3 className="me-2" />
                    Life Balance Overview
                  </h3>
                  <div className="row text-center">
                    <div className="col-md-3 mb-3">
                      <div className="bg-success bg-opacity-25 rounded p-3 border border-success border-opacity-25">
                        <div className="text-white fw-bold fs-2">{getOverallScore()}/10</div>
                        <div className="text-white opacity-75 small">Overall Satisfaction</div>
                        <div className="text-success small mt-1">{getScoreEmoji(getOverallScore())}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="bg-info bg-opacity-25 rounded p-3 border border-info border-opacity-25">
                        <div className="text-white fw-bold fs-2">{getBalanceScore()}%</div>
                        <div className="text-white opacity-75 small">Life Balance</div>
                        <div className="text-info small mt-1">⚖️</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="bg-warning bg-opacity-25 rounded p-3 border border-warning border-opacity-25">
                        <div className="text-white fw-bold fs-2">{wheelOfLife?.priorities?.length || 0}</div>
                        <div className="text-white opacity-75 small">Priority Areas</div>
                        <div className="text-warning small mt-1">🎯</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="bg-primary bg-opacity-25 rounded p-3 border border-primary border-opacity-25">
                        <div className="text-white fw-bold fs-2">{wheelOfLife?.lifeAreas?.length || 0}</div>
                        <div className="text-white opacity-75 small">Life Areas</div>
                        <div className="text-primary small mt-1">📊</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Life Areas Grid */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-white fw-bold mb-4">
                    <PieChart className="me-2" />
                    Life Areas Assessment
                  </h3>
                  
                  {wheelOfLife?.lifeAreas?.length > 0 ? (
                    <div className="row">
                      {wheelOfLife.lifeAreas.map((area) => {
                        const stats = areaStats[area.id];
                        const scoreColor = getScoreColor(area.score);
                        const isPriority = wheelOfLife?.priorities?.includes(area.id);
                        
                        return (
                          <div key={area.id} className="col-md-6 mb-3">
                            <div className="card bg-light bg-opacity-10 border border-white border-opacity-25 hover-lift">
                              <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white me-3" 
                                         style={{ width: '50px', height: '50px', background: area.color }}>
                                      <span className="fs-4">{area.icon}</span>
                                    </div>
                                    <div>
                                      <h5 className="text-white fw-bold mb-1">{area.name}</h5>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className={`badge bg-${scoreColor}`}>
                                          {area.score}/10 {getScoreEmoji(area.score)}
                                        </span>
                                        {isPriority && (
                                          <span className="badge bg-warning text-dark">
                                            <Target className="w-3 h-3 me-1" />
                                            Priority
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Link href={`/wheel-of-life/${area.id}`}>
                                    <button className="btn btn-outline-light btn-sm">
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </Link>
                                </div>

                                <div className="mb-3">
                                  <div className="d-flex justify-content-between text-white opacity-75 small mb-1">
                                    <span>Low</span>
                                    <span>High</span>
                                  </div>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div 
                                      className={`progress-bar bg-${scoreColor}`}
                                      style={{ width: `${area.score * 10}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Area Stats */}
                                {stats && (
                                  <div className="row g-2 text-center">
                                    <div className="col-4">
                                      <div className="text-white opacity-75 small">Entries</div>
                                      <div className="text-white fw-bold">{stats.totalEntries}</div>
                                    </div>
                                    <div className="col-4">
                                      <div className="text-white opacity-75 small">Activity</div>
                                      <div className="text-white fw-bold">{stats.entryFrequency}</div>
                                    </div>
                                    <div className="col-4">
                                      <div className="text-white opacity-75 small">Trend</div>
                                      <div className={`fw-bold ${stats.improvementTrend === 'up' ? 'text-success' : stats.improvementTrend === 'down' ? 'text-danger' : 'text-warning'}`}>
                                        {stats.improvementTrend === 'up' ? '↗️' : stats.improvementTrend === 'down' ? '↘️' : '→'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-white opacity-75 mb-4">No life areas data available</p>
                      <Link href="/onboarding/priorities">
                        <button className="btn btn-primary">
                          Set Priorities
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-white fw-bold mb-4">
                    <Lightbulb className="me-2" />
                    AI-Powered Insights
                  </h3>
                  
                  <div className="row">
                    {insights.map((insight, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className={`card bg-${insight.type} bg-opacity-25 border border-${insight.type} border-opacity-25`}>
                          <div className="card-body">
                            <div className="d-flex align-items-start gap-3">
                              <div className="fs-3">{insight.icon}</div>
                              <div className="flex-grow-1">
                                <h6 className="text-white fw-bold mb-2">{insight.title}</h6>
                                <p className="text-white opacity-75 small mb-2">{insight.message}</p>
                                <div className="text-white opacity-75 small fw-medium">
                                  💡 {insight.action}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <h4 className="text-white fw-bold mb-4">
                    <Zap className="me-2" />
                    Quick Actions
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <Link href="/journal/new">
                        <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Create Journal Entry
                        </button>
                      </Link>
                    </div>
                    <div className="col-md-4">
                      <Link href="/check-in">
                        <button className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Daily Check-In
                        </button>
                      </Link>
                    </div>
                    <div className="col-md-4">
                      <Link href="/recaps">
                        <button className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          View Recaps
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Info */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25">
                <div className="card-body p-4">
                  <h4 className="text-white fw-bold mb-4">
                    <Calendar className="me-2" />
                    Assessment Info
                  </h4>
                  <div className="row g-3 text-white opacity-75 small">
                    <div className="col-md-3">
                      <div>Last Updated</div>
                      <div className="fw-bold">{new Date(wheelOfLife.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="col-md-3">
                      <div>Created</div>
                      <div className="fw-bold">{new Date(wheelOfLife.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="col-md-3">
                      <div>Status</div>
                      <div className="fw-bold text-success">
                        {wheelOfLife.isCompleted ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div>Next Review</div>
                      <div className="fw-bold">In 30 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 text-center">
                <div className="card-body p-5">
                  <div className="text-white opacity-50 mb-4">
                    <PieChart className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-white fw-bold mb-3">Set Your Life Priorities</h3>
                  <p className="text-white opacity-75 mb-4">
                    Set your life priorities to personalize your Wheel of Life experience and unlock AI-powered insights.
                  </p>
                  <Link href="/onboarding/priorities">
                    <button className="btn btn-primary">
                      Set Priorities
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
} 
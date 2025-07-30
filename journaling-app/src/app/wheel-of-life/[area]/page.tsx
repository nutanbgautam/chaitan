'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Edit,
  Save,
  X,
  BarChart3,
  Lightbulb,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Activity,
  BookOpen,
  Heart,
  DollarSign,
  Home,
  Music,
  Users,
  Zap,
  Target as TargetIcon,
  Award,
  TrendingUp as TrendingUpIcon,
  CalendarDays,
  MessageSquare,
  FileText,
  PieChart,
  LineChart,
  Brain,
  Eye,
  Compass,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';

interface LifeArea {
  id: string;
  name: string;
  description: string;
  currentScore: number;
  targetScore: number;
  color: string;
  icon: string;
  entries: string[];
  goals: Goal[];
  insights: Insight[];
  progressHistory: ProgressEntry[];
  journalAnalysis?: {
    totalEntries: number;
    averageSentiment: number;
    mostActiveMonth: string;
    entryFrequency: string;
  };
  relatedEntries?: any[];
  sentimentTrend?: string;
  keyThemes?: string[];
  recommendations?: string[];
}

interface Goal {
    id: string;
    title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed';
    progress: number;
  lifeAreaId: string;
}

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  source: 'ai' | 'user';
  date: string;
  lifeAreaId: string;
}

interface ProgressEntry {
  date: string;
  score: number;
  notes?: string;
}

export default function WheelOfLifeAreaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const areaSlug = params.area as string;

  const [lifeArea, setLifeArea] = useState<LifeArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editGoalForm, setEditGoalForm] = useState({
    id: '',
    title: '',
    description: '',
    targetDate: '',
    progress: 0,
    status: 'pending' as 'pending' | 'in-progress' | 'completed'
  });

  // Form state
  const [formData, setFormData] = useState({
    currentScore: 0,
    targetScore: 0,
    description: ''
  });

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    progress: 0
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadLifeAreaData();
  }, [session, status, router, areaSlug]);

  const loadLifeAreaData = async () => {
    try {
      const response = await fetch(`/api/wheel-of-life/area/${areaSlug}`);
      if (response.ok) {
        const data = await response.json();
        setLifeArea(data);
        setFormData({
          currentScore: data.currentScore,
          targetScore: data.targetScore,
          description: data.description
        });
      }
    } catch (error) {
      console.error('Error loading life area data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/wheel-of-life/area/${areaSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        loadLifeAreaData();
      } else {
        console.error('Failed to update life area');
      }
    } catch (error) {
      console.error('Error updating life area:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goalForm,
          lifeAreaId: lifeArea?.id
        }),
      });

      if (response.ok) {
        setShowAddGoal(false);
        setGoalForm({
          title: '',
          description: '',
          targetDate: '',
          progress: 0
        });
        loadLifeAreaData();
      } else {
        console.error('Failed to add goal');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditGoalForm({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      progress: goal.progress,
      status: goal.status
    });
    setShowEditGoal(true);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGoalForm),
      });

      if (response.ok) {
        setShowEditGoal(false);
        setEditGoalForm({
          id: '',
          title: '',
          description: '',
          targetDate: '',
          progress: 0,
          status: 'pending'
        });
        loadLifeAreaData();
      } else {
        console.error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadLifeAreaData();
      } else {
        console.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    setUpdatingProgress(goalId);
    
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: goalId,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'pending'
        }),
      });

      if (response.ok) {
        loadLifeAreaData();
      } else {
        console.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setUpdatingProgress(null);
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="fs-6" />;
      case 'in-progress': return <Clock className="fs-6" />;
      default: return <AlertCircle className="fs-6" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      default: return 'secondary';
    }
  };

  const getAreaIcon = (areaId: string) => {
    const iconMap: Record<string, any> = {
      'career': <TargetIcon className="w-5 h-5" />,
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

  const getActionableInsights = () => {
    const insights = [];
    
    if (lifeArea) {
      const progressPercentage = (lifeArea.currentScore / lifeArea.targetScore) * 100;
      
      if (progressPercentage < 50) {
        insights.push({
          icon: '🎯',
          title: 'Focus Area',
          message: 'This area needs immediate attention. Start with small, achievable goals.',
          action: 'Set 3 specific goals for the next 30 days'
        });
      } else if (progressPercentage < 80) {
        insights.push({
          icon: '📈',
          title: 'Improvement Zone',
          message: 'Good progress! Focus on consistent actions to reach your target.',
          action: 'Review your goals weekly and adjust as needed'
        });
      } else {
        insights.push({
          icon: '🏆',
          title: 'Excellence Zone',
          message: 'Outstanding! You\'re doing great in this area.',
          action: 'Share your success and help others improve'
        });
      }

      if (lifeArea.journalAnalysis?.totalEntries === 0) {
        insights.push({
          icon: '📝',
          title: 'Start Journaling',
          message: 'No journal entries found for this area. Start documenting your journey.',
          action: 'Create your first journal entry about this life area'
        });
      }

      if (lifeArea.goals.length === 0) {
        insights.push({
          icon: '🎯',
          title: 'Set Goals',
          message: 'No goals set for this area. Clear goals help track progress.',
          action: 'Create 2-3 specific, measurable goals'
        });
      }
    }

    return insights;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading life area details...</p>
        </div>
      </div>
    );
  }

  if (!session || !lifeArea) {
    return null;
  }

  const progressPercentage = (lifeArea.currentScore / lifeArea.targetScore) * 100;
  const progressColor = getProgressColor(lifeArea.currentScore, lifeArea.targetScore);
  const actionableInsights = getActionableInsights();

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        showBackButton={false}
        title={lifeArea.name}
        showAddButton={true}
        addButtonText="Add Goal"
        onAddClick={() => setShowAddGoal(true)}
      />

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Hero Section */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white fw-semibold" 
                         style={{ width: '100px', height: '100px', background: lifeArea.color }}>
                      <span className="fs-1">{lifeArea.icon}</span>
                    </div>
                  </div>

                  <div className="col">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h1 className="text-white fw-bold mb-2">{lifeArea.name}</h1>
                        <p className="text-white opacity-75 mb-3 fs-5">{lifeArea.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-white fw-medium">Progress</span>
                            <span className="text-white fw-bold">
                              {lifeArea.currentScore}/{lifeArea.targetScore} ({progressPercentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="progress" style={{ height: '12px' }}>
                            <div 
                              className={`progress-bar bg-${progressColor}`}
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="btn btn-success btn-sm"
                            >
                              <Save className="me-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="btn btn-outline-light btn-sm"
                            >
                              <X className="me-1" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-outline-light btn-sm"
                          >
                            <Edit className="me-1" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body p-0">
                <div className="nav nav-tabs nav-fill border-0" role="tablist">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active bg-primary' : 'text-white'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <Eye className="w-4 h-4 me-2" />
                    Overview
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'goals' ? 'active bg-primary' : 'text-white'}`}
                    onClick={() => setActiveTab('goals')}
                  >
                    <Target className="w-4 h-4 me-2" />
                    Goals
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'insights' ? 'active bg-primary' : 'text-white'}`}
                    onClick={() => setActiveTab('insights')}
                  >
                    <Lightbulb className="w-4 h-4 me-2" />
                    Insights
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'progress' ? 'active bg-primary' : 'text-white'}`}
                    onClick={() => setActiveTab('progress')}
                  >
                    <LineChart className="w-4 h-4 me-2" />
                    Progress
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-pane fade show active">
                  <div className="row">
                    {/* Current Status */}
                    <div className="col-md-6 mb-4">
                      <div className="card bg-dark bg-opacity-25 border-0 h-100">
                        <div className="card-body">
                          <h3 className="text-white fw-semibold mb-4">
                            <BarChart3 className="me-2" />
                            Current Status
                          </h3>
                          
                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <label className="form-label text-white">Current Score</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={formData.currentScore}
                                  onChange={(e) => setFormData({ ...formData, currentScore: parseInt(e.target.value) })}
                                  className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                                />
                              </div>
                              <div>
                                <label className="form-label text-white">Target Score</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={formData.targetScore}
                                  onChange={(e) => setFormData({ ...formData, targetScore: parseInt(e.target.value) })}
                                  className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                                />
                              </div>
                              <div>
                                <label className="form-label text-white">Description</label>
                                <textarea
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                                  rows={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="row g-4">
                              <div className="col-md-4">
                                <div className="text-center">
                                  <div className="text-primary fw-bold fs-1">{lifeArea.currentScore}</div>
                                  <div className="text-white opacity-75">Current Score</div>
                                  <div className="text-primary small mt-1">{getScoreEmoji(lifeArea.currentScore)}</div>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="text-center">
                                  <div className="text-warning fw-bold fs-1">{lifeArea.targetScore}</div>
                                  <div className="text-white opacity-75">Target Score</div>
                                  <div className="text-warning small mt-1">🎯</div>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="text-center">
                                  <div className={`fw-bold fs-1 text-${progressColor}`}>
                                    {progressPercentage.toFixed(0)}%
                                  </div>
                                  <div className="text-white opacity-75">Progress</div>
                                  <div className={`text-${progressColor} small mt-1`}>
                                    {progressColor === 'success' ? '🏆' : progressColor === 'warning' ? '📈' : '🔧'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actionable Insights */}
                    <div className="col-md-6 mb-4">
                      <div className="card bg-dark bg-opacity-25 border-0 h-100">
                        <div className="card-body">
                          <h3 className="text-white fw-semibold mb-4">
                            <Sparkles className="me-2" />
                            Actionable Insights
                          </h3>
                          
                          <div className="space-y-3">
                            {actionableInsights.map((insight, index) => (
                              <div key={index} className="card bg-light bg-opacity-10 border border-white border-opacity-25">
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
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Journal Analysis */}
                  {lifeArea.journalAnalysis && (
                    <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                      <div className="card-body">
                        <h3 className="text-white fw-semibold mb-4">
                          <FileText className="me-2" />
                          Journal Analysis
                        </h3>
                        
                        <div className="row g-4">
                          {/* Analysis Stats */}
                          <div className="col-md-6">
                            <div className="card bg-light bg-opacity-10 border-0">
                              <div className="card-body">
                                <h6 className="text-white mb-3">Analysis Overview</h6>
                                <div className="space-y-2">
                                  <div className="d-flex justify-content-between">
                                    <span className="text-white opacity-75">Total Entries:</span>
                                    <span className="text-white fw-bold">{lifeArea.journalAnalysis.totalEntries}</span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="text-white opacity-75">Entry Frequency:</span>
                                    <span className="text-white fw-bold">{lifeArea.journalAnalysis.entryFrequency}</span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="text-white opacity-75">Most Active Month:</span>
                                    <span className="text-white fw-bold">{lifeArea.journalAnalysis.mostActiveMonth}</span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="text-white opacity-75">Sentiment Trend:</span>
                                    <span className={`fw-bold ${lifeArea.sentimentTrend === 'improving' ? 'text-success' : lifeArea.sentimentTrend === 'declining' ? 'text-danger' : 'text-warning'}`}>
                                      {lifeArea.sentimentTrend || 'stable'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Key Themes */}
                          <div className="col-md-6">
                            <div className="card bg-light bg-opacity-10 border-0">
                              <div className="card-body">
                                <h6 className="text-white mb-3">Key Themes</h6>
                                {lifeArea.keyThemes && lifeArea.keyThemes.length > 0 ? (
                                  <div className="d-flex flex-wrap gap-2">
                                    {lifeArea.keyThemes.map((theme, index) => (
                                      <span key={index} className="badge bg-primary bg-opacity-75">
                                        {theme}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-white opacity-75 mb-0">No themes identified yet</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {lifeArea.recommendations && lifeArea.recommendations.length > 0 && (
                          <div className="mt-4">
                            <h6 className="text-white mb-3">
                              <Lightbulb className="me-2" />
                              Recommendations
                            </h6>
                            <div className="space-y-2">
                              {lifeArea.recommendations.map((recommendation, index) => (
                                <div key={index} className="d-flex align-items-start gap-2">
                                  <CheckCircle className="text-success mt-1 flex-shrink-0" />
                                  <span className="text-white">{recommendation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Journal Entries */}
                        {lifeArea.relatedEntries && lifeArea.relatedEntries.length > 0 && (
                          <div className="mt-4">
                            <h6 className="text-white mb-3">
                              <BookOpen className="me-2" />
                              Recent Related Entries
                            </h6>
                            <div className="space-y-3">
                              {lifeArea.relatedEntries.map((entry) => (
                                <div key={entry.id} className="card bg-light bg-opacity-10 border-0">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <span className="text-white opacity-75 small">
                                        {new Date(entry.date).toLocaleDateString()}
                                      </span>
                                      <span className={`badge ${entry.sentiment > 0 ? 'bg-success' : entry.sentiment < 0 ? 'bg-danger' : 'bg-warning'}`}>
                                        {entry.sentiment > 0 ? 'Positive' : entry.sentiment < 0 ? 'Negative' : 'Neutral'}
                                      </span>
                                    </div>
                                    <p className="text-white mb-0">
                                      {entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && (
                <div className="tab-pane fade show active">
                  <div className="card bg-dark bg-opacity-25 border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="text-white fw-semibold mb-0">Goals</h3>
                        <button
                          onClick={() => setShowAddGoal(true)}
                          className="btn btn-primary btn-sm"
                        >
                          <Plus className="me-1" />
                          Add Goal
                        </button>
                      </div>

                      {lifeArea.goals.length === 0 ? (
                        <div className="text-center py-4">
                          <Target className="text-white opacity-50 mb-3" style={{ fontSize: '3rem' }} />
                          <p className="text-white opacity-75">No goals set for this area yet</p>
                          <button
                            onClick={() => setShowAddGoal(true)}
                            className="btn btn-primary"
                          >
                            <Plus className="me-1" />
                            Add Your First Goal
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lifeArea.goals.map((goal) => (
                            <div key={goal.id} className="card bg-light bg-opacity-10 border border-white border-opacity-25">
                              <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between">
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <h6 className="text-white mb-0">{goal.title}</h6>
                                      <span className={`badge bg-${getStatusColor(goal.status)} d-inline-flex align-items-center gap-1`}>
                                        {getStatusIcon(goal.status)}
                                        {goal.status}
                                      </span>
                                    </div>
                                    {goal.description && (
                                      <p className="text-white opacity-75 mb-2">{goal.description}</p>
                                    )}
                                    <div className="d-flex align-items-center gap-3 text-white opacity-75 small mb-2">
                                      <span>
                                        <Calendar className="me-1" />
                                        {new Date(goal.targetDate).toLocaleDateString()}
                                      </span>
                                      <span>
                                        <Activity className="me-1" />
                                        {goal.progress}% complete
                                      </span>
                                    </div>
                                    
                                    {/* Progress Bar with Update Functionality */}
                                    <div className="mb-3">
                                      <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="text-white small">Progress:</span>
                                        <span className="text-white fw-semibold">{goal.progress}%</span>
                                        {updatingProgress === goal.id && (
                                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Updating...</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="progress mb-2" style={{ height: '8px' }}>
                                        <div
                                          className="progress-bar bg-primary"
                                          style={{ width: `${goal.progress}%` }}
                                        />
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <input
                                          type="range"
                                          className="form-range flex-grow-1"
                                          min="0"
                                          max="100"
                                          value={goal.progress}
                                          onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                                          disabled={updatingProgress === goal.id}
                                          style={{ height: '6px' }}
                                        />
                                        <button
                                          onClick={() => handleUpdateProgress(goal.id, goal.progress + 10)}
                                          disabled={updatingProgress === goal.id || goal.progress >= 100}
                                          className="btn btn-outline-primary btn-sm"
                                          style={{ minWidth: '40px' }}
                                        >
                                          +10%
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="d-flex flex-column gap-1 ms-3">
                                    <button
                                      onClick={() => handleEditGoal(goal)}
                                      className="btn btn-outline-light btn-sm"
                                      title="Edit Goal"
                                    >
                                      <Edit className="fs-6" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGoal(goal.id)}
                                      className="btn btn-outline-danger btn-sm"
                                      title="Delete Goal"
                                    >
                                      <X className="fs-6" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="tab-pane fade show active">
                  <div className="card bg-dark bg-opacity-25 border-0">
                    <div className="card-body">
                      <h3 className="text-white fw-semibold mb-4">
                        <Lightbulb className="me-2" />
                        Insights
                      </h3>

                      {lifeArea.insights.length === 0 ? (
                        <div className="text-center py-4">
                          <Lightbulb className="text-white opacity-50 mb-3" style={{ fontSize: '3rem' }} />
                          <p className="text-white opacity-75">No insights available yet</p>
                          <p className="text-white opacity-75 small">Start journaling about this area to get personalized insights</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lifeArea.insights.map((insight) => (
                            <div key={insight.id} className="card bg-light bg-opacity-10 border border-white border-opacity-25">
                              <div className="card-body">
                                <div className="d-flex align-items-start gap-3">
                                  <div className={`badge bg-${getInsightColor(insight.type)} rounded-circle d-flex align-items-center justify-content-center`} 
                                       style={{ width: '32px', height: '32px' }}>
                                    <Lightbulb className="fs-6" />
                                  </div>
                                  <div className="flex-grow-1">
                                    <p className="text-white mb-2">{insight.content}</p>
                                    <div className="d-flex align-items-center gap-3 text-white opacity-75 small">
                                      <span>
                                        <Calendar className="me-1" />
                                        {new Date(insight.date).toLocaleDateString()}
                                      </span>
                                      <span className={`badge bg-${getInsightColor(insight.type)}`}>
                                        {insight.source === 'ai' ? 'AI Generated' : 'User Added'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="tab-pane fade show active">
                  <div className="card bg-dark bg-opacity-25 border-0">
                    <div className="card-body">
                      <h3 className="text-white fw-semibold mb-4">
                        <LineChart className="me-2" />
                        Progress History
                      </h3>
                      
                      {lifeArea.progressHistory.length === 0 ? (
                        <div className="text-center py-4">
                          <LineChart className="text-white opacity-50 mb-3" style={{ fontSize: '3rem' }} />
                          <p className="text-white opacity-75">No progress history available yet</p>
                          <p className="text-white opacity-75 small">Start tracking your progress to see your journey</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lifeArea.progressHistory.slice(-5).reverse().map((entry, index) => (
                            <div key={index} className="d-flex align-items-center gap-3">
                              <div className="text-white opacity-75 small" style={{ minWidth: '100px' }}>
                                {new Date(entry.date).toLocaleDateString()}
                              </div>
                              <div className="flex-grow-1">
                                <div className="progress" style={{ height: '8px' }}>
                                  <div
                                    className="progress-bar bg-primary"
                                    style={{ width: `${(entry.score / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-white fw-medium" style={{ minWidth: '40px' }}>
                                {entry.score}/10
                              </div>
                              {entry.notes && (
                                <div className="text-white opacity-75 small">
                                  {entry.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">Add Goal for {lifeArea.name}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddGoal(false)}
                />
              </div>
              
              <form onSubmit={handleAddGoal}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-white">Title *</label>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Description</label>
                    <textarea
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Target Date *</label>
                        <input
                          type="date"
                          value={goalForm.targetDate}
                          onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Current Progress (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={goalForm.progress}
                          onChange={(e) => setGoalForm({ ...goalForm, progress: parseInt(e.target.value) })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top border-white border-opacity-25">
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="btn btn-outline-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">Edit Goal for {lifeArea.name}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditGoal(false)}
                />
              </div>
              
              <form onSubmit={handleUpdateGoal}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-white">Title *</label>
                    <input
                      type="text"
                      value={editGoalForm.title}
                      onChange={(e) => setEditGoalForm({ ...editGoalForm, title: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Description</label>
                    <textarea
                      value={editGoalForm.description}
                      onChange={(e) => setEditGoalForm({ ...editGoalForm, description: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Target Date *</label>
                        <input
                          type="date"
                          value={editGoalForm.targetDate}
                          onChange={(e) => setEditGoalForm({ ...editGoalForm, targetDate: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Current Progress (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editGoalForm.progress}
                          onChange={(e) => setEditGoalForm({ ...editGoalForm, progress: parseInt(e.target.value) })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top border-white border-opacity-25">
                  <button
                    type="button"
                    onClick={() => setShowEditGoal(false)}
                    className="btn btn-outline-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .space-y-3 > * + * {
          margin-top: 1rem;
        }
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
} 
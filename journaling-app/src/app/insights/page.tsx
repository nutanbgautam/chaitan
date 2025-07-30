'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Heart,
  Users,
  DollarSign,
  Zap,
  Brain,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Calendar,
  TrendingDown,
  Star,
  Activity
} from 'lucide-react';

interface Insight {
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any[];
}

interface InsightsData {
  priority: Insight[];
  lifeAreas: Insight[];
  goals: Insight[];
  wellness: Insight[];
  relationships: Insight[];
  finance: Insight[];
  productivity: Insight[];
  personality: Insight[];
}

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadInsights();
  }, [session, status, router]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lifeAreas': return <Target className="w-5 h-5" />;
      case 'goals': return <Target className="w-5 h-5" />;
      case 'wellness': return <Heart className="w-5 h-5" />;
      case 'relationships': return <Users className="w-5 h-5" />;
      case 'finance': return <DollarSign className="w-5 h-5" />;
      case 'productivity': return <Zap className="w-5 h-5" />;
      case 'personality': return <Brain className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'lifeAreas': return 'Life Areas';
      case 'goals': return 'Goals';
      case 'wellness': return 'Wellness';
      case 'relationships': return 'Relationships';
      case 'finance': return 'Finance';
      case 'productivity': return 'Productivity';
      case 'personality': return 'Personality';
      default: return 'General';
    }
  };

  const getAllInsights = (): Insight[] => {
    if (!insights) return [];
    
    return [
      ...insights.lifeAreas,
      ...insights.goals,
      ...insights.wellness,
      ...insights.relationships,
      ...insights.finance,
      ...insights.productivity,
      ...insights.personality
    ].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getFilteredInsights = () => {
    let filtered = getAllInsights();
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(insight => {
        return Object.entries(insights!).some(([category, categoryInsights]) => {
          if (category === activeCategory) {
            return categoryInsights.some((catInsight: Insight) => catInsight.type === insight.type);
          }
          return false;
        });
      });
    }
    
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === selectedPriority);
    }
    
    return filtered;
  };

  const getInsightsStats = () => {
    if (!insights) return null;
    
    const allInsights = getAllInsights();
    const highPriority = allInsights.filter(i => i.priority === 'high').length;
    const mediumPriority = allInsights.filter(i => i.priority === 'medium').length;
    const lowPriority = allInsights.filter(i => i.priority === 'low').length;
    const actionable = allInsights.filter(i => i.actionable).length;
    
    return { total: allInsights.length, highPriority, mediumPriority, lowPriority, actionable };
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const stats = getInsightsStats();
  const filteredInsights = getFilteredInsights();

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        title="Insights"
        showAddButton={true}
        addButtonText="Refresh Insights"
        onAddClick={loadInsights}
      />

      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Page Header */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Lightbulb className="me-2" />
                AI Insights
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">AI Insights & Recommendations</h1>
              <p className="text-white opacity-75 fs-5">Personalized analysis and actionable recommendations</p>
            </div>

            {/* Insights Overview */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-dark bg-opacity-25 border-0 mb-4"
              >
                <div className="card-body">
                  <h2 className="text-white fw-bold mb-4">Insights Overview</h2>
                  <div className="row g-3">
                    <div className="col-6 col-md-2">
                      <div className="text-center p-3 bg-primary bg-opacity-25 rounded">
                        <div className="text-white fw-bold fs-4 mb-1">{stats.total}</div>
                        <div className="text-white opacity-75 small">Total Insights</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="text-center p-3 bg-danger bg-opacity-25 rounded">
                        <div className="text-white fw-bold fs-4 mb-1">{stats.highPriority}</div>
                        <div className="text-white opacity-75 small">High Priority</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="text-center p-3 bg-warning bg-opacity-25 rounded">
                        <div className="text-white fw-bold fs-4 mb-1">{stats.mediumPriority}</div>
                        <div className="text-white opacity-75 small">Medium Priority</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="text-center p-3 bg-success bg-opacity-25 rounded">
                        <div className="text-white fw-bold fs-4 mb-1">{stats.lowPriority}</div>
                        <div className="text-white opacity-75 small">Low Priority</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="text-center p-3 bg-info bg-opacity-25 rounded">
                        <div className="text-white fw-bold fs-4 mb-1">{stats.actionable}</div>
                        <div className="text-white opacity-75 small">Actionable</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card bg-dark bg-opacity-25 border-0 mb-4"
            >
              <div className="card-body">
                <div className="row g-3">
                  {/* Category Filter */}
                  <div className="col-md-6">
                    <label className="form-label text-white">Category</label>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Categories</option>
                      {insights && Object.keys(insights).map(category => {
                        if (category === 'priority') return null;
                        return (
                          <option key={category} value={category}>
                            {getCategoryName(category)} ({insights[category as keyof InsightsData].length})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="col-md-6">
                    <label className="form-label text-white">Priority</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

        {/* Insights List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="wellness-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredInsights.length} {filteredInsights.length === 1 ? 'Insight' : 'Insights'}
            </h2>
          </div>

          {filteredInsights.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No insights found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or add more data to get personalized insights
              </p>
              <button
                onClick={loadInsights}
                className="wellness-button"
              >
                Refresh Insights
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={`${insight.type}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getPriorityColor(insight.priority)}`}>
                      {getPriorityIcon(insight.priority)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-800 text-lg">{insight.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                        {insight.actionable && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Actionable
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-base leading-relaxed mb-4">{insight.message}</p>
                      
                      {insight.data && insight.data.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-2">Related Items:</h4>
                          <div className="space-y-2">
                            {insight.data.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>{item.title || item.name || 'Item'}</span>
                              </div>
                            ))}
                            {insight.data.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{insight.data.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Category Breakdown */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="wellness-card mt-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Insights by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(insights).map(([category, categoryInsights]) => {
                if (category === 'priority') return null;
                                 const highPriorityCount = categoryInsights.filter((i: Insight) => i.priority === 'high').length;
                 const actionableCount = categoryInsights.filter((i: Insight) => i.actionable).length;
                
                return (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center mb-3">
                      {getCategoryIcon(category)}
                    </div>
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {getCategoryName(category)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {categoryInsights.length} insight{categoryInsights.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex justify-center gap-2 text-xs">
                      {highPriorityCount > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          {highPriorityCount} high
                        </span>
                      )}
                      {actionableCount > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {actionableCount} actionable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
} 
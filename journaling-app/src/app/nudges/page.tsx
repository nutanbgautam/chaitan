'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Target, 
  Heart, 
  Users, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  X,
  Clock,
  Star,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  Zap,
  Calendar,
  Lightbulb,
  BarChart3,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';

interface Nudge {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions: Array<{
    label: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  timing: string;
  frequency: string;
  lifeArea: string;
  confidence?: number;
  expectedOutcome?: string;
  relevanceScore?: number;
}

interface NudgesData {
  nudges: Nudge[];
  summary: {
    totalNudges: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    categories: string[];
  };
}

export default function NudgesPage() {
  const [nudgesData, setNudgesData] = useState<NudgesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedNudge, setExpandedNudge] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadNudgesData();
  }, []);

  const loadNudgesData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/nudges');
      if (response.ok) {
        const data = await response.json();
        setNudgesData(data);
      }
    } catch (error) {
      console.error('Error loading nudges data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNudgeAction = async (nudgeId: string, action: string, feedback?: string) => {
    try {
      const response = await fetch('/api/nudges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nudgeId,
          action,
          feedback
        }),
      });

      if (response.ok) {
        await loadNudgesData();
      }
    } catch (error) {
      console.error('Error handling nudge action:', error);
    }
  };

  const getNudgeIcon = (type: string) => {
    switch (type) {
      case 'wellness':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'goals':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'relationships':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'finance':
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case 'life-balance':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'productivity':
        return <Zap className="w-5 h-5 text-orange-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 text-red-600';
      case 'medium':
        return 'bg-yellow-50 text-yellow-600';
      case 'low':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTimingIcon = (timing: string) => {
    switch (timing) {
      case 'now':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'today':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'this-week':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'this-month':
        return <Calendar className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFilteredNudges = () => {
    if (!nudgesData) return [];
    
    let filtered = nudgesData.nudges;
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(nudge => nudge.priority === activeFilter);
    }
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(nudge => nudge.type === activeCategory);
    }
    
    return filtered;
  };

  const getCategoryStats = () => {
    if (!nudgesData) return {};
    
    const stats: { [key: string]: number } = {};
    nudgesData.nudges.forEach(nudge => {
      stats[nudge.type] = (stats[nudge.type] || 0) + 1;
    });
    
    return stats;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your personalized nudges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!nudgesData || nudgesData.nudges.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">No Nudges Available</h1>
            <p className="text-gray-600 mb-4">Add more data to receive personalized life area nudges</p>
            <Link href="/dashboard" className="text-green-600 hover:text-green-700">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredNudges = getFilteredNudges();
  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Life Area Nudges</h1>
              <p className="text-gray-600">Personalized recommendations for improving your life areas</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:shadow-md transition-shadow"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={loadNudgesData}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {nudgesData.summary.totalNudges}
              </div>
              <div className="text-sm text-gray-600">Total Nudges</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {nudgesData.summary.highPriority}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {nudgesData.summary.mediumPriority}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {nudgesData.summary.lowPriority}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Nudge Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800 mb-1">{category}</div>
                  <div className="text-2xl font-bold text-green-600">{count}</div>
                  <div className="text-sm text-gray-600">nudges</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'all'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('high')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'high'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setActiveFilter('medium')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setActiveFilter('low')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'low'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Low
              </button>
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.keys(categoryStats).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeCategory === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Nudges List/Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredNudges.map((nudge, index) => (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNudgeIcon(nudge.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{nudge.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(nudge.priority)}`}>
                          {nudge.priority}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {getTimingIcon(nudge.timing)}
                          <span>{nudge.timing.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{nudge.message}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{nudge.lifeArea}</span>
                        {nudge.confidence && (
                          <span className="text-xs text-gray-500">
                            {(nudge.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setExpandedNudge(expandedNudge === nudge.id ? null : nudge.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {expandedNudge === nudge.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {expandedNudge === nudge.id ? 'Hide' : 'Details'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedNudge === nudge.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-gray-100"
                      >
                        {nudge.actions && nudge.actions.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">Suggested Actions:</h4>
                            <div className="space-y-2">
                              {nudge.actions.map((action, actionIndex) => (
                                <div key={actionIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-700">{action.label}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(action.impact)}`}>
                                    {action.impact} impact
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {nudge.expectedOutcome && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">Expected Outcome:</h4>
                            <p className="text-sm text-gray-600">{nudge.expectedOutcome}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleNudgeAction(nudge.id, 'completed')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Complete
                          </button>
                          <button
                            onClick={() => handleNudgeAction(nudge.id, 'snoozed')}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            <Clock className="w-3 h-3" />
                            Snooze
                          </button>
                          <button
                            onClick={() => handleNudgeAction(nudge.id, 'dismissed')}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNudges.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No nudges match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setActiveCategory('all');
              }}
              className="text-green-600 hover:text-green-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
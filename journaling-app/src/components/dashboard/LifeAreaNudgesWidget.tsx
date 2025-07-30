import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lightbulb
} from 'lucide-react';

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

const LifeAreaNudgesWidget: React.FC = () => {
  const [nudgesData, setNudgesData] = useState<NudgesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedNudge, setExpandedNudge] = useState<string | null>(null);

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
        // Reload nudges to reflect the action
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
    
    return filtered;
  };

  if (isLoading) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Life Area Nudges</h2>
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized nudges...</p>
        </div>
      </div>
    );
  }

  if (!nudgesData || nudgesData.nudges.length === 0) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Life Area Nudges</h2>
          <button
            onClick={loadNudgesData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No nudges available</p>
          <p className="text-sm text-gray-500 mt-2">Add more data to receive personalized nudges</p>
        </div>
      </div>
    );
  }

  const filteredNudges = getFilteredNudges();

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Life Area Nudges</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadNudgesData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600 mb-1">
            {nudgesData.summary.totalNudges}
          </div>
          <div className="text-xs text-gray-600">Total Nudges</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600 mb-1">
            {nudgesData.summary.highPriority}
          </div>
          <div className="text-xs text-gray-600">High Priority</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600 mb-1">
            {nudgesData.summary.mediumPriority}
          </div>
          <div className="text-xs text-gray-600">Medium Priority</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600 mb-1">
            {nudgesData.summary.lowPriority}
          </div>
          <div className="text-xs text-gray-600">Low Priority</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({nudgesData.nudges.length})
        </button>
        <button
          onClick={() => setActiveFilter('high')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            activeFilter === 'high'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          High ({nudgesData.summary.highPriority})
        </button>
        <button
          onClick={() => setActiveFilter('medium')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            activeFilter === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Medium ({nudgesData.summary.mediumPriority})
        </button>
        <button
          onClick={() => setActiveFilter('low')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            activeFilter === 'low'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Low ({nudgesData.summary.lowPriority})
        </button>
      </div>

      {/* Nudges List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNudges.map((nudge, index) => (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNudgeIcon(nudge.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{nudge.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(nudge.priority)}`}>
                          {nudge.priority} priority
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {getTimingIcon(nudge.timing)}
                          <span>{nudge.timing.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{nudge.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{nudge.lifeArea}</span>
                        {nudge.confidence && (
                          <span className="text-xs text-gray-500">
                            {(nudge.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedNudge(expandedNudge === nudge.id ? null : nudge.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          {expandedNudge === nudge.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {expandedNudge === nudge.id ? 'Hide' : 'Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedNudge === nudge.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
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
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LifeAreaNudgesWidget; 
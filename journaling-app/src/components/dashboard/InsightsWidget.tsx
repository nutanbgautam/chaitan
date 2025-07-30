import React, { useState, useEffect } from 'react';
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
  RefreshCw
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

const InsightsWidget: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'priority' | 'all'>('priority');

  useEffect(() => {
    loadInsights();
  }, []);

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

  if (isLoading) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Insights</h2>
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Insights</h2>
          <button
            onClick={loadInsights}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No insights available yet</p>
          <p className="text-sm text-gray-500 mt-2">Add more data to get personalized insights</p>
        </div>
      </div>
    );
  }

  const displayInsights = activeCategory === 'priority' ? insights.priority : getAllInsights();

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI Insights & Recommendations</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadInsights}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveCategory('priority')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'priority'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Priority ({insights.priority.length})
        </button>
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({getAllInsights().length})
        </button>
      </div>

      {displayInsights.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No insights available</p>
          <p className="text-sm text-gray-500 mt-2">Continue using the app to get personalized insights</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayInsights.map((insight, index) => (
            <motion.div
              key={`${insight.type}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getPriorityColor(insight.priority)}`}>
                  {getPriorityIcon(insight.priority)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{insight.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{insight.message}</p>
                  
                  {insight.actionable && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">Actionable</span>
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category Breakdown */}
      {activeCategory === 'all' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Insights by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(insights).map(([category, categoryInsights]) => {
              if (category === 'priority') return null;
              return (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {getCategoryName(category)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {categoryInsights.length} insight{categoryInsights.length !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsWidget; 
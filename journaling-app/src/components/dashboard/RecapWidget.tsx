import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  BookOpen, 
  Target, 
  Heart, 
  TrendingUp, 
  Lightbulb,
  RefreshCw,
  Clock,
  Star,
  Award,
  Zap,
  Users
} from 'lucide-react';

interface RecapData {
  period: string;
  startDate: string;
  endDate: string;
  title: string;
  summary: string;
  highlights: any[];
  insights: any[];
  goals: any;
  wellness: any;
  themes: any;
  recommendations: any[];
  story: any;
}

const RecapWidget: React.FC = () => {
  const [recapData, setRecapData] = useState<RecapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  useEffect(() => {
    loadRecapData();
  }, [selectedPeriod]);

  const loadRecapData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/recaps?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setRecapData(data);
      }
    } catch (error) {
      console.error('Error loading recap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
      case 'achievement':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'learning':
        return <Lightbulb className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'writing':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'wellness':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'goals':
        return <Target className="w-4 h-4 text-green-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'positive':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recap</h2>
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating recap...</p>
        </div>
      </div>
    );
  }

  if (!recapData) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recap</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="wellness-input text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={loadRecapData}
              className="text-green-600 hover:text-green-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No recap data available</p>
          <p className="text-sm text-gray-500 mt-2">Add more journal entries to generate recaps</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recap</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="wellness-input text-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={loadRecapData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recap Title and Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">{recapData.title}</h3>
        <p className="text-gray-600 leading-relaxed">{recapData.summary}</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600 mb-1">
            {recapData.wellness.averageMood.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Avg Mood</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600 mb-1">
            {recapData.goals.completionRate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Goal Completion</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600 mb-1">
            {recapData.highlights.length}
          </div>
          <div className="text-xs text-gray-600">Highlights</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600 mb-1">
            {recapData.insights.length}
          </div>
          <div className="text-xs text-gray-600">Insights</div>
        </div>
      </motion.div>

      {/* Highlights */}
      {recapData.highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Key Highlights
          </h4>
          <div className="space-y-3">
            {recapData.highlights.slice(0, 3).map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {getImpactIcon(highlight.impact)}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 text-sm">{highlight.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">{highlight.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(highlight.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {recapData.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Insights
          </h4>
          <div className="space-y-3">
            {recapData.insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                <div className="mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 text-sm">{insight.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Story Format */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
          Your Story
        </h4>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed italic">
          "{recapData.story.narrative}"
        </p>
        </div>
      </motion.div>

      {/* Recommendations */}
      {recapData.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {recapData.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="mt-1">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 text-sm">{rec.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecapWidget; 
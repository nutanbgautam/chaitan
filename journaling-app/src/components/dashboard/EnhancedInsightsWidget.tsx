import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Heart, 
  Users, 
  DollarSign,
  Zap,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Filter,
  Brain,
  Eye
} from 'lucide-react';

interface EnhancedInsightsData {
  emotionalInsights: any[];
  behavioralInsights: any[];
  relationshipInsights: any[];
  goalInsights: any[];
  lifeBalanceInsights: any[];
  growthOpportunities: any[];
  predictiveInsights: any[];
  actionableRecommendations: any[];
}

const EnhancedInsightsWidget: React.FC = () => {
  const [insightsData, setInsightsData] = useState<EnhancedInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInsightsData();
  }, []);

  const loadInsightsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/insights');
      if (response.ok) {
        const data = await response.json();
        setInsightsData(data);
      }
    } catch (error) {
      console.error('Error loading insights data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'emotional':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'behavioral':
        return <Brain className="w-4 h-4 text-blue-500" />;
      case 'relationship':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'goal':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'lifeBalance':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAllInsights = () => {
    if (!insightsData) return [];
    
    return [
      ...insightsData.emotionalInsights.map(insight => ({ ...insight, category: 'emotional' })),
      ...insightsData.behavioralInsights.map(insight => ({ ...insight, category: 'behavioral' })),
      ...insightsData.relationshipInsights.map(insight => ({ ...insight, category: 'relationship' })),
      ...insightsData.goalInsights.map(insight => ({ ...insight, category: 'goal' })),
      ...insightsData.lifeBalanceInsights.map(insight => ({ ...insight, category: 'lifeBalance' }))
    ];
  };

  const getFilteredInsights = () => {
    const allInsights = getAllInsights();
    if (activeCategory === 'all') return allInsights;
    return allInsights.filter(insight => insight.category === activeCategory);
  };

  const getTopInsights = () => {
    const allInsights = getAllInsights();
    return allInsights
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 3);
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

  if (!insightsData) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Insights</h2>
          <button
            onClick={loadInsightsData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No insights available</p>
          <p className="text-sm text-gray-500 mt-2">Add more data to generate AI insights</p>
        </div>
      </div>
    );
  }

  const topInsights = getTopInsights();
  const filteredInsights = getFilteredInsights();

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <Eye className="w-4 h-4" />
            {showDetails ? 'Summary' : 'Details'}
          </button>
          <button
            onClick={loadInsightsData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!showDetails ? (
        // Summary View
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setShowDetails(true)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getInsightIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{insight.message}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                      <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600 mb-1">
                {insightsData.emotionalInsights.length}
              </div>
              <div className="text-xs text-gray-600">Emotional</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600 mb-1">
                {insightsData.behavioralInsights.length}
              </div>
              <div className="text-xs text-gray-600">Behavioral</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600 mb-1">
                {insightsData.relationshipInsights.length}
              </div>
              <div className="text-xs text-gray-600">Relationships</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600 mb-1">
                {insightsData.actionableRecommendations.length}
              </div>
              <div className="text-xs text-gray-600">Recommendations</div>
            </div>
          </div>
        </div>
      ) : (
        // Detailed View
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Insights
            </button>
            <button
              onClick={() => setActiveCategory('emotional')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === 'emotional'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Emotional
            </button>
            <button
              onClick={() => setActiveCategory('behavioral')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === 'behavioral'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Behavioral
            </button>
            <button
              onClick={() => setActiveCategory('relationship')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === 'relationship'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Relationships
            </button>
            <button
              onClick={() => setActiveCategory('goal')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === 'goal'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Goals
            </button>
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getInsightIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                        <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Growth Opportunities */}
          {insightsData.growthOpportunities.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                Growth Opportunities
              </h3>
              <div className="space-y-3">
                {insightsData.growthOpportunities.slice(0, 3).map((opportunity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border"
                  >
                    <h4 className="font-medium text-gray-800 mb-2">{opportunity.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        opportunity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        opportunity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {opportunity.difficulty} difficulty
                      </span>
                      <span className="text-xs text-gray-500">{opportunity.expectedOutcome}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {insightsData.actionableRecommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                Actionable Recommendations
              </h3>
              <div className="space-y-3">
                {insightsData.actionableRecommendations.slice(0, 3).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-lg border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{rec.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        {rec.steps && rec.steps.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Steps:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {rec.steps.slice(0, 2).map((step: string, stepIndex: number) => (
                                <li key={stepIndex} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedInsightsWidget; 
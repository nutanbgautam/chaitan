'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Heart,
  Zap,
  Target,
  Calendar,
  RefreshCw,
  Lightbulb,
  Users,
  Star,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Line, Radar, Bar, Doughnut } from 'react-chartjs-2';

interface PersonalityEvolutionData {
  timeline: any[];
  traitEvolution: {
    extraversion: any[];
    neuroticism: any[];
    openness: any[];
    conscientiousness: any[];
    agreeableness: any[];
  };
  lifeEvents: any[];
  personalityInsights: any[];
  growthAreas: any[];
  stabilityMetrics: {
    overallStability: number;
    traitStability: any;
    growthRate: number;
    adaptationScore: number;
  };
}

export default function PersonalityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [evolutionData, setEvolutionData] = useState<PersonalityEvolutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('90');
  const [selectedGranularity, setSelectedGranularity] = useState('weekly');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadEvolutionData();
  }, [session, status, router, selectedPeriod, selectedGranularity]);

  const loadEvolutionData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/personality-evolution?period=${selectedPeriod}&granularity=${selectedGranularity}`);
      if (response.ok) {
        const data = await response.json();
        setEvolutionData(data);
      }
    } catch (error) {
      console.error('Error loading personality evolution data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTraitChartData = (trait: string) => {
    if (!evolutionData?.traitEvolution[trait as keyof typeof evolutionData.traitEvolution]) return null;

    const data = evolutionData.traitEvolution[trait as keyof typeof evolutionData.traitEvolution];
    
    return {
      labels: data.map((item: any) => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: trait.charAt(0).toUpperCase() + trait.slice(1),
          data: data.map((item: any) => item.score),
          borderColor: getTraitColor(trait),
          backgroundColor: getTraitColor(trait, 0.1),
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const getCurrentPersonalityRadarData = () => {
    if (!evolutionData?.timeline.length) return null;

    const latestSnapshot = evolutionData.timeline[evolutionData.timeline.length - 1].personalitySnapshot;
    
    return {
      labels: ['Extraversion', 'Neuroticism', 'Openness', 'Conscientiousness', 'Agreeableness'],
      datasets: [
        {
          label: 'Current Personality',
          data: [
            latestSnapshot.extraversion,
            latestSnapshot.neuroticism,
            latestSnapshot.openness,
            latestSnapshot.conscientiousness,
            latestSnapshot.agreeableness
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(59, 130, 246)'
        }
      ]
    };
  };

  const getPersonalityComparisonData = () => {
    if (!evolutionData?.timeline.length) return null;

    const firstSnapshot = evolutionData.timeline[0].personalitySnapshot;
    const latestSnapshot = evolutionData.timeline[evolutionData.timeline.length - 1].personalitySnapshot;
    
    return {
      labels: ['Extraversion', 'Neuroticism', 'Openness', 'Conscientiousness', 'Agreeableness'],
      datasets: [
        {
          label: 'Start',
          data: [
            firstSnapshot.extraversion,
            firstSnapshot.neuroticism,
            firstSnapshot.openness,
            firstSnapshot.conscientiousness,
            firstSnapshot.agreeableness
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2
        },
        {
          label: 'Current',
          data: [
            latestSnapshot.extraversion,
            latestSnapshot.neuroticism,
            latestSnapshot.openness,
            latestSnapshot.conscientiousness,
            latestSnapshot.agreeableness
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        }
      ]
    };
  };

  const getStabilityChartData = () => {
    if (!evolutionData?.stabilityMetrics.traitStability) return null;

    const stability = evolutionData.stabilityMetrics.traitStability;
    
    return {
      labels: Object.keys(stability).map(trait => trait.charAt(0).toUpperCase() + trait.slice(1)),
      datasets: [
        {
          label: 'Stability Score',
          data: Object.values(stability).map((s: any) => s * 10), // Convert to 0-10 scale
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getLifeEventsChartData = () => {
    if (!evolutionData?.lifeEvents.length) return null;

    const eventTypes = evolutionData.lifeEvents.reduce((acc: any, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(eventTypes).map(type => 
        type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      ),
      datasets: [
        {
          label: 'Life Events',
          data: Object.values(eventTypes),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getTraitColor = (trait: string, alpha = 1) => {
    const colors: { [key: string]: string } = {
      extraversion: `rgba(59, 130, 246, ${alpha})`,
      neuroticism: `rgba(239, 68, 68, ${alpha})`,
      openness: `rgba(245, 158, 11, ${alpha})`,
      conscientiousness: `rgba(34, 197, 94, ${alpha})`,
      agreeableness: `rgba(139, 92, 246, ${alpha})`
    };
    return colors[trait] || `rgba(156, 163, 175, ${alpha})`;
  };

  const getTraitIcon = (trait: string) => {
    const icons: { [key: string]: any } = {
      extraversion: <Users className="w-4 h-4" />,
      neuroticism: <Brain className="w-4 h-4" />,
      openness: <Target className="w-4 h-4" />,
      conscientiousness: <Star className="w-4 h-4" />,
      agreeableness: <Heart className="w-4 h-4" />
    };
    return icons[trait] || <Activity className="w-4 h-4" />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        beginAtZero: true,
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing personality evolution...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentPersonalityData = getCurrentPersonalityRadarData();
  const personalityComparisonData = getPersonalityComparisonData();
  const stabilityChartData = getStabilityChartData();
  const lifeEventsChartData = getLifeEventsChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Personality Evolution</h1>
              <p className="text-gray-600">Track your personality development and growth over time</p>
            </div>
            <button
              onClick={loadEvolutionData}
              className="wellness-button flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="wellness-card mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="wellness-input w-full"
              >
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
              </select>
            </div>
            <div className="md:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">Granularity</label>
              <select
                value={selectedGranularity}
                onChange={(e) => setSelectedGranularity(e.target.value)}
                className="wellness-input w-full"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Personality Overview */}
        {evolutionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="wellness-card mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personality Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(evolutionData.stabilityMetrics.overallStability * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Overall Stability</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {(evolutionData.stabilityMetrics.growthRate * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(evolutionData.stabilityMetrics.adaptationScore * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Adaptation Score</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {evolutionData.lifeEvents.length}
                </div>
                <div className="text-sm text-gray-600">Life Events</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="wellness-card mb-6"
        >
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('traits')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'traits'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trait Evolution
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Life Events
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'growth'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Growth Areas
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentPersonalityData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-blue-500" />
                    Current Personality Profile
                  </h3>
                  <div className="h-64">
                    <Radar data={currentPersonalityData} options={radarOptions} />
                  </div>
                </div>
              )}

              {personalityComparisonData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                    Personality Evolution
                  </h3>
                  <div className="h-64">
                    <Radar data={personalityComparisonData} options={radarOptions} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'traits' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.keys(evolutionData?.traitEvolution || {}).map((trait, index) => {
                const traitData = getTraitChartData(trait);
                if (!traitData) return null;

                const traitInfo = evolutionData?.traitEvolution[trait as keyof typeof evolutionData.traitEvolution];
                const latestData = traitInfo?.[traitInfo.length - 1];
                const trend = latestData?.trend || 'stable';

                return (
                  <div key={trait} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="mr-2" style={{ color: getTraitColor(trait) }}>
                          {getTraitIcon(trait)}
                        </span>
                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend)}
                        <span className="text-sm text-gray-600">
                          {latestData?.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="h-48">
                      <Line data={traitData} options={chartOptions} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              {lifeEventsChartData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                    Life Events Distribution
                  </h3>
                  <div className="h-64">
                    <Doughnut data={lifeEventsChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Life Events</h3>
                <div className="space-y-3">
                  {evolutionData?.lifeEvents.slice(-5).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {event.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </h4>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">
                          Impact: {(event.impact * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="space-y-6">
              {stabilityChartData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-purple-500" />
                    Trait Stability Scores
                  </h3>
                  <div className="h-64">
                    <Bar data={stabilityChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {evolutionData?.growthAreas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-500" />
                    Growth Areas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evolutionData.growthAreas.map((area, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">
                            {area.trait.charAt(0).toUpperCase() + area.trait.slice(1)}
                          </h4>
                          <span className="text-sm text-gray-600">
                            Gap: {area.gap.toFixed(1)}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Current: {area.currentLevel.toFixed(1)}</span>
                            <span>Target: {area.idealLevel.toFixed(1)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(area.currentLevel / area.idealLevel) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">Suggestions:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {area.suggestions.slice(0, 3).map((suggestion: string, idx: number) => (
                              <li key={idx} className="text-xs">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evolutionData?.personalityInsights.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Personality Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evolutionData.personalityInsights.map((insight, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium text-gray-800 mb-2">{insight.title || insight.type}</h4>
                        <p className="text-sm text-gray-600">{insight.message}</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            insight.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : insight.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {insight.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
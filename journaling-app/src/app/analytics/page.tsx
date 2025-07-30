'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Heart,
  Zap,
  Moon,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  Lightbulb,
  Clock,
  Target,
  Users,
  DollarSign
} from 'lucide-react';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';

interface CorrelationData {
  moodCorrelations: any[];
  energyCorrelations: any[];
  sleepCorrelations: any[];
  contentPatterns: any[];
  trends: any[];
  insights: any[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedAnalysis, setSelectedAnalysis] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadCorrelationData();
  }, [session, status, router, selectedPeriod, selectedAnalysis]);

  const loadCorrelationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/correlations?period=${selectedPeriod}&type=${selectedAnalysis}`);
      if (response.ok) {
        const data = await response.json();
        setCorrelationData(data);
      }
    } catch (error) {
      console.error('Error loading correlation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodChartData = () => {
    if (!correlationData?.moodCorrelations.length) return null;

    const data = correlationData.moodCorrelations.slice(-14);
    
    return {
      labels: data.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Mood Score',
          data: data.map(item => item.mood),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Entry Length (words)',
          data: data.map(item => Math.round(item.entryLength / 5)),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const getEnergyChartData = () => {
    if (!correlationData?.energyCorrelations.length) return null;

    const data = correlationData.energyCorrelations.slice(-14);
    
    return {
      labels: data.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Energy Level',
          data: data.map(item => item.energy),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const getSleepChartData = () => {
    if (!correlationData?.sleepCorrelations.length) return null;

    const data = correlationData.sleepCorrelations.slice(-14);
    
    return {
      labels: data.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Sleep Hours',
          data: data.map(item => item.previousDaySleep),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const getContentPatternsData = () => {
    if (!correlationData?.contentPatterns.length) return null;

    const patterns = correlationData.contentPatterns;
    const themes = ['work', 'relationships', 'health', 'finance'];
    const themeCounts = themes.map(theme => ({
      theme,
      count: patterns.filter(p => p.themes.includes(theme)).length
    }));

    return {
      labels: themeCounts.map(t => t.theme.charAt(0).toUpperCase() + t.theme.slice(1)),
      datasets: [
        {
          label: 'Theme Frequency',
          data: themeCounts.map(t => t.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getCorrelationMatrixData = () => {
    if (!correlationData) return null;

    const moodData = correlationData.moodCorrelations;
    const energyData = correlationData.energyCorrelations;
    const sleepData = correlationData.sleepCorrelations;

    const highMoodLongEntries = moodData.filter(d => d.correlation.highMoodLongEntries).length;
    const lowMoodShortEntries = moodData.filter(d => d.correlation.lowMoodShortEntries).length;
    const highEnergyDetailed = energyData.filter(d => d.correlation.highEnergyDetailed).length;
    const goodSleepDetailed = sleepData.filter(d => d.correlation.goodSleepLongEntries).length;

    return {
      labels: ['High Mood + Long', 'Low Mood + Short', 'High Energy + Detailed', 'Good Sleep + Detailed'],
      datasets: [
        {
          label: 'Correlation Strength',
          data: [highMoodLongEntries, lowMoodShortEntries, highEnergyDetailed, goodSleepDetailed],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 10
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  const getAnalyticsStats = () => {
    if (!correlationData) return null;

    const moodData = correlationData.moodCorrelations;
    const energyData = correlationData.energyCorrelations;
    const sleepData = correlationData.sleepCorrelations;
    const contentData = correlationData.contentPatterns;

    const avgMood = moodData.length > 0 ? moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length : 0;
    const avgEnergy = energyData.length > 0 ? energyData.reduce((sum, d) => sum + d.energy, 0) / energyData.length : 0;
    const avgSleep = sleepData.length > 0 ? sleepData.reduce((sum, d) => sum + d.previousDaySleep, 0) / sleepData.length : 0;
    const avgEntryLength = contentData.length > 0 ? contentData.reduce((sum, d) => sum + d.contentLength, 0) / contentData.length : 0;

    return {
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      avgEntryLength: Math.round(avgEntryLength),
      totalEntries: contentData.length,
      totalCheckIns: moodData.length
    };
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

  const stats = getAnalyticsStats();
  const moodChartData = getMoodChartData();
  const energyChartData = getEnergyChartData();
  const sleepChartData = getSleepChartData();
  const contentChartData = getContentPatternsData();
  const correlationMatrixData = getCorrelationMatrixData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Correlations</h1>
              <p className="text-gray-600">Deep insights into your patterns and relationships</p>
            </div>
            <button
              onClick={loadCorrelationData}
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
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
              </select>
            </div>
            <div className="md:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
              <select
                value={selectedAnalysis}
                onChange={(e) => setSelectedAnalysis(e.target.value)}
                className="wellness-input w-full"
              >
                <option value="all">All Data</option>
                <option value="mood">Mood Only</option>
                <option value="energy">Energy Only</option>
                <option value="sleep">Sleep Only</option>
                <option value="content">Content Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Analytics Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="wellness-card mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">{stats.avgMood}</div>
                <div className="text-sm text-gray-600">Avg Mood</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.avgEnergy}</div>
                <div className="text-sm text-gray-600">Avg Energy</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.avgSleep}</div>
                <div className="text-sm text-gray-600">Avg Sleep</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.avgEntryLength}</div>
                <div className="text-sm text-gray-600">Avg Entry Length</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalEntries}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">{stats.totalCheckIns}</div>
                <div className="text-sm text-gray-600">Total Check-ins</div>
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
              onClick={() => setActiveTab('correlations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'correlations'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Correlations
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'trends'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Insights
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {moodChartData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Mood vs Entry Length
                  </h3>
                  <div className="h-64">
                    <Line data={moodChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {energyChartData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    Energy Levels Over Time
                  </h3>
                  <div className="h-64">
                    <Line data={energyChartData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'correlations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sleepChartData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Moon className="w-4 h-4 mr-2 text-purple-500" />
                    Sleep Hours vs Journaling
                  </h3>
                  <div className="h-64">
                    <Line data={sleepChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {correlationMatrixData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                    Correlation Matrix
                  </h3>
                  <div className="h-64">
                    <Bar data={correlationMatrixData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contentChartData && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    Content Themes Distribution
                  </h3>
                  <div className="h-64">
                    <Bar data={contentChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                  Weekly Trends
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Trend analysis coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              {correlationData?.insights.length > 0 ? (
                correlationData.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg border"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">{insight.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{insight.message}</p>
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
                  <p className="text-gray-600">Add more data to generate personalized insights</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
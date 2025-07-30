import React, { useState, useEffect } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { Line, Bar, Scatter } from 'react-chartjs-2';

interface CorrelationData {
  moodCorrelations: any[];
  energyCorrelations: any[];
  sleepCorrelations: any[];
  contentPatterns: any[];
  trends: any[];
  insights: any[];
}

const CorrelationAnalysis: React.FC = () => {
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedAnalysis, setSelectedAnalysis] = useState('all');

  useEffect(() => {
    loadCorrelationData();
  }, [selectedPeriod, selectedAnalysis]);

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

    const data = correlationData.moodCorrelations.slice(-14); // Last 14 days
    
    return {
      labels: data.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Mood Score',
          data: data.map(item => item.mood),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Entry Length (words)',
          data: data.map(item => Math.round(item.entryLength / 5)), // Approximate word count
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

  const getCorrelationStats = () => {
    if (!correlationData) return null;

    const moodData = correlationData.moodCorrelations;
    const energyData = correlationData.energyCorrelations;
    const sleepData = correlationData.sleepCorrelations;

    const highMoodLongEntries = moodData.filter(d => d.correlation.highMoodLongEntries).length;
    const lowMoodShortEntries = moodData.filter(d => d.correlation.lowMoodShortEntries).length;
    const highEnergyDetailed = energyData.filter(d => d.correlation.highEnergyDetailed).length;
    const goodSleepDetailed = sleepData.filter(d => d.correlation.goodSleepLongEntries).length;

    return {
      highMoodLongEntries,
      lowMoodShortEntries,
      highEnergyDetailed,
      goodSleepDetailed
    };
  };

  if (isLoading) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Correlation Analysis</h2>
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing correlations...</p>
        </div>
      </div>
    );
  }

  if (!correlationData) {
    return (
      <div className="wellness-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Correlation Analysis</h2>
          <button
            onClick={loadCorrelationData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No correlation data available</p>
          <p className="text-sm text-gray-500 mt-2">Add more check-ins and journal entries to see correlations</p>
        </div>
      </div>
    );
  }

  const stats = getCorrelationStats();
  const moodChartData = getMoodChartData();
  const energyChartData = getEnergyChartData();
  const sleepChartData = getSleepChartData();
  const contentChartData = getContentPatternsData();

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Correlation Analysis</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="wellness-input text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
          </select>
          <button
            onClick={loadCorrelationData}
            className="text-green-600 hover:text-green-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Correlation Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600 mb-1">{stats.highMoodLongEntries}</div>
            <div className="text-xs text-gray-600">High Mood + Long Entries</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 mb-1">{stats.lowMoodShortEntries}</div>
            <div className="text-xs text-gray-600">Low Mood + Short Entries</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600 mb-1">{stats.highEnergyDetailed}</div>
            <div className="text-xs text-gray-600">High Energy + Detailed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600 mb-1">{stats.goodSleepDetailed}</div>
            <div className="text-xs text-gray-600">Good Sleep + Detailed</div>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood vs Entry Length */}
        {moodChartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg border"
          >
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Mood vs Entry Length
            </h3>
            <div className="h-64">
              <Line data={moodChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* Energy Levels */}
        {energyChartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg border"
          >
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Energy Levels Over Time
            </h3>
            <div className="h-64">
              <Line data={energyChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* Sleep Patterns */}
        {sleepChartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg border"
          >
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Moon className="w-4 h-4 mr-2 text-purple-500" />
              Sleep Hours vs Journaling
            </h3>
            <div className="h-64">
              <Line data={sleepChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* Content Themes */}
        {contentChartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-lg border"
          >
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-green-500" />
              Content Themes Distribution
            </h3>
            <div className="h-64">
              <Bar data={contentChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Key Insights */}
      {correlationData.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {correlationData.insights.map((insight, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CorrelationAnalysis; 
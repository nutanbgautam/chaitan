import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Heart, Zap, Moon, Plus } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CheckInData {
  date: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  sleep: number; // hours
}

interface CheckInTrendsProps {
  checkInData: CheckInData[];
  period: 'week' | 'month';
}

const CheckInTrends: React.FC<CheckInTrendsProps> = ({ checkInData, period }) => {
  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😞';
    return '😢';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-yellow-600';
    if (mood >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getAverage = (data: number[]) => {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  };

  const getTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3);
    const previous = data.slice(-6, -3);
    const recentAvg = getAverage(recent);
    const previousAvg = getAverage(previous);
    return recentAvg - previousAvg;
  };

  const moodData = {
    labels: checkInData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Mood',
        data: checkInData.map(d => d.mood),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const energyData = {
    labels: checkInData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Energy',
        data: checkInData.map(d => d.energy),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sleepData = {
    labels: checkInData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sleep (hours)',
        data: checkInData.map(d => d.sleep),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2 },
      },
      x: {
        ticks: { maxRotation: 0 },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const sleepChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        max: 12,
        ticks: { stepSize: 2 },
      },
    },
  };

  const currentMood = checkInData[checkInData.length - 1]?.mood || 0;
  const currentEnergy = checkInData[checkInData.length - 1]?.energy || 0;
  const currentSleep = checkInData[checkInData.length - 1]?.sleep || 0;

  const moodTrend = getTrend(checkInData.map(d => d.mood));
  const energyTrend = getTrend(checkInData.map(d => d.energy));
  const sleepTrend = getTrend(checkInData.map(d => d.sleep));

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Check-In Trends</h2>
        <button className="wellness-button flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Quick Check-In
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Stats */}
        <div className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">{getMoodEmoji(currentMood)}</div>
            <div className={`text-xl font-bold ${getMoodColor(currentMood)}`}>
              {currentMood}/10
            </div>
            <div className="text-sm text-gray-600">Current Mood</div>
            {moodTrend !== 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                {getTrendIcon(currentMood, currentMood - moodTrend)}
                <span className="text-xs text-gray-500">
                  {moodTrend > 0 ? 'Improving' : 'Declining'}
                </span>
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl mb-2">
              <Zap className="w-8 h-8 mx-auto text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-600">
              {currentEnergy}/10
            </div>
            <div className="text-sm text-gray-600">Energy Level</div>
            {energyTrend !== 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                {getTrendIcon(currentEnergy, currentEnergy - energyTrend)}
                <span className="text-xs text-gray-500">
                  {energyTrend > 0 ? 'Increasing' : 'Decreasing'}
                </span>
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl mb-2">
              <Moon className="w-8 h-8 mx-auto text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-600">
              {currentSleep}h
            </div>
            <div className="text-sm text-gray-600">Sleep</div>
            {sleepTrend !== 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                {getTrendIcon(currentSleep, currentSleep - sleepTrend)}
                <span className="text-xs text-gray-500">
                  {sleepTrend > 0 ? 'More sleep' : 'Less sleep'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Mood & Energy Trends</h3>
            <div className="h-48">
              <Line data={moodData} options={chartOptions} />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Sleep Pattern</h3>
            <div className="h-48">
              <Line data={sleepData} options={sleepChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-800 mb-2">This {period === 'week' ? 'Week' : 'Month'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Mood:</span>
            <span className="font-medium">{getAverage(checkInData.map(d => d.mood)).toFixed(1)}/10</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Energy:</span>
            <span className="font-medium">{getAverage(checkInData.map(d => d.energy)).toFixed(1)}/10</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Sleep:</span>
            <span className="font-medium">{getAverage(checkInData.map(d => d.sleep)).toFixed(1)}h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: Remove this default export and use real data from API/page
export default function CheckInTrendsDemo() {
  // Placeholder data for the past week
  const checkInData: CheckInData[] = [
    { date: '2024-01-15', mood: 7, energy: 6, sleep: 7.5 },
    { date: '2024-01-16', mood: 8, energy: 7, sleep: 8 },
    { date: '2024-01-17', mood: 6, energy: 5, sleep: 6.5 },
    { date: '2024-01-18', mood: 9, energy: 8, sleep: 8.5 },
    { date: '2024-01-19', mood: 7, energy: 6, sleep: 7 },
    { date: '2024-01-20', mood: 8, energy: 7, sleep: 7.5 },
    { date: '2024-01-21', mood: 6, energy: 5, sleep: 6 },
  ];
  
  return (
    <CheckInTrends
      checkInData={checkInData}
      period="week"
    />
  );
} 
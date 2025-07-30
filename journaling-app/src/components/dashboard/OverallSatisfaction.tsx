import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface OverallSatisfactionProps {
  overallScore: number;
  previousScore?: number;
  balanceScore: number;
  lifeAreas: Array<{ name: string; currentScore: number; targetScore: number }>;
}

const OverallSatisfaction: React.FC<OverallSatisfactionProps> = ({
  overallScore,
  previousScore,
  balanceScore,
  lifeAreas
}) => {
  const scoreChange = previousScore ? overallScore - previousScore : 0;
  const scoreChangePercent = previousScore ? ((scoreChange / previousScore) * 100) : 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceColor = (balance: number) => {
    if (balance <= 2) return 'text-green-600';
    if (balance <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance <= 2) return 'Well Balanced';
    if (balance <= 4) return 'Moderately Balanced';
    return 'Needs Balance';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendText = (change: number) => {
    if (change > 0) return 'Improving';
    if (change < 0) return 'Declining';
    return 'Stable';
  };

  return (
    <div className="wellness-card p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Overall Satisfaction & Balance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">/ 10</div>
              </div>
            </div>
            <div 
              className="absolute inset-0 rounded-full border-8 border-transparent"
              style={{
                borderTopColor: getScoreColor(overallScore).replace('text-', ''),
                transform: `rotate(${(overallScore / 10) * 360}deg)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            />
          </div>
          <h3 className="font-semibold text-gray-800 mt-3">Overall Satisfaction</h3>
          {previousScore && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {getTrendIcon(scoreChange)}
              <span className={`text-sm ${scoreChange > 0 ? 'text-green-600' : scoreChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {getTrendText(scoreChange)} ({Math.abs(scoreChangePercent).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Balance Score */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getBalanceColor(balanceScore)}`}>
                {balanceScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Balance</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 mt-3">Life Balance</h3>
          <p className={`text-sm mt-1 ${getBalanceColor(balanceScore)}`}>
            {getBalanceText(balanceScore)}
          </p>
        </div>

        {/* Top Areas */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Top Areas</h3>
          <div className="space-y-2">
            {lifeAreas
              .sort((a, b) => b.currentScore - a.currentScore)
              .slice(0, 3)
              .map((area, index) => (
                <div key={area.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm text-gray-700">{area.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800">{area.currentScore}</span>
                    <Target className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{area.targetScore}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: Remove this default export and use real data from API/page
export default function OverallSatisfactionDemo() {
  // Placeholder data
  const lifeAreas = [
    { name: 'Career', currentScore: 7, targetScore: 9 },
    { name: 'Health', currentScore: 6, targetScore: 8 },
    { name: 'Relationships', currentScore: 5, targetScore: 7 },
    { name: 'Finance', currentScore: 8, targetScore: 9 },
    { name: 'Personal Growth', currentScore: 6, targetScore: 8 },
    { name: 'Recreation', currentScore: 4, targetScore: 7 },
    { name: 'Spirituality', currentScore: 5, targetScore: 7 },
    { name: 'Environment', currentScore: 7, targetScore: 8 },
  ];
  
  const overallScore = lifeAreas.reduce((sum, area) => sum + area.currentScore, 0) / lifeAreas.length;
  const balanceScore = Math.max(...lifeAreas.map(a => a.currentScore)) - Math.min(...lifeAreas.map(a => a.currentScore));
  
  return (
    <OverallSatisfaction
      overallScore={overallScore}
      previousScore={6.2} // Placeholder previous score
      balanceScore={balanceScore}
      lifeAreas={lifeAreas}
    />
  );
} 
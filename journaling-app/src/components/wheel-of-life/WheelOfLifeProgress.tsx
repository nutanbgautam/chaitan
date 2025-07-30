import React from 'react';
import { Radar } from 'react-chartjs-2';
// TODO: Replace with actual type from types/index
interface LifeArea {
  id: string;
  name: string;
  currentScore: number;
  targetScore: number;
}

interface WheelOfLifeProgressProps {
  lifeAreas: LifeArea[];
}

const WheelOfLifeProgress: React.FC<WheelOfLifeProgressProps> = ({ lifeAreas }) => {
  // Prepare data for radar chart
  const data = {
    labels: lifeAreas.map(area => area.name),
    datasets: [
      {
        label: 'Current',
        data: lifeAreas.map(area => area.currentScore),
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderColor: 'rgba(56, 189, 248, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(56, 189, 248, 1)',
      },
      {
        label: 'Target',
        data: lifeAreas.map(area => area.targetScore),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.7)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { stepSize: 1 },
        pointLabels: { font: { size: 14 } },
      },
    },
  };

  return (
    <div className="wellness-card p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Wheel of Life Progress</h2>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2">
          <Radar data={data} options={options} />
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          {lifeAreas.map(area => (
            <div key={area.id}>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-700">{area.name}</span>
                <span className="text-sm text-gray-500">{area.currentScore}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-400 h-3 rounded-full transition-all"
                  style={{ width: `${(area.currentScore / 10) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Target: {area.targetScore}/10</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// TODO: Remove this default export and use real data from API/page
export default function WheelOfLifeProgressDemo() {
  // Placeholder data
  const lifeAreas = [
    { id: 'career', name: 'Career', currentScore: 7, targetScore: 9 },
    { id: 'health', name: 'Health', currentScore: 6, targetScore: 8 },
    { id: 'relationships', name: 'Relationships', currentScore: 5, targetScore: 7 },
    { id: 'finance', name: 'Finance', currentScore: 8, targetScore: 9 },
    { id: 'personal', name: 'Personal Growth', currentScore: 6, targetScore: 8 },
    { id: 'recreation', name: 'Recreation', currentScore: 4, targetScore: 7 },
    { id: 'spirituality', name: 'Spirituality', currentScore: 5, targetScore: 7 },
    { id: 'environment', name: 'Environment', currentScore: 7, targetScore: 8 },
  ];
  return <WheelOfLifeProgress lifeAreas={lifeAreas} />;
} 
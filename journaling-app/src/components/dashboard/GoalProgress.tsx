import React from 'react';
import { Target, Plus, CheckCircle, Clock, Calendar } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  lifeArea: string;
}

interface GoalProgressProps {
  goals: Goal[];
  completionRate: number;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals, completionRate }) => {
  const activeGoals = goals.filter(goal => goal.status !== 'completed');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date();
  };

  return (
    <div className="wellness-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Goal Progress</h2>
        <button className="wellness-button-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{completionRate}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444',
                transform: `rotate(${(completionRate / 100) * 360}deg)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            />
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-600">
              {completedGoals.length} of {goals.length} goals completed
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="md:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-3">Active Goals</h3>
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{goal.title}</h4>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(goal.status)}`}>
                    {getStatusIcon(goal.status)}
                    <span className="capitalize">{goal.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{goal.lifeArea}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className={`text-xs ${isOverdue(goal.targetDate) ? 'text-red-600' : 'text-gray-500'}`}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                      {isOverdue(goal.targetDate) && ' (Overdue)'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{goal.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
            
            {activeGoals.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No active goals</p>
                <p className="text-sm">Set your first goal to get started</p>
              </div>
            )}
            
            {activeGoals.length > 3 && (
              <div className="text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View all {activeGoals.length} active goals
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: Remove this default export and use real data from API/page
export default function GoalProgressDemo() {
  // Placeholder data
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Exercise 3 times per week',
      description: 'Build a consistent exercise routine',
      targetDate: '2024-02-15',
      status: 'in-progress',
      progress: 75,
      lifeArea: 'Health'
    },
    {
      id: '2',
      title: 'Read 2 books this month',
      description: 'Expand knowledge and vocabulary',
      targetDate: '2024-01-31',
      status: 'pending',
      progress: 25,
      lifeArea: 'Personal Growth'
    },
    {
      id: '3',
      title: 'Save $1000 for emergency fund',
      description: 'Build financial security',
      targetDate: '2024-03-01',
      status: 'in-progress',
      progress: 60,
      lifeArea: 'Finance'
    },
    {
      id: '4',
      title: 'Call family weekly',
      description: 'Maintain strong family relationships',
      targetDate: '2024-01-20',
      status: 'completed',
      progress: 100,
      lifeArea: 'Relationships'
    }
  ];
  
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const completionRate = Math.round((completedGoals.length / goals.length) * 100);
  
  return (
    <GoalProgress
      goals={goals}
      completionRate={completionRate}
    />
  );
} 
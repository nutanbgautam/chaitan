'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Link from 'next/link';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import TextEditor from '@/components/text/TextEditor';
import QuickCheckIn from '@/components/check-in/QuickCheckIn';
import { AnimatePresence } from 'framer-motion';

interface TryPageProps {
  params: {
    type: string;
  };
}

export default function TryPage({ params }: TryPageProps) {
  const [currentStep, setCurrentStep] = useState<'entry' | 'processing' | 'results' | 'save'>('entry');
  const [entryData, setEntryData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEntryComplete = async (data: any) => {
    setEntryData(data);
    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis result
      const mockAnalysis = {
        sentiment: {
          overall: 'positive',
          confidence: 0.85,
          emotions: ['joy', 'excitement'],
          intensity: 7,
          moodIndicators: ['enthusiastic', 'motivated'],
          emotionalTone: 'upbeat and optimistic'
        },
        people: [
          {
            name: 'Sarah',
            relationship: 'friend',
            context: 'Had a great conversation about future plans',
            sentiment: 'positive',
            interactionType: 'social',
            confidence: 0.9,
            frequency: 'first_mention'
          }
        ],
        finance: [
          {
            amount: 150,
            currency: 'USD',
            category: 'expense',
            description: 'Lunch with colleagues',
            context: 'Business lunch expense',
            confidence: 0.8,
            type: 'transaction'
          }
        ],
        tasks: [
          {
            description: 'Complete project proposal',
            priority: 'high',
            deadline: '2024-01-15',
            status: 'pending',
            category: 'work',
            confidence: 0.9,
            complexity: 'moderate'
          }
        ],
        insights: {
          themes: ['social connection', 'professional growth', 'personal development'],
          patterns: ['positive social interactions', 'goal-oriented thinking'],
          recommendations: ['Continue building relationships', 'Focus on project completion'],
          growthOpportunities: ['Leadership development', 'Network expansion'],
          actionItems: ['Follow up with Sarah', 'Complete project proposal'],
          reflectionPoints: ['How do social connections impact your well-being?']
        }
      };

      setAnalysis(mockAnalysis);
      setCurrentStep('results');
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process entry. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndSignup = () => {
    setCurrentStep('save');
  };

  const renderEntryComponent = () => {
    switch (params.type) {
      case 'voice':
        return (
          <VoiceRecorder
            onRecordingComplete={(blob) => handleEntryComplete({ type: 'voice', audio: blob })}
            onTranscriptionComplete={(transcription) => handleEntryComplete({ type: 'voice', transcription })}
            isProcessing={isProcessing}
          />
        );
      case 'text':
        return (
          <TextEditor
            onContentChange={() => {}}
            onSave={(content) => handleEntryComplete({ type: 'text', content })}
            isProcessing={isProcessing}
          />
        );
      case 'check-in':
        return (
          <QuickCheckIn
            onSave={(checkIn) => handleEntryComplete({ type: 'check-in', ...checkIn })}
            isProcessing={isProcessing}
          />
        );
      default:
        return <div>Invalid entry type</div>;
    }
  };

  const renderResults = () => {
    if (!analysis) return null;

    return (
      <div className="wellness-card max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Analysis Results</h2>
          <p className="text-gray-600">
            Here's what we discovered from your entry
          </p>
        </div>

        {/* Sentiment Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Emotional Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Overall Sentiment</h4>
              <p className="text-blue-700 capitalize">{analysis.sentiment.overall}</p>
              <p className="text-sm text-blue-600 mt-1">
                Confidence: {Math.round(analysis.sentiment.confidence * 100)}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Emotions Detected</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.sentiment.emotions.map((emotion: string) => (
                  <span key={emotion} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* People Mentioned */}
        {analysis.people && analysis.people.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">People Mentioned</h3>
            <div className="space-y-3">
              {analysis.people.map((person: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{person.name}</h4>
                      <p className="text-gray-600">{person.relationship}</p>
                      <p className="text-sm text-gray-500">{person.context}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      person.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      person.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {person.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        {analysis.tasks && analysis.tasks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Tasks & Action Items</h3>
            <div className="space-y-3">
              {analysis.tasks.map((task: any, index: number) => (
                <div key={index} className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{task.description}</h4>
                      <p className="text-sm text-gray-600">Category: {task.category}</p>
                      {task.deadline && (
                        <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Themes</h4>
              <div className="space-y-1">
                {analysis.insights.themes.map((theme: string, index: number) => (
                  <div key={index} className="text-sm text-gray-600">• {theme}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <div className="space-y-1">
                {analysis.insights.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-sm text-gray-600">• {rec}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Link href="/">
            <button className="wellness-button-secondary flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Try Another Entry</span>
            </button>
          </Link>

          <button
            onClick={handleSaveAndSignup}
            className="wellness-button flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Create Account</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSavePrompt = () => (
    <div className="wellness-card max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Save Your Analysis</h2>
        <p className="text-gray-600 mb-6">
          Your entry and analysis will be saved when you create your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">What You'll Get</h3>
          <ul className="text-green-700 text-sm space-y-2">
            <li>• Unlimited journal entries</li>
            <li>• Advanced AI analysis</li>
            <li>• Progress tracking</li>
            <li>• Wheel of Life insights</li>
            <li>• Weekly & monthly recaps</li>
          </ul>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Free Forever</h3>
          <ul className="text-blue-700 text-sm space-y-2">
            <li>• No credit card required</li>
            <li>• No hidden fees</li>
            <li>• Cancel anytime</li>
            <li>• Data privacy guaranteed</li>
            <li>• Export your data anytime</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/signup">
          <button className="wellness-button flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
          </button>
        </Link>
        <Link href="/login">
          <button className="wellness-button-secondary">
            Sign In to Existing Account
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="wellness-button-secondary flex items-center space-x-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {params.type === 'voice' ? 'Voice Entry' : 
               params.type === 'text' ? 'Text Entry' : 'Quick Check-In'}
            </h1>
            <p className="text-gray-600">
              Experience the power of AI-powered journaling
            </p>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderEntryComponent()}
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="loading-breathing">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Analyzing Your Entry</h2>
              <p className="text-gray-600">
                Our AI is processing your thoughts and extracting insights...
              </p>
            </motion.div>
          )}

          {currentStep === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderResults()}
            </motion.div>
          )}

          {currentStep === 'save' && (
            <motion.div
              key="save"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderSavePrompt()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
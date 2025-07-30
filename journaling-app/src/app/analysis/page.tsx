'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Users, 
  DollarSign, 
  CheckSquare, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  Calendar,
  BarChart3,
  PieChart,
  MessageSquare,
  Heart,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface AnalysisResult {
  id: string;
  journalEntryId: string;
  sentimentAnalysis: any;
  peopleMentioned: any[];
  financeCues: any[];
  tasksMentioned: any[];
  locations: any[];
  temporalReferences: any[];
  lifeAreas: any[];
  insights: any[];
  createdAt: string;
}

interface JournalEntry {
  id: string;
  content: string;
  transcription: string;
  processingStatus: string;
  processingType: string;
  createdAt: string;
}

export default function AnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadAnalysisData();
  }, [session, status, router]);

  const loadAnalysisData = async () => {
    try {
      // Load journal entries
      const entriesResponse = await fetch('/api/journal');
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setJournalEntries(entriesData);
      }

      // Load analysis results
      const analysisResponse = await fetch('/api/analysis');
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysisResults(analysisData);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredResults = () => {
    let filtered = analysisResults;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result => {
        const entry = journalEntries.find(e => e.id === result.journalEntryId);
        if (!entry) return false;
        
        const content = entry.transcription || entry.content || '';
        return content.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => {
        const entry = journalEntries.find(e => e.id === result.journalEntryId);
        return entry?.processingType === selectedType;
      });
    }

    // Apply period filter
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(result => new Date(result.createdAt) >= startDate);
    }

    return filtered;
  };

  const getSentimentStats = () => {
    const sentiments = analysisResults.map(r => r.sentimentAnalysis?.overall || 'neutral');
    const stats = {
      positive: sentiments.filter(s => s === 'positive').length,
      negative: sentiments.filter(s => s === 'negative').length,
      neutral: sentiments.filter(s => s === 'neutral').length
    };
    return stats;
  };

  const getAllPeople = () => {
    const allPeople: any[] = [];
    analysisResults.forEach(result => {
      if (result.peopleMentioned) {
        allPeople.push(...result.peopleMentioned);
      }
    });
    return allPeople;
  };

  const getAllFinance = () => {
    const allFinance: any[] = [];
    analysisResults.forEach(result => {
      if (result.financeCues) {
        allFinance.push(...result.financeCues);
      }
    });
    return allFinance;
  };

  const getAllTasks = () => {
    const allTasks: any[] = [];
    analysisResults.forEach(result => {
      if (result.tasksMentioned) {
        allTasks.push(...result.tasksMentioned);
      }
    });
    return allTasks;
  };

  const getAllInsights = () => {
    const allInsights: any[] = [];
    analysisResults.forEach(result => {
      if (result.insights) {
        allInsights.push(...result.insights);
      }
    });
    return allInsights;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analysis insights...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const filteredResults = getFilteredResults();
  const sentimentStats = getSentimentStats();
  const allPeople = getAllPeople();
  const allFinance = getAllFinance();
  const allTasks = getAllTasks();
  const allInsights = getAllInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Journal Analysis</h1>
              <p className="text-gray-600">AI-powered insights from your journal entries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="wellness-card mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search analysis by journal content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="wellness-input w-full pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="wellness-input w-full"
              >
                <option value="all">All Types</option>
                <option value="transcribe-only">Transcribe Only</option>
                <option value="full-analysis">Full Analysis</option>
              </select>
            </div>

            {/* Period Filter */}
            <div className="md:w-48">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="wellness-input w-full"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="wellness-card mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Analysis Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{analysisResults.length}</div>
              <div className="text-sm text-gray-600">Total Analyses</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{allPeople.length}</div>
              <div className="text-sm text-gray-600">People Mentioned</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{allTasks.length}</div>
              <div className="text-sm text-gray-600">Tasks Identified</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">{allInsights.length}</div>
              <div className="text-sm text-gray-600">AI Insights</div>
            </div>
          </div>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="wellness-card mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">{sentimentStats.positive}</div>
              <div className="text-sm text-gray-600">Positive Entries</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600 mb-1">{sentimentStats.neutral}</div>
              <div className="text-sm text-gray-600">Neutral Entries</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600 mb-1">{sentimentStats.negative}</div>
              <div className="text-sm text-gray-600">Negative Entries</div>
            </div>
          </div>
        </motion.div>

        {/* Key Insights */}
        {allInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="wellness-card mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allInsights.slice(0, 6).map((insight, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-800">{insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="wellness-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredResults.length} {filteredResults.length === 1 ? 'Analysis' : 'Analyses'}
            </h2>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedType !== 'all' || selectedPeriod !== 'all'
                  ? 'No analyses found' 
                  : 'No analyses yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedType !== 'all' || selectedPeriod !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create journal entries with "Full Analysis" to see AI insights here'
                }
              </p>
              {!searchTerm && selectedType === 'all' && selectedPeriod === 'all' && (
                <Link href="/journal/new">
                  <button className="wellness-button">
                    Create Your First Entry
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredResults.map((result) => {
                const entry = journalEntries.find(e => e.id === result.journalEntryId);
                if (!entry) return null;

                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Analysis from {new Date(entry.createdAt).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {entry.transcription || entry.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(result.sentimentAnalysis?.overall || 'neutral')}`}>
                            {result.sentimentAnalysis?.overall || 'neutral'} sentiment
                          </span>
                          <span className="text-xs text-gray-500">
                            {entry.processingType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* People */}
                      {result.peopleMentioned && result.peopleMentioned.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">People</span>
                          </div>
                          <div className="space-y-1">
                            {result.peopleMentioned.slice(0, 3).map((person, index) => (
                              <div key={index} className="text-xs text-blue-700">
                                {person.name} ({person.relationship})
                              </div>
                            ))}
                            {result.peopleMentioned.length > 3 && (
                              <div className="text-xs text-blue-600">
                                +{result.peopleMentioned.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Finance */}
                      {result.financeCues && result.financeCues.length > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Finance</span>
                          </div>
                          <div className="space-y-1">
                            {result.financeCues.slice(0, 3).map((finance, index) => (
                              <div key={index} className="text-xs text-green-700">
                                ${finance.amount} - {finance.category}
                              </div>
                            ))}
                            {result.financeCues.length > 3 && (
                              <div className="text-xs text-green-600">
                                +{result.financeCues.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tasks */}
                      {result.tasksMentioned && result.tasksMentioned.length > 0 && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">Tasks</span>
                          </div>
                          <div className="space-y-1">
                            {result.tasksMentioned.slice(0, 3).map((task, index) => (
                              <div key={index} className="text-xs text-purple-700">
                                {task.description}
                              </div>
                            ))}
                            {result.tasksMentioned.length > 3 && (
                              <div className="text-xs text-purple-600">
                                +{result.tasksMentioned.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {result.locations && result.locations.length > 0 && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">Locations</span>
                          </div>
                          <div className="space-y-1">
                            {result.locations.slice(0, 3).map((location, index) => (
                              <div key={index} className="text-xs text-orange-700">
                                {location.name}
                              </div>
                            ))}
                            {result.locations.length > 3 && (
                              <div className="text-xs text-orange-600">
                                +{result.locations.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
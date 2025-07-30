'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Heart, 
  Tag,
  ArrowRight,
  X,
  Clock,
  TrendingUp
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Loading, { FullScreenLoading } from '@/components/ui/Loading';
import { JournalEntry } from '@/types';

interface SearchResult {
  id: string;
  type: 'journal' | 'check-in';
  title: string;
  content: string;
  date: string;
  tags?: string[];
  sentiment?: string;
  score?: number;
}

function SearchContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    dateRange: 'all',
    sentiment: 'all',
    tags: [] as string[]
  });

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (query) {
      performSearch();
    }
  }, [session, status, router, query]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // In a real app, you'd make an API call to search
      // For now, we'll simulate search results
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'journal',
          title: 'Morning Reflection',
          content: 'Today I felt particularly grateful for the beautiful weather and the opportunity to spend time with family.',
          date: '2024-01-15T09:00:00Z',
          tags: ['gratitude', 'family', 'weather'],
          sentiment: 'positive',
          score: 0.85
        },
        {
          id: '2',
          type: 'check-in',
          title: 'Daily Check-in',
          content: 'Energy: 8/10, Mood: Happy, Sleep: 7 hours',
          date: '2024-01-15T08:00:00Z',
          tags: ['energy', 'mood', 'sleep'],
          sentiment: 'positive',
          score: 0.8
        },
        {
          id: '3',
          type: 'journal',
          title: 'Work Challenges',
          content: 'Facing some challenges at work today, but I\'m learning to stay positive and focus on solutions.',
          date: '2024-01-14T18:00:00Z',
          tags: ['work', 'challenges', 'growth'],
          sentiment: 'neutral',
          score: 0.6
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const clearFilters = () => {
    setActiveFilters({
      type: 'all',
      dateRange: 'all',
      sentiment: 'all',
      tags: []
    });
    setDateRange({ start: '', end: '' });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journal': return <FileText className="w-4 h-4" />;
      case 'check-in': return <Heart className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  if (status === 'loading') {
    return (
      <Layout>
        <FullScreenLoading text="Loading search..." />
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Your Journal</h1>
          <p className="text-gray-600">Find specific entries, check-ins, and insights across your journaling history.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your journal entries, check-ins, and insights..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={activeFilters.type}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="journal">Journal Entries</option>
                  <option value="check-in">Check-ins</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={activeFilters.dateRange}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Sentiment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment</label>
                <select
                  value={activeFilters.sentiment}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, sentiment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = activeFilters.tags.includes(tag)
                          ? activeFilters.tags.filter(t => t !== tag)
                          : [...activeFilters.tags, tag];
                        setActiveFilters(prev => ({ ...prev, tags: newTags }));
                      }}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        activeFilters.tags.includes(tag)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {activeFilters.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Search Results */}
        {query && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results for "{query}"
              </h2>
              <p className="text-gray-600">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {isLoading ? (
              <Loading text="Searching..." />
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (result.type === 'journal') {
                        router.push(`/journal/${result.id}`);
                      } else {
                        router.push(`/check-ins/${result.id}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTypeIcon(result.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{result.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {formatDate(result.date)}
                            {result.sentiment && (
                              <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(result.sentiment)}`}>
                                {result.sentiment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <p 
                      className="text-gray-700 mb-3 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: highlightQuery(result.content, query) }}
                    />

                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600 mb-6">
              Search through your journal entries, check-ins, and insights to find specific content.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Journal Entries</h4>
                <p className="text-sm text-gray-600">Search through your written thoughts and reflections</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Check-ins</h4>
                <p className="text-sm text-gray-600">Find specific mood and wellness check-ins</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Insights</h4>
                <p className="text-sm text-gray-600">Discover patterns and trends in your data</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<FullScreenLoading text="Loading search..." />}>
      <SearchContent />
    </Suspense>
  );
} 
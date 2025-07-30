'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import SwipeableRecapCard from '@/components/recaps/SwipeableRecapCard';
import { 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Heart,
  Users,
  DollarSign,
  CheckSquare,
  BarChart3,
  Lightbulb,
  Star,
  ArrowRight,
  Plus,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Brain,
  Activity,
  Zap,
  Moon,
  MapPin,
  Award,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Minus,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Recap {
  id: string;
  type: 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  content: string;
  insights?: string;
  recommendations?: string;
  lifeAreaImprovements?: string;
  metrics?: string;
  createdAt: string;
}

interface CategoryRecap {
  category: string;
  title: string;
  icon: string;
  color: string;
  metrics: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  }[];
  insights: string[];
  highlights: string[];
}

interface RecapCard {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  content: string;
  insights: string[];
  highlights: string[];
  data: any;
}

export default function RecapsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [categoryRecaps, setCategoryRecaps] = useState<CategoryRecap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // New state for swipeable cards
  const [recapCards, setRecapCards] = useState<RecapCard[]>([]);
  const [showSwipeableCards, setShowSwipeableCards] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadRecaps();
  }, [session, status, router]);

  const loadRecaps = async () => {
    try {
      const response = await fetch('/api/recaps?limit=50');
      if (response.ok) {
        const data = await response.json();
        setCategoryRecaps(data);
        
        // Generate swipeable cards
        await generateSwipeableCards();
      }
    } catch (error) {
      console.error('Error loading recaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSwipeableCards = async () => {
    try {
      const response = await fetch('/api/recaps/generate-cards');
      if (response.ok) {
        const cards = await response.json();
        setRecapCards(cards);
      }
    } catch (error) {
      console.error('Error generating swipeable cards:', error);
    }
  };

  const generateCategoryRecaps = (recapsData: Recap[]) => {
    // This function is now handled by the API
    // The API returns category recaps directly
    console.log('Category recaps loaded from API:', recapsData);
  };

  const generateRecap = async (type: 'weekly' | 'monthly') => {
    try {
      setShowGenerateModal(false);
      const response = await fetch('/api/recaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        await loadRecaps();
      }
    } catch (error) {
      console.error('Error generating recap:', error);
    }
  };

  const filteredRecaps = recaps.filter(recap => 
    filterType === 'all' || recap.type === filterType
  );

  const sortedRecaps = [...filteredRecaps].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getRecapIcon = (type: string) => {
    return type === 'weekly' ? <Calendar className="fs-4" /> : <BarChart3 className="fs-4" />;
  };

  const getRecapColor = (type: string) => {
    return type === 'weekly' ? 'primary' : 'success';
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUpIcon className="text-success" />;
    if (trend === 'down') return <TrendingDownIcon className="text-danger" />;
    return <Minus className="text-muted" />;
  };

  // Function to convert icon name to React component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Heart': <Heart className="fs-4" />,
      'BookOpen': <BookOpen className="fs-4" />,
      'Target': <Target className="fs-4" />,
      'Users': <Users className="fs-4" />,
      'DollarSign': <DollarSign className="fs-4" />,
      'Brain': <Brain className="fs-4" />,
      'Calendar': <Calendar className="fs-4" />,
      'BarChart3': <BarChart3 className="fs-4" />
    };
    return iconMap[iconName] || <BookOpen className="fs-4" />;
  };

  const filteredCategoryRecaps = activeCategory === 'all' 
    ? categoryRecaps 
    : categoryRecaps.filter(recap => recap.category === activeCategory);

  const handleCardComplete = (cardId: string) => {
    console.log('Card completed:', cardId);
  };

  const handleShare = (cardId: string) => {
    console.log('Sharing card:', cardId);
    // Implement share functionality
  };

  const handleSave = (cardId: string) => {
    console.log('Saving card:', cardId);
    // Implement save functionality
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading recaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation />

      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row">
          <div className="col-12">
            {/* Welcome Section */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Your Weekly Story
              </div>
              <h1 className="text-white display-6 fw-bold mb-2">
                Recaps ✨
              </h1>
              <p className="text-white opacity-75 fs-5">Discover your week through beautiful stories</p>
            </div>

            {/* View Mode Toggle */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-center">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('cards')}
                    >
                      <BookOpen className="me-2" />
                      Story Cards
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <BarChart3 className="me-2" />
                      Data View
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Swipeable Cards View */}
            {viewMode === 'cards' && recapCards.length > 0 && (
              <div className="card bg-dark bg-opacity-25 border-0">
                <div className="card-body p-0">
                  <div style={{ height: '70vh', minHeight: '500px' }}>
                    <SwipeableRecapCard
                      cards={recapCards}
                      onCardComplete={handleCardComplete}
                      onShare={handleShare}
                      onSave={handleSave}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Data View */}
            {viewMode === 'list' && (
              <>
                {/* Category Filters */}
                <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-white fw-medium mb-2">Filter by Category</label>
                        <select
                          className="form-select bg-dark border-0 text-white"
                          value={activeCategory}
                          onChange={(e) => setActiveCategory(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          <option value="wellness">Wellness & Mood</option>
                          <option value="journal">Journal & Reflection</option>
                          <option value="life-areas">Life Areas & Goals</option>
                          <option value="relationships">Relationships & People</option>
                          <option value="productivity">Finance & Tasks</option>
                          <option value="growth">Personal Growth</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-white fw-medium mb-2">Filter by Period</label>
                        <select
                          className="form-select bg-dark border-0 text-white"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as 'all' | 'weekly' | 'monthly')}
                        >
                          <option value="all">All Periods</option>
                          <option value="weekly">Weekly Recaps</option>
                          <option value="monthly">Monthly Recaps</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Recaps */}
                <div className="row g-4">
                  {filteredCategoryRecaps.map((categoryRecap) => (
                    <div key={categoryRecap.category} className="col-12 col-lg-6">
                      <div className="card bg-dark bg-opacity-25 border-0 h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-4">
                            <div className={`bg-${categoryRecap.color} bg-opacity-75 rounded p-2 me-3`}>
                              {getIconComponent(categoryRecap.icon)}
                            </div>
                            <div className="flex-grow-1">
                              <h4 className="text-white mb-1 fw-bold">{categoryRecap.title}</h4>
                              <p className="text-white opacity-75 mb-0">Comprehensive insights and trends</p>
                            </div>
                            <button className="btn btn-outline-light btn-sm">
                              <Eye className="me-1" />
                              View
                            </button>
                          </div>

                          {/* Metrics Grid */}
                          <div className="row g-3 mb-4">
                            {categoryRecap.metrics.map((metric, index) => (
                              <div key={index} className="col-6">
                                <div className="card bg-light bg-opacity-10 border-0">
                                  <div className="card-body text-center py-3">
                                    <div className="d-flex align-items-center justify-content-center mb-2">
                                      {getTrendIcon(metric.trend)}
                                      <span className="text-white fw-bold fs-5 ms-2">{metric.value}</span>
                                    </div>
                                    <div className="text-white opacity-75 small">{metric.label}</div>
                                    {metric.change && (
                                      <div className={`small ${metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-danger' : 'text-muted'}`}>
                                        {metric.change}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Insights and Highlights */}
                          <div className="row">
                            <div className="col-md-6">
                              <h6 className="text-white mb-3 d-flex align-items-center">
                                <Lightbulb className="me-2" />
                                Key Insights
                              </h6>
                              <ul className="list-unstyled">
                                {categoryRecap.insights.map((insight, index) => (
                                  <li key={index} className="d-flex align-items-start mb-2">
                                    <CheckCircle className="text-success me-2 mt-1 flex-shrink-0" />
                                    <span className="text-white opacity-90 small">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6 className="text-white mb-3 d-flex align-items-center">
                                <Star className="me-2" />
                                Highlights
                              </h6>
                              <ul className="list-unstyled">
                                {categoryRecap.highlights.map((highlight, index) => (
                                  <li key={index} className="d-flex align-items-start mb-2">
                                    <Award className="text-warning me-2 mt-1 flex-shrink-0" />
                                    <span className="text-white opacity-90 small">{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* No Cards Message */}
            {viewMode === 'cards' && recapCards.length === 0 && (
              <div className="card bg-dark bg-opacity-25 border-0">
                <div className="card-body text-center py-5">
                  <div className="display-1 mb-4">📊</div>
                  <h3 className="text-white text-xl font-semibold mb-3">No Recap Data Yet</h3>
                  <p className="text-white opacity-75 mb-4 fs-5">
                    Start journaling and tracking your activities to see your weekly story
                  </p>
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className="btn btn-primary btn-lg px-4"
                  >
                    <Plus className="me-2" />
                    Generate Your First Recap
                  </button>
                </div>
              </div>
            )}

            {/* Generate Modal */}
            {showGenerateModal && (
              <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content bg-dark border-0">
                    <div className="modal-header border-0">
                      <h5 className="modal-title text-white fw-bold">Generate New Recap</h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setShowGenerateModal(false)}
                      />
                    </div>
                    <div className="modal-body">
                      <p className="text-white opacity-75 mb-4">Choose the type of recap to generate:</p>
                      <div className="d-grid gap-3">
                        <button
                          onClick={() => generateRecap('weekly')}
                          className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
                        >
                          <Calendar className="me-3" />
                          Weekly Story
                        </button>
                        <button
                          onClick={() => generateRecap('monthly')}
                          className="btn btn-success btn-lg d-flex align-items-center justify-content-center"
                        >
                          <BarChart3 className="me-3" />
                          Monthly Summary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
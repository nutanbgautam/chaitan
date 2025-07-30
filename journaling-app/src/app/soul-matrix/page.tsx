'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  RefreshCw,
  BarChart3,
  User,
  Heart,
  Target,
  Zap,
  Shield,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface SoulMatrix {
  id: string;
  userId: string;
  traits: {
    openness: TraitScore;
    conscientiousness: TraitScore;
    extraversion: TraitScore;
    agreeableness: TraitScore;
    neuroticism: TraitScore;
  };
  confidence: number;
  lastUpdated: string;
  nextUpdate: string;
  analyzedEntries: string[];
}

interface TraitScore {
  score: number; // 0-100
  percentile: number; // 0-100
  description: string;
  keywords: string[];
  trends: 'increasing' | 'decreasing' | 'stable';
}

const traitIcons = {
  openness: Brain,
  conscientiousness: Target,
  extraversion: Zap,
  agreeableness: Heart,
  neuroticism: Shield
};

const traitColors = {
  openness: 'bg-purple-500',
  conscientiousness: 'bg-blue-500',
  extraversion: 'bg-warning',
  agreeableness: 'bg-success',
  neuroticism: 'bg-danger'
};

const traitDescriptions = {
  openness: 'Openness to experience reflects curiosity, imagination, and willingness to try new things.',
  conscientiousness: 'Conscientiousness reflects organization, responsibility, and goal-directed behavior.',
  extraversion: 'Extraversion reflects sociability, assertiveness, and positive emotionality.',
  agreeableness: 'Agreeableness reflects compassion, cooperation, and trust in others.',
  neuroticism: 'Neuroticism reflects emotional instability, anxiety, and negative emotionality.'
};

export default function SoulMatrixPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [soulMatrix, setSoulMatrix] = useState<SoulMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadSoulMatrix();
  }, [session, status, router]);

  const loadSoulMatrix = async () => {
    try {
      const response = await fetch('/api/soul-matrix');
      if (response.ok) {
        const data = await response.json();
        setSoulMatrix(data);
      }
    } catch (error) {
      console.error('Error loading SoulMatrix:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSoulMatrix = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/soul-matrix/update', {
        method: 'POST',
      });
      if (response.ok) {
        await loadSoulMatrix();
      }
    } catch (error) {
      console.error('Error updating SoulMatrix:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTraitColor = (trait: string) => {
    return traitColors[trait as keyof typeof traitColors] || 'bg-secondary';
  };

  const getTraitIcon = (trait: string) => {
    const IconComponent = traitIcons[trait as keyof typeof traitIcons];
    return IconComponent ? <IconComponent className="fs-4" /> : <User className="fs-4" />;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') {
      return <TrendingUp className="w-4 h-4 text-success" />;
    } else if (trend === 'decreasing') {
      return <TrendingUp className="w-4 h-4 text-danger rotate-180" />;
    } else {
      return <BarChart3 className="w-4 h-4 text-muted" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-danger';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white opacity-75">Loading your personality profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-25 backdrop-blur">
        <div className="container">
          <Link href="/dashboard" className="btn btn-outline-light btn-sm rounded-circle me-3">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="navbar-brand d-flex align-items-center">
            <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="fw-bold">SoulMatrix</span>
          </div>
          <div className="navbar-nav ms-auto">
            <button
              onClick={handleUpdateSoulMatrix}
              disabled={isUpdating}
              className="btn btn-outline-light btn-sm"
            >
              <RefreshCw className={`w-4 h-4 me-2 ${isUpdating ? 'spinner-border spinner-border-sm' : ''}`} />
              {isUpdating ? 'Updating...' : 'Update Analysis'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {soulMatrix ? (
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Overview Card */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle p-2 me-3 ${getTraitColor('openness')}`}>
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-white fw-bold mb-0">Personality Overview</h2>
                    </div>
                    <div className="text-end">
                      <div className="text-white opacity-75 small">Analysis Confidence</div>
                      <div className={`fw-bold fs-5 ${getConfidenceColor(soulMatrix.confidence)}`}>
                        {(soulMatrix.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="row text-center">
                    <div className="col-md-4 mb-3">
                      <div className="bg-light bg-opacity-10 rounded p-3">
                        <div className="text-white fw-bold fs-4">{soulMatrix.analyzedEntries.length}</div>
                        <div className="text-white opacity-75 small">Entries Analyzed</div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="bg-light bg-opacity-10 rounded p-3">
                        <div className="text-white fw-bold fs-4">
                          {new Date(soulMatrix.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-white opacity-75 small">Last Updated</div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="bg-light bg-opacity-10 rounded p-3">
                        <div className="text-white fw-bold fs-4">
                          {new Date(soulMatrix.nextUpdate).toLocaleDateString()}
                        </div>
                        <div className="text-white opacity-75 small">Next Update</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Five Traits */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-white fw-bold mb-4">Big Five Personality Traits</h3>
                  
                  <div className="row">
                    {Object.entries(soulMatrix.traits).map(([traitName, trait], index) => (
                      <div key={traitName} className="col-lg-6 mb-4">
                        <div className="card bg-light bg-opacity-10 border border-white border-opacity-25">
                          <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center">
                                <div className={`rounded-circle p-2 me-3 ${getTraitColor(traitName)}`}>
                                  {getTraitIcon(traitName)}
                                </div>
                                <div>
                                  <h5 className="text-white fw-bold mb-1 text-capitalize">{traitName}</h5>
                                  <div className="d-flex align-items-center">
                                    <span className="text-white opacity-75 small me-2">{trait.score}/100</span>
                                    {getTrendIcon(trait.trends)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="text-white opacity-75 small">Percentile</div>
                                <div className="text-white fw-bold">{trait.percentile}%</div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="d-flex justify-content-between text-white opacity-75 small mb-1">
                                <span>Low</span>
                                <span>High</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className={`progress-bar ${getTraitColor(traitName)}`}
                                  style={{ width: `${trait.score}%` }}
                                ></div>
                              </div>
                            </div>

                            <p className="text-white opacity-75 small mb-3">{trait.description}</p>

                            <div className="d-flex flex-wrap gap-1">
                              {trait.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                                <span 
                                  key={keywordIndex}
                                  className="badge bg-light bg-opacity-25 text-white"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personality Insights */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-white fw-bold mb-4">Personality Insights</h3>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h5 className="text-white fw-bold mb-3">Your Strengths</h5>
                      <ul className="list-unstyled">
                        {Object.entries(soulMatrix.traits)
                          .filter(([_, trait]) => trait.score >= 70)
                          .map(([traitName, trait]) => (
                            <li key={traitName} className="d-flex align-items-start mb-2">
                              <span className="badge bg-success rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></span>
                              <span className="text-white opacity-75">
                                <span className="fw-bold text-capitalize">{traitName}</span>: {trait.description}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="col-md-6 mb-3">
                      <h5 className="text-white fw-bold mb-3">Growth Areas</h5>
                      <ul className="list-unstyled">
                        {Object.entries(soulMatrix.traits)
                          .filter(([_, trait]) => trait.score <= 40)
                          .map(([traitName, trait]) => (
                            <li key={traitName} className="d-flex align-items-start mb-2">
                              <span className="badge bg-info rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></span>
                              <span className="text-white opacity-75">
                                <span className="fw-bold text-capitalize">{traitName}</span>: Consider developing this aspect
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25">
                <div className="card-body p-4">
                  <h3 className="text-white fw-bold mb-4">Recent Analysis Activity</h3>
                  
                  <div className="d-flex align-items-center justify-content-between p-3 bg-light bg-opacity-10 rounded mb-4">
                    <div className="d-flex align-items-center">
                      <Clock className="w-5 h-5 text-white opacity-75 me-3" />
                      <div>
                        <div className="text-white fw-bold">Last Analysis</div>
                        <div className="text-white opacity-75 small">
                          {new Date(soulMatrix.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-white opacity-75 small">Next Update</div>
                      <div className="text-white fw-bold">
                        {new Date(soulMatrix.nextUpdate).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link href="/journal">
                      <button className="btn btn-outline-light">
                        View Journal Entries
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25 text-center">
                <div className="card-body p-5">
                  <div className="text-white opacity-50 mb-4">
                    <Brain className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-white fw-bold mb-3">No personality profile yet</h3>
                  <p className="text-white opacity-75 mb-4">
                    Create some journal entries to start building your personality profile
                  </p>
                  <Link href="/journal/new">
                    <button className="btn btn-primary">
                      Create Your First Entry
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
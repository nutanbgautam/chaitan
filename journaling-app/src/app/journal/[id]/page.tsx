'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ArrowLeft, Calendar, Clock, User, DollarSign, MapPin, Target, 
  TrendingUp, Heart, Brain, Users, FileText, Lightbulb, Activity,
  CheckCircle, AlertCircle, Info, Star, Tag, MessageSquare, Mic, PenTool,
  Play, Pause, Volume2, ExternalLink
} from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  transcription?: string;
  audioUrl?: string;
  processingType: 'transcribe-only' | 'full-analysis';
  processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface AnalysisResult {
  sentiment?: {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
    intensity: number;
    moodIndicators: string[];
    emotionalTone: string;
  };
  people?: Array<{
    name: string;
    relationship: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    interactionType: string;
    confidence: number;
  }>;
  finance?: Array<{
    amount: number | null;
    currency: string;
    category: 'income' | 'expense' | 'investment' | 'debt';
    description: string;
    context: string;
    type: 'transaction' | 'decision' | 'plan' | 'reflection';
  }>;
  tasks?: Array<{
    description: string;
    priority: 'high' | 'medium' | 'low';
    deadline: string | null;
    status: 'pending' | 'completed' | 'in-progress';
    category: string;
  }>;
  locations?: Array<{
    name: string;
    type: 'work' | 'home' | 'travel' | 'leisure' | 'other';
    context: string;
    significance: 'primary' | 'secondary' | 'passing_mention';
  }>;
  temporal?: Array<{
    date: string | null;
    time: string | null;
    duration: string | null;
    context: string;
    type: 'past' | 'present' | 'future' | 'recurring';
  }>;
  lifeAreas?: Array<{
    area: string;
    relevance: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    insights: string;
    priorityAlignment: 'high' | 'medium' | 'low';
  }>;
  insights?: {
    themes: string[];
    patterns: string[];
    recommendations: string[];
    growthOpportunities: string[];
    actionItems: string[];
    reflectionPoints: string[];
  };
}

export default function JournalEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [peopleProfiles, setPeopleProfiles] = useState<Record<string, any>>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadEntry = async () => {
    try {
      const response = await fetch(`/api/journal/entries/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to load journal entry');
      }
      const data = await response.json();
      setEntry(data.entry);
      
      // Parse analysis data if it exists
      if (data.analysis) {
        try {
          const parsedAnalysis: AnalysisResult = {};
          
          if (data.analysis.sentiment_analysis) {
            parsedAnalysis.sentiment = JSON.parse(data.analysis.sentiment_analysis);
          }
          if (data.analysis.people_mentioned) {
            parsedAnalysis.people = JSON.parse(data.analysis.people_mentioned);
          }
          if (data.analysis.finance_cues) {
            parsedAnalysis.finance = JSON.parse(data.analysis.finance_cues);
          }
          if (data.analysis.tasks_mentioned) {
            parsedAnalysis.tasks = JSON.parse(data.analysis.tasks_mentioned);
          }
          if (data.analysis.locations) {
            parsedAnalysis.locations = JSON.parse(data.analysis.locations);
          }
          if (data.analysis.temporal_references) {
            parsedAnalysis.temporal = JSON.parse(data.analysis.temporal_references);
          }
          if (data.analysis.life_areas) {
            parsedAnalysis.lifeAreas = JSON.parse(data.analysis.life_areas);
          }
          if (data.analysis.insights) {
            parsedAnalysis.insights = JSON.parse(data.analysis.insights);
          }
          
          setAnalysis(parsedAnalysis);
          
          // Load people profiles if people are mentioned
          if (parsedAnalysis.people && parsedAnalysis.people.length > 0) {
            await loadPeopleProfiles(parsedAnalysis.people);
          }
        } catch (parseError) {
          console.error('Error parsing analysis data:', parseError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadPeopleProfiles = async (people: Array<{ name: string }>) => {
    try {
      const response = await fetch('/api/people');
      if (response.ok) {
        const allPeople = await response.json();
        const profilesMap: Record<string, any> = {};
        
        people.forEach(person => {
          const foundPerson = allPeople.find((p: any) => 
            p.name.toLowerCase() === person.name.toLowerCase()
          );
          if (foundPerson) {
            profilesMap[person.name] = foundPerson;
          }
        });
        
        setPeopleProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Error loading people profiles:', error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadEntry();
    }
  }, [params.id]);

  // Audio player functions
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleUpgradeToFullAnalysis = async () => {
    if (!entry) return;
    
    setIsUpgrading(true);
    try {
      // Update the journal entry to trigger full analysis
      const response = await fetch(`/api/journal/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          processingType: 'full-analysis'
        }),
      });

      if (response.ok) {
        // Reload the entry to get the updated analysis
        await loadEntry();
      } else {
        throw new Error('Failed to upgrade to full analysis');
      }
    } catch (error) {
      console.error('Error upgrading to full analysis:', error);
      setError('Failed to upgrade to full analysis. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading journal entry...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="alert alert-danger d-inline-block" role="alert">
            <AlertCircle className="fs-1 mb-3" />
            <h4 className="alert-heading">Entry Not Found</h4>
            <p>{error || 'The journal entry could not be loaded.'}</p>
            <hr />
            <button
              onClick={() => router.push('/journal')}
              className="btn btn-outline-light"
            >
              Back to Journal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const formatTimeDisplay = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Time not available';
    }
  };

  // Determine if this is a voice entry
  const isVoiceEntry = entry.audioUrl && entry.audioUrl.trim() !== '';

  // Chart data preparation
  const sentimentData = analysis?.sentiment ? [
    { name: 'Positive', value: analysis.sentiment.overall === 'positive' ? 1 : 0, fill: '#198754' },
    { name: 'Neutral', value: analysis.sentiment.overall === 'neutral' ? 1 : 0, fill: '#6c757d' },
    { name: 'Negative', value: analysis.sentiment.overall === 'negative' ? 1 : 0, fill: '#dc3545' },
  ] : [];

  const peopleData = analysis?.people?.map(person => ({
    name: person.name,
    sentiment: person.sentiment === 'positive' ? 1 : person.sentiment === 'negative' ? -1 : 0,
    relationship: person.relationship,
  })) || [];

  const financeData = analysis?.finance?.map(item => ({
    category: item.category,
    amount: item.amount || 0,
    type: item.type,
  })) || [];

  const taskPriorityData = analysis?.tasks?.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const lifeAreasData = analysis?.lifeAreas?.map(area => ({
    area: area.area,
    relevance: area.relevance,
    sentiment: area.sentiment === 'positive' ? 1 : area.sentiment === 'negative' ? -1 : 0,
  })) || [];

  const COLORS = ['#0d6efd', '#198754', '#ffc107', '#fd7e14', '#6f42c1', '#20c997'];

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-25 backdrop-blur">
        <div className="container-fluid">
          <button
            onClick={() => router.push('/journal')}
            className="btn btn-outline-light btn-sm rounded-circle me-3"
          >
            <ArrowLeft />
          </button>
          <span className="navbar-brand mb-0 h1">
            <FileText className="me-2" />
            Journal Entry
          </span>
          <div className="d-flex align-items-center">
            {entry.processingStatus === 'completed' && (
              <span className="badge bg-success me-2">
                <CheckCircle className="me-1" />
                Analyzed
              </span>
            )}
            {entry.processingType === 'full-analysis' && (
              <span className="badge bg-info">
                <Brain className="me-1" />
                Full Analysis
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Entry Header */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    {isVoiceEntry ? (
                      <Mic className="fs-2 text-primary me-3" />
                    ) : (
                      <PenTool className="fs-2 text-success me-3" />
                    )}
                    <div>
                      <h1 className="text-white mb-1">
                        {isVoiceEntry ? 'Voice Entry' : 'Text Entry'}
                      </h1>
                      <div className="d-flex align-items-center text-white opacity-75">
                        <Calendar className="me-2" />
                        {formatDate(entry.createdAt)}
                        <Clock className="ms-3 me-2" />
                        {formatTimeDisplay(entry.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-2">
                      <Activity className="me-1" />
                      {entry.processingStatus}
                    </div>
                    <br />
                    <small className="text-white opacity-75">
                      {entry.transcription || entry.content ? 
                        `${(entry.transcription || entry.content).split(' ').length} words` : 
                        'No content'
                      }
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Player for Voice Entries */}
            {isVoiceEntry && entry.audioUrl && (
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <h3 className="text-white mb-3">
                    <Volume2 className="me-2" />
                    Audio Recording
                  </h3>
                  <div className="bg-light bg-opacity-10 rounded p-4">
                    <div className="d-flex align-items-center mb-3">
                      <button
                        onClick={togglePlay}
                        className="btn btn-primary rounded-circle me-3"
                        style={{ width: '48px', height: '48px' }}
                      >
                        {isPlaying ? <Pause /> : <Play />}
                      </button>
                      <div className="flex-grow-1 me-3">
                        <div className="progress" style={{ height: '8px' }}>
                          <input
                            type="range"
                            min="0"
                            max={audioDuration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="form-range"
                            style={{ height: '8px' }}
                          />
                        </div>
                      </div>
                      <span className="text-white opacity-75 small">
                        {formatTime(currentTime)} / {formatTime(audioDuration)}
                      </span>
                    </div>
                    <audio
                      ref={audioRef}
                      src={entry.audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      className="d-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <h3 className="text-white mb-3">
                  <FileText className="me-2" />
                  {isVoiceEntry ? 'Transcription' : 'Content'}
                </h3>
                <div className="bg-light bg-opacity-10 rounded p-4">
                  <p className="text-white opacity-90 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {entry.transcription || entry.content || 'No content available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && Object.keys(analysis).length > 0 && (
              <div className="space-y-4">
                {/* Sentiment Analysis */}
                {analysis.sentiment && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <Heart className="fs-2 text-danger me-3" />
                        <h2 className="text-white mb-0">Sentiment Analysis</h2>
                      </div>
                      
                      <div className="row">
                        <div className="col-lg-6">
                          <h4 className="text-white mb-3">Overall Sentiment</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {sentimentData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="bg-light bg-opacity-10 rounded p-4 mb-3">
                            <h5 className="text-white mb-3">Sentiment Details</h5>
                            <div className="row">
                              <div className="col-6">
                                <p className="text-white opacity-75 mb-1">Overall:</p>
                                <span className={`badge ${
                                  analysis.sentiment.overall === 'positive' ? 'bg-success' :
                                  analysis.sentiment.overall === 'negative' ? 'bg-danger' : 'bg-secondary'
                                }`}>
                                  {analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}
                                </span>
                              </div>
                              <div className="col-6">
                                <p className="text-white opacity-75 mb-1">Confidence:</p>
                                <span className="text-white fw-bold">
                                  {(analysis.sentiment.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="row mt-3">
                              <div className="col-6">
                                <p className="text-white opacity-75 mb-1">Intensity:</p>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div 
                                    className="progress-bar bg-primary" 
                                    style={{ width: `${(analysis.sentiment.intensity / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <small className="text-white opacity-75">{analysis.sentiment.intensity}/10</small>
                              </div>
                            </div>
                          </div>
                          
                          {analysis.sentiment.emotions && analysis.sentiment.emotions.length > 0 && (
                            <div className="bg-light bg-opacity-10 rounded p-4">
                              <h5 className="text-white mb-3">Emotions Detected</h5>
                              <div className="d-flex flex-wrap gap-2">
                                {analysis.sentiment.emotions.map((emotion, index) => (
                                  <span key={index} className="badge bg-primary bg-opacity-25 text-white">
                                    {emotion}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* People Mentioned */}
                {analysis.people && analysis.people.length > 0 && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <Users className="fs-2 text-primary me-3" />
                        <h2 className="text-white mb-0">People Mentioned</h2>
                      </div>
                      
                      <div className="row">
                        <div className="col-lg-6">
                          <h4 className="text-white mb-3">Sentiment by Person</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={peopleData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                              <XAxis dataKey="name" stroke="#ffffff80" />
                              <YAxis stroke="#ffffff80" />
                              <Tooltip contentStyle={{ backgroundColor: '#2c3e50', border: 'none', color: '#fff' }} />
                              <Bar dataKey="sentiment" fill="#0d6efd" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="row">
                            {analysis.people.map((person, index) => {
                              const profile = peopleProfiles[person.name];
                              return (
                                <div key={index} className="col-12 mb-3">
                                  <div className="card bg-light bg-opacity-10 border-0">
                                    <div className="card-body">
                                      <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                             style={{ width: '48px', height: '48px' }}>
                                          {profile?.displayPicture ? (
                                            <img 
                                              src={profile.displayPicture} 
                                              alt={person.name}
                                              className="rounded-circle"
                                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                            />
                                          ) : (
                                            <span className="text-white fw-bold">
                                              {person.name.charAt(0).toUpperCase()}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex-grow-1">
                                          <div className="d-flex justify-content-between align-items-start">
                                            <h6 className="text-white mb-0">{person.name}</h6>
                                            <span className={`badge ${
                                              person.sentiment === 'positive' ? 'bg-success' :
                                              person.sentiment === 'negative' ? 'bg-danger' : 'bg-secondary'
                                            }`}>
                                              {person.sentiment}
                                            </span>
                                          </div>
                                          <p className="text-white opacity-75 mb-0 small">
                                            <strong>Relationship:</strong> {person.relationship}
                                          </p>
                                        </div>
                                        {profile && (
                                          <button 
                                            onClick={() => router.push(`/people/${profile.id}`)}
                                            className="btn btn-outline-primary btn-sm ms-2"
                                            title="View Profile"
                                          >
                                            <ExternalLink className="fs-6" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-white opacity-75 mb-1 small">
                                        <strong>Context:</strong> {person.context}
                                      </p>
                                      <p className="text-white opacity-75 mb-0 small">
                                        <strong>Interaction:</strong> {person.interactionType}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Insights */}
                {analysis.finance && analysis.finance.length > 0 && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <DollarSign className="fs-2 text-success me-3" />
                        <h2 className="text-white mb-0">Financial Insights</h2>
                      </div>
                      
                      <div className="row">
                        <div className="col-lg-6">
                          <h4 className="text-white mb-3">Financial Categories</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={financeData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                              <XAxis dataKey="category" stroke="#ffffff80" />
                              <YAxis stroke="#ffffff80" />
                              <Tooltip contentStyle={{ backgroundColor: '#2c3e50', border: 'none', color: '#fff' }} />
                              <Bar dataKey="amount" fill="#198754" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="row">
                            {analysis.finance.map((item, index) => (
                              <div key={index} className="col-12 mb-3">
                                <div className="card bg-light bg-opacity-10 border-0">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="text-white mb-0">{item.description}</h6>
                                      <span className={`badge ${
                                        item.category === 'income' ? 'bg-success' :
                                        item.category === 'expense' ? 'bg-danger' :
                                        item.category === 'investment' ? 'bg-info' : 'bg-warning'
                                      }`}>
                                        {item.category}
                                      </span>
                                    </div>
                                    {item.amount && (
                                      <h5 className="text-white mb-2">
                                        {item.currency} {item.amount.toLocaleString()}
                                      </h5>
                                    )}
                                    <p className="text-white opacity-75 mb-1 small">
                                      <strong>Type:</strong> {item.type}
                                    </p>
                                    <p className="text-white opacity-75 mb-0 small">
                                      <strong>Context:</strong> {item.context}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tasks Mentioned */}
                {analysis.tasks && analysis.tasks.length > 0 && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <Target className="fs-2 text-warning me-3" />
                        <h2 className="text-white mb-0">Tasks & Actions</h2>
                      </div>
                      
                      <div className="row">
                        <div className="col-lg-6">
                          <h4 className="text-white mb-3">Task Priority Distribution</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={Object.entries(taskPriorityData).map(([priority, count]) => ({
                                  name: priority,
                                  value: count,
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {Object.entries(taskPriorityData).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#2c3e50', border: 'none', color: '#fff' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="row">
                            {analysis.tasks.map((task, index) => (
                              <div key={index} className="col-12 mb-3">
                                <div className="card bg-light bg-opacity-10 border-0">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="text-white mb-0">{task.description}</h6>
                                      <span className={`badge ${
                                        task.priority === 'high' ? 'bg-danger' :
                                        task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                                      }`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                    <p className="text-white opacity-75 mb-1 small">
                                      <strong>Status:</strong> {task.status}
                                    </p>
                                    <p className="text-white opacity-75 mb-1 small">
                                      <strong>Category:</strong> {task.category}
                                    </p>
                                    {task.deadline && (
                                      <p className="text-white opacity-75 mb-0 small">
                                        <strong>Deadline:</strong> {task.deadline}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Life Areas */}
                {analysis.lifeAreas && analysis.lifeAreas.length > 0 && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <TrendingUp className="fs-2 text-info me-3" />
                        <h2 className="text-white mb-0">Life Areas Analysis</h2>
                      </div>
                      
                      <div className="row">
                        <div className="col-lg-6">
                          <h4 className="text-white mb-3">Life Areas Relevance</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={lifeAreasData}>
                              <PolarGrid stroke="#ffffff40" />
                              <PolarAngleAxis dataKey="area" stroke="#ffffff80" />
                              <PolarRadiusAxis stroke="#ffffff80" />
                              <Radar name="Relevance" dataKey="relevance" stroke="#0d6efd" fill="#0d6efd" fillOpacity={0.6} />
                              <Tooltip contentStyle={{ backgroundColor: '#2c3e50', border: 'none', color: '#fff' }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="row">
                            {analysis.lifeAreas.map((area, index) => (
                              <div key={index} className="col-12 mb-3">
                                <div className="card bg-light bg-opacity-10 border-0">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="text-white mb-0">{area.area}</h6>
                                      <span className={`badge ${
                                        area.sentiment === 'positive' ? 'bg-success' :
                                        area.sentiment === 'negative' ? 'bg-danger' : 'bg-secondary'
                                      }`}>
                                        {area.sentiment}
                                      </span>
                                    </div>
                                    <p className="text-white opacity-75 mb-1 small">
                                      <strong>Relevance:</strong> {area.relevance}/10
                                    </p>
                                    <p className="text-white opacity-75 mb-1 small">
                                      <strong>Priority Alignment:</strong> {area.priorityAlignment}
                                    </p>
                                    <p className="text-white opacity-75 mb-0 small">
                                      <strong>Insights:</strong> {area.insights}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights & Recommendations */}
                {analysis.insights && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <Lightbulb className="fs-2 text-warning me-3" />
                        <h2 className="text-white mb-0">Insights & Recommendations</h2>
                      </div>
                      
                      <div className="row">
                        {/* Themes */}
                        {analysis.insights.themes && analysis.insights.themes.length > 0 && (
                          <div className="col-lg-6 mb-4">
                            <div className="card bg-light bg-opacity-10 border-0 h-100">
                              <div className="card-body">
                                <h5 className="text-white mb-3">
                                  <Tag className="me-2" />
                                  Key Themes
                                </h5>
                                <div className="d-flex flex-wrap gap-2">
                                  {analysis.insights.themes.map((theme, index) => (
                                    <span key={index} className="badge bg-primary bg-opacity-25 text-white">
                                      <Star className="me-1" />
                                      {theme}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Items */}
                        {analysis.insights.actionItems && analysis.insights.actionItems.length > 0 && (
                          <div className="col-lg-6 mb-4">
                            <div className="card bg-light bg-opacity-10 border-0 h-100">
                              <div className="card-body">
                                <h5 className="text-white mb-3">
                                  <Target className="me-2" />
                                  Action Items
                                </h5>
                                <ul className="list-unstyled">
                                  {analysis.insights.actionItems.map((item, index) => (
                                    <li key={index} className="d-flex align-items-start mb-2">
                                      <CheckCircle className="text-success me-2 mt-1 flex-shrink-0" />
                                      <span className="text-white opacity-90">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {analysis.insights.recommendations && analysis.insights.recommendations.length > 0 && (
                          <div className="col-lg-6 mb-4">
                            <div className="card bg-light bg-opacity-10 border-0 h-100">
                              <div className="card-body">
                                <h5 className="text-white mb-3">
                                  <TrendingUp className="me-2" />
                                  Recommendations
                                </h5>
                                <ul className="list-unstyled">
                                  {analysis.insights.recommendations.map((rec, index) => (
                                    <li key={index} className="d-flex align-items-start mb-2">
                                      <Lightbulb className="text-info me-2 mt-1 flex-shrink-0" />
                                      <span className="text-white opacity-90">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reflection Points */}
                        {analysis.insights.reflectionPoints && analysis.insights.reflectionPoints.length > 0 && (
                          <div className="col-lg-6 mb-4">
                            <div className="card bg-light bg-opacity-10 border-0 h-100">
                              <div className="card-body">
                                <h5 className="text-white mb-3">
                                  <MessageSquare className="me-2" />
                                  Reflection Points
                                </h5>
                                <ul className="list-unstyled">
                                  {analysis.insights.reflectionPoints.map((point, index) => (
                                    <li key={index} className="d-flex align-items-start mb-2">
                                      <Info className="text-primary me-2 mt-1 flex-shrink-0" />
                                      <span className="text-white opacity-90">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Analysis Message */}
            {(!analysis || Object.keys(analysis).length === 0) && entry.processingStatus === 'completed' && (
              <div className="card bg-dark bg-opacity-25 border-0 text-center">
                <div className="card-body">
                  <Info className="fs-1 text-muted mb-3" />
                  <h3 className="text-white mb-2">No Analysis Available</h3>
                  <p className="text-white opacity-75">
                    This entry was processed but no analysis results are available.
                  </p>
                </div>
              </div>
            )}

            {/* Upgrade to Full Analysis Option */}
            {entry.processingType === 'transcribe-only' && (entry.processingStatus === 'completed' || entry.processingStatus === 'transcribed') && (
              <div className="card bg-dark bg-opacity-25 border-0 text-center">
                <div className="card-body">
                  <Brain className="fs-1 text-primary mb-3" />
                  <h3 className="text-white mb-2">Unlock AI Insights</h3>
                  <p className="text-white opacity-75 mb-4">
                    Get deep insights into your thoughts with our AI-powered analysis. 
                    Discover patterns, emotions, and actionable insights from your journal entry.
                  </p>
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <div className="bg-light bg-opacity-10 rounded p-4 mb-4">
                        <h5 className="text-white mb-3">What you'll get:</h5>
                        <div className="row text-start">
                          <div className="col-md-6">
                            <ul className="list-unstyled text-white opacity-75">
                              <li className="mb-2">• Sentiment analysis</li>
                              <li className="mb-2">• People mentioned</li>
                              <li className="mb-2">• Financial insights</li>
                              <li className="mb-2">• Task identification</li>
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <ul className="list-unstyled text-white opacity-75">
                              <li className="mb-2">• Location tracking</li>
                              <li className="mb-2">• Time references</li>
                              <li className="mb-2">• Life area insights</li>
                              <li className="mb-2">• Personal recommendations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleUpgradeToFullAnalysis}
                    disabled={isUpgrading}
                    className="btn btn-primary btn-lg"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Processing...</span>
                        </div>
                        Upgrading...
                      </>
                    ) : (
                      <>
                        <Brain className="me-2" />
                        Upgrade to Full Analysis (~$0.02)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}



            {/* Processing Status */}
            {entry.processingStatus !== 'completed' && (
              <div className="card bg-dark bg-opacity-25 border-0 text-center">
                <div className="card-body">
                  <div className="spinner-border text-light mb-3" role="status">
                    <span className="visually-hidden">Processing...</span>
                  </div>
                  <h3 className="text-white mb-2">Processing Entry</h3>
                  <p className="text-white opacity-75">
                    {entry.processingType === 'full-analysis' 
                      ? 'This entry is currently being processed. Analysis results will appear here once complete.'
                      : 'This entry is currently being transcribed. It will be ready shortly.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .backdrop-blur {
          backdrop-filter: blur(10px);
        }
        .space-y-4 > * + * {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Mic, 
  PenTool, 
  Clock,
  MoreVertical,
  Trash2,
  Eye,
  BookOpen,
  Sparkles,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';

interface JournalEntry {
  id: string;
  content: string;
  transcription?: string;
  processingType: 'transcribe-only' | 'full-analysis';
  processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export default function JournalEntriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadEntries();
  }, [session, status, router]);

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/journal/entries?limit=100');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== entryId));
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'analyzed': return 'primary';
      case 'transcribed': return 'warning';
      default: return 'secondary';
    }
  };

  const getEntryTypeIcon = (entry: JournalEntry) => {
    return entry.transcription ? (
      <Mic className="fs-5 text-primary" />
    ) : (
      <PenTool className="fs-5 text-success" />
    );
  };

  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = searchTerm === '' || 
        (entry.transcription || entry.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || entry.processingStatus === filterStatus;
      const matchesType = filterType === 'all' || 
        (filterType === 'voice' && entry.transcription) ||
        (filterType === 'text' && !entry.transcription);
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.processingStatus.localeCompare(b.processingStatus);
      }
    });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading entries...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        title="Journal"
        showAddButton={true}
        addButtonText="New Entry"
        onAddClick={() => router.push('/journal/new')}
      />

      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Page Header */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Your Journal
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">Journal Entries</h1>
              <p className="text-white opacity-75 fs-5">Your thoughts and experiences</p>
            </div>

            {/* Filters and Search */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="row g-3">
                  {/* Search */}
                  <div className="col-12 col-md-3">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                      <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="col-6 col-md-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="transcribed">Transcribed</option>
                      <option value="analyzed">Analyzed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div className="col-6 col-md-3">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="voice">Voice</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="col-12 col-md-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="status">Sort by Status</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-3">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="card bg-dark bg-opacity-25 border-0 hover-lift"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="card-body">
                      <div className="row align-items-start">
                        <div className="col-12 col-lg-8">
                          <div className="d-flex align-items-center gap-3 mb-3">
                            {getEntryTypeIcon(entry)}
                            <h3 className="text-white fw-semibold mb-0">
                              {entry.transcription ? 'Voice Entry' : 'Text Entry'}
                            </h3>
                            <span className={`badge bg-${getStatusColor(entry.processingStatus)}`}>
                              {entry.processingStatus}
                            </span>
                            {entry.processingType === 'full-analysis' && (
                              <span className="badge bg-info">
                                Full Analysis
                              </span>
                            )}
                          </div>

                          <p className="text-white opacity-75 mb-3 line-clamp-3">
                            {entry.transcription || entry.content || 'No content available'}
                          </p>

                          <div className="d-flex align-items-center gap-4 text-white opacity-75 small">
                            <span className="d-flex align-items-center">
                              <Calendar className="me-1" />
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                            <span className="d-flex align-items-center">
                              <Clock className="me-1" />
                              {new Date(entry.createdAt).toLocaleTimeString()}
                            </span>
                            <span>
                              {(entry.transcription || entry.content || '').split(' ').length} words
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-lg-4">
                          <div className="d-flex justify-content-end gap-2">
                            <Link href={`/journal/${entry.id}`}>
                              <button className="btn btn-outline-light btn-sm">
                                <Eye className="me-1" />
                                View
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="btn btn-outline-danger btn-sm"
                            >
                              <Trash2 className="me-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card bg-dark bg-opacity-25 border-0 text-center py-5">
                  <div className="card-body">
                    <div className="text-white opacity-50 mb-3">
                      <PenTool className="fs-1" />
                    </div>
                    <h3 className="text-white fw-semibold mb-2">No entries found</h3>
                    <p className="text-white opacity-75 mb-4">
                      {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Start your journaling journey by creating your first entry'
                      }
                    </p>
                    {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                      <Link href="/journal/new">
                        <button className="btn btn-primary">
                          <Plus className="me-2" />
                          Create Your First Entry
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            {entries.length > 0 && (
              <div className="card bg-dark bg-opacity-25 border-0 mt-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-4">
                    <BarChart3 className="text-primary me-3" />
                    <h3 className="text-white fw-semibold mb-0">Summary</h3>
                  </div>
                  <div className="row g-3 dashboard-stats">
                    <div className="col-6 col-md-3">
                      <div className="text-center">
                        <div className="text-white fw-bold fs-2">{entries.length}</div>
                        <div className="text-white opacity-75 small">Total Entries</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center">
                        <div className="text-primary fw-bold fs-2">
                          {entries.filter(e => e.transcription).length}
                        </div>
                        <div className="text-white opacity-75 small">Voice Entries</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center">
                        <div className="text-success fw-bold fs-2">
                          {entries.filter(e => !e.transcription).length}
                        </div>
                        <div className="text-white opacity-75 small">Text Entries</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="text-center">
                        <div className="text-info fw-bold fs-2">
                          {entries.filter(e => e.processingStatus === 'completed').length}
                        </div>
                        <div className="text-white opacity-75 small">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="d-md-none position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1000 }}>
        <Link href="/journal/new">
          <button className="btn btn-primary rounded-circle shadow-lg" style={{ width: '60px', height: '60px' }}>
            <Plus className="fs-4" />
          </button>
        </Link>
      </div>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .backdrop-blur {
          backdrop-filter: blur(10px);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .space-y-3 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
} 
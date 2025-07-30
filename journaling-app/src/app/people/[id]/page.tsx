'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Heart, 
  MessageCircle,
  Calendar,
  Star,
  Sparkles,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface Person {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  displayPicture: string | null;
  createdAt: string;
  updatedAt: string;
  interactionCount?: number;
  lastInteraction?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface JournalEntry {
  id: string;
  content: string;
  transcription?: string;
  createdAt: string;
  mood?: string;
  tags?: string[];
}

interface PersonDetail extends Person {
  journalEntries?: JournalEntry[];
  sentimentTrend?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentMentions?: string[];
  interactionFrequency?: number;
  averageMood?: string;
}

export default function PersonDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;
  
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (personId) {
      loadPersonDetail();
    }
  }, [session, status, router, personId]);

  const loadPersonDetail = async () => {
    try {
      const response = await fetch(`/api/people/${personId}`);
      if (response.ok) {
        const data = await response.json();
        setPerson(data);
      } else {
        console.error('Failed to load person details');
        router.push('/people');
      }
    } catch (error) {
      console.error('Error loading person details:', error);
      router.push('/people');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePerson = async () => {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/people?id=${personId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/people');
      } else {
        console.error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleEditPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPerson || !editingPerson.name.trim() || !editingPerson.relationship.trim()) {
      alert('Please fill in both name and relationship');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/people', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingPerson.id,
          name: editingPerson.name.trim(),
          relationship: editingPerson.relationship.trim(),
          displayPicture: editingPerson.displayPicture || null
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingPerson(null);
        loadPersonDetail(); // Reload the details
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update person');
      }
    } catch (error) {
      console.error('Error updating person:', error);
      alert('Failed to update person. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File, setImageUrl: (url: string) => void) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.url);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      default: return 'secondary';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <Heart className="fs-6" />;
      case 'negative': return <MessageCircle className="fs-6" />;
      default: return <MessageCircle className="fs-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!person) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <h3 className="text-white mb-3">Person not found</h3>
          <button 
            onClick={() => router.push('/people')}
            className="btn btn-primary"
          >
            Back to People
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        showBackButton={true}
        backHref="/people"
        title={person.name}
        showAddButton={false}
      />

      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Header Section */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '80px', height: '80px' }}>
                      {person.displayPicture ? (
                        <img 
                          src={person.displayPicture} 
                          alt={person.name}
                          className="rounded-circle"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="text-white fs-1 fw-bold">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-white fw-bold mb-1">{person.name}</h1>
                      <p className="text-white opacity-75 mb-0">{person.relationship}</p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingPerson(person);
                        setShowEditModal(true);
                      }}
                      className="btn btn-outline-light btn-sm"
                    >
                      <Edit className="me-1" />
                      Edit
                    </button>
                    <button 
                      onClick={handleDeletePerson}
                      className="btn btn-outline-danger btn-sm"
                    >
                      <Trash2 className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-white fs-4 fw-bold">{person.interactionCount || 0}</div>
                      <div className="text-white opacity-75 small">Interactions</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-white fs-4 fw-bold">{person.journalEntries?.length || 0}</div>
                      <div className="text-white opacity-75 small">Mentions</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-white fs-4 fw-bold">
                        {person.lastInteraction ? formatTimeAgo(person.lastInteraction) : 'Never'}
                      </div>
                      <div className="text-white opacity-75 small">Last Contact</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className={`badge bg-${getSentimentColor(person.sentiment)} d-inline-flex align-items-center gap-1`}>
                        {getSentimentIcon(person.sentiment)}
                        <span className="text-capitalize">{person.sentiment || 'neutral'}</span>
                      </div>
                      <div className="text-white opacity-75 small mt-1">Sentiment</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            {person.sentimentTrend && (
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <h5 className="text-white fw-bold mb-3">
                    <BarChart3 className="me-2" />
                    Sentiment Analysis
                  </h5>
                  <div className="row g-3">
                    <div className="col-4">
                      <div className="text-center">
                        <div className="text-success fs-4 fw-bold">{person.sentimentTrend.positive}%</div>
                        <div className="text-white opacity-75 small">Positive</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center">
                        <div className="text-secondary fs-4 fw-bold">{person.sentimentTrend.neutral}%</div>
                        <div className="text-white opacity-75 small">Neutral</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center">
                        <div className="text-danger fs-4 fw-bold">{person.sentimentTrend.negative}%</div>
                        <div className="text-white opacity-75 small">Negative</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Journal Entries */}
            {person.journalEntries && person.journalEntries.length > 0 && (
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <h5 className="text-white fw-bold mb-3">
                    <FileText className="me-2" />
                    Recent Mentions
                  </h5>
                  <div className="space-y-3">
                    {person.journalEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="border border-white border-opacity-25 rounded p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="text-white opacity-75 small">
                            {formatDate(entry.createdAt)}
                          </div>
                          {entry.mood && (
                            <span className="badge bg-light text-dark">
                              {entry.mood}
                            </span>
                          )}
                        </div>
                        <p className="text-white mb-0">
                          {entry.content || entry.transcription || 'No content available'}
                        </p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mt-2">
                            {entry.tags.map((tag, index) => (
                              <span key={index} className="badge bg-primary me-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Mentions */}
            {person.recentMentions && person.recentMentions.length > 0 && (
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <h5 className="text-white fw-bold mb-3">
                    <MessageCircle className="me-2" />
                    Recent Mentions
                  </h5>
                  <div className="space-y-2">
                    {person.recentMentions.map((mention, index) => (
                      <div key={index} className="text-white opacity-75">
                        "{mention}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Relationship Timeline */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <h5 className="text-white fw-bold mb-3">
                  <Calendar className="me-2" />
                  Relationship Timeline
                </h5>
                <div className="space-y-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary rounded-circle me-3" style={{ width: '12px', height: '12px' }}></div>
                    <div>
                      <div className="text-white fw-semibold">Added to your network</div>
                      <div className="text-white opacity-75 small">{formatDate(person.createdAt)}</div>
                    </div>
                  </div>
                  {person.lastInteraction && (
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle me-3" style={{ width: '12px', height: '12px' }}></div>
                      <div>
                        <div className="text-white fw-semibold">Last interaction</div>
                        <div className="text-white opacity-75 small">{formatDate(person.lastInteraction)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Person Modal */}
      {showEditModal && editingPerson && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">Edit Person</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPerson(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditPerson}>
                  <div className="mb-3">
                    <label className="form-label text-white">Name *</label>
                    <input
                      type="text"
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60"
                      placeholder="Enter person's name"
                      value={editingPerson.name}
                      onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-white">Relationship *</label>
                    <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      value={editingPerson.relationship}
                      onChange={(e) => setEditingPerson({ ...editingPerson, relationship: e.target.value })}
                      required
                    >
                      <option value="">Select relationship</option>
                      <option value="Family">Family</option>
                      <option value="Friend">Friend</option>
                      <option value="Colleague">Colleague</option>
                      <option value="Partner">Partner</option>
                      <option value="Acquaintance">Acquaintance</option>
                      <option value="Mentor">Mentor</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-white">Profile Picture (Optional)</label>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              setEditingPerson({ ...editingPerson, displayPicture: url });
                            });
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="visually-hidden">Uploading...</span>
                        </div>
                      )}
                    </div>
                    {editingPerson.displayPicture && (
                      <div className="mt-2">
                        <img 
                          src={editingPerson.displayPicture} 
                          alt="Preview" 
                          className="rounded"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-footer border-top border-white border-opacity-25 px-0 pb-0">
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingPerson(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Updating...
                        </>
                      ) : (
                        'Update Person'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .space-y-3 > * + * {
          margin-top: 1rem;
        }
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Heart, 
  MessageCircle,
  Calendar,
  Star,
  MoreVertical,
  Sparkles,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

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

export default function PeoplePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    relationship: '',
    displayPicture: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadPeople();
  }, [session, status, router]);

  useEffect(() => {
    filterPeople();
  }, [people, searchTerm, selectedFilter]);

  const loadPeople = async () => {
    try {
      const response = await fetch('/api/people');
      if (response.ok) {
        const data = await response.json();
        setPeople(data);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPeople = () => {
    let filtered = people;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.relationship.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply relationship filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(person => person.relationship === selectedFilter);
    }

    setFilteredPeople(filtered);
  };

  const getRelationshipOptions = () => {
    const relationships = people.map(p => p.relationship);
    const uniqueRelationships = [...new Set(relationships)];
    return uniqueRelationships;
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

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/people?id=${personId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the people list
        loadPeople();
      } else {
        console.error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPerson.name.trim() || !newPerson.relationship.trim()) {
      alert('Please fill in both name and relationship');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPerson.name.trim(),
          relationship: newPerson.relationship.trim(),
          displayPicture: newPerson.displayPicture.trim() || null
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewPerson({ name: '', relationship: '', displayPicture: '' });
        loadPeople(); // Reload the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add person');
      }
    } catch (error) {
      console.error('Error adding person:', error);
      alert('Failed to add person. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        loadPeople(); // Reload the list
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading your connections...</p>
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
        title="People"
        showAddButton={true}
        addButtonText="Add Person"
        onAddClick={() => setShowAddModal(true)}
      />

      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Page Header */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Your Connections
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">People</h1>
              <p className="text-white opacity-75 fs-5">Manage your relationships and connections</p>
            </div>

            {/* Search and Filters */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="row g-3">
                  {/* Search */}
                  <div className="col-12 col-md-8">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                      <input
                        type="text"
                        placeholder="Search people by name or relationship..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5"
                      />
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="col-12 col-md-4">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Relationships</option>
                      {getRelationshipOptions().map(relationship => (
                        <option key={relationship} value={relationship}>
                          {relationship}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <BarChart3 className="text-primary me-3" />
                  <h3 className="text-white fw-semibold mb-0">Overview</h3>
                </div>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-primary fw-bold fs-2">{people.length}</div>
                      <div className="text-white opacity-75 small">Total People</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-success fw-bold fs-2">
                        {people.filter(p => p.sentiment === 'positive').length}
                      </div>
                      <div className="text-white opacity-75 small">Positive Connections</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-info fw-bold fs-2">
                        {getRelationshipOptions().length}
                      </div>
                      <div className="text-white opacity-75 small">Relationship Types</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-warning fw-bold fs-2">
                        {people.filter(p => p.interactionCount && p.interactionCount > 5).length}
                      </div>
                      <div className="text-white opacity-75 small">Frequent Contacts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* People Grid */}
            <div className="card bg-dark bg-opacity-25 border-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="text-white fw-semibold mb-0">
                    {filteredPeople.length} {filteredPeople.length === 1 ? 'Person' : 'People'}
                  </h3>
                </div>

                {filteredPeople.length === 0 ? (
                  <div className="text-center py-5">
                    <Users className="text-white opacity-50 mb-3" style={{ fontSize: '4rem' }} />
                    <h3 className="text-white fw-semibold mb-2">
                      {searchTerm || selectedFilter !== 'all' ? 'No people found' : 'No people yet'}
                    </h3>
                    <p className="text-white opacity-75 mb-4">
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'People mentioned in your journal entries will appear here'
                      }
                    </p>
                    {!searchTerm && selectedFilter === 'all' && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary"
                      >
                        <UserPlus className="me-2" />
                        Add Your First Person
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="row g-4">
                    {filteredPeople.map((person, index) => (
                      <div
                        key={person.id}
                        className="col-12 col-md-6 col-lg-4"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="card bg-light bg-opacity-10 border border-white border-opacity-25 hover-lift h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white fw-semibold" style={{ width: '48px', height: '48px', background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                                  {person.displayPicture ? (
                                    <img 
                                      src={person.displayPicture} 
                                      alt={person.name}
                                      className="rounded-circle"
                                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    person.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-white fw-semibold mb-0">{person.name}</h4>
                                  <p className="text-white opacity-75 small mb-0">{person.relationship}</p>
                                </div>
                              </div>
                              <button className="btn btn-outline-light btn-sm rounded-circle">
                                <MoreVertical className="fs-6" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              {/* Sentiment */}
                              {person.sentiment && (
                                <div className={`badge bg-${getSentimentColor(person.sentiment)} d-inline-flex align-items-center gap-2`}>
                                  {getSentimentIcon(person.sentiment)}
                                  <span className="text-capitalize">{person.sentiment}</span>
                                </div>
                              )}

                              {/* Interaction Count */}
                              {person.interactionCount && (
                                <div className="d-flex align-items-center gap-2 text-white opacity-75 small">
                                  <MessageCircle className="fs-6" />
                                  <span>{person.interactionCount} interactions</span>
                                </div>
                              )}

                              {/* Last Interaction */}
                              {person.lastInteraction && (
                                <div className="d-flex align-items-center gap-2 text-white opacity-75 small">
                                  <Calendar className="fs-6" />
                                  <span>Last: {new Date(person.lastInteraction).toLocaleDateString()}</span>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="d-flex gap-2 pt-3 border-top border-white border-opacity-25">
                                <button 
                                  onClick={() => router.push(`/people/${person.id}`)}
                                  className="btn btn-outline-primary btn-sm flex-fill"
                                >
                                  <ExternalLink className="me-1" />
                                  View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingPerson(person);
                                    setShowEditModal(true);
                                  }}
                                  className="btn btn-outline-light btn-sm flex-fill"
                                >
                                  <Edit className="me-1" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeletePerson(person.id)}
                                  className="btn btn-outline-danger btn-sm flex-fill"
                                >
                                  <Trash2 className="me-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">Add New Person</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddPerson}>
                  <div className="mb-3">
                    <label className="form-label text-white">Name *</label>
                    <input
                      type="text"
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60"
                      placeholder="Enter person's name"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-white">Relationship *</label>
                    <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      value={newPerson.relationship}
                      onChange={(e) => setNewPerson({ ...newPerson, relationship: e.target.value })}
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
                              setNewPerson({ ...newPerson, displayPicture: url });
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
                    {newPerson.displayPicture && (
                      <div className="mt-2">
                        <img 
                          src={newPerson.displayPicture} 
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
                      onClick={() => setShowAddModal(false)}
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
                          Adding...
                        </>
                      ) : (
                        'Add Person'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Floating Action Button for Mobile */}
      <div className="d-md-none position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1000 }}>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary rounded-circle shadow-lg" 
          style={{ width: '60px', height: '60px' }}
        >
          <UserPlus className="fs-4" />
        </button>
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
        .space-y-3 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  CheckCircle, 
  X, 
  Edit3, 
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Users,
  DollarSign,
  Target,
  MapPin,
  Clock,
  Heart,
  Brain,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

interface Entity {
  id?: string;
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  type?: string;
  relationship?: string;
  context?: string;
  sentiment?: string;
  interactionType?: string;
  priority?: string;
  deadline?: string;
  status?: string;
  location?: string;
  significance?: string;
  date?: string;
  time?: string;
  duration?: string;
  relevance?: number;
  insights?: string;
  priorityAlignment?: string;
}

interface AnalysisData {
  people?: Entity[];
  finance?: Entity[];
  tasks?: Entity[];
  locations?: Entity[];
}

interface JournalEntry {
  id: string;
  content: string;
  transcription?: string;
  audioUrl?: string;
  processingType: 'transcribe-only' | 'full-analysis';
  processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  createdAt: string;
}

export default function ConfirmAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'people' | 'finance' | 'tasks' | 'locations' | 'temporal' | 'lifeAreas'>('people');
  const [editingEntity, setEditingEntity] = useState<{ type: string; index: number } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedEntities, setDeletedEntities] = useState<Record<string, Entity[]>>({});
  const [existingPeople, setExistingPeople] = useState<any[]>([]);
  const [showPeopleSelector, setShowPeopleSelector] = useState(false);
  const [selectedPersonForEdit, setSelectedPersonForEdit] = useState<{ type: string; index: number } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadEntryAndAnalysis();
    loadExistingPeople();
  }, [session, status, router]);



  const loadEntryAndAnalysis = async () => {
    try {
      setLoading(true);
      
      // Load journal entry
      const entryResponse = await fetch(`/api/journal/entries/${params.id}`);
      if (!entryResponse.ok) {
        throw new Error('Failed to load journal entry');
      }
      const entryData = await entryResponse.json();
      setEntry(entryData.entry);

      // Load analysis data
      if (entryData.analysis) {
        const parsedAnalysis: AnalysisData = {};
        
        if (entryData.analysis.people_mentioned) {
          parsedAnalysis.people = JSON.parse(entryData.analysis.people_mentioned);
        }
        if (entryData.analysis.finance_cues) {
          parsedAnalysis.finance = JSON.parse(entryData.analysis.finance_cues);
        }
        if (entryData.analysis.tasks_mentioned) {
          parsedAnalysis.tasks = JSON.parse(entryData.analysis.tasks_mentioned);
        }
        if (entryData.analysis.locations) {
          parsedAnalysis.locations = JSON.parse(entryData.analysis.locations);
        }
        // Note: temporal and lifeAreas are no longer included in the interface
        // but we still parse them from the database for backward compatibility
        
        setAnalysis(parsedAnalysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingPeople = async () => {
    try {
      const response = await fetch('/api/people');
      if (response.ok) {
        const people = await response.json();
        setExistingPeople(people);
      }
    } catch (error) {
      console.error('Error loading existing people:', error);
    }
  };

  const handleEditEntity = (type: string, index: number) => {
    setEditingEntity({ type, index });
  };

  const handleSaveEntity = (type: string, index: number, updatedEntity: Entity) => {
    setAnalysis(prev => ({
      ...prev,
      [type]: prev[type as keyof AnalysisData]?.map((entity, i) => 
        i === index ? updatedEntity : entity
      )
    }));
    setEditingEntity(null);
  };

  const handleDeleteEntity = (type: string, index: number) => {
    const entityToDelete = analysis[type as keyof AnalysisData]?.[index];
    if (entityToDelete) {
      // Add to deleted entities
      setDeletedEntities(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), entityToDelete]
      }));

      // Remove from analysis
      setAnalysis(prev => ({
        ...prev,
        [type]: prev[type as keyof AnalysisData]?.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAddEntity = (type: string) => {
    if (type === 'people') {
      setShowPeopleSelector(true);
      setSelectedPersonForEdit({ type, index: (analysis[type as keyof AnalysisData]?.length || 0) });
    } else {
      const newEntity: Entity = {};
      setAnalysis(prev => ({
        ...prev,
        [type]: [...(prev[type as keyof AnalysisData] || []), newEntity]
      }));
      setEditingEntity({ type, index: (analysis[type as keyof AnalysisData]?.length || 0) });
    }
  };

  const handleRestoreEntity = (type: string, index: number) => {
    const entityToRestore = deletedEntities[type]?.[index];
    if (entityToRestore) {
      // Add back to analysis
      setAnalysis(prev => ({
        ...prev,
        [type]: [...(prev[type as keyof AnalysisData] || []), entityToRestore]
      }));

      // Remove from deleted entities
      setDeletedEntities(prev => ({
        ...prev,
        [type]: prev[type]?.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSelectExistingPerson = (person: any) => {
    if (selectedPersonForEdit) {
      const updatedPerson: Entity = {
        name: person.name,
        relationship: person.relationship || 'Unknown',
        context: '',
        sentiment: 'neutral',
        interactionType: 'mentioned'
      };

      if (selectedPersonForEdit.index < (analysis.people?.length || 0)) {
        // Editing existing person
        setAnalysis(prev => ({
          ...prev,
          people: prev.people?.map((p, i) => i === selectedPersonForEdit.index ? updatedPerson : p)
        }));
      } else {
        // Adding new person
        setAnalysis(prev => ({
          ...prev,
          people: [...(prev.people || []), updatedPerson]
        }));
      }

      setShowPeopleSelector(false);
      setSelectedPersonForEdit(null);
    }
  };

  const handleEditPerson = (type: string, index: number) => {
    if (type === 'people') {
      setShowPeopleSelector(true);
      setSelectedPersonForEdit({ type, index });
    } else {
      setEditingEntity({ type, index });
    }
  };

  const handleSaveAnalysis = async () => {
    if (!entry) return;
    
    setIsSaving(true);
    try {
      // First, update the journal entry content
      const entryResponse = await fetch(`/api/journal/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: entry.content,
          processingStatus: 'completed'
        }),
      });

      if (!entryResponse.ok) {
        throw new Error('Failed to update journal entry');
      }

      // Then save the updated analysis back to the database
      const analysisResponse = await fetch(`/api/journal/entries/${entry.id}/analysis`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: analysis
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to save analysis');
      }

      // Redirect to the journal entry view
      router.push(`/journal/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipConfirmation = () => {
    if (!entry) return;
    router.push(`/journal/${entry.id}`);
  };

  const getEntityCount = (type: string) => {
    return analysis[type as keyof AnalysisData]?.length || 0;
  };

  const getTotalEntityCount = () => {
    return Object.keys(analysis).reduce((total, type) => {
      return total + (analysis[type as keyof AnalysisData]?.length || 0);
    }, 0);
  };

  const tabs = [
    { key: 'people' as const, label: 'People', icon: <Users />, count: getEntityCount('people') },
    { key: 'finance' as const, label: 'Finance', icon: <DollarSign />, count: getEntityCount('finance') },
    { key: 'tasks' as const, label: 'Tasks', icon: <Target />, count: getEntityCount('tasks') },
    { key: 'locations' as const, label: 'Locations', icon: <MapPin />, count: getEntityCount('locations') }
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white">
          <AlertCircle className="fs-1 mb-3" />
          <h4>Error</h4>
          <p>{error || 'Failed to load entry'}</p>
          <button onClick={() => router.push('/journal')} className="btn btn-light">
            <ArrowLeft className="me-2" />
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

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
            <Brain className="me-2" />
            Confirm Analysis
          </span>
          <div className="d-flex align-items-center">
            <span className="badge bg-info me-2">
              {getTotalEntityCount()} entities found
            </span>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="btn btn-outline-light btn-sm"
            >
              {showDeleted ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Summary */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <h3 className="text-white mb-3">
                  <Star className="me-2" />
                  Analysis Summary
                </h3>
                <div className="row">
                  {tabs.map(tab => (
                    <div key={tab.key} className="col-md-2 col-6 mb-3">
                      <div className="card bg-light bg-opacity-10 border-0 text-center">
                        <div className="card-body">
                          <div className="text-white mb-2">{tab.icon}</div>
                          <div className="text-white fw-bold fs-5">{tab.count}</div>
                          <div className="text-white opacity-75 small">{tab.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <ul className="nav nav-tabs nav-fill border-0">
                  {tabs.map(tab => (
                    <li key={tab.key} className="nav-item">
                      <button
                        className={`nav-link border-0 ${activeTab === tab.key ? 'active bg-primary text-white' : 'text-white opacity-75'}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.icon}
                        <span className="ms-2">{tab.label}</span>
                        {tab.count > 0 && (
                          <span className="badge bg-light text-dark ms-2">{tab.count}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Tab Content */}
                <div className="mt-4">
                  {analysis[activeTab as keyof AnalysisData] && analysis[activeTab as keyof AnalysisData]!.length > 0 ? (
                    <div className="row">
                      {analysis[activeTab as keyof AnalysisData]!.map((entity, index) => (
                        <div key={index} className="col-12 mb-3">
                          <EntityCard
                            entity={entity}
                            type={activeTab}
                            index={index}
                            isEditing={editingEntity?.type === activeTab && editingEntity?.index === index}
                            onEdit={() => handleEditPerson(activeTab, index)}
                            onSave={(updatedEntity) => handleSaveEntity(activeTab, index, updatedEntity)}
                            onDelete={() => handleDeleteEntity(activeTab, index)}
                            onCancel={() => setEditingEntity(null)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-white opacity-75 mb-3">
                        No {activeTab} entities found
                      </div>
                    </div>
                  )}

                  {/* Add Entity Button */}
                  <div className="text-center mt-4">
                    <button
                      onClick={() => handleAddEntity(activeTab)}
                      className="btn btn-outline-primary"
                    >
                      <Plus className="me-2" />
                      Add {activeTab.slice(0, -1)}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Deleted Entities */}
            {showDeleted && Object.keys(deletedEntities).some(type => deletedEntities[type]?.length > 0) && (
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body">
                  <h4 className="text-white mb-3">
                    <Trash2 className="me-2" />
                    Deleted Entities
                  </h4>
                  {Object.entries(deletedEntities).map(([type, entities]) => 
                    entities.length > 0 && (
                      <div key={type} className="mb-3">
                        <h6 className="text-white opacity-75">{type.charAt(0).toUpperCase() + type.slice(1)}</h6>
                        <div className="row">
                          {entities.map((entity, index) => (
                            <div key={index} className="col-12 mb-2">
                              <div className="card bg-danger bg-opacity-25 border-0">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                  <div className="text-white">
                                    {entity.name || entity.description || 'Unnamed entity'}
                                  </div>
                                  <button
                                    onClick={() => handleRestoreEntity(type, index)}
                                    className="btn btn-outline-light btn-sm"
                                  >
                                    Restore
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <button
                      onClick={handleSaveAnalysis}
                      disabled={isSaving}
                      className="btn btn-primary w-100"
                    >
                      {isSaving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="me-2" />
                          Save Analysis
                        </>
                      )}
                    </button>
                    <small className="text-white opacity-75 d-block mt-2">
                      Save all changes and proceed to journal entry
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <button
                      onClick={handleSkipConfirmation}
                      className="btn btn-outline-light w-100"
                    >
                      Skip Confirmation
                    </button>
                    <small className="text-white opacity-75 d-block mt-2">
                      Save analysis without reviewing
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* People Selector Modal */}
      {showPeopleSelector && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-0">
                <h5 className="modal-title text-white">Select Existing Person</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowPeopleSelector(false);
                    setSelectedPersonForEdit(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <p className="text-white opacity-75 mb-3">Choose from your existing people or add a new one:</p>
                
                {/* Existing People */}
                <div className="row g-3 mb-4">
                  {existingPeople.map((person) => (
                    <div key={person.id} className="col-12 col-md-6">
                      <div 
                        className="card bg-light bg-opacity-10 border-0 cursor-pointer hover-lift"
                        onClick={() => handleSelectExistingPerson(person)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body d-flex align-items-center">
                          <div className="bg-primary bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '48px', height: '48px' }}>
                            {person.displayPicture ? (
                              <img 
                                src={person.displayPicture} 
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
                            <h6 className="text-white mb-1">{person.name}</h6>
                            <p className="text-white opacity-75 mb-0 small">{person.relationship || 'Unknown'}</p>
                          </div>
                          <button className="btn btn-outline-primary btn-sm">
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Person */}
                <div className="text-center">
                  <button 
                    className="btn btn-outline-light"
                    onClick={() => {
                      setShowPeopleSelector(false);
                      setEditingEntity({ type: 'people', index: (analysis.people?.length || 0) });
                    }}
                  >
                    <Plus className="me-2" />
                    Add New Person
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Entity Card Component
interface EntityCardProps {
  entity: Entity;
  type: string;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (entity: Entity) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function EntityCard({ entity, type, index, isEditing, onEdit, onSave, onDelete, onCancel }: EntityCardProps) {
  const [editedEntity, setEditedEntity] = useState<Entity>(entity);

  useEffect(() => {
    setEditedEntity(entity);
  }, [entity]);

  const handleSave = () => {
    onSave(editedEntity);
  };

  const renderEntityFields = () => {
    switch (type) {
      case 'people':
        return (
          <>
            <div className="mb-2">
              <label className="text-white opacity-75 small">Name</label>
              <input
                type="text"
                value={editedEntity.name || ''}
                onChange={(e) => setEditedEntity(prev => ({ ...prev, name: e.target.value }))}
                className="form-control bg-light bg-opacity-10 text-white border-0"
                disabled={!isEditing}
              />
            </div>
            <div className="mb-2">
              <label className="text-white opacity-75 small">Relationship</label>
              <input
                type="text"
                value={editedEntity.relationship || ''}
                onChange={(e) => setEditedEntity(prev => ({ ...prev, relationship: e.target.value }))}
                className="form-control bg-light bg-opacity-10 text-white border-0"
                disabled={!isEditing}
              />
            </div>
            <div className="mb-2">
              <label className="text-white opacity-75 small">Context</label>
              <textarea
                value={editedEntity.context || ''}
                onChange={(e) => setEditedEntity(prev => ({ ...prev, context: e.target.value }))}
                className="form-control bg-light bg-opacity-10 text-white border-0"
                rows={2}
                disabled={!isEditing}
              />
            </div>
          </>
        );

      case 'finance':
        return (
          <>
            <div className="mb-2">
              <label className="text-white opacity-75 small">Description</label>
              <input
                type="text"
                value={editedEntity.description || ''}
                onChange={(e) => setEditedEntity(prev => ({ ...prev, description: e.target.value }))}
                className="form-control bg-light bg-opacity-10 text-white border-0"
                disabled={!isEditing}
              />
            </div>
            <div className="row">
              <div className="col-6">
                <label className="text-white opacity-75 small">Amount</label>
                <input
                  type="number"
                  value={editedEntity.amount || ''}
                  onChange={(e) => setEditedEntity(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="form-control bg-light bg-opacity-10 text-white border-0"
                  disabled={!isEditing}
                />
              </div>
              <div className="col-6">
                <label className="text-white opacity-75 small">Category</label>
                <select
                  value={editedEntity.category || ''}
                  onChange={(e) => setEditedEntity(prev => ({ ...prev, category: e.target.value }))}
                  className="form-control bg-light bg-opacity-10 text-white border-0"
                  disabled={!isEditing}
                >
                  <option value="">Select category</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="investment">Investment</option>
                  <option value="debt">Debt</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'tasks':
        return (
          <>
            <div className="mb-2">
              <label className="text-white opacity-75 small">Description</label>
              <input
                type="text"
                value={editedEntity.description || ''}
                onChange={(e) => setEditedEntity(prev => ({ ...prev, description: e.target.value }))}
                className="form-control bg-light bg-opacity-10 text-white border-0"
                disabled={!isEditing}
              />
            </div>
            <div className="row">
              <div className="col-6">
                <label className="text-white opacity-75 small">Priority</label>
                <select
                  value={editedEntity.priority || ''}
                  onChange={(e) => setEditedEntity(prev => ({ ...prev, priority: e.target.value }))}
                  className="form-control bg-light bg-opacity-10 text-white border-0"
                  disabled={!isEditing}
                >
                  <option value="">Select priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="col-6">
                <label className="text-white opacity-75 small">Status</label>
                <select
                  value={editedEntity.status || ''}
                  onChange={(e) => setEditedEntity(prev => ({ ...prev, status: e.target.value }))}
                  className="form-control bg-light bg-opacity-10 text-white border-0"
                  disabled={!isEditing}
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="mb-2">
            <label className="text-white opacity-75 small">Description</label>
            <input
              type="text"
              value={editedEntity.description || editedEntity.name || ''}
              onChange={(e) => setEditedEntity(prev => ({ ...prev, description: e.target.value, name: e.target.value }))}
              className="form-control bg-light bg-opacity-10 text-white border-0"
              disabled={!isEditing}
            />
          </div>
        );
    }
  };

  return (
    <div className="card bg-light bg-opacity-10 border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            {renderEntityFields()}
          </div>
          <div className="d-flex gap-2 ms-3">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn btn-success btn-sm">
                  <Save className="fs-6" />
                </button>
                <button onClick={onCancel} className="btn btn-secondary btn-sm">
                  <X className="fs-6" />
                </button>
              </>
            ) : (
              <>
                <button onClick={onEdit} className="btn btn-outline-light btn-sm">
                  <Edit3 className="fs-6" />
                </button>
                <button onClick={onDelete} className="btn btn-outline-danger btn-sm">
                  <Trash2 className="fs-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
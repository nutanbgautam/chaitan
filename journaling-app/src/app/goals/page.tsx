'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  TrendingUp,
  Eye,
  Sparkles,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  lifeAreaId: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface LifeArea {
  id: string;
  name: string;
  currentScore: number;
  targetScore: number;
}

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLifeArea, setSelectedLifeArea] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    lifeAreaId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadGoals();
    loadLifeAreas();
  }, [session, status, router]);

  useEffect(() => {
    filterGoals();
  }, [goals, searchTerm, selectedStatus, selectedLifeArea, selectedPriority]);

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLifeAreas = async () => {
    try {
      const response = await fetch('/api/wheel-of-life');
      if (response.ok) {
        const data = await response.json();
        if (data.lifeAreas) {
          const areas = JSON.parse(data.lifeAreas);
          setLifeAreas(areas);
        }
      }
    } catch (error) {
      console.error('Error loading life areas:', error);
    }
  };

  const filterGoals = () => {
    let filtered = goals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === selectedStatus);
    }

    // Apply life area filter
    if (selectedLifeArea !== 'all') {
      filtered = filtered.filter(goal => goal.lifeAreaId === selectedLifeArea);
    }

    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(goal => goal.priority === selectedPriority);
    }

    setFilteredGoals(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      default: return 'warning';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    const area = lifeAreas.find(a => a.id === lifeAreaId);
    return area ? area.name : 'Unknown Area';
  };

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingGoal ? '/api/goals' : '/api/goals';
      const method = editingGoal ? 'PUT' : 'POST';
      const body = editingGoal ? { ...formData, id: editingGoal.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingGoal(null);
        resetForm();
        loadGoals();
      } else {
        console.error('Failed to save goal');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadGoals();
      } else {
        console.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      lifeAreaId: goal.lifeAreaId,
      priority: goal.priority,
      category: goal.category
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: '',
      lifeAreaId: '',
      priority: 'medium',
      category: ''
    });
  };

  const getStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const inProgress = goals.filter(g => g.status === 'in-progress').length;
    const overdue = goals.filter(g => isOverdue(g.targetDate) && g.status !== 'completed').length;
    
    return { total, completed, inProgress, overdue };
  };

  const stats = getStats();

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading your goals...</p>
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
        showBackButton={true}
        backHref="/dashboard"
        title="Goals"
        showAddButton={true}
        addButtonText="Add Goal"
        onAddClick={() => {
          setEditingGoal(null);
          resetForm();
          setShowAddModal(true);
        }}
      />
      
      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Page Header */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Your Goals
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">Goals</h1>
              <p className="text-white opacity-75 fs-5">Set and track your life goals</p>
            </div>

            {/* Stats */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <BarChart3 className="text-primary me-3" />
                  <h3 className="text-white fw-semibold mb-0">Goal Overview</h3>
                </div>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-primary fw-bold fs-2">{stats.total}</div>
                      <div className="text-white opacity-75 small">Total Goals</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-success fw-bold fs-2">{stats.completed}</div>
                      <div className="text-white opacity-75 small">Completed</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-warning fw-bold fs-2">{stats.inProgress}</div>
                      <div className="text-white opacity-75 small">In Progress</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-danger fw-bold fs-2">{stats.overdue}</div>
                      <div className="text-white opacity-75 small">Overdue</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="row g-3">
                  {/* Search */}
                  <div className="col-12 col-md-6">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                      <input
                        type="text"
                        placeholder="Search goals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="col-12 col-md-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Life Area Filter */}
                  <div className="col-12 col-md-2">
                    <select
                      value={selectedLifeArea}
                      onChange={(e) => setSelectedLifeArea(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Areas</option>
                      {lifeAreas.map(area => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="col-12 col-md-2">
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals List */}
            <div className="card bg-dark bg-opacity-25 border-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="text-white fw-semibold mb-0">
                    {filteredGoals.length} {filteredGoals.length === 1 ? 'Goal' : 'Goals'}
                  </h3>
                </div>

                {filteredGoals.length === 0 ? (
                  <div className="text-center py-5">
                    <Target className="text-white opacity-50 mb-3" style={{ fontSize: '4rem' }} />
                    <h3 className="text-white fw-semibold mb-2">
                      {searchTerm || selectedStatus !== 'all' || selectedLifeArea !== 'all' || selectedPriority !== 'all' 
                        ? 'No goals found' 
                        : 'No goals yet'
                      }
                    </h3>
                    <p className="text-white opacity-75 mb-4">
                      {searchTerm || selectedStatus !== 'all' || selectedLifeArea !== 'all' || selectedPriority !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Set your first goal to start tracking your progress'
                      }
                    </p>
                    {!searchTerm && selectedStatus === 'all' && selectedLifeArea === 'all' && selectedPriority === 'all' && (
                      <button
                        onClick={() => {
                          setEditingGoal(null);
                          resetForm();
                          setShowAddModal(true);
                        }}
                        className="btn btn-primary"
                      >
                        <Plus className="me-2" />
                        Add Your First Goal
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="card bg-light bg-opacity-10 border border-white border-opacity-25 hover-lift"
                      >
                        <div className="card-body">
                          <div className="row align-items-start">
                            <div className="col-12 col-lg-8">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <h4 className="text-white fw-semibold mb-0">{goal.title}</h4>
                                <span className={`badge bg-${getStatusColor(goal.status)}`}>
                                  {goal.status === 'completed' ? <CheckCircle className="me-1" /> : 
                                   goal.status === 'in-progress' ? <Clock className="me-1" /> : 
                                   <AlertCircle className="me-1" />}
                                  {goal.status}
                                </span>
                                <span className={`badge bg-${getPriorityColor(goal.priority)}`}>
                                  <Flag className="me-1" />
                                  {goal.priority}
                                </span>
                              </div>
                              
                              {goal.description && (
                                <p className="text-white opacity-75 mb-3">{goal.description}</p>
                              )}
                              
                              <div className="d-flex align-items-center gap-4 text-white opacity-75 small mb-3">
                                <span className="d-flex align-items-center">
                                  <Target className="me-1" />
                                  {getLifeAreaName(goal.lifeAreaId)}
                                </span>
                                <span className={`d-flex align-items-center ${isOverdue(goal.targetDate) ? 'text-danger' : ''}`}>
                                  <Calendar className="me-1" />
                                  {new Date(goal.targetDate).toLocaleDateString()}
                                  {isOverdue(goal.targetDate) && ' (Overdue)'}
                                </span>
                                {goal.category && (
                                  <span className="d-flex align-items-center">
                                    <span className="bg-primary rounded-circle me-1" style={{ width: '8px', height: '8px' }}></span>
                                    {goal.category}
                                  </span>
                                )}
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                  <span className="text-white opacity-75 small">Progress</span>
                                  <span className="text-white fw-medium small">{goal.progress}%</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div
                                    className="progress-bar bg-primary"
                                    style={{ width: `${goal.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="col-12 col-lg-4">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  onClick={() => handleEdit(goal)}
                                  className="btn btn-outline-light btn-sm"
                                >
                                  <Edit className="me-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(goal.id)}
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                />
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-white">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Target Date *</label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Life Area *</label>
                    <select
                      value={formData.lifeAreaId}
                      onChange={(e) => setFormData({ ...formData, lifeAreaId: e.target.value })}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      required
                    >
                      <option value="">Select a life area</option>
                      {lifeAreas.map(area => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      placeholder="e.g., Health, Career, Personal"
                    />
                  </div>
                </div>

                <div className="modal-footer border-top border-white border-opacity-25">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingGoal(null);
                      resetForm();
                    }}
                    className="btn btn-outline-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
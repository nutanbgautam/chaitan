'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { 
  CheckSquare, 
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
  BarChart3,
  Target,
  User,
  Tag,
  CalendarDays,
  ArrowRight,
  Play,
  Pause,
  X,
  FileText,
  Square
} from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  startDate?: string;
  deadline?: string;
  category: string;
  assignee?: string;
  remarks?: string;
  isCompleted: boolean;
  completedDate?: string;
  source: 'journal' | 'manual';
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [togglingTasks, setTogglingTasks] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    priority: 'medium' as 'high' | 'medium' | 'low',
    startDate: '',
    deadline: '',
    category: '',
    assignee: '',
    remarks: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadTasks();
  }, [session, status, router]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedCategory]);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    setFilteredTasks(filtered);
  };

  const handleToggleCompletion = async (taskId: string) => {
    // Optimistic update
    setTogglingTasks(prev => new Set(prev).add(taskId));
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle' }),
      });

      if (response.ok) {
        const { task } = await response.json();
        
        // Update the task in the list
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? task : t)
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle task completion:', errorData);
        // Revert optimistic update
        await loadTasks();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Revert optimistic update
      await loadTasks();
    } finally {
      setTogglingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'cancelled': return 'secondary';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="fs-6" />;
      case 'in-progress': return <Play className="fs-6" />;
      case 'cancelled': return <X className="fs-6" />;
      default: return <Clock className="fs-6" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTask ? '/api/tasks' : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      const body = editingTask ? { ...formData, id: editingTask.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingTask(null);
        resetForm();
        loadTasks();
      } else {
        console.error('Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTasks();
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate || '',
      deadline: task.deadline || '',
      category: task.category,
      assignee: task.assignee || '',
      remarks: task.remarks || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      startDate: '',
      deadline: '',
      category: '',
      assignee: '',
      remarks: ''
    });
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => isOverdue(t.deadline) && t.status !== 'completed').length;
    const fromJournal = tasks.filter(t => t.source === 'journal').length;
    
    return { total, completed, inProgress, pending, overdue, fromJournal };
  };

  const stats = getStats();
  const categories = [...new Set(tasks.map(task => task.category))];

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading your tasks...</p>
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
        title="Tasks"
        showAddButton={true}
        addButtonText="Add Task"
        onAddClick={() => {
          setEditingTask(null);
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
                Your Tasks
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">Tasks</h1>
              <p className="text-white opacity-75 fs-5">Manage tasks extracted from your journal entries and manually added items</p>
            </div>

            {/* Journal Extracted Tasks Highlight */}
            {tasks.filter(t => t.source === 'journal').length > 0 && (
              <div className="card bg-success bg-opacity-25 border border-success border-opacity-50 mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <FileText className="text-success me-3" />
                    <h4 className="text-white fw-semibold mb-0">Journal Extracted Tasks</h4>
                  </div>
                  <p className="text-white opacity-75 mb-3">
                    These tasks were automatically extracted from your journal entries using AI analysis.
                  </p>
                  <div className="row g-2">
                    {tasks.filter(t => t.source === 'journal').slice(0, 3).map(task => (
                      <div key={task.id} className="col-12 col-md-4">
                        <div className="bg-light bg-opacity-10 rounded p-3 border border-success border-opacity-25">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className={`badge bg-${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)} {task.status}
                            </span>
                            <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="text-white fw-semibold">{task.title}</div>
                          <div className="text-white opacity-75 small">{task.description}</div>
                          {task.deadline && (
                            <div className={`text-white opacity-50 small ${isOverdue(task.deadline) ? 'text-danger' : ''}`}>
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {tasks.filter(t => t.source === 'journal').length > 3 && (
                    <div className="text-center mt-3">
                      <span className="text-white opacity-75">
                        +{tasks.filter(t => t.source === 'journal').length - 3} more journal tasks
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <BarChart3 className="text-primary me-3" />
                  <h3 className="text-white fw-semibold mb-0">Task Overview</h3>
                </div>
                <div className="row g-3">
                  <div className="col-6 col-md-2">
                    <div className="text-center">
                      <div className="text-primary fw-bold fs-2">{stats.total}</div>
                      <div className="text-white opacity-75 small">Total Tasks</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-2">
                    <div className="text-center">
                      <div className="text-success fw-bold fs-2">{stats.completed}</div>
                      <div className="text-white opacity-75 small">Completed</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-2">
                    <div className="text-center">
                      <div className="text-warning fw-bold fs-2">{stats.pending}</div>
                      <div className="text-white opacity-75 small">Pending</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-2">
                    <div className="text-center">
                      <div className="text-info fw-bold fs-2">{stats.inProgress}</div>
                      <div className="text-white opacity-75 small">In Progress</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-2">
                    <div className="text-center">
                      <div className="text-danger fw-bold fs-2">{stats.overdue}</div>
                      <div className="text-white opacity-75 small">Overdue</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-2">
                    <div className="text-center">
                      <div className="text-secondary fw-bold fs-2">{stats.fromJournal}</div>
                      <div className="text-white opacity-75 small">From Journal</div>
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
              <div className="col-12 col-md-4">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
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
                      <option value="cancelled">Cancelled</option>
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

                  {/* Category Filter */}
              <div className="col-12 col-md-2">
                <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

                  {/* Source Filter */}
              <div className="col-12 col-md-2">
                <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                    >
                      <option value="all">All Sources</option>
                      <option value="journal">From Journal</option>
                      <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
            <div className="card bg-dark bg-opacity-25 border-0">
                <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="text-white fw-semibold mb-0">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                  </h3>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <CheckSquare className="text-white opacity-50 mb-3" style={{ fontSize: '4rem' }} />
                    <h3 className="text-white fw-semibold mb-2">
                      {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all' 
                        ? 'No tasks found' 
                        : 'No tasks yet'
                      }
                    </h3>
                    <p className="text-white opacity-75 mb-4">
                      {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Tasks will be extracted from your journal entries or you can add them manually'
                      }
                    </p>
                    {!searchTerm && selectedStatus === 'all' && selectedPriority === 'all' && selectedCategory === 'all' && (
                      <div className="d-flex gap-3 justify-content-center">
                        <Link href="/journal/new">
                          <button className="btn btn-primary">
                            <Plus className="me-2" />
                            Create Journal Entry
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            resetForm();
                            setShowAddModal(true);
                          }}
                          className="btn btn-outline-light"
                        >
                          <CheckSquare className="me-2" />
                          Add Manual Task
                        </button>
                      </div>
                    )}
                        </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`card bg-light bg-opacity-10 border border-white border-opacity-25 hover-lift ${task.isCompleted ? 'opacity-75' : ''}`}
                      >
                        <div className="card-body">
                          <div className="row align-items-start">
                            <div className="col-12 col-lg-8">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                {/* Completion Checkbox */}
                                <button
                                  onClick={() => handleToggleCompletion(task.id)}
                                  disabled={togglingTasks.has(task.id)}
                                  className={`btn btn-link p-0 me-2 ${task.isCompleted ? 'text-success' : 'text-white opacity-75'}`}
                                  style={{ minWidth: '24px', height: '24px' }}
                                >
                                  {togglingTasks.has(task.id) ? (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  ) : task.isCompleted ? (
                                    <CheckSquare className="fs-5" />
                                  ) : (
                                    <Square className="fs-5" />
                                  )}
                                </button>
                                
                                <h4 className={`text-white fw-semibold mb-0 ${task.isCompleted ? 'text-decoration-line-through' : ''}`}>
                                  {task.title}
                                </h4>
                                
                                <span className={`badge bg-${getStatusColor(task.status)} d-inline-flex align-items-center gap-1`}>
                                  {getStatusIcon(task.status)}
                                  {task.status}
                                </span>
                            <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                                  <Flag className="me-1" />
                              {task.priority}
                            </span>
                                {task.source === 'journal' && (
                                  <span className="badge bg-info">
                                    <Target className="me-1" />
                                    From Journal
                            </span>
                                )}
                          </div>
                              
                          {task.description && (
                                <p className={`text-white opacity-75 mb-3 ${task.isCompleted ? 'text-decoration-line-through' : ''}`}>
                                  {task.description}
                                </p>
                          )}
                              
                              <div className="d-flex align-items-center gap-4 text-white opacity-75 small mb-3">
                            {task.category && (
                                  <span className="d-flex align-items-center">
                                    <Tag className="me-1" />
                                {task.category}
                              </span>
                            )}
                            {task.assignee && (
                                  <span className="d-flex align-items-center">
                                    <User className="me-1" />
                                {task.assignee}
                              </span>
                            )}
                                {task.deadline && (
                                  <span className={`d-flex align-items-center ${isOverdue(task.deadline) ? 'text-danger' : ''}`}>
                                    <Calendar className="me-1" />
                                    {new Date(task.deadline).toLocaleDateString()}
                                    {isOverdue(task.deadline) && ' (Overdue)'}
                                  </span>
                                )}
                                {task.startDate && (
                                  <span className="d-flex align-items-center">
                                    <CalendarDays className="me-1" />
                                    Started: {new Date(task.startDate).toLocaleDateString()}
                            </span>
                                )}
                                {task.isCompleted && task.completedDate && (
                                  <span className="d-flex align-items-center text-success">
                                    <CheckCircle className="me-1" />
                                    Completed: {new Date(task.completedDate).toLocaleDateString()}
                                  </span>
                                )}
                          </div>
                              
                              {task.remarks && (
                                <div className="mb-3">
                                  <p className="text-white opacity-75 small mb-0">
                                    <strong>Remarks:</strong> {task.remarks}
                                  </p>
                        </div>
                              )}

                              {task.journalEntryId && (
                                <div className="mb-3">
                                  <Link href={`/journal/${task.journalEntryId}`} className="text-decoration-none">
                                    <span className="text-info small">
                                      <ArrowRight className="me-1" />
                                      View source journal entry
                                    </span>
                                  </Link>
                      </div>
                              )}
                    </div>

                    <div className="col-12 col-lg-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                                  onClick={() => handleEdit(task)}
                                  className="btn btn-outline-light btn-sm"
                                >
                          <Edit className="me-1" />
                          Edit
                        </button>
                        <button 
                                  onClick={() => handleDelete(task.id)}
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

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
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

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Deadline</label>
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        />
                </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Category</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          placeholder="e.g., Work, Personal, Health"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Assignee</label>
                        <input
                          type="text"
                          value={formData.assignee}
                          onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          placeholder="Who is responsible?"
                        />
                </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      rows={2}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="modal-footer border-top border-white border-opacity-25">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTask(null);
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
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
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
          <Plus className="fs-4" />
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
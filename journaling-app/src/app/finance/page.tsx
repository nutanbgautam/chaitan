'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Tag,
  CalendarDays,
  Repeat,
  Target,
  Settings,
  Sparkles,
  ArrowRight,
  User,
  FileText,
  PieChart,
  LineChart
} from 'lucide-react';
import Link from 'next/link';

interface FinanceEntry {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: 'income' | 'expense' | 'investment' | 'savings';
  subcategory?: string;
  description: string;
  date: string;
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  notes?: string;
  source: 'journal' | 'manual';
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FinanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterRecurring, setFilterRecurring] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: 'expense' as 'income' | 'expense' | 'investment' | 'savings',
    subcategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    recurringPattern: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    priority: 'medium' as 'high' | 'medium' | 'low',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadEntries();
  }, [session, status, router]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, filterCategory, filterPriority, filterRecurring]);

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/finance?limit=100');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading finance entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags && Array.isArray(entry.tags) && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === filterCategory);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(entry => entry.priority === filterPriority);
    }

    // Apply recurring filter
    if (filterRecurring !== 'all') {
      const isRecurring = filterRecurring === 'recurring';
      filtered = filtered.filter(entry => entry.recurring === isRecurring);
    }

    setFilteredEntries(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEntry ? '/api/finance' : '/api/finance';
      const method = editingEntry ? 'PUT' : 'POST';
      const body = editingEntry ? { 
        ...formData, 
        id: editingEntry.id,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      } : {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingEntry(null);
        resetForm();
        loadEntries();
      } else {
        console.error('Failed to save finance entry');
      }
    } catch (error) {
      console.error('Error saving finance entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this finance entry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/finance/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadEntries();
      } else {
        console.error('Failed to delete finance entry');
      }
    } catch (error) {
      console.error('Error deleting finance entry:', error);
    }
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setFormData({
      amount: entry.amount.toString(),
      currency: entry.currency,
      category: entry.category,
      subcategory: entry.subcategory || '',
      description: entry.description,
      date: entry.date,
      recurring: entry.recurring,
      recurringPattern: entry.recurringPattern || 'monthly',
      priority: entry.priority,
      tags: entry.tags && Array.isArray(entry.tags) ? entry.tags.join(', ') : '',
      notes: entry.notes || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      currency: 'USD',
      category: 'expense',
      subcategory: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      recurringPattern: 'monthly',
      priority: 'medium',
      tags: '',
      notes: ''
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'income': return <TrendingUp className="fs-5 text-success" />;
      case 'expense': return <TrendingDown className="fs-5 text-danger" />;
      case 'investment': return <PiggyBank className="fs-5 text-primary" />;
      case 'savings': return <Wallet className="fs-5 text-info" />;
      default: return <DollarSign className="fs-5 text-secondary" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'income': return 'success';
      case 'expense': return 'danger';
      case 'investment': return 'primary';
      case 'savings': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'amount':
        return b.amount - a.amount;
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const categories = [...new Set(entries.map(entry => entry.category))];
  const priorities = [...new Set(entries.map(entry => entry.priority))];

  const totalIncome = entries
    .filter(entry => entry.category === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = entries
    .filter(entry => entry.category === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalInvestments = entries
    .filter(entry => entry.category === 'investment')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalSavings = entries
    .filter(entry => entry.category === 'savings')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netWorth = totalIncome - totalExpenses + totalInvestments + totalSavings;

  const getStats = () => {
    const total = entries.length;
    const fromJournal = entries.filter(e => e.source === 'journal').length;
    const recurring = entries.filter(e => e.recurring).length;
    const highPriority = entries.filter(e => e.priority === 'high').length;
    
    return { total, fromJournal, recurring, highPriority };
  };

  const stats = getStats();

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading finance entries...</p>
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
        title="Finance"
        showAddButton={true}
        addButtonText="Add Entry"
        onAddClick={() => {
          setEditingEntry(null);
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
                Your Finances
              </div>
              <h1 className="text-white display-5 fw-bold mb-3">Finance</h1>
              <p className="text-white opacity-75 fs-5">Track financial entries extracted from your journal entries and manually added items</p>
            </div>

            {/* Financial Overview */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <BarChart3 className="text-primary me-3" />
                  <h3 className="text-white fw-semibold mb-0">Financial Overview</h3>
                </div>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-success fw-bold fs-2">${totalIncome.toFixed(2)}</div>
                      <div className="text-white opacity-75 small">Total Income</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-danger fw-bold fs-2">${totalExpenses.toFixed(2)}</div>
                      <div className="text-white opacity-75 small">Total Expenses</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-primary fw-bold fs-2">${totalInvestments.toFixed(2)}</div>
                      <div className="text-white opacity-75 small">Investments</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className={`fw-bold fs-2 ${netWorth >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${netWorth.toFixed(2)}
                      </div>
                      <div className="text-white opacity-75 small">Net Worth</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Extracted Data Highlight */}
            {entries.filter(e => e.source === 'journal').length > 0 && (
              <div className="card bg-success bg-opacity-25 border border-success border-opacity-50 mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <FileText className="text-success me-3" />
                    <h4 className="text-white fw-semibold mb-0">Journal Extracted Entries</h4>
                  </div>
                  <p className="text-white opacity-75 mb-3">
                    These entries were automatically extracted from your journal entries using AI analysis.
                  </p>
                  <div className="row g-2">
                    {entries.filter(e => e.source === 'journal').slice(0, 3).map(entry => (
                      <div key={entry.id} className="col-12 col-md-4">
                        <div className="bg-light bg-opacity-10 rounded p-3 border border-success border-opacity-25">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className={`badge ${getCategoryColor(entry.category)}`}>
                              {getCategoryIcon(entry.category)} {entry.category}
                            </span>
                            <span className={`badge ${getPriorityColor(entry.priority)}`}>
                              {entry.priority}
                            </span>
                          </div>
                          <div className="text-white fw-semibold">${entry.amount.toFixed(2)}</div>
                          <div className="text-white opacity-75 small">{entry.description}</div>
                          <div className="text-white opacity-50 small">{new Date(entry.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {entries.filter(e => e.source === 'journal').length > 3 && (
                    <div className="text-center mt-3">
                      <span className="text-white opacity-75">
                        +{entries.filter(e => e.source === 'journal').length - 3} more journal entries
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
                  <PieChart className="text-primary me-3" />
                  <h3 className="text-white fw-semibold mb-0">Entry Summary</h3>
                </div>
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-primary fw-bold fs-2">{stats.total}</div>
                      <div className="text-white opacity-75 small">Total Entries</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-success fw-bold fs-2">{stats.fromJournal}</div>
                      <div className="text-white opacity-75 small">From Journal</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-info fw-bold fs-2">{stats.recurring}</div>
                      <div className="text-white opacity-75 small">Recurring</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div className="text-warning fw-bold fs-2">{stats.highPriority}</div>
                      <div className="text-white opacity-75 small">High Priority</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                      <input
                        type="text"
                        placeholder="Search finance entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-2">
                    <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-2">
                    <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-2">
                    <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      value={filterRecurring}
                      onChange={(e) => setFilterRecurring(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="recurring">Recurring</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-2">
                    <select
                      className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
                    >
                      <option value="date">Sort by Date</option>
                      <option value="amount">Sort by Amount</option>
                      <option value="category">Sort by Category</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Finance Entries List */}
            <div className="card bg-dark bg-opacity-25 border-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="text-white fw-semibold mb-0">
                    {sortedEntries.length} {sortedEntries.length === 1 ? 'Entry' : 'Entries'}
                  </h3>
                </div>

                {sortedEntries.length === 0 ? (
                  <div className="text-center py-5">
                    <DollarSign className="text-white opacity-50 mb-3" style={{ fontSize: '4rem' }} />
                    <h3 className="text-white fw-semibold mb-2">
                      {searchTerm || filterCategory !== 'all' || filterPriority !== 'all' || filterRecurring !== 'all'
                        ? 'No entries found' 
                        : 'No finance entries yet'
                      }
                    </h3>
                    <p className="text-white opacity-75 mb-4">
                      {searchTerm || filterCategory !== 'all' || filterPriority !== 'all' || filterRecurring !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Finance entries will be extracted from your journal entries or you can add them manually'
                      }
                    </p>
                    {!searchTerm && filterCategory === 'all' && filterPriority === 'all' && filterRecurring === 'all' && (
                      <div className="d-flex gap-3 justify-content-center">
                        <Link href="/journal/new">
                          <button className="btn btn-primary">
                            <Plus className="me-2" />
                            Create Journal Entry
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setEditingEntry(null);
                            resetForm();
                            setShowAddModal(true);
                          }}
                          className="btn btn-outline-light"
                        >
                          <DollarSign className="me-2" />
                          Add Manual Entry
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedEntries.map((entry) => (
                      <div key={entry.id} className="card bg-light bg-opacity-10 border border-white border-opacity-25 hover-lift">
                        <div className="card-body">
                          <div className="row align-items-start">
                            <div className="col-12 col-lg-8">
                              <div className="d-flex align-items-start gap-3">
                                <div className="flex-shrink-0">
                                  {getCategoryIcon(entry.category)}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <h5 className="text-white mb-0">{entry.description}</h5>
                                    <span className={`badge bg-${getCategoryColor(entry.category)}`}>
                                      {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                                    </span>
                                    <span className={`badge bg-${getPriorityColor(entry.priority)}`}>
                                      {entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)}
                                    </span>
                                    {entry.recurring && (
                                      <span className="badge bg-info">
                                        <Repeat className="me-1" />
                                        Recurring
                                      </span>
                                    )}
                                    {entry.source === 'journal' && (
                                      <span className="badge bg-secondary">
                                        <FileText className="me-1" />
                                        From Journal
                                      </span>
                                    )}
                                  </div>
                                  <div className="d-flex flex-wrap gap-3 text-white opacity-75 small mb-2">
                                    <span className="d-flex align-items-center gap-1">
                                      <DollarSign className="fs-6" />
                                      {entry.currency} {entry.amount.toFixed(2)}
                                    </span>
                                    {entry.subcategory && (
                                      <span className="d-flex align-items-center gap-1">
                                        <Tag className="fs-6" />
                                        {entry.subcategory}
                                      </span>
                                    )}
                                    <span className="d-flex align-items-center gap-1">
                                      <CalendarDays className="fs-6" />
                                      {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    {entry.recurringPattern && (
                                      <span className="d-flex align-items-center gap-1">
                                        <Repeat className="fs-6" />
                                        {entry.recurringPattern}
                                      </span>
                                    )}
                                  </div>
                                  {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
                                    <div className="mb-2">
                                      {entry.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-light bg-opacity-25 text-white me-1 mb-1">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {entry.notes && (
                                    <p className="text-white opacity-75 mb-0 small">{entry.notes}</p>
                                  )}
                                  {entry.journalEntryId && (
                                    <div className="mt-2">
                                      <Link href={`/journal/${entry.journalEntryId}`} className="text-decoration-none">
                                        <span className="text-info small">
                                          <ArrowRight className="me-1" />
                                          View source journal entry
                                        </span>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="col-12 col-lg-4">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="btn btn-outline-light btn-sm"
                                >
                                  <Edit className="me-1" />
                                  Edit
                                </button>
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Finance Entry Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">
                  {editingEntry ? 'Edit Finance Entry' : 'Add New Finance Entry'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                />
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Amount *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Currency</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                          <option value="AUD">AUD</option>
                          <option value="JPY">JPY</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          required
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                          <option value="investment">Investment</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Subcategory</label>
                        <input
                          type="text"
                          value={formData.subcategory}
                          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          placeholder="e.g., groceries, salary, rent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Description *</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Date *</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          required
                        />
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
                        <div className="form-check">
                          <input
                            type="checkbox"
                            checked={formData.recurring}
                            onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                            className="form-check-input"
                            id="recurring"
                          />
                          <label className="form-check-label text-white" htmlFor="recurring">
                            Recurring Entry
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      {formData.recurring && (
                        <div className="mb-3">
                          <label className="form-label text-white">Recurring Pattern</label>
                          <select
                            value={formData.recurringPattern}
                            onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value as any })}
                            className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="modal-footer border-top border-white border-opacity-25">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEntry(null);
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
                    {editingEntry ? 'Update Entry' : 'Create Entry'}
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
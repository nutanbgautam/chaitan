'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import WheelOfLifeRadar from '@/components/dashboard/WheelOfLifeRadar';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  LogOut,
  Settings,
  Sparkles,
  Activity,
  ChevronRight,
  Edit,
  Target,
  Heart,
  TrendingUp,
  Users,
  DollarSign,
  CheckSquare,
  Calendar,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  preferences: {
    emailNotifications: boolean;
    weeklyRecaps: boolean;
    dailyReminders: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

interface WheelOfLife {
  lifeAreas: string;
  priorities?: string;
  isCompleted: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wheelOfLife, setWheelOfLife] = useState<WheelOfLife | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedLifeArea, setSelectedLifeArea] = useState<any>(null);
  const [newPriority, setNewPriority] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    preferences: {
      emailNotifications: true,
      weeklyRecaps: true,
      dailyReminders: false,
      theme: 'auto' as 'light' | 'dark' | 'auto'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadProfile();
    loadWheelOfLife();
  }, [session, status, router]);

  const loadProfile = async () => {
    try {
      // Mock profile data
      const mockProfile: UserProfile = {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'User',
        email: session?.user?.email || 'user@example.com',
        createdAt: new Date().toISOString(),
        preferences: {
          emailNotifications: true,
          weeklyRecaps: true,
          dailyReminders: false,
          theme: 'auto'
        }
      };

      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        preferences: mockProfile.preferences
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWheelOfLife = async () => {
    try {
      const response = await fetch('/api/wheel-of-life');
      if (response.ok) {
        const data = await response.json();
        setWheelOfLife(data);
      }
    } catch (error) {
      console.error('Error loading wheel of life:', error);
    }
  };

  const handleUpdatePriority = async () => {
    if (!selectedLifeArea) return;

    try {
      setIsSaving(true);
      
      // Get current priorities
      let priorities: string[] = [];
      if (wheelOfLife?.priorities) {
        priorities = JSON.parse(wheelOfLife.priorities);
      }

      // Remove the selected area from current priorities
      priorities = priorities.filter((id: string) => id !== selectedLifeArea.id);

      // Insert the selected area at the new priority position
      priorities.splice(newPriority - 1, 0, selectedLifeArea.id);

      // Update wheel of life
      const response = await fetch('/api/wheel-of-life', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priorities: JSON.stringify(priorities)
        })
      });

      if (response.ok) {
        await loadWheelOfLife();
        setShowPriorityModal(false);
        setSelectedLifeArea(null);
        setNewPriority(1);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  // Parse wheel of life data
  let wheelData: any[] = [];
  let priorities: string[] = [];
  
  try {
    if (wheelOfLife?.lifeAreas) {
      wheelData = JSON.parse(wheelOfLife.lifeAreas);
    }
    if (wheelOfLife?.priorities) {
      priorities = JSON.parse(wheelOfLife.priorities);
    }
  } catch (error) {
    console.error('Error parsing wheel of life data:', error);
  }

  // Default wheel data if none exists
  const defaultWheelData = [
    { id: 'career', name: 'Career & Work', value: 7, priority: 1, weightage: 20, color: '#3B82F6', icon: '💼' },
    { id: 'finances', name: 'Finances', value: 6, priority: 2, weightage: 18, color: '#10B981', icon: '💰' },
    { id: 'health', name: 'Health & Fitness', value: 8, priority: 3, weightage: 16, color: '#EF4444', icon: '🏃‍♂️' },
    { id: 'relationships', name: 'Relationships', value: 9, priority: 4, weightage: 15, color: '#F59E0B', icon: '❤️' },
    { id: 'personal-growth', name: 'Personal Growth', value: 7, priority: 5, weightage: 12, color: '#8B5CF6', icon: '📚' },
    { id: 'recreation', name: 'Recreation & Fun', value: 6, priority: 6, weightage: 10, color: '#EC4899', icon: '🎮' },
    { id: 'spirituality', name: 'Spirituality', value: 5, priority: 7, weightage: 6, color: '#6366F1', icon: '🕊️' },
    { id: 'environment', name: 'Environment', value: 7, priority: 8, weightage: 3, color: '#059669', icon: '🏠' }
  ];

  // Process wheel data with priorities
  let processedWheelData: any[] = wheelData.length > 0 ? wheelData : defaultWheelData;
  
  if (priorities && priorities.length > 0) {
    processedWheelData = processedWheelData.map((area: any) => {
      const priorityIndex = priorities.indexOf(area.id);
      return {
        ...area,
        priority: priorityIndex >= 0 ? priorityIndex + 1 : 999,
        weightage: area.weightage || (100 / processedWheelData.length)
      };
    }).sort((a: any, b: any) => a.priority - b.priority);
  } else {
    processedWheelData = processedWheelData.map((area: any) => ({
      ...area,
      priority: area.priority || 1,
      weightage: area.weightage || (100 / processedWheelData.length)
    }));
  }

  const totalValue = processedWheelData.reduce((sum: number, item: any) => sum + item.value, 0);
  const maxValue = 10;
  const overallBalance = (totalValue / processedWheelData.length).toFixed(1);

  const userName = session?.user?.name?.split(' ')[0] || 'there';
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good morning' : currentTime < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation 
        showBackButton={true}
        backHref="/dashboard"
        title="Profile"
        showAddButton={false}
      />
      
      <div className="container-fluid py-4 pb-5" style={{ paddingBottom: '120px' }}>
        <div className="row">
          <div className="col-12">
            {/* Welcome Section */}
            <div className="text-center mb-4">
              <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                <Sparkles className="me-2" />
                Profile Settings
              </div>
              <h1 className="text-white display-6 fw-bold mb-2">
                {greeting}, {userName}! ⚙️
              </h1>
            </div>

            {/* User Information Section */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary bg-opacity-75 rounded p-2 me-3">
                    <User className="text-white" />
                  </div>
                  <h3 className="text-white mb-0">Personal Information</h3>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-white">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <button className="btn btn-primary btn-sm">
                    <Save className="me-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Life Balance Section */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary bg-opacity-75 rounded p-2 me-3">
                    <Activity className="text-white" />
                  </div>
                  <h3 className="text-white mb-0">Life Balance & Priorities</h3>
                </div>
                
                {/* Interactive Radar Wheel of Life Chart */}
                <div className="text-center mb-4">
                  <WheelOfLifeRadar 
                    wheelData={processedWheelData} 
                    overallBalance={overallBalance}
                  />
                </div>

                {/* Life Area Labels with Priority Indicators */}
                <div className="row g-2">
                  {processedWheelData.map((item: any, index: number) => (
                    <div key={item.name} className="col-6">
                      <div className={`bg-opacity-25 rounded p-2 text-center border border-white border-opacity-25 position-relative`}
                           style={{ 
                             backgroundColor: `hsl(${(index * 60) % 360}, 70%, ${50 + (item.value / 10) * 20}%)`,
                             cursor: 'pointer'
                           }}
                           onClick={() => {
                             setSelectedLifeArea(item);
                             setShowPriorityModal(true);
                           }}>
                        {/* Priority badge for top 3 */}
                        {item.priority <= 3 && (
                          <div className="position-absolute top-0 start-0 translate-middle badge bg-warning text-dark rounded-pill" style={{ fontSize: '0.6rem' }}>
                            #{item.priority}
                          </div>
                        )}
                        <small className="text-white fw-medium d-block">{item.name}</small>
                        <div className="text-white fw-bold">{item.value}/10</div>
                        <small className="text-white opacity-75">Priority: {item.priority}</small>
                        <div className="mt-1">
                          <Edit className="text-white opacity-75" size={12} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Account Actions Section */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-warning bg-opacity-75 rounded p-2 me-3">
                    <Settings className="text-white" />
                  </div>
                  <h3 className="text-white mb-0">Account Actions</h3>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <button className="btn btn-outline-light w-100">
                      <Download className="me-2" />
                      Export Data
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-warning w-100">
                      <Shield className="me-2" />
                      Privacy Settings
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      onClick={handleLogout}
                      className="btn btn-outline-danger w-100"
                    >
                      <LogOut className="me-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Update Modal */}
      {showPriorityModal && selectedLifeArea && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark bg-opacity-75 border border-white border-opacity-25">
              <div className="modal-header border-bottom border-white border-opacity-25">
                <h5 className="modal-title text-white">
                  Update Priority: {selectedLifeArea.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPriorityModal(false)}
                />
              </div>
              
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-white">New Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(parseInt(e.target.value))}
                    className="form-select bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
                  >
                    {processedWheelData.map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        Priority {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="alert alert-info bg-info bg-opacity-25 border border-info border-opacity-25">
                  <small className="text-white">
                    Higher priority numbers (1, 2, 3) will be shown with badges and receive more focus in your dashboard.
                  </small>
                </div>
              </div>
              
              <div className="modal-footer border-top border-white border-opacity-25">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPriorityModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdatePriority}
                  disabled={isSaving}
                >
                  {isSaving ? 'Updating...' : 'Update Priority'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';


export default function TestFlowPage() {
  const { data: session, status } = useSession();
  const [userState, setUserState] = useState(() => {
    // Get initial state from localStorage
    try {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
      const hasAnyData = localStorage.getItem('has_any_data') === 'true';
      const lastCheckInDate = localStorage.getItem('last_check_in_date');
      const isFirstTimeUser = !hasAnyData && !hasCompletedOnboarding;
      
      return {
        hasCompletedOnboarding,
        hasAnyData,
        lastCheckInDate,
        isFirstTimeUser
      };
    } catch (error) {
      return {
        hasCompletedOnboarding: false,
        hasAnyData: false,
        lastCheckInDate: null,
        isFirstTimeUser: true
      };
    }
  });

  const refreshState = () => {
    // Refresh state from localStorage
    try {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
      const hasAnyData = localStorage.getItem('has_any_data') === 'true';
      const lastCheckInDate = localStorage.getItem('last_check_in_date');
      const isFirstTimeUser = !hasAnyData && !hasCompletedOnboarding;
      
      setUserState({
        hasCompletedOnboarding,
        hasAnyData,
        lastCheckInDate,
        isFirstTimeUser
      });
    } catch (error) {
      console.error('Error refreshing user state:', error);
    }
  };

  const resetAll = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('has_any_data');
    localStorage.removeItem('last_check_in_date');
    refreshState();
  };

  const simulateOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    refreshState();
  };

  const simulateDataCreated = () => {
    localStorage.setItem('has_any_data', 'true');
    refreshState();
  };

  const simulateCheckIn = () => {
    localStorage.setItem('last_check_in_date', new Date().toISOString());
    refreshState();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
          <p>Please log in to test the user flow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 User Flow Test Page</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current State */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Current User State</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Onboarding Completed:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${userState.hasCompletedOnboarding ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {userState.hasCompletedOnboarding ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Has Any Data:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${userState.hasAnyData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {userState.hasAnyData ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Last Check-in:</span>
                  <span className="px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                    {userState.lastCheckInDate ? new Date(userState.lastCheckInDate).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Is First Time User:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${!userState.hasAnyData && !userState.hasCompletedOnboarding ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {!userState.hasAnyData && !userState.hasCompletedOnboarding ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Flow */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">Expected Flow</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                  <span>First Time User → Welcome Page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                  <span>Returning User (No Check-in Today) → Check-in Page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                  <span>Returning User (Checked-in Today) → Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={simulateOnboarding}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✅ Complete Onboarding
              </button>
              
              <button
                onClick={simulateDataCreated}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📝 Create Data
              </button>
              
              <button
                onClick={simulateCheckIn}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📱 Complete Check-in
              </button>
              
              <button
                onClick={resetAll}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Reset All
              </button>
            </div>
          </div>

          {/* Test Navigation */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Navigation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                🏠 Go to Home
              </a>
              
              <a
                href="/check-in"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
              >
                📱 Go to Check-in
              </a>
              
              <a
                href="/dashboard"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-center"
              >
                📊 Go to Dashboard
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-4">📋 Test Instructions</h2>
            <ol className="space-y-2 text-yellow-800">
              <li>1. <strong>Reset All</strong> to start fresh</li>
              <li>2. Click <strong>Go to Home</strong> - should redirect to Welcome (first time user)</li>
              <li>3. <strong>Complete Onboarding</strong> then go to Home - should redirect to Check-in</li>
              <li>4. <strong>Complete Check-in</strong> then go to Home - should redirect to Dashboard</li>
              <li>5. Wait until tomorrow or <strong>Reset All</strong> to test daily check-in again</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 
export interface UserState {
  hasCompletedOnboarding: boolean;
  hasAnyData: boolean;
  lastCheckInDate: string | null;
  isFirstTimeUser: boolean;
}

// Client-side only user state management
export function getUserState(): UserState {
  try {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
    const hasAnyData = localStorage.getItem('has_any_data') === 'true';
    const lastCheckInDate = localStorage.getItem('last_check_in_date');

    // Check if this is first time user (no data and no onboarding)
    const isFirstTimeUser = !hasAnyData && !hasCompletedOnboarding;

    return {
      hasCompletedOnboarding,
      hasAnyData,
      lastCheckInDate,
      isFirstTimeUser
    };
  } catch (error) {
    console.error('Error getting user state:', error);
    // Return default state on error
    return {
      hasCompletedOnboarding: false,
      hasAnyData: false,
      lastCheckInDate: null,
      isFirstTimeUser: true
    };
  }
}

export function shouldShowCheckIn(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return true;
  
  const lastCheckIn = new Date(lastCheckInDate);
  const today = new Date();
  
  // Reset time to compare only dates
  const lastCheckInDateOnly = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Show check-in if last check-in was not today
  return lastCheckInDateOnly.getTime() !== todayDateOnly.getTime();
}

export function getRedirectPath(userState: UserState): string {
  if (userState.isFirstTimeUser) {
    return '/welcome';
  }
  
  if (shouldShowCheckIn(userState.lastCheckInDate)) {
    return '/check-in';
  }
  
  return '/dashboard';
}



 
"use client";

// Constants
export const MAX_SHORTLISTED_PRACTITIONERS = 3;

// Get the current shortlisted practitioners count
export const getShortlistedCount = async () => {
  try {
    const response = await fetch('/api/matches?type=shortlisted');
    if (!response.ok) {
      throw new Error('Failed to fetch shortlisted matches');
    }
    const data = await response.json();
    return data.matches.length;
  } catch (error) {
    console.error('Error getting shortlisted count:', error);
    return 0;
  }
};

// Check if user has reached their shortlisting limit (3 practitioners)
export const hasReachedShortlistLimit = async () => {
  const shortlistedCount = await getShortlistedCount();
  return shortlistedCount >= MAX_SHORTLISTED_PRACTITIONERS;
};

// Get the list of shortlisted practitioner IDs
export const getShortlistedPractitionerIds = async () => {
  try {
    const response = await fetch('/api/matches?type=shortlisted');
    if (!response.ok) {
      throw new Error('Failed to fetch shortlisted matches');
    }
    const data = await response.json();
    return data.matches.map(match => match.practitioner._id);
  } catch (error) {
    console.error('Error getting shortlisted practitioner IDs:', error);
    return [];
  }
};

// Check if a practitioner is already shortlisted
export const isPractitionerShortlisted = async (practitionerId) => {
  try {
    const response = await fetch(`/api/matches/practitioner/${practitionerId}?type=shortlisted`);
    if (!response.ok) {
      throw new Error('Failed to check if practitioner is shortlisted');
    }
    const data = await response.json();
    return data.isMatched;
  } catch (error) {
    console.error('Error checking if practitioner is shortlisted:', error);
    return false;
  }
};

// Track shown practitioners
export const saveShownPractitioners = async (practitionerIds) => {
  try {
    const response = await fetch('/api/practitioners/shown', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ practitionerIds }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving shown practitioners:', error);
    return false;
  }
};

// Get the list of practitioner IDs that have been shown to the user
export const getShownPractitioners = async () => {
  try {
    const response = await fetch('/api/practitioners/shown');
    if (!response.ok) {
      throw new Error('Failed to fetch shown practitioners');
    }
    const data = await response.json();
    return data.shownPractitioners;
  } catch (error) {
    console.error('Error getting shown practitioners:', error);
    return [];
  }
};

// Reset practitioners queue for restarting swipe process
export const resetPractitionersQueue = async () => {
  try {
    const response = await fetch('/api/practitioners/shown', {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error resetting practitioners queue:', error);
    return false;
  }
};

// Get the remaining practitioners (excluding already shortlisted ones)
export const getRemainingPractitioners = async (allPractitioners) => {
  try {
    const shortlistedIds = await getShortlistedPractitionerIds();
    return allPractitioners.filter(p => !shortlistedIds.includes(p.id));
  } catch (error) {
    console.error('Error getting remaining practitioners:', error);
    return allPractitioners;
  }
};

// Booking related utility functions
export const hasBookedSession = async () => {
  try {
    const response = await fetch('/api/appointments?status=confirmed');
    if (!response.ok) {
      throw new Error('Failed to fetch booked appointments');
    }
    const data = await response.json();
    return data.appointments && data.appointments.length > 0;
  } catch (error) {
    console.error('Error checking booked sessions:', error);
    return false;
  }
};

// Quiz parameters - save to user profile
export const saveQuizParameters = async (parameters) => {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quizParameters: parameters }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving quiz parameters:', error);
    return false;
  }
};

// Get quiz parameters from user profile
export const getQuizParameters = async () => {
  try {
    const response = await fetch('/api/users/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return data.user.quizParameters;
  } catch (error) {
    console.error('Error getting quiz parameters:', error);
    return null;
  }
};

// Get the ID of the practitioner who messaged
export const getMessagedPractitionerId = async () => {
  try {
    const response = await fetch('/api/matches?hasMessaged=true');
    if (!response.ok) {
      throw new Error('Failed to fetch practitioners with messages');
    }
    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      return data.matches[0].practitioner._id;
    }
    return null;
  } catch (error) {
    console.error('Error getting messaged practitioner ID:', error);
    return null;
  }
};

// Store mid-screen prompt state in user profile
export const setMidScreenPromptShown = async (shown = true) => {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ midScreenPromptShown: shown }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error setting mid-screen prompt status:', error);
    return false;
  }
};

// Check if mid-screen prompt has been shown from user profile
export const hasMidScreenPromptShown = async () => {
  try {
    const response = await fetch('/api/users/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return data.user.midScreenPromptShown === true;
  } catch (error) {
    console.error('Error checking mid-screen prompt status:', error);
    return false;
  }
};

// Reset mid-screen prompt status
export const resetMidScreenPromptStatus = async () => {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ midScreenPromptShown: false }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error resetting mid-screen prompt status:', error);
    return false;
  }
};

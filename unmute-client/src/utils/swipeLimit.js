"use client";

// Helper function to check if localStorage is available
export const isLocalStorageAvailable = () => {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.localStorage) return false;
    
    // Test localStorage functionality
    const testKey = '__test_key__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper function to safely get localStorage items
export const safeGetItem = (key) => {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(key);
};

// Helper function to safely set localStorage items
export const safeSetItem = (key, value) => {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error(`Error setting localStorage item ${key}:`, e);
    return false;
  }
};

// Helper function to safely remove localStorage items
export const safeRemoveItem = (key) => {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing localStorage item ${key}:`, e);
    return false;
  }
};

// Constants
export const MAX_SHORTLISTED_PRACTITIONERS = 3;

// Get the current shortlisted practitioners count
export const getShortlistedCount = () => {
  try {
    const savedMatches = safeGetItem('savedMatches');
    if (!savedMatches) return 0;
    
    const matches = JSON.parse(savedMatches);
    return matches.length;
  } catch (error) {
    console.error('Error reading shortlisted data:', error);
    return 0;
  }
};

// Check if user has reached their shortlisting limit (3 practitioners)
export const hasReachedShortlistLimit = () => {
  const shortlistedCount = getShortlistedCount();
  return shortlistedCount >= MAX_SHORTLISTED_PRACTITIONERS;
};

// Get the list of shortlisted practitioner IDs
export const getShortlistedPractitionerIds = () => {
  try {
    const savedMatches = safeGetItem('savedMatches');
    if (!savedMatches) return [];
    
    const matches = JSON.parse(savedMatches);
    return matches.map(practitioner => practitioner.id);
  } catch (error) {
    console.error('Error reading shortlisted practitioner IDs:', error);
    return [];
  }
};

// Check if a practitioner is already shortlisted
export const isPractitionerShortlisted = (practitionerId) => {
  const shortlistedIds = getShortlistedPractitionerIds();
  return shortlistedIds.includes(practitionerId);
};

// Clear the shortlisted practitioners (for testing or when a booking is made)
export const clearShortlistedPractitioners = () => {
  try {
    safeRemoveItem('savedMatches');
    return true;
  } catch (error) {
    console.error('Error clearing shortlisted practitioners:', error);
    return false;
  }
};

// Store practitioner message status to track if a practitioner has messaged
export const savePractitionerMessageStatus = (practitionerId, hasMessaged) => {
  try {
    const storedData = safeGetItem('practitionerMessages') || '{}';
    const data = JSON.parse(storedData);
    
    data[practitionerId] = hasMessaged;
    
    safeSetItem('practitionerMessages', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving practitioner message status:', error);
    return false;
  }
};

// Check if a practitioner has messaged
export const hasPractitionerMessaged = (practitionerId) => {
  try {
    const storedData = safeGetItem('practitionerMessages');
    if (!storedData) return false;
    
    const data = JSON.parse(storedData);
    return !!data[practitionerId];
  } catch (error) {
    console.error('Error checking practitioner message status:', error);
    return false;
  }
};

// Check if any practitioner has messaged
export const hasAnyPractitionerMessaged = () => {
  try {
    const storedData = safeGetItem('practitionerMessages');
    if (!storedData) return false;
    
    const data = JSON.parse(storedData);
    return Object.values(data).some(value => value === true);
  } catch (error) {
    console.error('Error checking if any practitioner has messaged:', error);
    return false;
  }
};

// Get the ID of the practitioner who messaged
export const getMessagedPractitionerId = () => {
  try {
    const storedData = safeGetItem('practitionerMessages');
    if (!storedData) return null;
    
    const data = JSON.parse(storedData);
    for (const [id, hasMessaged] of Object.entries(data)) {
      if (hasMessaged) {
        return id;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting messaged practitioner ID:', error);
    return null;
  }
};

// Check if a user has booked a session
export const hasBookedSession = () => {
  try {
    return safeGetItem('hasBookedSession') === 'true';
  } catch (error) {
    console.error('Error checking if user has booked session:', error);
    return false;
  }
};

// Set the booked session status
export const setBookedSession = (hasBooked = true) => {
  try {
    safeSetItem('hasBookedSession', hasBooked.toString());
    return true;
  } catch (error) {
    console.error('Error setting booked session status:', error);
    return false;
  }
};

// Store quiz parameters for when booking a session
export const saveQuizParameters = (parameters) => {
  try {
    safeSetItem('quizParameters', JSON.stringify(parameters));
    return true;
  } catch (error) {
    console.error('Error saving quiz parameters:', error);
    return false;
  }
};

// Get quiz parameters
export const getQuizParameters = () => {
  try {
    const parameters = safeGetItem('quizParameters');
    if (!parameters) return null;
    
    return JSON.parse(parameters);
  } catch (error) {
    console.error('Error getting quiz parameters:', error);
    return null;
  }
};

// Save shown practitioners to track which ones the user has already seen
export const saveShownPractitioners = (practitionerIds) => {
  try {
    const current = getShownPractitioners();
    const updated = [...new Set([...current, ...practitionerIds])];
    safeSetItem('shownPractitioners', JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving shown practitioners:', error);
    return false;
  }
};

// Get the list of practitioner IDs that have been shown to the user
export const getShownPractitioners = () => {
  try {
    const shown = safeGetItem('shownPractitioners');
    if (!shown) return [];
    
    return JSON.parse(shown);
  } catch (error) {
    console.error('Error getting shown practitioners:', error);
    return [];
  }
};

// Clear shown practitioners to restart the queue
export const clearShownPractitioners = () => {
  try {
    safeRemoveItem('shownPractitioners');
    return true;
  } catch (error) {
    console.error('Error clearing shown practitioners:', error);
    return false;
  }
};

// Reset practitioners queue for restarting swipe process
// This retains shortlisted practitioners but clears the shown status
export const resetPractitionersQueue = () => {
  return clearShownPractitioners();
};

// Get the remaining practitioners (excluding already shortlisted ones)
export const getRemainingPractitioners = (allPractitioners) => {
  try {
    const shortlistedIds = getShortlistedPractitionerIds();
    return allPractitioners.filter(p => !shortlistedIds.includes(p.id));
  } catch (error) {
    console.error('Error getting remaining practitioners:', error);
    return [];
  }
};

// Track when user has seen the mid-screen prompt
export const setMidScreenPromptShown = (shown = true) => {
  try {
    safeSetItem('midScreenPromptShown', shown.toString());
    return true;
  } catch (error) {
    console.error('Error setting mid-screen prompt status:', error);
    return false;
  }
};

// Check if user has seen the mid-screen prompt
export const hasMidScreenPromptShown = () => {
  try {
    return safeGetItem('midScreenPromptShown') === 'true';
  } catch (error) {
    console.error('Error checking if mid-screen prompt has shown:', error);
    return false;
  }
};

// Reset mid-screen prompt status when user restarts swipe queue
export const resetMidScreenPromptStatus = () => {
  try {
    safeRemoveItem('midScreenPromptShown');
    return true;
  } catch (error) {
    console.error('Error resetting mid-screen prompt status:', error);
    return false;
  }
};

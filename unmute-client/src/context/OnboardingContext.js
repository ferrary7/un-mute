"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const OnboardingContext = createContext(undefined);

// Use localStorage to persist the onboarding data between routes and sessions
const getStoredData = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('onboardingData');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored onboarding data', e);
      }
    }
  }
  return null;
};

export function OnboardingProvider({ children }) {
  const [onboardingData, setOnboardingData] = useState(getStoredData);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Store data in localStorage when it changes
  useEffect(() => {
    if (onboardingData) {
      console.log("OnboardingContext: Storing data in localStorage");
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    }
  }, [onboardingData]);

  // If session becomes available AND we have onboarding data, try to save it
  useEffect(() => {
    const saveDataIfNeeded = async () => {
      if (status === 'authenticated' && session?.user?.id && onboardingData) {
        console.log("OnboardingContext: Authenticated with onboarding data, attempting to save");
        
        try {
          const response = await fetch('/api/users/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(onboardingData),
          });
            if (response.ok) {
            console.log("OnboardingContext: Data saved successfully");
            localStorage.removeItem('onboardingData');
            setOnboardingData(null);
            toast.success("Welcome to Un-Mute! 🎉", {
              description: "Let's find your perfect therapy match",
              duration: 5000,
              action: {
                label: "Find Matches",
                onClick: () => router.push("/matches"),
              },
            });
            router.push('/matches');
          } else {
            console.error("OnboardingContext: Failed to save data", await response.json());
            toast.error("Failed to save your preferences. Please try again.");
          }        } catch (error) {
          console.error("OnboardingContext: Error saving data", error);
          toast.error("An unexpected error occurred. Please try again.");
        }
      }
    };
    
    saveDataIfNeeded();
  }, [status, session, onboardingData, router]);
  
  const storeOnboardingData = useCallback((data) => {
    console.log("OnboardingContext: Storing onboarding data in context", data);
    setOnboardingData(data);
  }, []);
  
  const clearOnboardingData = useCallback(() => {
    console.log("OnboardingContext: Clearing onboarding data");
    setOnboardingData(null);
    localStorage.removeItem('onboardingData');
  }, []);

  return (
    <OnboardingContext.Provider value={{ 
      onboardingData, 
      storeOnboardingData, 
      clearOnboardingData
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

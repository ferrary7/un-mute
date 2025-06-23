"use client";

import { createContext, useContext, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [toastHistory, setToastHistory] = useState([]);

  // Save toast to user profile notifications
  const saveToastToProfile = async (message, type = "info") => {
    if (!session?.user?.id) return;

    try {
      const notification = {
        id: Date.now().toString(),
        message,
        type,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Add to local history
      setToastHistory(prev => [notification, ...prev]);

      // Save to backend
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $push: { notifications: notification }
        }),
      });
    } catch (error) {
      console.error("Failed to save notification:", error);
    }
  };

  const toast = {
    success: (message, options = {}) => {
      saveToastToProfile(message, "success");
      return sonnerToast.success(message, {
        duration: 4000,
        ...options,
      });
    },

    error: (message, options = {}) => {
      saveToastToProfile(message, "error");
      return sonnerToast.error(message, {
        duration: 5000,
        ...options,
      });
    },

    info: (message, options = {}) => {
      saveToastToProfile(message, "info");
      return sonnerToast.info(message, {
        duration: 4000,
        ...options,
      });
    },

    warning: (message, options = {}) => {
      saveToastToProfile(message, "warning");
      return sonnerToast.warning(message, {
        duration: 4000,
        ...options,
      });
    },

    // Booking-specific toasts with actions
    bookingSuccess: (practitionerName, appointment) => {
      const message = `Session with ${practitionerName} confirmed!`;
      saveToastToProfile(message, "success");
      
      return sonnerToast.success(message, {
        description: `${appointment.date} at ${appointment.time}`,
        duration: 6000,
        action: {
          label: "View Appointments",
          onClick: () => router.push("/appointments"),
        },
      });
    },

    appointmentReminder: (practitionerName, appointment) => {
      const message = `Upcoming session with ${practitionerName}`;
      saveToastToProfile(message, "info");
      
      return sonnerToast.info(message, {
        description: `Tomorrow at ${appointment.time}`,
        duration: 8000,
        action: {
          label: "View Details",
          onClick: () => router.push("/appointments"),
        },
      });
    },

    handshakeRequest: (practitionerName, appointmentId) => {
      const message = `${practitionerName} wants to continue working with you`;
      saveToastToProfile(message, "info");
      
      return sonnerToast.info(message, {
        description: "Please respond to their handshake request",
        duration: 10000,
        action: {
          label: "Respond",
          onClick: () => router.push("/appointments"),
        },
      });
    },

    matchFound: (practitionerName, matchCount) => {
      const message = `New match found: ${practitionerName}`;
      saveToastToProfile(message, "success");
      
      return sonnerToast.success(message, {
        description: `You now have ${matchCount} potential matches`,
        duration: 6000,
        action: {
          label: "View Matches",
          onClick: () => router.push("/matches/list"),
        },
      });
    },

    profileUpdated: () => {
      const message = "Profile updated successfully";
      saveToastToProfile(message, "success");
      
      return sonnerToast.success(message, {
        description: "Your changes have been saved",
        duration: 3000,
      });
    },

    onboardingComplete: () => {
      const message = "Welcome to Un-Mute! 🎉";
      saveToastToProfile(message, "success");
      
      return sonnerToast.success(message, {
        description: "Let's find your perfect therapy match",
        duration: 5000,
        action: {
          label: "Find Matches",
          onClick: () => router.push("/matches"),
        },
      });
    },

    // Generic toast with custom action
    custom: (message, options = {}) => {
      if (options.saveToProfile !== false) {
        saveToastToProfile(message, options.type || "info");
      }
      
      return sonnerToast(message, {
        duration: 4000,
        ...options,
      });
    },
  };

  const value = {
    toast,
    toastHistory,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

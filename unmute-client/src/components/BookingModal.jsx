"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Phone, MessageCircle, CreditCard, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
// Import API utility functions
import { 
  getMessagedPractitionerId, 
  getonboardingParameters
} from "@/utils/dbUtils";

export default function BookingModal({ practitioner, isOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isAllowedToBook, setIsAllowedToBook] = useState(true);
  const [onboardingParameters, setonboardingParameters] = useState(null);
  const [isFirstSession, setIsFirstSession] = useState(true);
  const [previousSessions, setPreviousSessions] = useState([]);
  
  const router = useRouter();
  const { toast } = useToast();

  // Helper function to extract numeric price from string
  const extractPrice = (priceString) => {
    if (!priceString) return 0;
    const match = priceString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Get the session price based on whether it's first session or not
  const getSessionPrice = () => {
    return isFirstSession ? 99 : extractPrice(practitioner.price);
  };

  // Get session duration based on whether it's first session or not
  const getSessionDuration = () => {
    return isFirstSession ? "20 minutes" : "50 minutes";
  };

  // Load onboarding parameters from API/user profile
  useEffect(() => {
    // Always allow booking
    setIsAllowedToBook(true);
    
    // Check if this is the first session with this practitioner
    const checkSessionHistory = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const { appointments } = await response.json();
          
          // Filter sessions with this practitioner
          const sessionsWithPractitioner = appointments.filter(
            appt => appt.practitioner._id === practitioner.id && 
                   (appt.status === 'completed' || appt.status === 'confirmed')
          );
          
          setPreviousSessions(sessionsWithPractitioner);
          
          // Check if there are any completed introductory sessions
          const completedIntroSessions = sessionsWithPractitioner.filter(
            appt => appt.isIntroductorySession && appt.status === 'completed'
          );
          
          if (completedIntroSessions.length > 0) {
            // There's a completed intro session, check handshake status
            const introSession = completedIntroSessions[0];
            if (introSession.handshakeCompleted) {
              // Handshake completed, allow regular sessions
              setIsFirstSession(false);
              setIsAllowedToBook(true);
            } else if (introSession.userHandshake === null) {
              // Handshake pending
              setIsAllowedToBook(false);
            } else {
              // Handshake declined
              setIsAllowedToBook(false);
            }
          } else {
            // No completed intro sessions
            setIsFirstSession(sessionsWithPractitioner.length === 0);
            setIsAllowedToBook(true);
          }
        }
      } catch (error) {
        console.error("Error checking session history:", error);
        // Default to first session if we can't check
        setIsFirstSession(true);
        setIsAllowedToBook(true);
      }
    };
    
    // Load onboarding parameters from API
    const fetchonboardingParameters = async () => {
      try {
        const parameters = await getonboardingParameters();
        if (parameters) {
          setonboardingParameters(parameters);
        }
      } catch (error) {
        console.error("Error fetching onboarding parameters:", error);
      }
    };
    
    if (practitioner) {
      checkSessionHistory();
      fetchonboardingParameters();
    }
  }, [practitioner]);

  // Mock available dates (next 7 days)
  const availableDates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    availableDates.push({
      date: date,
      formatted: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    });
  }

  // Mock available time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", 
    "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  const sessionTypeOptions = [
    {
      id: "video",
      label: "Video Call",
      icon: <Video className="h-5 w-5" />,
      description: "Face-to-face video session",
      available: practitioner?.sessionTypes?.includes("video")
    },
    {
      id: "audio",
      label: "Audio Call",
      icon: <Phone className="h-5 w-5" />,
      description: "Voice-only session",
      available: practitioner?.sessionTypes?.includes("audio")
    },
    {
      id: "text",
      label: "Text Chat",
      icon: <MessageCircle className="h-5 w-5" />,
      description: "Written conversation",
      available: practitioner?.sessionTypes?.includes("text")
    }
  ];

  // Handle session booking
  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !selectedSessionType) {
      alert("Please select a date, time, and session type.");
      return;
    }
    
    setIsBooking(true);
    
    try {
      // Prepare the appointment data
      const appointmentData = {
        practitionerId: practitioner.id,
        date: selectedDate,
        time: selectedTime,
        sessionType: selectedSessionType,
        status: "confirmed",
        duration: isFirstSession ? "20 minutes" : "50 minutes",
        sessionPrice: isFirstSession ? 99 : extractPrice(practitioner.price),
        isIntroductorySession: isFirstSession,
        notes: null,
        onboardingParameters: onboardingParameters || {}
      };
      
      // Save appointment to the database
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }
      
      // Update the message status to mark that the practitioner has messaged the user
      await fetch('/api/matches', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practitionerId: practitioner.id,
          hasMessaged: true
        }),
      });
      
      // Update UI state
      setBookingComplete(true);
      
      // Show success toast with action button
      toast.bookingSuccess(practitioner.name, {
        date: selectedDate,
        time: selectedTime
      });
      
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };
  
  // Handle viewing appointments
  const handleViewAppointments = () => {
    router.push('/appointments');
  };
  
  // Handle closing the modal after booking
  const handleClose = () => {
    onClose();
  };

  // After successful booking, redirect to appointments
  useEffect(() => {
    if (bookingComplete) {
      const timer = setTimeout(() => {
        onClose();
        router.push("/appointments");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [bookingComplete, onClose, router]);

  // If booking is not allowed, show appropriate message
  if (!isAllowedToBook) {
    const completedIntroSessions = previousSessions.filter(
      appt => appt.isIntroductorySession && appt.status === 'completed'
    );
    
    let title, description, actionText = "View Appointments";
    
    if (completedIntroSessions.length > 0) {
      const introSession = completedIntroSessions[0];
      if (introSession.userHandshake === null) {
        title = "Complete Your Handshake First";
        description = `You have a completed introductory session with ${practitioner.name}. Please complete the handshake process before booking regular sessions.`;
        actionText = "Go to Appointments";
      } else if (!introSession.handshakeCompleted) {
        title = "No Match Found";
        description = `The handshake with ${practitioner.name} was not successful. You may want to try booking with a different practitioner.`;
        actionText = "Find Other Practitioners";
      }
    } else {
      title = "Booking Not Available";
      description = "Another practitioner has already contacted you. You can only book sessions with that practitioner.";
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 mt-4">
            <Button 
              className="flex-1"
              onClick={() => {
                onClose();
                if (actionText === "Go to Appointments") {
                  router.push('/appointments');
                } else if (actionText === "Find Other Practitioners") {
                  router.push('/matches');
                }
              }}
            >
              {actionText}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!practitioner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!bookingComplete ? (
          <>
            <DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={practitioner.image} alt={practitioner.name} />
                  <AvatarFallback>
                    {practitioner.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>Book Session with {practitioner.name}</DialogTitle>
                  <DialogDescription>
                    {practitioner.specializations.slice(0, 2).join(", ")} • 
                    {isFirstSession ? (
                      <span className="text-green-600 font-medium"> ₹99 (Introductory Session)</span>
                    ) : (
                      <span> {practitioner.price}</span>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Introductory Session Info */}
              {isFirstSession && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Special Introductory Session</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          Get to know your practitioner with a 20-minute introductory session for just ₹99.
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Discuss your goals and concerns</li>
                          <li>• Experience the practitioner's approach</li>
                          <li>• Decide if you'd like to continue with regular sessions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Previous Sessions Info */}
              {!isFirstSession && previousSessions.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Continuing sessions with {practitioner.name} 
                        ({previousSessions.length} session{previousSessions.length > 1 ? 's' : ''} completed)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Session Type Selection */}
              <div>
                <h3 className="font-semibold mb-3">Choose Session Type</h3>
                <div className="grid gap-3">
                  {sessionTypeOptions.filter(option => option.available).map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedSessionType === option.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedSessionType(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {option.icon}
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                          {selectedSessionType === option.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Date Selection */}
              <div>
                <h3 className="font-semibold mb-3">Select Date</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {availableDates.map((dateOption, index) => (
                    <Button
                      key={index}
                      variant={selectedDate === dateOption.formatted ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col"
                      onClick={() => setSelectedDate(dateOption.formatted)}
                    >
                      <Calendar className="h-4 w-4 mb-1" />
                      <span className="text-xs">{dateOption.formatted}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-semibold mb-3">Select Time</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="h-auto p-3 flex flex-col"
                        onClick={() => setSelectedTime(time)}
                      >
                        <Clock className="h-4 w-4 mb-1" />
                        <span className="text-xs">{time}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Booking Summary */}
              {selectedDate && selectedTime && selectedSessionType && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Practitioner:</span>
                      <span className="font-medium">{practitioner.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Type:</span>
                      <span className="font-medium">
                        {sessionTypeOptions.find(opt => opt.id === selectedSessionType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{getSessionDuration()}</span>
                    </div>
                    {isFirstSession && (
                      <div className="flex justify-between text-blue-600">
                        <span>Session Type:</span>
                        <span className="font-medium">Introductory Session</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">
                        ₹{getSessionPrice()}
                        {isFirstSession && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            (Special Price)
                          </span>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleBookSession}
                  disabled={!selectedDate || !selectedTime || !selectedSessionType || isBooking}
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Booking Success */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Your session with {practitioner.name} has been successfully booked.
            </DialogDescription>
            
            <Card className="bg-green-50 border-green-200 mb-6">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">{selectedDate} at {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Type:</span>
                    <span className="font-medium">
                      {sessionTypeOptions.find(opt => opt.id === selectedSessionType)?.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <Button className="w-full" onClick={handleViewAppointments}>
                View My Appointments
              </Button>
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Continue Browsing
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              You'll receive a confirmation email with session details shortly.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
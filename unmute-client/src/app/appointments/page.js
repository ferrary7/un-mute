"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, Phone, MessageCircle, Star, MapPin, MoreVertical, Plus, HandHeart } from "lucide-react";
import Navbar from "@/components/Navbar";
import HandshakeModal from "@/components/HandshakeModal";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHandshake, setShowHandshake] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const router = useRouter();
  useEffect(() => {
    // Load appointments from API
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/appointments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const { appointments: dbAppointments } = await response.json();
          // Format appointments for UI display
        const formattedAppointments = dbAppointments.map(appt => ({
          id: appt._id,
          practitioner: {
            id: appt.practitioner._id,
            name: appt.practitioner.name,
            image: appt.practitioner.image,
            specializations: appt.practitioner.specializations,
            rating: appt.practitioner.rating,
            location: appt.practitioner.location
          },
          date: new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: appt.time,
          sessionType: appt.sessionType,
          bookingId: appt.bookingId || `BK${Date.now().toString().substring(7)}`,
          status: appt.status,
          duration: appt.duration || "50 minutes",
          sessionPrice: appt.sessionPrice,
          isIntroductorySession: appt.isIntroductorySession || false,
          handshakeCompleted: appt.handshakeCompleted || false,
          userHandshake: appt.userHandshake,
          practitionerHandshake: appt.practitionerHandshake,
          notes: appt.notes
        }));
        
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Phone className="h-4 w-4" />;
      case "text":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Video Call";
      case "audio":
        return "Audio Call";
      case "text":
        return "Text Chat";
      default:
        return "Video Call";
    }
  };
  const getStatusBadge = (status, isIntroductory, handshakeCompleted, userHandshake) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case "completed":
        if (isIntroductory && userHandshake === null) {
          return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Needs Handshake</Badge>;
        } else if (isIntroductory && handshakeCompleted) {
          return <Badge className="bg-green-100 text-green-800 border-green-200">Handshake Complete</Badge>;
        } else if (isIntroductory && !handshakeCompleted) {
          return <Badge variant="secondary">No Match</Badge>;
        }
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isUpcoming = (appointment) => {
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return false;
    }
    // For demo purposes, consider all "confirmed" appointments as upcoming
    return appointment.status === "confirmed";
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter(app => !isUpcoming(app));

  const handleJoinSession = (appointment) => {
    // Mock joining session
    console.log("Joining session:", appointment);
    alert(`Joining ${getSessionTypeLabel(appointment.sessionType)} with ${appointment.practitioner.name}`);
  };

  const handleReschedule = (appointment) => {
    // Mock reschedule
    console.log("Reschedule:", appointment);
    alert("Reschedule functionality would be implemented here");
  };
  const handleCancel = (appointment) => {
    // Mock cancel
    console.log("Cancel:", appointment);
    if (confirm("Are you sure you want to cancel this appointment?")) {
      const updatedAppointments = appointments.map(app => 
        app.bookingId === appointment.bookingId 
          ? { ...app, status: "cancelled" }
          : app
      );
      setAppointments(updatedAppointments);
    }
  };

  const handleMarkCompleted = async (appointment) => {
    // Helper function for testing - mark session as completed
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (response.ok) {
        // Refresh appointments
        window.location.reload();
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };
  const handleBookNew = () => {
    router.push("/matches/list");
  };

  const handleHandshake = (appointment) => {
    setSelectedAppointment(appointment);
    setShowHandshake(true);
  };

  const handleHandshakeComplete = (result) => {
    // Refresh appointments to show updated status
    const loadAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const { appointments: dbAppointments } = await response.json();
          const formattedAppointments = dbAppointments.map(appt => ({
            id: appt._id,
            practitioner: {
              id: appt.practitioner._id,
              name: appt.practitioner.name,
              image: appt.practitioner.image,
              specializations: appt.practitioner.specializations,
              rating: appt.practitioner.rating,
              location: appt.practitioner.location
            },
            date: new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: appt.time,
            sessionType: appt.sessionType,
            bookingId: appt.bookingId || `BK${Date.now().toString().substring(7)}`,
            status: appt.status,
            duration: appt.duration || "50 minutes",
            sessionPrice: appt.sessionPrice,
            isIntroductorySession: appt.isIntroductorySession || false,
            handshakeCompleted: appt.handshakeCompleted || false,
            userHandshake: appt.userHandshake,
            practitionerHandshake: appt.practitionerHandshake,
            notes: appt.notes
          }));
          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error('Error refreshing appointments:', error);
      }
    };
    
    loadAppointments();
    setShowHandshake(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              My Appointments
            </h1>
            <p className="text-muted-foreground">
              Manage your mental wellness sessions
            </p>
          </div>
          <Button onClick={handleBookNew}>
            <Plus className="h-4 w-4 mr-2" />
            Book New Session
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Upcoming Appointments */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.bookingId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.practitioner.image} alt={appointment.practitioner.name} />
                          <AvatarFallback>
                            {appointment.practitioner.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{appointment.practitioner.name}</CardTitle>
                          <CardDescription>
                            {appointment.practitioner.specializations.slice(0, 2).join(", ")}
                          </CardDescription>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{appointment.practitioner.rating}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <MapPin className="h-3 w-3 text-muted-foreground" />                            <span className="text-sm text-muted-foreground">{appointment.practitioner.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {appointment.isIntroductorySession && (
                          <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                            Introductory Session
                          </Badge>
                        )}
                        {getStatusBadge(appointment.status, appointment.isIntroductorySession, appointment.handshakeCompleted, appointment.userHandshake)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSessionTypeIcon(appointment.sessionType)}
                        <span className="text-sm">{getSessionTypeLabel(appointment.sessionType)}</span>
                      </div>
                    </div>
                      <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinSession(appointment)}
                        className="flex-1"
                      >
                        Join Session
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReschedule(appointment)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCancel(appointment)}
                      >
                        Cancel
                      </Button>
                      {/* Test button for marking introductory sessions as completed */}
                      {appointment.isIntroductorySession && process.env.NODE_ENV === 'development' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleMarkCompleted(appointment)}
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          [Test] Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No Upcoming Appointments</CardTitle>
                  <CardDescription className="mb-4">
                    You don&apos;t have any upcoming sessions scheduled.
                  </CardDescription>
                  <Button onClick={handleBookNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Past Appointments */}
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <Card key={appointment.bookingId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.practitioner.image} alt={appointment.practitioner.name} />
                          <AvatarFallback>
                            {appointment.practitioner.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{appointment.practitioner.name}</CardTitle>
                          <CardDescription>
                            {appointment.practitioner.specializations.slice(0, 2).join(", ")}
                          </CardDescription>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{appointment.practitioner.rating}</span>
                            <span className="text-sm text-muted-foreground">•</span>                            <span className="text-sm text-muted-foreground">{appointment.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {appointment.isIntroductorySession && (
                          <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                            Introductory Session
                          </Badge>
                        )}
                        {getStatusBadge(appointment.status, appointment.isIntroductorySession, appointment.handshakeCompleted, appointment.userHandshake)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSessionTypeIcon(appointment.sessionType)}
                        <span className="text-sm">{getSessionTypeLabel(appointment.sessionType)}</span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="bg-muted/30 p-3 rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground italic">
                          &quot;{appointment.notes}&quot;
                        </p>
                      </div>
                    )}                    
                    <div className="flex space-x-2">
                      {appointment.isIntroductorySession && 
                       appointment.status === 'completed' && 
                       appointment.userHandshake === null ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleHandshake(appointment)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <HandHeart className="h-4 w-4 mr-2" />
                          Complete Handshake
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleBookNew}
                            className="flex-1"
                          >
                            Book Again
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Leave Review
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No Past Appointments</CardTitle>
                  <CardDescription className="mb-4">
                    Your completed sessions will appear here.
                  </CardDescription>
                  <Button onClick={handleBookNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Session
                  </Button>
                </CardContent>
              </Card>
            )}          </TabsContent>
        </Tabs>
      </div>

      {/* Handshake Modal */}
      <HandshakeModal 
        appointment={selectedAppointment}
        isOpen={showHandshake}
        onClose={() => setShowHandshake(false)}
        onHandshakeComplete={handleHandshakeComplete}
      />
    </div>
  );
}
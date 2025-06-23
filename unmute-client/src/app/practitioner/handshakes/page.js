"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PractitionerNavbar from "@/components/practitioner/PractitionerNavbar";
import PractitionerFooter from "@/components/practitioner/PractitionerFooter";
import {
  Handshake,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Video,
  Phone,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
} from "lucide-react";

export default function PractitionerHandshakes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [handshakes, setHandshakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHandshake, setSelectedHandshake] = useState(null);
  const [schedulingSession, setSchedulingSession] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    date: "",
    time: "",
    sessionType: "video",
    duration: "50 minutes",
    notes: ""
  });

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/practitioner/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHandshakes();
    }
  }, [isAuthenticated]);

  const fetchHandshakes = async () => {
    try {
      const response = await fetch("/api/practitioner/handshakes");
      if (response.ok) {
        const data = await response.json();
        setHandshakes(data.handshakes);
      }
    } catch (error) {
      console.error("Error fetching handshakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHandshakeResponse = async (handshakeId, action) => {
    try {
      const response = await fetch(`/api/appointments/${handshakeId}/handshake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchHandshakes(); // Refresh the list
        if (action === "accept") {
          // Open scheduling modal
          const handshake = handshakes.find(h => h._id === handshakeId);
          setSelectedHandshake(handshake);
          setSchedulingSession(true);
        }
      }
    } catch (error) {
      console.error("Error responding to handshake:", error);
    }
  };

  const handleScheduleSession = async () => {
    if (!selectedHandshake) return;

    try {
      const response = await fetch("/api/practitioner/schedule-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedHandshake.user._id,
          practitionerId: selectedHandshake.practitioner._id,
          ...newSessionData,
        }),
      });

      if (response.ok) {
        setSchedulingSession(false);
        setSelectedHandshake(null);
        setNewSessionData({
          date: "",
          time: "",
          sessionType: "video",
          duration: "50 minutes",
          notes: ""
        });
        fetchHandshakes(); // Refresh the list
        // Show success message or redirect
      }
    } catch (error) {
      console.error("Error scheduling session:", error);
    }
  };

  const getSessionIcon = (sessionType) => {
    switch (sessionType) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Phone className="h-4 w-4" />;
      case "text":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const HandshakeCard = ({ handshake }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="mb-4"
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {handshake.user?.name || "Anonymous User"}
                  </h3>
                  <Badge className="bg-orange-100 text-orange-800">
                    Pending Response
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Initial session completed: {handshake.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{handshake.time} • {handshake.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getSessionIcon(handshake.sessionType)}
                    <span className="capitalize">{handshake.sessionType} session</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    <span>Handshake status: {handshake.handshakeStatus}</span>
                  </div>
                </div>
                
                {handshake.sessionNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Session Notes:</strong> {handshake.sessionNotes}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <Button
                    onClick={() => handleHandshakeResponse(handshake._id, "accept")}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept & Schedule
                  </Button>
                  
                  <Button
                    onClick={() => handleHandshakeResponse(handshake._id, "decline")}
                    variant="outline"
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading handshakes...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <PractitionerNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Pending Handshakes</h1>
          <p className="text-xl text-muted-foreground">
            Review completed sessions and schedule follow-up appointments
          </p>
        </motion.div>

        {/* Handshakes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {handshakes.length > 0 ? (
            <div className="space-y-4">
              {handshakes.map((handshake) => (
                <HandshakeCard key={handshake._id} handshake={handshake} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pending handshakes
                </h3>
                <p className="text-gray-600">
                  Handshakes from completed sessions will appear here for your review.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Scheduling Modal */}
        <Dialog open={schedulingSession} onOpenChange={setSchedulingSession}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Follow-up Session</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSessionData.date}
                  onChange={(e) => setNewSessionData({...newSessionData, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSessionData.time}
                  onChange={(e) => setNewSessionData({...newSessionData, time: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <select
                  id="sessionType"
                  value={newSessionData.sessionType}
                  onChange={(e) => setNewSessionData({...newSessionData, sessionType: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Call</option>
                  <option value="text">Text Chat</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  value={newSessionData.duration}
                  onChange={(e) => setNewSessionData({...newSessionData, duration: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="50 minutes">50 minutes</option>
                  <option value="60 minutes">60 minutes</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Session Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this session..."
                  value={newSessionData.notes}
                  onChange={(e) => setNewSessionData({...newSessionData, notes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSchedulingSession(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleScheduleSession}>
                Schedule Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <PractitionerFooter />
    </div>
  );
}

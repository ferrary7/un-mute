"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PractitionerNavbar from "@/components/practitioner/PractitionerNavbar";
import PractitionerFooter from "@/components/practitioner/PractitionerFooter";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  User,
  MapPin,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PractitionerAppointments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState({
    today: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/practitioner/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/practitioner/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const AppointmentCard = ({ appointment, showDate = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="mb-4"
    >
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => router.push(`/practitioner/appointments/${appointment._id}`)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.user?.name || "Anonymous User"}
                  </h3>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {showDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{appointment.date}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time} • {appointment.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getSessionIcon(appointment.sessionType)}
                    <span className="capitalize">{appointment.sessionType} session</span>
                  </div>
                  
                  {appointment.user?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{appointment.user.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Booking ID: </span>
                    <span className="font-mono text-gray-900">{appointment.bookingId}</span>
                  </div>
                  
                  {appointment.sessionPrice && (
                    <div className="text-sm font-medium text-green-600">
                      ₹{appointment.sessionPrice}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-gray-400" />
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
          <p className="mt-4 text-lg text-muted-foreground">Loading appointments...</p>
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Appointments</h1>
          <p className="text-xl text-muted-foreground">Manage your schedule and sessions</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by client name or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Appointments Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="today">
                Today ({appointments.today.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({appointments.upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({appointments.completed.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({appointments.cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-6">
              <div className="space-y-4">
                {appointments.today.length > 0 ? (
                  appointments.today.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      showDate={false}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No appointments today
                      </h3>
                      <p className="text-gray-600">
                        Enjoy your free day or check upcoming appointments.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-4">
                {appointments.upcoming.length > 0 ? (
                  appointments.upcoming.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No upcoming appointments
                      </h3>
                      <p className="text-gray-600">
                        Your schedule is clear for the coming days.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {appointments.completed.length > 0 ? (
                  appointments.completed.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No completed sessions yet
                      </h3>
                      <p className="text-gray-600">
                        Completed sessions will appear here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              <div className="space-y-4">
                {appointments.cancelled.length > 0 ? (
                  appointments.cancelled.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No cancelled appointments
                      </h3>
                      <p className="text-gray-600">
                        Cancelled appointments will appear here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <PractitionerFooter />
    </div>
  );
}

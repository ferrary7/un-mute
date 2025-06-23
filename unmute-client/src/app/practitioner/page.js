"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PractitionerNavbar from "@/components/practitioner/PractitionerNavbar";
import PractitionerFooter from "@/components/practitioner/PractitionerFooter";
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Bell,
  MessageSquare,
  Video,
  Award,
  ArrowRight,
} from "lucide-react";

export default function PractitionerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [practitionerData, setPractitionerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    monthlyEarnings: 0,
    completedSessions: 0,
    pendingHandshakes: 0,
    upcomingAppointments: []
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
      fetchPractitionerData();
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchPractitionerData = async () => {
    try {
      const response = await fetch("/api/practitioner/profile");
      if (response.ok) {
        const data = await response.json();
        setPractitionerData(data.practitioner);
      }
    } catch (error) {
      console.error("Error fetching practitioner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/practitioner/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading your dashboard...</p>
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {practitionerData?.name || "Doctor"}
          </h1>          <p className="text-xl text-muted-foreground">
            Here&apos;s your practice overview for today
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.pendingHandshakes > 0 && `${dashboardStats.pendingHandshakes} pending handshakes`}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats.monthlyEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/practitioner/appointments")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                View Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage your upcoming sessions and schedule</p>
              <Button className="w-full">
                Open Calendar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/practitioner/clients")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View client profiles and session history</p>
              <Button className="w-full">
                View Clients
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/practitioner/handshakes")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Pending Handshakes
                {dashboardStats.pendingHandshakes > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {dashboardStats.pendingHandshakes}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Complete handshakes and schedule follow-up sessions</p>
              <Button className="w-full">
                View Handshakes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Schedule */}
        {dashboardStats.upcomingAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today&apos;s Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats.upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium">{appointment.time}</div>
                          <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                        </div>
                        <div>
                          <div className="font-medium">{appointment.clientName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {appointment.sessionType === 'video' && <Video className="h-4 w-4" />}
                            {appointment.sessionType === 'audio' && <MessageSquare className="h-4 w-4" />}
                            {appointment.sessionType} session
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/practitioner/appointments/${appointment.id}`)}
                      >
                        Join Session
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <PractitionerFooter />
    </div>
  );
}

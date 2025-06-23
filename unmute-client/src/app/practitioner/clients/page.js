"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PractitionerNavbar from "@/components/practitioner/PractitionerNavbar";
import PractitionerFooter from "@/components/practitioner/PractitionerFooter";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  Phone,
  Mail,
  FileText,
  Users,
} from "lucide-react";

export default function PractitionerClients() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/practitioner/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter clients based on search term
    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/practitioner/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ClientCard = ({ client }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="mb-4"
    >
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => router.push(`/practitioner/clients/${client._id}`)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {client.name || "Anonymous Client"}
                  </h3>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status || "active"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  
                  {client.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{client.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Total Sessions: {client.totalSessions || 0}</span>
                  </div>
                  
                  {client.lastSession && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Last Session: {client.lastSession}</span>
                    </div>
                  )}
                </div>
                
                {client.currentConcerns && client.currentConcerns.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-500 mb-1">Current Concerns:</div>
                    <div className="flex flex-wrap gap-1">
                      {client.currentConcerns.slice(0, 3).map((concern, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {concern}
                        </Badge>
                      ))}
                      {client.currentConcerns.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.currentConcerns.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
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
          <p className="mt-4 text-lg text-muted-foreground">Loading clients...</p>
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Client Management</h1>
          <p className="text-xl text-muted-foreground">
            View and manage your client relationships
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.status === "active" || !c.status).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.status === "new").length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Clients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filteredClients.length > 0 ? (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <ClientCard key={client._id} client={client} />
              ))}
            </div>
          ) : searchTerm ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No clients found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or clear the search to see all clients.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No clients yet
                </h3>
                <p className="text-gray-600">
                  Clients will appear here once you start having sessions.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <PractitionerFooter />
    </div>
  );
}

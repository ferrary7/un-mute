"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Plus, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  useEffect(() => {
    // Load user data from localStorage or use mock data
    const loadUserData = () => {
      setIsLoading(true);
      
      // Try to get user data from localStorage
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Mock user data if none exists
        const mockUser = {
          name: "Aryan Singh",
          email: "aryan.singh@example.com",
          phone: "+91 98765 43210",
          location: "Bangalore, India",
          dateJoined: "January 2024",
          profileImage: null,
          bio: "I'm looking to improve my mental well-being and find better ways to manage stress in my daily life.",
          preferences: {
            language: "English",
            sessionType: "Video",
            practitionerGender: "No preference",
            concerns: ["Anxiety", "Stress Management", "Work-Life Balance"],
            ageGroup: "25-34",
            experience: "First time"
          },
          upcomingSessions: 2,
          completedSessions: 3,
          notifications: [
            {
              id: 1,
              message: "Your session with Dr. Priya Sharma is tomorrow at 2:00 PM",
              date: "1 day ago",
              read: false
            },
            {
              id: 2,
              message: "Dr. Rahul Gupta has sent you a message",
              date: "3 days ago",
              read: true
            }
          ]
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      }
      
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setUser(editedUser);
      localStorage.setItem("user", JSON.stringify(editedUser));
      setIsEditing(false);
    } else {
      // Start editing
      setEditedUser({...user});
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  const handleAddConcern = () => {
    const newConcern = prompt("Enter a new concern:");
    if (newConcern && newConcern.trim() !== "") {
      setEditedUser(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          concerns: [...prev.preferences.concerns, newConcern.trim()]
        }
      }));
    }
  };

  const handleRemoveConcern = (concern) => {
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        concerns: prev.preferences.concerns.filter(c => c !== concern)
      }
    }));
  };

  const handleMarkAllRead = () => {
    const updatedUser = {
      ...user,
      notifications: user.notifications.map(notification => ({
        ...notification,
        read: true
      }))
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (isLoading || !user) {
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
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>
          <Button onClick={handleEditToggle}>
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {user.notifications.some(n => !n.read) && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {user.notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-background">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {isEditing ? (
                        <Input 
                          name="name" 
                          value={editedUser.name} 
                          onChange={handleInputChange} 
                          className="text-2xl font-bold h-10"
                        />
                      ) : (
                        user.name
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {user.dateJoined}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="bg-primary/10">
                        {user.completedSessions} Sessions Completed
                      </Badge>
                      {user.upcomingSessions > 0 && (
                        <Badge variant="outline" className="bg-accent/10">
                          {user.upcomingSessions} Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About Me</h3>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={editedUser.bio}
                      onChange={handleInputChange}
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                    />
                  ) : (
                    <p className="text-muted-foreground">{user.bio}</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {isEditing ? (
                        <Input 
                          name="email" 
                          value={editedUser.email} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <span>{user.email}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Phone</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {isEditing ? (
                        <Input 
                          name="phone" 
                          value={editedUser.phone} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <span>{user.phone}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Location</Label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {isEditing ? (
                        <Input 
                          name="location" 
                          value={editedUser.location} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <span>{user.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Therapy Preferences</CardTitle>
                <CardDescription>
                  Your preferences help us match you with the right practitioners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    {isEditing ? (
                      <select 
                        id="language" 
                        name="language" 
                        value={editedUser.preferences.language} 
                        onChange={handlePreferenceChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Malayalam">Malayalam</option>
                      </select>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/20">
                        {user.preferences.language}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Preferred Session Type</Label>
                    {isEditing ? (
                      <select 
                        id="sessionType" 
                        name="sessionType" 
                        value={editedUser.preferences.sessionType} 
                        onChange={handlePreferenceChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="Video">Video Call</option>
                        <option value="Audio">Audio Call</option>
                        <option value="Text">Text Chat</option>
                      </select>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/20">
                        {user.preferences.sessionType}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="practitionerGender">Practitioner Gender Preference</Label>
                    {isEditing ? (
                      <select 
                        id="practitionerGender" 
                        name="practitionerGender" 
                        value={editedUser.preferences.practitionerGender} 
                        onChange={handlePreferenceChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="No preference">No preference</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/20">
                        {user.preferences.practitionerGender}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group</Label>
                    {isEditing ? (
                      <select 
                        id="ageGroup" 
                        name="ageGroup" 
                        value={editedUser.preferences.ageGroup} 
                        onChange={handlePreferenceChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55+">55+</option>
                      </select>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/20">
                        {user.preferences.ageGroup}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Areas of Concern</Label>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddConcern}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20 min-h-[60px]">
                    {(isEditing ? editedUser : user).preferences.concerns.map((concern, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {concern}
                        {isEditing && (
                          <X 
                            className="h-3 w-3 ml-2 cursor-pointer" 
                            onClick={() => handleRemoveConcern(concern)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Stay updated with your therapy journey
                  </CardDescription>
                </div>
                {user.notifications.some(n => !n.read) && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {user.notifications.length > 0 ? (
                  <div className="space-y-4">
                    {user.notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg border ${notification.read ? 'bg-card' : 'bg-accent/10 border-accent/20'}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className={notification.read ? 'text-muted-foreground' : 'font-medium'}>
                            {notification.message}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.date}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { primaryReasonOptions, desiredOutcomeOptions, obstacleOptions, readinessOptions, ageGroupOptions, practitionerGenderOptions } from "@/utils/preferencesOptions";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      if (status !== "authenticated") return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/users/profile');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }
        
        const data = await response.json();
        console.log('Fetched user data:', data.user);
        setUser(data.user);
        
        // Set default notifications if none exist
        if (!data.user.notifications || data.user.notifications.length === 0) {
          data.user.notifications = [];
        }
        
        // Set default concerns if none exist
        if (!data.user.preferences?.concerns || data.user.preferences?.concerns.length === 0) {
          data.user.preferences = {
            ...data.user.preferences,
            concerns: []
          };
        }
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes to database
      setIsSaving(true);
      try {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedUser),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
        
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
        
      } catch (err) {
        console.error('Error saving profile:', err);
        setError('Failed to save profile changes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Start editing
      setEditedUser({...user});
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(null);
    setError(null);
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
  };  const handleDesiredOutcomeToggle = (outcomeId) => {
    const currentOutcomes = editedUser.preferences?.desiredOutcome || [];
    const isSelected = currentOutcomes.includes(outcomeId);
    
    const updatedOutcomes = isSelected
      ? currentOutcomes.filter(c => c !== outcomeId)
      : [...currentOutcomes, outcomeId];
    
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        desiredOutcome: updatedOutcomes
      }
    }));
  };

  const handleObstacleToggle = (obstacleId) => {
    const currentObstacles = editedUser.preferences?.obstacles || [];
    const isSelected = currentObstacles.includes(obstacleId);
    
    const updatedObstacles = isSelected
      ? currentObstacles.filter(c => c !== obstacleId)
      : [...currentObstacles, obstacleId];
    
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        obstacles: updatedObstacles
      }
    }));
  };

  const handleMarkAllRead = async () => {
    try {
      const updatedNotifications = user.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications: updatedNotifications }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notifications');
      }
      
      const data = await response.json();
      setUser(data.user);
      
    } catch (err) {
      console.error('Error updating notifications:', err);
      setError('Failed to mark notifications as read. Please try again.');
    }
  };

  if (status === "unauthenticated") {
    return null; // Will be redirected
  }
  
  if (status === "loading" || isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
          <div className="animate-pulse space-y-4 mt-8">
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

  // Calculate formatted join date
  const formattedDate = user.dateJoined 
    ? new Date(user.dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently');

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
          <div className="flex gap-2">
            {isEditing && (
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button onClick={handleEditToggle} disabled={isSaving}>
              {isEditing ? (
                isSaving ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-primary animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-6">
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {user.notifications && user.notifications.some(n => !n.read) && (
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
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.split(" ").map(n => n[0]).join("") || "?"}
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
                      Joined {formattedDate}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="bg-primary/10">
                        {user.completedSessions || 0} Sessions Completed
                      </Badge>
                      {(user.upcomingSessions > 0) && (
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
                      value={editedUser.bio || ''}
                      onChange={handleInputChange}
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {user.bio || "No bio has been set yet. Click 'Edit Profile' to add information about yourself."}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Phone</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {isEditing ? (
                        <Input 
                          name="phone" 
                          value={editedUser.phone || ''} 
                          onChange={handleInputChange} 
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <span>{user.phone || "Not provided"}</span>
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
                          value={editedUser.location || ''} 
                          onChange={handleInputChange} 
                          placeholder="Enter your location"
                        />
                      ) : (
                        <span>{user.location || "Not provided"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Customize your therapy experience
                </CardDescription>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="primaryReason">Primary Reason for Seeking Help</Label>
                    {isEditing ? (
                      <select 
                        name="primaryReason" 
                        id="primaryReason"
                        value={editedUser.preferences?.primaryReason || "unsure"}
                        onChange={handlePreferenceChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {primaryReasonOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-10 flex items-center">
                        {(() => {
                          const option = primaryReasonOptions.find(o => o.id === user.preferences?.primaryReason);
                          return option ? (
                            <span>
                              <span className="mr-2">{option.emoji}</span>
                              {option.label}
                            </span>
                          ) : user.preferences?.primaryReason || "Not specified";
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Readiness Level */}
                  <div className="space-y-2">
                    <Label htmlFor="readiness">Readiness Level</Label>
                    {isEditing ? (
                      <select 
                        name="readiness" 
                        id="readiness"
                        value={editedUser.preferences?.readiness || "exploring"}
                        onChange={handlePreferenceChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {readinessOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-10 flex items-center">
                        {(() => {
                          const option = readinessOptions.find(o => o.id === user.preferences?.readiness);
                          return option ? (
                            <span>
                              <span className="mr-2">{option.emoji}</span>
                              {option.label}
                            </span>
                          ) : user.preferences?.readiness || "Not specified";
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Practitioner Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Practitioner Gender</Label>
                    {isEditing ? (
                      <select 
                        name="practitionerGender" 
                        id="practitionerGender"
                        value={editedUser.preferences?.practitionerGender || "no-preference"}
                        onChange={handlePreferenceChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {practitionerGenderOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-10 flex items-center">
                        {(() => {
                          const option = practitionerGenderOptions.find(o => o.id === user.preferences?.practitionerGender);
                          return option ? (
                            <span>
                              <span className="mr-2">{option.emoji}</span>
                              {option.label}
                            </span>
                          ) : user.preferences?.practitionerGender || "No preference";
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Age Group */}
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group</Label>
                    {isEditing ? (
                      <select 
                        name="ageGroup" 
                        id="ageGroup"
                        value={editedUser.preferences?.ageGroup || "25-34"}
                        onChange={handlePreferenceChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {ageGroupOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-10 flex items-center">
                        {(() => {
                          const option = ageGroupOptions.find(o => o.id === user.preferences?.ageGroup);
                          return option ? (
                            <span>
                              <span className="mr-2">{option.emoji}</span>
                              {option.label}
                            </span>
                          ) : user.preferences?.ageGroup || "25-34";
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Desired Outcomes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Desired Outcomes</Label>
                  </div>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {desiredOutcomeOptions.map((option) => {
                        const isSelected = editedUser.preferences?.desiredOutcome?.includes(option.id);
                        const currentSelections = editedUser.preferences?.desiredOutcome || [];
                        const canSelect = isSelected || currentSelections.length < 2;
                        
                        return (
                          <div 
                            key={option.id}
                            onClick={() => canSelect && handleDesiredOutcomeToggle(option.id)}
                            className={`p-2 rounded-md border cursor-pointer flex items-center gap-2 hover:bg-muted/50 transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : ""
                            } ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span className="text-lg">{option.emoji}</span>
                            <span className="text-sm">{option.label}</span>
                            {isSelected && <X className="h-3 w-3 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(user.preferences?.desiredOutcome || []).map((outcomeId, index) => {
                        const outcome = desiredOutcomeOptions.find(c => c.id === outcomeId) || { id: outcomeId, label: outcomeId, emoji: "🎯" };
                        return (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            <span className="mr-1">{outcome.emoji}</span> {outcome.label}
                          </Badge>
                        );
                      })}
                      {(user.preferences?.desiredOutcome || []).length === 0 && (
                        <p className="text-sm text-muted-foreground">No desired outcomes specified yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Obstacles */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Current Obstacles</Label>
                  </div>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {obstacleOptions.map((option) => {
                        const isSelected = editedUser.preferences?.obstacles?.includes(option.id);
                        const currentSelections = editedUser.preferences?.obstacles || [];
                        const canSelect = isSelected || currentSelections.length < 2;
                        
                        return (
                          <div 
                            key={option.id}
                            onClick={() => canSelect && handleObstacleToggle(option.id)}
                            className={`p-2 rounded-md border cursor-pointer flex items-center gap-2 hover:bg-muted/50 transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : ""
                            } ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span className="text-lg">{option.emoji}</span>
                            <span className="text-sm">{option.label}</span>
                            {isSelected && <X className="h-3 w-3 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(user.preferences?.obstacles || []).map((obstacleId, index) => {
                        const obstacle = obstacleOptions.find(c => c.id === obstacleId) || { id: obstacleId, label: obstacleId, emoji: "🚧" };
                        return (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            <span className="mr-1">{obstacle.emoji}</span> {obstacle.label}
                          </Badge>
                        );
                      })}
                      {(user.preferences?.obstacles || []).length === 0 && (
                        <p className="text-sm text-muted-foreground">No obstacles specified yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Context */}
                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Additional Context</Label>
                  {isEditing ? (
                    <textarea
                      name="additionalContext"
                      id="additionalContext"
                      value={editedUser.preferences?.additionalContext || ''}
                      onChange={handlePreferenceChange}
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                      placeholder="Any specific information you'd like your practitioner to know..."
                      maxLength={300}
                    />
                  ) : (
                    <div className="p-3 rounded-md border bg-muted/30">
                      <p className="text-sm">
                        {user.preferences?.additionalContext || "No additional context provided."}
                      </p>
                    </div>
                  )}
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
                {user.notifications && user.notifications.some(n => !n.read) && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {user.notifications && user.notifications.length > 0 ? (
                  <div className="space-y-4">
                    {user.notifications.map((notification, index) => (
                      <div 
                        key={notification._id || notification.id || index} 
                        className={`p-4 rounded-lg border ${notification.read ? 'bg-card' : 'bg-accent/10 border-accent/20'}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className={notification.read ? 'text-muted-foreground' : 'font-medium'}>
                            {notification.message}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.date || new Date(notification.createdAt).toLocaleDateString()}
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
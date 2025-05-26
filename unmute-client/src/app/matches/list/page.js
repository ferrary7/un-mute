"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, CheckCircle, Video, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";

export default function MatchesListPage() {
  const [matches, setMatches] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load matches from localStorage
    const loadMatches = () => {
      setIsLoading(true);
      try {
        const savedMatches = localStorage.getItem('savedMatches');
        if (savedMatches) {
          setMatches(JSON.parse(savedMatches));
        }
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleViewProfile = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setShowProfile(true);
  };

  const handleBookSession = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setShowBooking(true);
  };

  const handleBackToMatching = () => {
    window.location.href = '/matches';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-64 mx-auto mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToMatching}
            className="mr-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Your Matches</h1>
            <p className="text-muted-foreground">You've matched with {matches.length} practitioners</p>
          </div>
        </div>
        
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold mb-3">No matches yet</h2>
            <p className="text-muted-foreground mb-5">Start swiping to find your perfect match</p>
            <Button onClick={handleBackToMatching}>Find Practitioners</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((practitioner) => (
              <Card key={practitioner.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="text-center pb-3">
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={practitioner.image} alt={practitioner.name} />
                    <AvatarFallback>
                      {practitioner.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{practitioner.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{practitioner.rating}</span>
                    <span className="text-sm text-muted-foreground">({practitioner.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{practitioner.location}</span>
                    <span className="mx-1">•</span>
                    <span>{practitioner.experience} exp</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-1">
                      {practitioner.specializations.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {practitioner.specializations.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{practitioner.specializations.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Session Types</h3>
                    <div className="flex space-x-3">
                      {practitioner.sessionTypes.includes("video") && (
                        <div className="flex items-center space-x-1 text-xs">
                          <Video className="h-3 w-3" />
                          <span>Video</span>
                        </div>
                      )}
                      {practitioner.sessionTypes.includes("audio") && (
                        <div className="flex items-center space-x-1 text-xs">
                          <Phone className="h-3 w-3" />
                          <span>Audio</span>
                        </div>
                      )}
                      {practitioner.sessionTypes.includes("text") && (
                        <div className="flex items-center space-x-1 text-xs">
                          <MessageCircle className="h-3 w-3" />
                          <span>Text</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium">Session Fee</h3>
                      <p className="text-primary font-bold">{practitioner.price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(practitioner)}
                      >
                        Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBookSession(practitioner)}
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Practitioner Profile Dialog */}
      {selectedPractitioner && (
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedPractitioner.image} alt={selectedPractitioner.name} />
                  <AvatarFallback>
                    {selectedPractitioner.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl">{selectedPractitioner.name}</DialogTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedPractitioner.location}</span>
                    <span>•</span>
                    <span>{selectedPractitioner.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{selectedPractitioner.rating}</span>
                    <span className="text-sm text-muted-foreground">({selectedPractitioner.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Verification Badge */}
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Psychoshala Verified Practitioner</span>
              </div>
              
              {/* Specializations */}
              <div>
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPractitioner.specializations.map((spec, index) => (
                    <Badge key={`${spec}-${index}`} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{selectedPractitioner.bio}</p>
              </div>
              
              {/* Education */}
              <div>
                <h3 className="font-semibold mb-2">Education</h3>
                <p className="text-muted-foreground">{selectedPractitioner.education}</p>
              </div>
              
              {/* Approach */}
              <div>
                <h3 className="font-semibold mb-2">My Approach</h3>
                <p className="text-muted-foreground italic">"{selectedPractitioner.approach}"</p>
              </div>
              
              {/* Languages */}
              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPractitioner.languages.map((lang, index) => (
                    <Badge key={`${lang}-${index}`} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
              
              {/* Session Types */}
              <div>
                <h3 className="font-semibold mb-2">Available Session Types</h3>
                <div className="flex space-x-4">
                  {selectedPractitioner.sessionTypes.includes("video") && (
                    <div className="flex items-center space-x-1 text-sm">
                      <Video className="h-4 w-4" />
                      <span>Video</span>
                    </div>
                  )}
                  {selectedPractitioner.sessionTypes.includes("audio") && (
                    <div className="flex items-center space-x-1 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>Audio</span>
                    </div>
                  )}
                  {selectedPractitioner.sessionTypes.includes("text") && (
                    <div className="flex items-center space-x-1 text-sm">
                      <MessageCircle className="h-4 w-4" />
                      <span>Text</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Availability & Price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Availability</h3>
                  <p className="text-sm text-muted-foreground">{selectedPractitioner.availability}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Session Fee</h3>
                  <p className="text-lg font-bold text-primary">{selectedPractitioner.price}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowProfile(false);
                    handleBookSession(selectedPractitioner);
                  }}
                >
                  Book Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Modal */}
      {selectedPractitioner && (
        <BookingModal
          practitioner={selectedPractitioner}
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, X, Star, MapPin, Clock, Video, Phone, MessageCircle, CheckCircle, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import PractitionerCard from "@/components/PractitionerCard";
import BookingModal from "@/components/BookingModal";

export default function MatchesPage() {
  const [practitioners, setPractitioners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showMatchesSummary, setShowMatchesSummary] = useState(false);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock practitioners data
  const mockPractitioners = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      image: null,
      specializations: ["Anxiety", "Depression", "Stress Management"],
      experience: "8 years",
      rating: 4.9,
      reviewCount: 127,
      languages: ["English", "Hindi"],
      sessionTypes: ["video", "audio", "text"],
      location: "Mumbai",
      bio: "Dr. Priya is a licensed clinical psychologist with expertise in cognitive behavioral therapy and mindfulness-based interventions. She has helped hundreds of clients overcome anxiety and depression.",
      education: "PhD in Clinical Psychology, Mumbai University",
      approach: "I believe in creating a safe, non-judgmental space where clients can explore their thoughts and feelings. My approach combines evidence-based techniques with compassionate understanding.",
      availability: "Mon-Fri: 9 AM - 6 PM",
      price: "₹1,200/session"
    },
    {
      id: 2,
      name: "Dr. Rahul Gupta",
      image: null,
      specializations: ["Relationship Counseling", "Family Therapy", "Communication"],
      experience: "12 years",
      rating: 4.8,
      reviewCount: 203,
      languages: ["English", "Hindi", "Punjabi"],
      sessionTypes: ["video", "audio"],
      location: "Delhi",
      bio: "Dr. Rahul specializes in relationship and family therapy, helping couples and families build stronger connections and resolve conflicts constructively.",
      education: "Masters in Marriage & Family Therapy, Delhi University",
      approach: "I focus on improving communication patterns and building emotional intimacy. Every relationship has the potential for growth and healing.",
      availability: "Tue-Sat: 10 AM - 8 PM",
      price: "₹1,500/session"
    },
    {
      id: 3,
      name: "Dr. Ananya Patel",
      image: null,
      specializations: ["Trauma Therapy", "PTSD", "Mindfulness"],
      experience: "10 years",
      rating: 4.9,
      reviewCount: 156,
      languages: ["English", "Gujarati"],
      sessionTypes: ["video", "text"],
      location: "Ahmedabad",
      bio: "Dr. Ananya is a trauma-informed therapist who specializes in helping clients heal from past experiences and develop resilience for the future.",
      education: "PhD in Trauma Psychology, Gujarat University",
      approach: "Healing happens at your own pace. I provide a gentle, supportive environment where you can process difficult experiences safely.",
      availability: "Mon-Thu: 11 AM - 7 PM",
      price: "₹1,300/session"
    },
    {
      id: 4,
      name: "Dr. Vikram Singh",
      image: null,
      specializations: ["Work Stress", "Career Counseling", "Burnout"],
      experience: "6 years",
      rating: 4.7,
      reviewCount: 89,
      languages: ["English", "Hindi"],
      sessionTypes: ["video", "audio", "text"],
      location: "Bangalore",
      bio: "Dr. Vikram helps professionals manage work-related stress and find better work-life balance. He understands the unique challenges of modern workplace.",
      education: "Masters in Occupational Psychology, IISc Bangalore",
      approach: "I help you develop practical strategies to manage stress while pursuing your career goals. Balance is achievable with the right tools.",
      availability: "Mon-Fri: 6 PM - 10 PM, Weekends: 9 AM - 5 PM",
      price: "₹1,100/session"
    },
    {
      id: 5,
      name: "Dr. Meera Krishnan",
      image: null,
      specializations: ["Self-Esteem", "Body Image", "Confidence Building"],
      experience: "9 years",
      rating: 4.8,
      reviewCount: 134,
      languages: ["English", "Tamil", "Malayalam"],
      sessionTypes: ["video", "audio"],
      location: "Chennai",
      bio: "Dr. Meera empowers individuals to build self-confidence and develop a positive self-image. She believes everyone deserves to feel good about themselves.",
      education: "PhD in Positive Psychology, University of Madras",
      approach: "Self-compassion is the foundation of confidence. Together, we'll challenge negative self-talk and build your inner strength.",
      availability: "Tue-Sat: 9 AM - 6 PM",
      price: "₹1,250/session"
    }
  ];

  useEffect(() => {
    // Simulate loading practitioners based on onboarding answers
    const loadPractitioners = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPractitioners(mockPractitioners);
      setIsLoading(false);
    };

    loadPractitioners();
  }, []);

  const handleSwipe = (direction) => {
    const currentPractitioner = practitioners[currentIndex];
    
    if (direction === "right") {
      // Add to matches
      setMatches(prev => [...prev, currentPractitioner]);
      console.log("Matched with:", currentPractitioner.name);
    }
    
    // Move to next practitioner
    if (currentIndex < practitioners.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more practitioners
      console.log("No more practitioners to show");
      
      // Check if we should load more practitioners
      if (practitioners.length > 0) {
        // In a real app, you would fetch more practitioners here
        // For now, we'll just reset to the beginning for demo purposes
        setCurrentIndex(0);
        
        // Optional: shuffle the practitioners for variety
        setPractitioners(prev => [...prev].sort(() => Math.random() - 0.5));
      }
    }
  };

  const handleViewProfile = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setShowProfile(true);
  };

  const handleBookSession = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setShowBooking(true);
  };

  const currentPractitioner = practitioners[currentIndex];
  const hasMorePractitioners = currentIndex < practitioners.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-64 mx-auto mb-8"></div>
            <div className="max-w-md mx-auto">
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background color indicators */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="w-1/2 bg-red-500/5 transition-opacity duration-300"></div>
        <div className="w-1/2 bg-green-500/5 transition-opacity duration-300"></div>
      </div>
      
      <Navbar className="bg-background/80 backdrop-blur-sm" />
      
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        {hasMorePractitioners && currentPractitioner ? (
          <div className="max-w-md mx-auto w-full relative">
            {/* Floating match counter */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
              <Badge variant="secondary" className="shadow-md">
                {matches.length} matches
              </Badge>
            </div>
            
            <PractitionerCard
              practitioner={currentPractitioner}
              onSwipeLeft={() => handleSwipe("left")}
              onSwipeRight={() => handleSwipe("right")}
              onViewProfile={() => handleViewProfile(currentPractitioner)}
            />
            
            {/* Swipe buttons - smaller and more subtle */}
            <div className="flex justify-center space-x-8 mt-6">
              <button
                className="rounded-full w-14 h-14 flex items-center justify-center bg-white/90 shadow-lg hover:bg-red-50 transition-colors border border-red-200 text-red-500"
                onClick={() => handleSwipe("left")}
              >
                <X className="h-6 w-6" />
              </button>
              <button
                className="rounded-full w-14 h-14 flex items-center justify-center bg-white/90 shadow-lg hover:bg-green-50 transition-colors border border-green-200 text-green-500"
                onClick={() => handleSwipe("right")}
              >
                <Heart className="h-6 w-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 max-w-md mx-auto bg-white/90 rounded-xl shadow-lg p-8 backdrop-blur-sm">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">
              No more practitioners to show
            </h2>
            <p className="text-muted-foreground mb-5 text-sm">
              Check back later for new practitioners
            </p>
            {matches.length > 0 && (
              <button 
                className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                onClick={() => setShowMatchesSummary(true)}
              >
                View Your Matches ({matches.length})
              </button>
            )}
          </div>
        )}

        {/* Floating action button to view matches */}
        {matches.length > 0 && hasMorePractitioners && (
          <button 
            className="fixed bottom-6 right-6 z-20 rounded-full bg-white shadow-lg p-3 flex items-center space-x-2 border border-primary/20 hover:bg-primary/5 transition-colors"
            onClick={() => setShowMatchesSummary(true)}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <span className="pr-2 font-medium">{matches.length}</span>
          </button>
        )}
        
        {/* Bottom Drawer for Matches */}
        {matches.length > 0 && (
          <div 
            className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${showMatchesSummary ? 'translate-y-0' : 'translate-y-full'}`}
          >
            {/* Overlay */}
            <div 
              className={`fixed inset-0 bg-black/20 backdrop-blur-sm rounded-t-3xl transition-opacity duration-300 ${showMatchesSummary ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setShowMatchesSummary(false)}
            />
            
            {/* Drawer Content */}
            <div className="relative bg-background rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Matches ({matches.length})</h2>
                <button 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowMatchesSummary(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Preview Content */}
              <div className="p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">You've matched with {matches.length} practitioners</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Save matches to localStorage for the matches page
                      localStorage.setItem('savedMatches', JSON.stringify(matches));
                      // Navigate to the matches page
                      window.location.href = '/matches/list';
                    }}
                  >
                    View All Matches
                  </Button>
                </div>
                
                {/* Preview of first 3 matches */}
                <div className="flex overflow-x-auto pb-4 space-x-4 snap-x">
                  {matches.slice(0, 3).map((practitioner) => (
                    <div 
                      key={practitioner.id} 
                      className="flex-shrink-0 w-48 snap-start bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="p-3 text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-2">
                          <AvatarImage src={practitioner.image} alt={practitioner.name} />
                          <AvatarFallback>
                            {practitioner.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-sm truncate">{practitioner.name}</h3>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{practitioner.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs truncate max-w-full">
                          {practitioner.specializations[0]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {matches.length > 3 && (
                    <div className="flex-shrink-0 w-24 flex items-center justify-center">
                      <div className="text-center text-sm text-muted-foreground">
                        +{matches.length - 3} more
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                  {selectedPractitioner.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
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
                  {selectedPractitioner.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
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
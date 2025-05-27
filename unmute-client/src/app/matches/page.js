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
import { useRouter } from "next/navigation";
import {
  MAX_SHORTLISTED_PRACTITIONERS,
  hasReachedShortlistLimit,
  getShortlistedCount,
  getShortlistedPractitionerIds,
  isPractitionerShortlisted,
  saveShownPractitioners,
  getShownPractitioners,
  resetPractitionersQueue,
  getRemainingPractitioners,
  hasMidScreenPromptShown,
  setMidScreenPromptShown,
  resetMidScreenPromptStatus,
  safeGetItem,
  safeSetItem
} from "@/utils/swipeLimit";

// Mock practitioners data - moved outside component to prevent re-creation on each render
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

export default function MatchesPage() {
  const [practitioners, setPractitioners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showMatchesSummary, setShowMatchesSummary] = useState(false);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortlistPrompt, setShowShortlistPrompt] = useState(false);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [remainingPractitioners, setRemainingPractitioners] = useState([]);
  const [showMidScreenPrompt, setShowMidScreenPrompt] = useState(false);
  const [hasMorePractitioners, setHasMorePractitioners] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    // Load any existing matches from localStorage
    try {
      // Import the safeGetItem from swipeLimit to use it here
      const savedMatches = safeGetItem ? safeGetItem('savedMatches') : 
        (typeof window !== 'undefined' ? localStorage?.getItem('savedMatches') : null);
      
      if (savedMatches) {
        const parsedMatches = JSON.parse(savedMatches);
        setMatches(parsedMatches);
        setShortlistCount(parsedMatches.length);
        
        // If they've already shortlisted 3 practitioners, check if mid-screen prompt should be shown
        if (parsedMatches.length >= MAX_SHORTLISTED_PRACTITIONERS && !hasMidScreenPromptShown()) {
          setShowMidScreenPrompt(true);
          setMidScreenPromptShown(true);
        }
      }
    } catch (error) {
      console.error('Error loading saved matches:', error);
    }

    // Simulate loading practitioners based on onboarding answers
    const loadPractitioners = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter out practitioners that are already shortlisted
      const availablePractitioners = getRemainingPractitioners(mockPractitioners);
      
      // Track which practitioners are shown
      const newShownIds = availablePractitioners.map(p => p.id);
      saveShownPractitioners(newShownIds);
      
      setPractitioners(availablePractitioners);
      setRemainingPractitioners(availablePractitioners);
      setIsLoading(false);
    };

    loadPractitioners();
  }, []); // Remove dependency array to prevent infinite loops

  // Save matches to localStorage whenever they change
  useEffect(() => {
    if (matches.length > 0) {
      safeSetItem('savedMatches', JSON.stringify(matches));
    }
    
    // Check URL parameters for restart flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('restart') === 'true') {
      handleRestartSwiping();
      // Clean up URL by removing the query parameter
      window.history.replaceState({}, document.title, '/matches');
    }
  }, [matches]);

  // Add a click handler to close the expanded button when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMatchesSummary) {
        // Check if the click was outside the expandable button
        const expandedButton = document.getElementById('expandable-matches-button');
        if (expandedButton && !expandedButton.contains(event.target)) {
          setShowMatchesSummary(false);
        }
      }
    };

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMatchesSummary]);
  
  const handleSwipe = (direction) => {
    const currentPractitioner = practitioners[currentIndex];
    
    // First, advance to the next card immediately for smoother UX
    if (currentIndex < practitioners.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more practitioners - reached the end
      setHasMorePractitioners(false); // Immediately update the UI state to show "Congratulations" popup
      
      // We're keeping the user at the end state until they explicitly choose to restart
      // No automatic reset or shuffling anymore to prevent UI inconsistency
    }
    
    // Use requestAnimationFrame to defer non-visual updates
    // This ensures the UI updates first, then we handle logic
    requestAnimationFrame(() => {
      if (direction === "right") {
        // Check if already shortlisted
        if (isPractitionerShortlisted(currentPractitioner.id)) {
          return;
        }
        
        // Add to matches
        const updatedMatches = [...matches, currentPractitioner];
        
        // Update UI state immediately
        setMatches(updatedMatches);
        setShortlistCount(updatedMatches.length);
        
        // Defer localStorage and other non-UI operations using requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
          // Save to localStorage using our safe helper function
          safeSetItem('savedMatches', JSON.stringify(updatedMatches));
          
          // Track this practitioner as shown
          saveShownPractitioners([currentPractitioner.id]);
          
          // Remove the practitioner from the remaining list
          const updatedRemaining = remainingPractitioners.filter(p => p.id !== currentPractitioner.id);
          setRemainingPractitioners(updatedRemaining);
          
          // If this was the 3rd right swipe, show the mid-screen prompt
          if (updatedMatches.length >= MAX_SHORTLISTED_PRACTITIONERS && !hasMidScreenPromptShown()) {
            setShowMidScreenPrompt(true);
            setMidScreenPromptShown(true);
          }
        });
        
      } else if (direction === "left") {
        // Track this practitioner as shown for left swipes too
        // Defer this non-critical operation
        requestAnimationFrame(() => {
          saveShownPractitioners([currentPractitioner.id]);
        });
      }
    });
  };

  const handleViewProfile = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setShowProfile(true);
  };

  // When viewing a profile from swiping, we'll direct them to matches list for booking
  const handleBookFromSwipe = () => {
    router.push('/matches/list');
  };

  const handleGoToMatchesList = () => {
    router.push('/matches/list');
  };
  
  const handleRestartSwiping = () => {
    // Clear the shown practitioners to restart the queue
    resetPractitionersQueue();
    
    // Reset UI state
    setShowMidScreenPrompt(false);
    setHasMorePractitioners(true);
    
    // Reload practitioners (excluding already shortlisted ones)
    const availablePractitioners = getRemainingPractitioners(mockPractitioners);
    setPractitioners(availablePractitioners);
    setRemainingPractitioners(availablePractitioners);
    setCurrentIndex(0);
  };

  const currentPractitioner = practitioners[currentIndex];
  
  // Update hasMorePractitioners whenever currentIndex or practitioners change
  useEffect(() => {
    setHasMorePractitioners(currentIndex < practitioners.length);
  }, [currentIndex, practitioners]);

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

  // If the mid-screen prompt should be shown (after 3 shortlisted practitioners)
  if (showMidScreenPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white/90 rounded-xl shadow-lg p-8 backdrop-blur-sm">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">You&apos;ve Shortlisted {MAX_SHORTLISTED_PRACTITIONERS} Practitioners!</h2>
            <p className="text-muted-foreground mb-8">
              You can keep exploring more options or go to your matches to compare profiles and book a session.
            </p>
            <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-4 sm:space-y-0">
              <Button
                variant="outline"
                onClick={handleRestartSwiping}
              >
                Keep Exploring
              </Button>                
              <Button
                variant="default"
                onClick={handleGoToMatchesList}
              >
                View My Matches
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // No booking check needed here

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background color indicators */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-green-600/10 blur-sm"></div>
      </div>

      
      <Navbar className="bg-background/80 backdrop-blur-sm" />
      
      <div className="container mx-auto px-4 py-2 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
            {/* Shortlisted count - with visual indicator when limit reached */}
            <Badge 
              variant={shortlistCount >= MAX_SHORTLISTED_PRACTITIONERS ? "secondary" : "outline"} 
              className={`text-center px-3 mb-3 py-2 text-sm ${shortlistCount >= MAX_SHORTLISTED_PRACTITIONERS ? "bg-green-100 text-green-800" : ""}`}
            >
              {Math.min(shortlistCount, MAX_SHORTLISTED_PRACTITIONERS)}/{MAX_SHORTLISTED_PRACTITIONERS} shortlisted
              {shortlistCount > MAX_SHORTLISTED_PRACTITIONERS && (
                <span className="ml-1 text-xs">• Exploring More</span>
              )}
            </Badge>

        
        {hasMorePractitioners && currentPractitioner ? (
          <div className="max-w-md mx-auto w-full relative">
            
            <PractitionerCard
              practitioner={currentPractitioner}
              onSwipeLeft={() => handleSwipe("left")}
              onSwipeRight={() => handleSwipe("right")}
              onViewProfile={() => handleViewProfile(currentPractitioner)}
            />
            
            {/* Swipe buttons are now inside the PractitionerCard component */}
          </div>
        ) : (
          <div className="text-center py-10 max-w-md mx-auto bg-white/95 rounded-xl shadow-lg p-8 backdrop-blur-sm border border-green-100/50 animate-fadeIn">
            {matches.length > 0 ? (
              <>
                <div className="relative w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 animate-pulse-slow"></div>
                  <CheckCircle className="h-12 w-12 text-green-500 relative z-10 animate-bounce-subtle" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-green-800">
                  {shortlistCount > 0 ? "Congratulations!" : "No more practitioners to show"}
                </h2>
                <p className="text-lg font-medium text-green-700 mb-2">
                  {shortlistCount > 0 ? "You've explored all available practitioners!" : "Check back later for new matches"}
                </p>
                <p className="text-muted-foreground mb-6 text-base">
                  {shortlistCount > 0 ? 
                    `You've shortlisted ${shortlistCount} practitioner${shortlistCount !== 1 ? 's' : ''}. You're now ready to connect and book a session.` : 
                    "We're constantly adding new practitioners to our network."}
                </p>
                {shortlistCount > 0 && (
                  <div className="flex flex-col space-y-4 max-w-xs mx-auto">
                    <Button
                      variant="default"
                      onClick={handleGoToMatchesList}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 group"
                    >
                      <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-lg">View {shortlistCount} Matches</span>
                    </Button>
                    <p className="text-sm text-muted-foreground italic">
                      Take the next step in your mental health journey
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-200">
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-3">
                  No practitioners shortlisted yet
                </h2>
                <p className="text-muted-foreground mb-5 text-sm">
                  Swipe right on practitioners you'd like to connect with
                </p>
                <Button
                  variant="outline" 
                  onClick={handleRestartSwiping}
                  className="border-dashed"
                >
                  Try again
                </Button>
              </>
            )}
          </div>
        )}

        {/* Expandable floating action button to view matches */}
        {matches.length > 0 && hasMorePractitioners && (
          <div 
            id="expandable-matches-button"
            className={`fixed bottom-6 right-6 z-20 flex items-center transition-all duration-300 ease-in-out ${showMatchesSummary ? 'pr-3' : ''}`}
          >
            {/* Expanded content - only visible when showMatchesSummary is true */}
            <div 
              className={`bg-white shadow-lg rounded-l-full overflow-hidden transition-all duration-300 flex items-center ${
                showMatchesSummary ? 'max-w-[400px] opacity-100 mr-2 border border-r-0 border-primary/20' : 'max-w-0 opacity-0'
              }`}
            >
              <div className="flex items-center pl-4 py-2 space-x-2 overflow-x-auto no-scrollbar">
                {/* First 3 matches in circles */}
                {matches.slice(0, 3).map((practitioner, index) => (
                  <div key={practitioner.id} className="flex-shrink-0">
                    <Avatar className={`w-8 h-8 border-2 border-primary/20`}>
                      <AvatarImage src={practitioner.image} alt={practitioner.name} />
                      <AvatarFallback className="text-xs bg-primary/5">
                        {practitioner.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                
                {/* Count if more than 3 */}
                {matches.length > 3 && (
                  <div className="flex-shrink-0 text-xs font-medium text-muted-foreground">
                    +{matches.length - 3}
                  </div>
                )}
                
                {/* View all button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-shrink-0 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoToMatchesList();
                  }}
                >
                  View all
                </Button>
              </div>
            </div>
            
            {/* Main button - always visible */}
            <button 
              className={`rounded-full bg-white shadow-lg p-3 flex items-center space-x-2 border border-primary/20 hover:bg-primary/5 transition-colors ${
                showMatchesSummary ? 'rounded-l-none border-l-0' : ''
              }`}
              onClick={() => setShowMatchesSummary(!showMatchesSummary)}
              aria-label={showMatchesSummary ? "Collapse matches" : "Expand matches"}
              id="expandable-matches-button"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <span className="pr-2 font-medium">{matches.length}</span>
            </button>
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
                <p className="text-muted-foreground italic">&quot;{selectedPractitioner.approach}&quot;</p>
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
              
              {/* Action Buttons - Remove booking from profile in swipe interface */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProfile(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                
                <Button 
                  onClick={handleGoToMatchesList}
                  className="flex-1"
                >
                  View in Matches
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* We keep the BookingModal component but won't use it in this page */}
    </div>
  );
}

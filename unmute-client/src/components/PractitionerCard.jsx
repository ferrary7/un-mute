"use client";

import { useState, useRef, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, CheckCircle, Heart, X, Eye } from "lucide-react";

export default function PractitionerCard({ 
  practitioner, 
  onSwipeLeft, 
  onSwipeRight, 
  onViewProfile 
}) {
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Add flag to prevent multiple triggers
  const cardRef = useRef(null);
  
  // Reset card position when practitioner changes
  useEffect(() => {
    setSwipeDirection(null);
    setSwipeOffset(0);
    setIsAnimatingOut(false);
  }, [practitioner]);

  // Configure swipeable handlers with improved settings for smoother swiping
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      // Don't update if we're already animating out
      if (isAnimatingOut) return;
      
      const { deltaX, velocity } = eventData;
      
      // Apply velocity-based offset for more natural feel
      // Higher velocity = slightly more movement
      const velocityFactor = Math.min(Math.abs(velocity) * 0.5, 1.5);
      const adjustedDeltaX = deltaX * velocityFactor;
      
      setSwipeOffset(adjustedDeltaX);
      
      if (deltaX > 30) { // Reduced threshold for more responsive direction indication
        setSwipeDirection("right");
      } else if (deltaX < -30) {
        setSwipeDirection("left");
      } else {
        setSwipeDirection(null);
      }
    },
    onSwipeLeft: (eventData) => {
      // Don't trigger if already animating
      if (isAnimatingOut) return;
      
      const { velocity } = eventData;
      const swipeThreshold = velocity > 0.5 ? 50 : 100; // Lower threshold for fast swipes
      
      if (Math.abs(swipeOffset) >= swipeThreshold) {
        // Set animating flag to prevent multiple triggers
        setIsAnimatingOut(true);
        
        // Animate card off-screen before calling handler
        setSwipeOffset(-window.innerWidth);
        
        // Increase timeout to allow animation to complete
        setTimeout(() => {
          onSwipeLeft();
        }, 300); // Increased from 200ms to 300ms
      } else {
        // Reset with animation
        setSwipeOffset(0);
        setSwipeDirection(null);
      }
    },
    onSwipeRight: (eventData) => {
      // Don't trigger if already animating
      if (isAnimatingOut) return;
      
      const { velocity } = eventData;
      const swipeThreshold = velocity > 0.5 ? 50 : 100; // Lower threshold for fast swipes
      
      if (Math.abs(swipeOffset) >= swipeThreshold) {
        // Set animating flag to prevent multiple triggers
        setIsAnimatingOut(true);
        
        // Animate card off-screen before calling handler
        setSwipeOffset(window.innerWidth);
        
        // Increase timeout to allow animation to complete
        setTimeout(() => {
          onSwipeRight();
        }, 300); // Increased from 200ms to 300ms
      } else {
        // Reset with animation
        setSwipeOffset(0);
        setSwipeDirection(null);
      }
    },
    onTap: () => {
      // Handle tap if needed
    },
    onSwiped: (eventData) => {
      // Don't reset if we're animating out
      if (isAnimatingOut) return;
      
      const { velocity } = eventData;
      const swipeThreshold = velocity > 0.5 ? 50 : 100; // Lower threshold for fast swipes
      
      // If not swiped enough and not already being animated off-screen
      if (Math.abs(swipeOffset) < swipeThreshold && Math.abs(swipeOffset) < window.innerWidth / 2) {
        // Reset with animation
        setSwipeOffset(0);
        setSwipeDirection(null);
      }
    },
    trackMouse: true, // Enable mouse tracking for desktop
    trackTouch: true, // Ensure touch tracking is enabled
    preventScrollOnSwipe: true,
    delta: 5, // Lower delta for more responsive swipe detection
    swipeDuration: 750, // Longer duration to detect swipes
    touchEventOptions: { passive: true }, // Performance optimization
  });

  // Calculate styles based on swipe with improved transitions
  const cardStyle = {
    transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
    transition: swipeOffset !== 0 
      ? 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)' // Smoother during movement (increased from 0.05s)
      : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)', // Same for return to center
    willChange: 'transform', // Performance hint for browser
    touchAction: 'none', // Prevent browser handling of touch events
  };

  // Background colors based on swipe direction
  const overlayStyle = {
    background: swipeDirection === "right" 
      ? 'linear-gradient(to right, transparent, rgba(74, 222, 128, 0.2))' 
      : swipeDirection === "left" 
        ? 'linear-gradient(to left, transparent, rgba(248, 113, 113, 0.2))' 
        : 'none',
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Like/Dislike Overlays */}
      {swipeDirection === "right" && (
        <div className="absolute top-6 left-6 z-10 bg-green-500 text-white p-3 rounded-full rotate-[-20deg] shadow-lg border-2 border-white">
          <Heart className="h-8 w-8 fill-white" />
        </div>
      )}
      
      {swipeDirection === "left" && (
        <div className="absolute top-6 right-6 z-10 bg-red-500 text-white p-3 rounded-full rotate-[20deg] shadow-lg border-2 border-white">
          <X className="h-8 w-8" />
        </div>
      )}
      
      <Card 
        ref={cardRef}
        className="w-full shadow-xl overflow-hidden"
        style={cardStyle}
        {...swipeHandlers}
      >
        {/* Overlay for color effect */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
          style={overlayStyle}
        />
        
        <CardHeader className="text-center pb-2">
          {/* Verification Badge */}
          <div className="flex justify-center mb-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          
          {/* Avatar */}
          <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-background shadow-lg">
            <AvatarImage src={practitioner.image} alt={practitioner.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
              {practitioner.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          {/* Name and Rating */}
          <h3 className="text-xl font-bold mb-1">{practitioner.name}</h3>
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{practitioner.rating}</span>
            <span className="text-muted-foreground text-sm">({practitioner.reviewCount})</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pb-4">
          {/* Location and Experience */}
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{practitioner.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{practitioner.experience}</span>
            </div>
          </div>
          
          {/* Specializations */}
          <div className="flex flex-wrap gap-1 justify-center">
            {practitioner.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
          
          {/* Bio Preview */}
          <div className="bg-muted/30 p-2 rounded-lg">
            <p className="text-sm text-muted-foreground italic line-clamp-2">
              "{practitioner.bio.substring(0, 100)}..."
            </p>
          </div>
          
          {/* View Profile Button */}
          <div 
            className="text-center text-sm text-primary font-medium cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
          >
            <Eye className="h-3 w-3 inline mr-1" />
            View Full Profile
          </div>
          
          {/* Swipe Instructions */}
          <div className="flex justify-between text-xs text-muted-foreground pt-1 px-2">
            <div className="flex items-center">
              <X className="h-3 w-3 mr-1 text-red-400" />
              Swipe left to pass
            </div>
            <div className="flex items-center">
              Swipe right to connect
              <Heart className="h-3 w-3 ml-1 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
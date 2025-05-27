"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const cardRef = useRef(null);
  
  // Reset card position when practitioner changes
  useEffect(() => {
    // Use a single batch update for better performance
    const resetCardState = () => {
      setSwipeDirection(null);
      setSwipeOffset(0);
      setIsAnimatingOut(false);
      setIsVisible(true);
    };
    
    resetCardState();
    
    // Pre-cache the next image if available
    if (practitioner?.image) {
      const img = new Image();
      img.src = practitioner.image;
    }
  }, [practitioner]);

  // Handle the animation end - make sure card is fully gone before callback
  const handleTransitionEnd = (e) => {
    // Only handle the transform transition, not other properties
    if (e.propertyName !== 'transform') return;
    
    if (isAnimatingOut) {
      // If we're animating out and transition ends, hide card and call callback
      setIsVisible(false);
      
      // Use requestAnimationFrame instead of timeout for better performance
      requestAnimationFrame(() => {
        // Call appropriate callback based on direction
        if (swipeDirection === "left") {
          onSwipeLeft();
        } else if (swipeDirection === "right") {
          onSwipeRight();
        }
      });
    }
  };

  // Immediately process a swipe action (left/right)
  const processSwipe = useMemo(() => {
    return (direction) => {
      if (isAnimatingOut) return;
      
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        // Set animation flag to prevent further interactions
        setIsAnimatingOut(true);
        setSwipeDirection(direction);
        
        // Force a reflow to ensure animation works consistently
        if (cardRef.current) {
          void cardRef.current.offsetWidth;
        }
        
        // Set the appropriate offset based on direction
        const offset = direction === "left" ? -window.innerWidth : window.innerWidth;
        setSwipeOffset(offset);
      });
    };
  }, [isAnimatingOut, cardRef]);

  // Configure swipeable handlers - memoize to prevent recreation on every render
  const config = useMemo(() => ({
    onSwiping: (eventData) => {
      if (isAnimatingOut) return;
      
      const { deltaX } = eventData;
      setSwipeOffset(deltaX);
      
      if (deltaX > 30) {
        setSwipeDirection("right");
      } else if (deltaX < -30) {
        setSwipeDirection("left");
      } else {
        setSwipeDirection(null);
      }
    },
    onSwiped: (eventData) => {
      if (isAnimatingOut) return;
      
      const { velocity, dir } = eventData;
      
      // If we didn't swipe far enough for a full swipe action
      if (Math.abs(swipeOffset) <= 50 && velocity < 0.2) {
        setSwipeOffset(0);
        setSwipeDirection(null);
      } else {
        // Process the swipe based on direction
        if (swipeOffset < 0 || dir === "Left") {
          processSwipe("left");
        } else if (swipeOffset > 0 || dir === "Right") {
          processSwipe("right");
        }
      }
    },
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 5,
  }), [isAnimatingOut, swipeOffset, processSwipe]);
  
  // Create the swipe handlers using the hook
  const { ref: swipeRef } = useSwipeable(config);

  // Handle button actions - memoize to prevent recreation
  const handleSwipeLeft = useMemo(() => () => processSwipe("left"), [processSwipe]);
  const handleSwipeRight = useMemo(() => () => processSwipe("right"), [processSwipe]);

  // Card style with optimized animations using memoization via useMemo
  const cardStyle = useMemo(() => ({
    transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
    transition: isAnimatingOut 
      ? 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease' 
      : 'transform 0.15s ease',
    opacity: isAnimatingOut ? '0.7' : '1',
    position: 'relative',
    willChange: 'transform, opacity',
    // Add hardware acceleration for smoother animations
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    WebkitTransform: `translateZ(0) translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
    transform: `translateZ(0) translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
    touchAction: 'pan-y', // Allow vertical scrolling but capture horizontal
    zIndex: isAnimatingOut ? 0 : 1,
  }), [swipeOffset, isAnimatingOut]);

  // Background colors based on swipe direction - memoized for better performance
  const overlayStyle = useMemo(() => ({
    background: swipeDirection === "right" 
      ? 'linear-gradient(to right, transparent, rgba(74, 222, 128, 0.3))' 
      : swipeDirection === "left" 
        ? 'linear-gradient(to left, transparent, rgba(248, 113, 113, 0.3))' 
        : 'none',
    willChange: 'opacity, background',
  }), [swipeDirection]);
  
  // If the card is no longer visible, don't render it (performance optimization)
  if (!isVisible) {
    return null;
  }

  // Use the mergeRefs utility to combine refs
  const mergeRefs = (refs) => {
    return (node) => {
      refs.forEach(ref => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          ref.current = node;
        }
      });
    };
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

      {/* Apply swipe handlers using ref instead of spreading props */}
      <div ref={mergeRefs([swipeRef, cardRef])}>
        <Card 
          className="w-full shadow-xl overflow-hidden"
          style={cardStyle}
          onTransitionEnd={handleTransitionEnd}
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
            <div className="flex justify-between text-xs text-muted-foreground pt-2 px-2">
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
      
      {/* Manual swipe buttons */}
      <div className="flex justify-center space-x-8 mt-6">
        <button
          className="rounded-full w-14 h-14 flex items-center justify-center bg-white/90 shadow-lg hover:bg-red-50 transition-colors border border-red-200 text-red-500"
          onClick={handleSwipeLeft}
          aria-label="Swipe left"
        >
          <X className="h-6 w-6" />
        </button>
        <button
          className="rounded-full w-14 h-14 flex items-center justify-center bg-white/90 shadow-lg hover:bg-green-50 transition-colors border border-green-200 text-green-500"
          onClick={handleSwipeRight}
          aria-label="Swipe right"
        >
          <Heart className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
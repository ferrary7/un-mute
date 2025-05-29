"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export default function BackgroundElements() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate parallax position based on scroll and screen position
  const getParallaxY = (speed, offset = 0) => {
    return offset - (scrollY * speed);
  };
  
  const getParallaxX = (speed, offset = 0) => {
    return offset + (scrollY * speed);
  };

  if (!mounted) return null;

  // Calculate if element should be visible based on scroll position
  const isInView = (topOffset, height) => {
    const elementTop = topOffset;
    const elementBottom = topOffset + height;
    const viewportTop = scrollY;
    const viewportBottom = scrollY + windowHeight;
    
    return (
      (elementBottom > viewportTop && elementBottom < viewportBottom + 300) ||
      (elementTop > viewportTop - 300 && elementTop < viewportBottom)
    );
  };

  return (
    <>
      {/* Background with parallax floating shapes */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Top right large blob */}
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.015] blur-3xl"
          style={{ 
            transform: `translate3d(${getParallaxX(-0.05, 100)}px, ${getParallaxY(-0.08, -100)}px, 0)`,
            opacity: Math.max(0.4, 1 - scrollY * 0.0005)
          }}
        />
        
        {/* Middle left blob */}
        <div 
          className="absolute top-[30vh] left-[-100px] w-[400px] h-[400px] rounded-full bg-primary/[0.02] blur-2xl"
          style={{ 
            transform: `translate3d(${getParallaxX(0.04, 0)}px, ${getParallaxY(-0.05, 0)}px, 0)`,
            opacity: Math.max(0.3, 0.8 - scrollY * 0.0003)
          }}
        />
        
        {/* Bottom right blob */}
        <div 
          className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary/[0.01] blur-3xl"
          style={{ 
            transform: `translate3d(${getParallaxX(-0.03, 0)}px, ${getParallaxY(0.06, 0)}px, 0)`,
            opacity: Math.min(0.6, 0.3 + scrollY * 0.0003)
          }}
        />

        {/* Floating waves at different depths */}
        <div 
          className="absolute w-full opacity-20"
          style={{ 
            top: '25vh',
            transform: `translate3d(0, ${getParallaxY(0.12, 0)}px, 0)` 
          }}
        >
          <svg width="100%" height="30" viewBox="0 0 1440 30" preserveAspectRatio="none">
            <path 
              d="M0,15 C160,40 320,0 480,15 C640,30 800,5 960,15 C1120,25 1280,10 1440,20" 
              stroke="#324055" 
              strokeOpacity="0.3" 
              strokeWidth="1.5" 
              fill="none"
            />
          </svg>
        </div>

        <div 
          className="absolute w-full opacity-15"
          style={{ 
            top: '65vh',
            transform: `translate3d(0, ${getParallaxY(0.08, 0)}px, 0)` 
          }}
        >
          <svg width="100%" height="20" viewBox="0 0 1440 20" preserveAspectRatio="none">
            <path 
              d="M0,10 C240,25 480,5 720,10 C960,15 1200,0 1440,10" 
              stroke="#324055" 
              strokeOpacity="0.2" 
              strokeWidth="1" 
              fill="none"
            />
          </svg>
        </div>

        {/* Floating particles with parallax */}
        <div className="hidden lg:block">
          {[...Array(20)].map((_, i) => {
            const size = 2 + Math.random() * 6;
            const topPercent = Math.random() * 100;
            const leftPercent = Math.random() * 100;
            const speedMultiplier = 0.02 + (Math.random() * 0.08);
            const delayMultiplier = Math.random() * 5;
            const parallaxStrength = 0.05 + (Math.random() * 0.1);
            
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-primary/10"
                style={{
                  top: `${topPercent}%`,
                  left: `${leftPercent}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: 0.1 + Math.random() * 0.3,
                  transform: `translate3d(${scrollY * (Math.random() > 0.5 ? parallaxStrength : -parallaxStrength)}px, ${scrollY * speedMultiplier}px, 0)`,
                  animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${delayMultiplier}s`
                }}
              />
            );
          })}
        </div>

        {/* Horizontal lines with parallax effect */}
        <div className="hidden lg:block">
          {[...Array(5)].map((_, i) => {
            const topOffset = (i + 1) * windowHeight / 3;
            const width = 100 + Math.random() * 200;
            const parallaxSpeed = 0.08 + (Math.random() * 0.05);
            
            return isInView(topOffset, 2) ? (
              <div
                key={i}
                className="absolute h-px bg-primary/10"
                style={{
                  top: `${topOffset}px`,
                  left: i % 2 === 0 ? '10%' : 'auto',
                  right: i % 2 !== 0 ? '10%' : 'auto',
                  width: `${width}px`,
                  transform: `translate3d(${i % 2 === 0 ? scrollY * parallaxSpeed : -scrollY * parallaxSpeed}px, 0, 0)`,
                  opacity: 0.3 - (Math.abs(scrollY - topOffset) * 0.0005)
                }}
              />
            ) : null;
          })}
        </div>
      </div>
    </>
  );
}

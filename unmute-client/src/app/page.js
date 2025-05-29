"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Users, Calendar, Star, ArrowRight, CheckCircle } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  
  // Fetch user profile to check onboarding status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/users/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.user) {
            setOnboardingCompleted(data.user.onboardingCompleted);
          }
        })
        .catch(err => {
          console.error("Error fetching user profile:", err);
        });
    }
  }, [isAuthenticated]);
  
  const handleAuthenticatedButtonClick = () => {
    if (onboardingCompleted) {
      router.push("/matches");
    } else {
      router.push("/onboarding");
    }
  };
  const testimonials = [
    {
      name: "Priya Sharma",
      rating: 5,
      text: "Found the perfect therapist who understands my cultural background. The matching process was so intuitive!",
      location: "Mumbai"
    },
    {
      name: "Rahul Gupta",
      rating: 5,
      text: "The quiz helped me find exactly what I was looking for. My sessions have been life-changing.",
      location: "Delhi"
    },
    {
      name: "Ananya Patel",
      rating: 5,
      text: "Professional, verified practitioners and such an easy booking process. Highly recommend!",
      location: "Bangalore"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Take Quiz",
      description: "Answer a few questions about your preferences, concerns, and what you're looking for in a mental wellness practitioner.",
      icon: <CheckCircle className="h-8 w-8 text-primary" />
    },
    {
      step: "02",
      title: "Swipe & Match",
      description: "Browse through verified Psychoshala-trained practitioners. Swipe right on profiles that resonate with you.",
      icon: <Heart className="h-8 w-8 text-primary" />
    },
    {
      step: "03",
      title: "Book Session",
      description: "Connect with your matched practitioner and book your first session. Choose video, audio, or text-based sessions.",
      icon: <Calendar className="h-8 w-8 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            🧠 Mental Wellness Made Simple
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Your Perfect
            <br />
            Mental Wellness Listener
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with verified Psychoshala-trained mental wellness practitioners. 
            Take our personalized quiz, swipe through matches, and book your session.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoading ? (
              <Button variant="default" size="lg" disabled>
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <Button variant="default" size="lg" onClick={handleAuthenticatedButtonClick}>
                Find Your Listener
              </Button>
            ) : (
              <AuthDialog triggerText="Find Your Listener" variant="default" size="lg" />
            )}
            <Button variant="outline" size="lg" className="group">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to connect with your ideal mental wellness practitioner
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {howItWorks.map((item, index) => (
            <Card key={index} className="text-center border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-primary mb-2">STEP {item.step}</div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Real stories from people who found their perfect mental wellness match
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Mental Wellness Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have found their perfect mental wellness practitioner
          </p>
          {isLoading ? (
            <Button variant="default" size="lg" disabled>
              Loading...
            </Button>
          ) : isAuthenticated ? (
            <Button variant="default" size="lg" onClick={handleAuthenticatedButtonClick}>
              Get Started Today
            </Button>
          ) : (
            <AuthDialog triggerText="Get Started Today" variant="default" size="lg" />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

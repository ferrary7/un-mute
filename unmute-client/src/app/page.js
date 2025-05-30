"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  MessageCircle,
  Clock,
  CheckCircle,
  Heart,
  Calendar,
  Star,
  ArrowRight,
  Users,
  UserCheck,
  Smile,
  Target,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import homeData from "@/data/home.json";

export default function Page() {
  const containerRef = useRef(null);
  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });
  const { data: session, status } = useSession();
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Fetch user profile to check onboarding status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setOnboardingCompleted(data.user.onboardingCompleted);
          }
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });
    }
  }, [isAuthenticated]);

  const handleFindListener = () => {
    // Always go to onboarding first - it will handle redirects as needed
    router.push("/onboarding");
  };

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth easing function for better animation feel
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // Responsive animation values based on screen width
  const isMobile = screenSize.width < 640;
  const isTablet = screenSize.width >= 640 && screenSize.width < 1024;

  const separationDistance = isMobile ? 600 : isTablet ? 800 : 1000;
  // Responsive starting positions - centered around 0 with proper separation
  const penCapStartX = isMobile ? -95 : isTablet ? -90 : -95;
  const penBodyStartX = isMobile ? 50 : isTablet ? 85 : 90;
  // Transform values for pen animation - much faster timing for better UX
  // Responsive values: smaller separation on mobile, larger on desktop
  const penCapX = useTransform(
    scrollYProgress,
    [0, 0.1],
    [penCapStartX, -separationDistance],
    { ease: easeOut }
  );
  const penBodyX = useTransform(
    scrollYProgress,
    [0, 0.1],
    [penBodyStartX, separationDistance],
    { ease: easeOut }
  );
  const penOpacity = useTransform(scrollYProgress, [0.08, 0.12], [1, 0]);
  const backgroundOpacity = useTransform(scrollYProgress, [0.05, 0.15], [1, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.13], [0, 1]);
  const contentScale = useTransform(scrollYProgress, [0.1, 0.13], [0.8, 1]);
  const contentBlur = useTransform(scrollYProgress, [0.1, 0.14], [5, 0]);
  // Parallax transforms for content sections - restored full structure
  const heroParallaxY = useTransform(scrollYProgress, [0.15, 0.9], [0, -100]);
  const statsParallaxY = useTransform(scrollYProgress, [0.35, 0.75], [0, -50]);
  const featuresParallaxY = useTransform(
    scrollYProgress,
    [0.45, 0.85],
    [0, -30]
  );
  const howItWorksParallaxY = useTransform(
    scrollYProgress,
    [0.55, 0.95],
    [0, -40]
  );
  const testimonialsParallaxY = useTransform(
    scrollYProgress,
    [0.65, 1],
    [0, -20]
  );
  const ctaParallaxY = useTransform(scrollYProgress, [0.7, 1], [0, -30]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div ref={containerRef} className="relative">
        {/* Pen Animation Section - Fixed position with lower z-index than navbar */}
        <motion.div
          className="fixed inset-0 z-20 pointer-events-none"
          style={{ opacity: penOpacity }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background overlay with fade effect - avoid navbar area */}
            <motion.div
              className="absolute inset-0 bg-secondary pointer-events-none"
              style={{
                opacity: backgroundOpacity,
                top: "64px", // Height of navbar to avoid overlap
              }}
            />

            <motion.div style={{ x: penCapX, y: 5 }} className="absolute z-10">
              <Image
                src="/pen-cap.svg"
                alt="Pen Cap"
                width={200}
                height={60}
                className="object-contain w-[150px] h-16 sm:w-56 sm:h-16 md:w-60 md:h-16 lg:w-64 lg:h-16"
                priority
              />
            </motion.div>

            <motion.div style={{ x: penBodyX }} className="absolute z-0">
              <Image
                src="/pen-body.svg"
                alt="Pen Body"
                width={550}
                height={60}
                className="object-contain w-[450px] h-16 sm:w-96 sm:h-16 md:w-[450px] md:h-16 lg:w-[520px] lg:h-16"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
        {/* Trigger section for scroll - increased height for more time */}
        <div className="h-[150vh] relative z-10">
          {/* Content revealed as pen separates */}
          <motion.div
            style={{
              opacity: contentOpacity,
              scale: contentScale,
              filter: `blur(${contentBlur}px)`,
            }}
            className="sticky top-0 min-h-screen transition-all duration-300"
          >
            <div className="min-h-screen">
              {" "}
              {/* Hero Section with Parallax */}
              <motion.section
                className="bg-secondary/95 px-3 py-32 text-center min-h-screen flex items-center"
                style={{ y: heroParallaxY }}
              >
                <div className="container mx-auto max-w-4xl flex justify-center flex-col">
                  <div className="flex justify-center mb-50"> </div>
                  <Badge className={homeData.hero.badge.className}>
                    {homeData.hero.badge.text}
                  </Badge>

                  <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
                    {homeData.hero.title.main}
                    <br />
                    <span className="text-primary">
                      {homeData.hero.title.highlight}
                    </span>{" "}
                    {homeData.hero.title.subtitle}
                  </h1>

                  <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                    {homeData.hero.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isLoading ? (
                      <Button variant="default" size="lg" disabled>
                        Loading...
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleFindListener}
                      >
                        {homeData.hero.buttons[0].text}
                      </Button>
                    )}
                    <Button variant="outline" size="lg" className="group">
                      {homeData.hero.buttons[1].text}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.section>{" "}
              {/* Stats Section with Parallax */}
              <motion.section
                className="py-12 sm:py-16 lg:py-20 bg-muted/30"
                style={{ y: statsParallaxY }}
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
                    {homeData.stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="text-center p-3 sm:p-4 lg:p-6"
                      >
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                          {stat.number}
                        </div>
                        <div className="text-sm sm:text-base text-muted-foreground">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>{" "}
              {/* How It Works Section with Parallax */}
              <motion.section
                id="how-it-works"
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-primary rounded-xl lg:rounded-2xl"
                style={{ y: howItWorksParallaxY }}
              >
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-secondary">
                    {homeData.howItWorks.title}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-white max-w-xs sm:max-w-lg lg:max-w-3xl mx-auto px-4 sm:px-0">
                    {homeData.howItWorks.subtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-xs sm:max-w-2xl lg:max-w-5xl mx-auto">
                  {homeData.howItWorks.steps.map((step, index) => {
                    const IconComponent = {
                      Users,
                      PhoneCall,
                      Sparkles,
                    }[step.icon];

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        className="relative"
                      >
                        <Card className="text-center border-2 hover:border-primary/20 transition-colors h-full p-4 sm:p-6">
                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">
                              STEP {step.step}
                            </div>
                            <CardTitle className="text-lg sm:text-xl text-foreground">
                              {step.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-sm sm:text-base text-muted-foreground">
                              {step.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>{" "}
              {/* Testimonials Section with Parallax */}
              <motion.section
                id="testimonials"
                className="bg-muted/30 py-12 sm:py-16 lg:py-20"
                style={{ y: testimonialsParallaxY }}
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
                      {homeData.testimonials.title}
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
                      {homeData.testimonials.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-xs sm:max-w-4xl lg:max-w-6xl mx-auto">
                    {homeData.testimonials.reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Card className="h-full p-4 sm:p-6">
                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex items-center gap-1 sm:gap-2 mb-2">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 sm:h-4 sm:w-4 fill-accent text-accent"
                                />
                              ))}
                            </div>
                            <CardTitle className="text-base sm:text-lg text-foreground">
                              {review.name}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base text-muted-foreground">
                              {review.location}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm sm:text-base text-muted-foreground italic">
                              &ldquo;{review.text}&rdquo;
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>{" "}
              {/* CTA Section with Parallax */}
              <motion.section
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center"
                style={{ y: ctaParallaxY }}
              >
                <div className="max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
                    {homeData.cta.title}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4 sm:px-0">
                    {homeData.cta.description}
                  </p>
                  {isLoading ? (
                    <Button
                      variant="default"
                      size="lg"
                      disabled
                      className="text-sm sm:text-base"
                    >
                      Loading...
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleFindListener}
                      className="text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3"
                    >
                      {homeData.cta.button.text}
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  )}
                </div>
              </motion.section>
              <Footer />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

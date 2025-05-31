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
import {
  Star,
  ArrowRight,
  Users,
  PhoneCall,
  Sparkles,
  ChevronDown,
  Target,
  Repeat,
  Zap,
  Heart,
  Award,
  Layers,
  Briefcase,
  GraduationCap,
  Lightbulb,
  BookOpen,
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

  const handleTakeQuiz = () => {
    // Redirect to quiz/onboarding
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

  // Scroll hint opacity - disappears when user starts scrolling
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
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
            </motion.div>{" "}
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
            {/* Scroll Hint - appears below the pen and fades out when scrolling starts */}
            <motion.div
              style={{ opacity: scrollHintOpacity }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="flex flex-col items-center text-primary">
                <p className="text-sm sm:text-base mb-2 font-medium">
                  Scroll to un-mute yourself.
                </p>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </motion.div>
              </div>
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
                <div className="container mx-auto max-w-4xl flex justify-center items-center flex-col">
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
                  </p>{" "}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isLoading ? (
                      <Button variant="default" size="lg" disabled>
                        Loading...
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleTakeQuiz}
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
                </div>{" "}
              </motion.section>{" "}
              {/* About Un-Mute Section */}
              <motion.section
                className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-secondary via-blue-50/30 to-secondary relative overflow-hidden"
                style={{ y: statsParallaxY }}
              >
                {/* Subtle background elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-20 right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
                  <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/15 rounded-full blur-2xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                      >
                        <div className="inline-flex items-center px-4 py-2 bg-white/70 rounded-full border border-primary/20 shadow-sm mb-6 backdrop-blur-sm">
                          <Heart className="h-4 w-4 text-primary mr-2" />
                          <span className="text-primary text-sm font-medium">
                            About Un-Mute
                          </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                          {homeData.aboutUnMute.title}
                        </h2>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-600">
                          {homeData.aboutUnMute.subtitle}
                        </h3>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed"
                      >
                        {homeData.aboutUnMute.description}
                      </motion.p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {homeData.aboutUnMute.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          className="group"
                        >
                          <div className="p-6 rounded-xl bg-white/80 border border-gray-200/60 hover:bg-white hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full backdrop-blur-sm">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              </div>
                              <p className="text-gray-800 font-medium leading-relaxed text-base">
                                {benefit}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
              {/* Why Un-Mute Section */}
              <motion.section
                className="py-12 sm:py-16 lg:py-20 bg-muted/30"
                style={{ y: featuresParallaxY }}
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                      {homeData.whyUnMute.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      {homeData.whyUnMute.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {homeData.whyUnMute.features.map((feature, index) => {
                      const IconComponent = {
                        Zap,
                        Heart,
                        Award,
                        Target,
                        Layers,
                      }[feature.icon];

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <IconComponent className="h-6 w-6 text-primary" />
                              </div>
                              <CardTitle className="text-lg text-foreground">
                                {feature.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-muted-foreground">
                                {feature.description}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>{" "}
              {/* Who It&apos;s For Section */}
              <motion.section
                className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-secondary via-blue-50/30 to-secondary relative overflow-hidden"
                style={{ y: featuresParallaxY }}
              >
                {/* Subtle background elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200/60 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/60 rounded-full blur-3xl"></div>
                  <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="text-center mb-16">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="mb-6"
                    >
                      <div className="inline-flex items-center px-4 py-2 bg-white/70 rounded-full border border-primary/20 shadow-sm mb-6 backdrop-blur-sm">
                        <Users className="h-4 w-4 text-primary mr-2" />
                        <span className="text-primary text-sm font-medium">
                          Who It&apos;s For
                        </span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                        {homeData.whoItsFor.title}
                      </h2>
                      <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        {homeData.whoItsFor.subtitle}
                      </p>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {homeData.whoItsFor.audience.map((audience, index) => {
                      const IconComponent = {
                        Briefcase,
                        GraduationCap,
                        Lightbulb,
                        BookOpen,
                      }[audience.icon];

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.15 }}
                          whileHover={{ y: -8, transition: { duration: 0.3 } }}
                          className="group"
                        >
                          <Card className="h-full px-2 py-6 text-center bg-muted/30 border border-gray-200/60 hover:bg-white hover:border-primary/40 hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                            <CardHeader className="pb-6">
                              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                                <IconComponent className="h-10 w-10 text-primary" />
                              </div>
                              <CardTitle className="text-xl text-gray-900 font-semibold leading-tight">
                                {audience.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-gray-600 leading-relaxed">
                                {audience.description}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
              {/* Corporate Section */}
              <motion.section
                className="py-12 sm:py-16 lg:py-20 bg-primary"
                style={{ y: featuresParallaxY }}
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-secondary">
                      {homeData.corporate.title}
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-white">
                      {homeData.corporate.subtitle}
                    </h3>
                    <p className="text-lg text-white mb-8 leading-relaxed">
                      {homeData.corporate.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {homeData.corporate.services.map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{
                            opacity: 0,
                            x: index % 2 === 0 ? -20 : 20,
                          }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-white/10 border border-white/20"
                        >
                          <p className="text-white font-medium">{service}</p>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-white/80 mb-8">
                      {homeData.corporate.features}
                    </p>

                    <Button
                      variant="secondary"
                      size="lg"
                      className={homeData.corporate.button.className}
                    >
                      {homeData.corporate.button.text}
                    </Button>
                  </div>
                </div>
              </motion.section>{" "}
              {/* How It Works Section with Parallax */}
              <motion.section
                id="how-it-works"
                className=" mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-secondary"
                style={{ y: howItWorksParallaxY }}
              >
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-primary">
                    {homeData.howItWorks.title}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-primary/70 max-w-xs sm:max-w-lg lg:max-w-3xl mx-auto px-4 sm:px-0">
                    {homeData.howItWorks.subtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-xs sm:max-w-2xl lg:max-w-6xl mx-auto">
                  {homeData.howItWorks.steps.map((step, index) => {
                    const IconComponent = {
                      Target,
                      Users,
                      PhoneCall,
                      Repeat,
                    }[step.icon];
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                      >
                        <Card className="text-center border-2 hover:border-secondary/20 transition-colors h-full p-4 sm:p-6">
                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                              <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">
                              STEP {step.step}
                            </div>
                            <CardTitle className="text-lg sm:text-xl text-primary">
                              {step.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-sm sm:text-base text-primary/70">
                              {step.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}{" "}
                </div>
              </motion.section>
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
                className="container mx-auto px-2 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center"
                style={{ y: ctaParallaxY }}
              >
                <div className="max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
                    {homeData.cta.title}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4 sm:px-0">
                    {homeData.cta.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                        onClick={handleTakeQuiz}
                        className={homeData.cta.buttons[0].className}
                      >
                        {homeData.cta.buttons[0].text}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      className={homeData.cta.buttons[1].className}
                    >
                      {homeData.cta.buttons[1].text}
                    </Button>
                  </div>
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

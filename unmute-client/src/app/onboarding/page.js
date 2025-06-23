"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useToast } from "@/context/ToastContext";
import AuthDialog from "@/components/AuthDialog";
import { useSession } from "next-auth/react";
import {
  primaryReasonOptions,
  desiredOutcomeOptions,
  obstacleOptions,
  readinessOptions,
  ageGroupOptions,
  practitionerGenderOptions,
} from "@/utils/preferencesOptions";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { storeOnboardingData, onboardingData } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  // If user is logged in, redirect to matches list regardless of onboarding status
  useEffect(() => {
    if (status === "authenticated") {
      console.log(
        "User is authenticated, redirecting to matches list"
      );
      router.push("/matches/list");
    }
  }, [status, router]);// Define questions structure using centralized options
  const questions = [
    {
      id: "primaryReason",
      title: "🧭 What's the real reason you're here today?",
      description: "Choose one that feels closest",
      type: "single",
      options: primaryReasonOptions,
    },
    {
      id: "desiredOutcome",
      title: "🧠 What outcome are you hoping for from this experience?",
      description: "Choose up to 2",
      type: "multiple",
      maxSelections: 2,
      options: desiredOutcomeOptions,
    },
    {
      id: "obstacles",
      title: "🪞 What's getting in the way right now?",
      description: "Pick what resonates — max 2",
      type: "multiple",
      maxSelections: 2,
      options: obstacleOptions,
    },
    {
      id: "ageGroup",
      title: "What's your age group?",
      description:
        "This helps us match you with practitioners who specialize in your age demographic",
      type: "single",
      options: ageGroupOptions,
    },
    {
      id: "readiness",
      title: "🎯 How ready are you to take action?",
      description: "This helps us guide you better",
      type: "single",
      options: readinessOptions,
    },
    {
      id: "practitionerGender",
      title: "Do you have a preference for your practitioner's gender?",
      description: "Some people feel more comfortable with a specific gender",
      type: "single",
      options: practitionerGenderOptions,
    },
    {
      id: "additionalContext",
      title:
        "Anything specific you'd like your expert to know before the call?",
      type: "text",
      hasTextInput: true,
      textInputPlaceholder:
        "I've been feeling stuck for 3 months...",
      optional: true,
    },
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const handleAnswer = (optionId) => {
    const question = currentQuestion;

    if (question.type === "multiple") {
      const currentAnswers = answers[question.id] || [];
      const maxSelections = question.maxSelections || Infinity;

      if (currentAnswers.includes(optionId)) {
        // Remove selection
        const newAnswers = currentAnswers.filter((id) => id !== optionId);
        setAnswers((prev) => ({
          ...prev,
          [question.id]: newAnswers,
        }));
      } else if (currentAnswers.length < maxSelections) {
        // Add selection if under limit
        const newAnswers = [...currentAnswers, optionId];
        setAnswers((prev) => ({
          ...prev,
          [question.id]: newAnswers,
        }));
      }
    } else {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: optionId,
      }));
    }
  };

  const handleTextInput = (value) => {
    const question = currentQuestion;
    const textKey = `${question.id}_text`;

    setAnswers((prev) => ({
      ...prev,
      [textKey]: value,
    }));
  };
  const isAnswered = () => {
    const question = currentQuestion;

    // For optional questions, always consider them answered
    if (question.optional) {
      return true;
    }

    // For text-only questions
    if (question.type === "text") {
      const textKey = `${question.id}_text`;
      return answers[textKey] && answers[textKey].trim().length > 0;
    }

    // For multiple choice questions
    const answer = answers[question.id];
    if (question.type === "multiple") {
      return answer && answer.length > 0;
    }

    // For single choice questions
    return answer !== undefined;
  };

  const hasTextInput = () => {
    const textKey = `${currentQuestion.id}_text`;
    return answers[textKey] && answers[textKey].trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Transform answers to the format expected by the User model
      const formattedData = {
        preferences: {
          primaryReason: answers.primaryReason || "unsure",
          desiredOutcome: Array.isArray(answers.desiredOutcome)
            ? answers.desiredOutcome
            : [],
          obstacles: Array.isArray(answers.obstacles) ? answers.obstacles : [],
          ageGroup: answers.ageGroup || "25-34",
          readiness: answers.readiness || "exploring",
          practitionerGender: answers.practitionerGender || "no-preference",
          additionalContext: answers.additionalContext_text || "",
        },
        onboardingParameters: answers,
      };

      console.log(
        "onboarding complete: Storing formatted onboarding data",
        formattedData
      );
      storeOnboardingData(formattedData);

      // If already logged in, try to save immediately
      if (status === "authenticated" && session?.user?.id) {
        const response = await fetch("/api/users/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });        if (response.ok) {
          console.log("onboarding data saved successfully for logged-in user");
          toast.onboardingComplete();
          router.push("/matches");
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to save your preferences");
          setError(errorData.error || "Failed to save your preferences");
        }
      } else {
        // Not logged in, show auth dialog
        setShowAuthDialog(true);
      }    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called after successful authentication - the OnboardingContext will handle saving
  const handleAuthSuccess = () => {
    console.log(
      "Auth successful - OnboardingContext will handle saving and redirect"
    );
  };

  const isSelected = (optionId) => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiple") {
      return answer && answer.includes(optionId);
    }
    return answer === optionId;
  };
  return (
    <div className="min-h-screen bg-secondary/95 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-32 right-16 w-48 h-48 bg-secondary/15 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/3 blur-2xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {" "}
          {/* Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="mb-4 flex items-center justify-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Step {currentStep + 1} of {questions.length}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-sm text-primary/60">
                {Math.round(progress)}% complete
              </p>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary">
              Let&apos;s find your perfect match
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Answer a few questions so we can connect you with someone who
              truly gets you
            </p>
          </div>{" "}
          {/* Question Card */}
          <Card className="mb-8 border-primary/20 bg-primary/95">
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl text-secondary mb-2">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="text-base text-secondary">
                {currentQuestion.description}
              </CardDescription>

              {/* Selection indicator for multiple choice */}
              {currentQuestion.type === "multiple" &&
                currentQuestion.maxSelections && (
                  <div className="mt-4">
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary"
                    >
                      Choose up to {currentQuestion.maxSelections}
                      {(answers[currentQuestion.id] || []).length > 0 &&
                        ` • ${
                          (answers[currentQuestion.id] || []).length
                        } selected`}
                    </Badge>
                  </div>
                )}
            </CardHeader>{" "}
            <CardContent>
              {/* For text-only questions */}
              {currentQuestion.type === "text" ? (
                <div className="space-y-4">
                  <Card className="border-secondary/30 bg-secondary">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">✍️</span>
                          <div className="flex-1">
                            <div className="font-medium text-primary text-lg">
                              Share your thoughts
                            </div>
                            <div className="text-sm text-primary/60">
                              Take your time — this helps us understand you
                              better
                            </div>
                          </div>
                        </div>
                        <textarea
                          placeholder={currentQuestion.textInputPlaceholder}
                          value={answers[`${currentQuestion.id}_text`] || ""}
                          onChange={(e) => handleTextInput(e.target.value)}
                          className="w-full text-base placeholder:text-muted-foreground/60 min-h-[120px] resize-none bg-white/70 border border-primary/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          maxLength={300}
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Optional — but valuable for matching</span>
                          <span>
                            {
                              (answers[`${currentQuestion.id}_text`] || "")
                                .length
                            }
                            /300
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* For choice-based questions */
                <div className="grid gap-3">
                  {currentQuestion.options &&
                    currentQuestion.options.map((option, index) => {
                      const isCurrentlySelected = isSelected(option.id);
                      const currentAnswers = answers[currentQuestion.id] || [];
                      const maxSelections =
                        currentQuestion.maxSelections || Infinity;
                      const canSelect =
                        currentQuestion.type === "single" ||
                        isCurrentlySelected ||
                        currentAnswers.length < maxSelections;

                      return (
                        <Card
                          key={option.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isCurrentlySelected
                              ? "border-primary bg-secondary shadow-md ring-2 ring-primary/20"
                              : canSelect
                              ? "hover:border-primary/50 hover:shadow-md hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => canSelect && handleAnswer(option.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{option.emoji}</span>
                              <div className="flex-1">
                                <div className="font-medium text-primary">
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              {isCurrentlySelected && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}

              {/* Legacy text input for questions that have both options and text input */}
              {currentQuestion.hasTextInput && currentQuestion.options && (
                <div className="mt-4">
                  <Card
                    className={`transition-all hover:shadow-md ${
                      hasTextInput()
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/10 hover:border-primary/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">✍️</span>
                          <div className="flex-1">
                            <div className="font-medium text-primary">
                              Tell us your story
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Describe what&apos;s happening in your own words
                            </div>
                          </div>
                          {hasTextInput() && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <textarea
                          placeholder={currentQuestion.textInputPlaceholder}
                          value={answers[`${currentQuestion.id}_text`] || ""}
                          onChange={(e) => handleTextInput(e.target.value)}
                          className="w-full text-base placeholder:text-muted-foreground/60 min-h-[100px] resize-none bg-white/70 border border-primary/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          maxLength={150}
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            This helps us find the perfect match for you
                          </span>
                          <span>
                            {
                              (answers[`${currentQuestion.id}_text`] || "")
                                .length
                            }
                            /150
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>{" "}
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStep + 1} of {questions.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!isAnswered() || isSubmitting}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {currentStep === questions.length - 1 ? (
                isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Complete"
                )
              ) : (
                "Next"
              )}
              {currentStep !== questions.length - 1 && (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Auth Dialog shown after onboarding completion */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
        defaultView="signup"
      />
    </div>
  );
}

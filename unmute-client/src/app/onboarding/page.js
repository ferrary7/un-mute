"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    router.push("/");
    return null;
  }
  
  const questions = [
    {
      id: "concerns",
      title: "What brings you here today?",
      description: "Share what's on your mind and select the areas you'd like support with",
      type: "multiple",
      hasTextInput: true,
      textInputPlaceholder: "...",
      options: [
        { id: "stress", label: "Stress & Anxiety", emoji: "😰" },
        { id: "confidence", label: "Self-Confidence", emoji: "💪" },
        { id: "relationships", label: "Relationships", emoji: "💕" },
        { id: "work", label: "Work-Life Balance", emoji: "⚖️" },
        { id: "depression", label: "Depression", emoji: "😔" },
        { id: "trauma", label: "Trauma & PTSD", emoji: "🌧️" },
        { id: "addiction", label: "Addiction", emoji: "🚫" },
        { id: "family", label: "Family Issues", emoji: "👨‍👩‍👧‍👦" },
        { id: "other", label: "Other", emoji: "💭" }
      ]
    },
    {
      id: "language",
      title: "What&apos;s your preferred language?",
      description: "Choose the language you&apos;re most comfortable speaking in",
      type: "single",
      options: [
        { id: "english", label: "English", emoji: "🇺🇸" },
        { id: "hindi", label: "Hindi", emoji: "🇮🇳" },
        { id: "marathi", label: "Marathi", emoji: "🏛️" },
        { id: "tamil", label: "Tamil", emoji: "🌴" },
        { id: "bengali", label: "Bengali", emoji: "🐟" },
        { id: "gujarati", label: "Gujarati", emoji: "🦁" },
        { id: "telugu", label: "Telugu", emoji: "🌾" },
        { id: "kannada", label: "Kannada", emoji: "☕" }
      ]
    },
    {
      id: "sessionType",
      title: "How would you prefer to have your sessions?",
      description: "Choose your preferred mode of communication",
      type: "single",
      options: [
        { id: "video", label: "Video Call", emoji: "📹", description: "Face-to-face interaction" },
        { id: "audio", label: "Audio Call", emoji: "📞", description: "Voice-only conversation" },
        { id: "text", label: "Text Chat", emoji: "💬", description: "Written conversation" },
        { id: "flexible", label: "I'm Flexible", emoji: "🔄", description: "Any format works for me" }
      ]
    },
    {
      id: "ageGroup",
      title: "What&apos;s your age group?",
      description: "This helps us match you with practitioners who specialize in your age demographic",
      type: "single",
      options: [
        { id: "18-24", label: "18-24 years", emoji: "🎓" },
        { id: "25-34", label: "25-34 years", emoji: "💼" },
        { id: "35-44", label: "35-44 years", emoji: "🏠" },
        { id: "45-54", label: "45-54 years", emoji: "👔" },
        { id: "55+", label: "55+ years", emoji: "🌺" } // Changed from "55-64" to "55+" to match schema
      ]
    },
    {
      id: "experience",
      title: "Have you had therapy or counseling before?",
      description: "Your experience level helps us tailor the matching process",
      type: "single",
      options: [
        { id: "never", label: "Never", emoji: "🆕", description: "This is my first time" },
        { id: "once", label: "Once or twice", emoji: "🔄", description: "I've tried it briefly" },
        { id: "several", label: "Several times", emoji: "📈", description: "I have some experience" },
        { id: "regular", label: "Regular sessions", emoji: "⭐", description: "I'm experienced with therapy" }
      ]
    },
    {
      id: "practitionerGender",
      title: "Do you have a preference for your practitioner's gender?",
      description: "Some people feel more comfortable with a specific gender",
      type: "single",
      options: [
        { id: "male", label: "Male", emoji: "👨‍⚕️" },
        { id: "female", label: "Female", emoji: "👩‍⚕️" },
        { id: "no-preference", label: "No Preference", emoji: "🤝" }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (optionId) => {
    const question = currentQuestion;
    
    if (question.type === "multiple") {
      const currentAnswers = answers[question.id] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter(id => id !== optionId)
        : [...currentAnswers, optionId];
      
      setAnswers(prev => ({
        ...prev,
        [question.id]: newAnswers
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [question.id]: optionId
      }));
    }
  };

  const handleTextInput = (value) => {
    const question = currentQuestion;
    const textKey = `${question.id}_text`;
    
    setAnswers(prev => ({
      ...prev,
      [textKey]: value
    }));
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiple") {
      return answer && answer.length > 0;
    }
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
  };  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Map values from form to match the enum values in User model
      const mapSessionType = (type) => {
        const mapping = {
          "video": "Video",
          "audio": "Audio", 
          "text": "Text",
          "flexible": "Video" // Default to Video for flexible
        };
        return mapping[type] || 'Video';
      };
      
      const mapGender = (gender) => {
        const mapping = {
          "male": "Male",
          "female": "Female",
          "no-preference": "No preference"
        };
        return mapping[gender] || 'No preference';
      };
      
      // Transform answers to the format expected by the User model
      const onboardingData = {
        preferences: {
          concerns: Array.isArray(answers.concerns) ? answers.concerns : [],
          sessionType: mapSessionType(answers.sessionType),
          practitionerGender: mapGender(answers.practitionerGender),
          language: answers.language ? answers.language.charAt(0).toUpperCase() + answers.language.slice(1) : 'English',
          ageGroup: answers.ageGroup || '25-34', // Ensuring this matches the schema enum values
          experience: answers.experience || 'First time'
        },
        quizParameters: answers
      };

      // Save to database via API
      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });      if (response.ok) {
        console.log("Onboarding completed successfully");
        setError(null);
        router.push("/matches");
      } else {
        const errorData = await response.json();
        console.error("Failed to complete onboarding:", errorData);
        
        if (errorData.details) {
          console.error("Validation errors:", errorData.details);
          setError(`Validation error: ${errorData.details.map(d => d.message).join(', ')}`);
        } else {
          setError(errorData.error || "Failed to complete onboarding");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelected = (optionId) => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiple") {
      return answer && answer.includes(optionId);
    }
    return answer === optionId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Step {currentStep + 1} of {questions.length}
          </Badge>
          <Progress value={progress} className="mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Let&apos;s personalize your experience
          </h1>
          <p className="text-muted-foreground">
            This helps us find the perfect mental wellness practitioner for you
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">
              {currentQuestion.title}
            </CardTitle>
            <CardDescription className="text-base">
              {currentQuestion.description}
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Subtle divider for concerns question */}
            {currentQuestion.hasTextInput && (
              <div className="mb-4 flex items-center">
                <div className="flex-1 border-t border-muted-foreground/20"></div>
                <div className="px-3">
                  <span className="text-xs text-muted-foreground/60">
                    Select what applies to you
                  </span>
                </div>
                <div className="flex-1 border-t border-muted-foreground/20"></div>
              </div>
            )}

            <div className="grid gap-3">
              {currentQuestion.options.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected(option.id)
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswer(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {isSelected(option.id) && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Text Input integrated as first option for concerns question */}
            {currentQuestion.hasTextInput && (
              <div className="my-4">
                <Card
                  className={`transition-all hover:shadow-md ${
                    hasTextInput()
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:border-primary/50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✍️</span>
                        <div className="flex-1">
                          <div className="font-medium text-primary">Tell us your story</div>
                          <div className="text-sm text-muted-foreground">
                            Describe what&apos;s happening in your own words
                          </div>
                        </div>
                        {hasTextInput() && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <Input
                        placeholder={currentQuestion.textInputPlaceholder}
                        value={answers[`${currentQuestion.id}_text`] || ""}
                        onChange={(e) => handleTextInput(e.target.value)}
                        className="text-base placeholder:text-muted-foreground/60"
                        maxLength={150}
                      />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>This helps us find the perfect match for you</span>
                        <span>{(answers[`${currentQuestion.id}_text`] || "").length}/150</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

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
          >
            {currentStep === questions.length - 1 ? (isSubmitting ? "Saving..." : "Complete") : "Next"}
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
  );
}
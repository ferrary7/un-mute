"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  
  const questions = [
    {
      id: "concerns",
      title: "What brings you here today?",
      description: "Select all that apply to help us find the right practitioner for you",
      type: "multiple",
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
      title: "What's your preferred language?",
      description: "Choose the language you're most comfortable speaking in",
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
      title: "What's your age group?",
      description: "This helps us match you with practitioners who specialize in your age demographic",
      type: "single",
      options: [
        { id: "18-24", label: "18-24 years", emoji: "🎓" },
        { id: "25-34", label: "25-34 years", emoji: "💼" },
        { id: "35-44", label: "35-44 years", emoji: "🏠" },
        { id: "45-54", label: "45-54 years", emoji: "👔" },
        { id: "55-64", label: "55-64 years", emoji: "🌅" },
        { id: "65+", label: "65+ years", emoji: "🌺" }
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

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiple") {
      return answer && answer.length > 0;
    }
    return answer !== undefined;
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

  const handleComplete = () => {
    // Save answers to localStorage (in real app, send to API)
    localStorage.setItem("onboarding_answers", JSON.stringify(answers));
    localStorage.setItem("onboarding_completed", "true");
    
    console.log("Onboarding completed with answers:", answers);
    
    // Redirect to matches page
    router.push("/matches");
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
            Let's personalize your experience
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
            disabled={!isAnswered()}
          >
            {currentStep === questions.length - 1 ? "Complete" : "Next"}
            {currentStep !== questions.length - 1 && (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
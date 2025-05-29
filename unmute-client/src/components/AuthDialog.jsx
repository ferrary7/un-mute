"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthDialog({ 
  open, 
  onOpenChange,
  triggerText, 
  variant = "default", 
  size = "default", 
  isSignUp = false,
  className = "",
  onSuccess = null,
  defaultView = "login"
}) {
  const [isSignUpMode, setIsSignUpMode] = useState(isSignUp || defaultView === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isSignUpMode && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (isSignUpMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUpMode) {
        // Registration with NextAuth credentials provider
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          redirect: false
        });
        
        if (result?.error) {
          setErrors({ submit: result.error });
          setIsLoading(false);
          return;
        }
        
        // Close the dialog first
        if (onOpenChange) {
          onOpenChange(false);
        }
        
        // Call success callback if provided - context will handle the rest
        if (onSuccess) {
          console.log("Sign-up successful, calling onSuccess callback");
          onSuccess();
        }
      } else {
        // Login with NextAuth credentials provider
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });
        
        if (result?.error) {
          setErrors({ submit: "Invalid email or password" });
          setIsLoading(false);
          return;
        }
        
        // Close the dialog first
        if (onOpenChange) {
          onOpenChange(false);
        }
        
        // Call success callback if provided - context will handle the rest
        if (onSuccess) {
          console.log("Login successful, calling onSuccess callback");
          onSuccess();
        }
      }
      
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({ submit: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Simple sign in without redirect
      const result = await signIn('google', { redirect: false });
      
      if (result?.error) {
        setErrors({ submit: "Google sign in failed. Please try again." });
        setIsLoading(false);
        return;
      }
      
      // Close the dialog first
      if (onOpenChange) {
        onOpenChange(false);
      }
      
      // Call success callback if provided - context will handle the rest
      if (onSuccess) {
        console.log("Google sign-in successful, calling onSuccess callback");
        onSuccess();
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setErrors({ submit: "Google sign in failed. Please try again." });
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerText && (
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignUpMode ? "Create your account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {isSignUpMode 
              ? "Join thousands finding their perfect mental wellness match"
              : "Sign in to continue your mental wellness journey"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Google Sign In */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUpMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            {isSignUpMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}
            
            {errors.submit && (
              <p className="text-sm text-destructive text-center">{errors.submit}</p>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Please wait..." : (isSignUpMode ? "Create Account" : "Sign In")}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
            </span>
            {" "}
            <Button variant="link" className="p-0 h-auto" onClick={toggleMode}>
              {isSignUpMode ? "Sign in" : "Sign up"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
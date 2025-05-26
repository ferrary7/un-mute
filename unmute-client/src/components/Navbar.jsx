"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Heart, User, Calendar, LogOut } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Mock user state - in real app this would come from NextAuth
  const [user, setUser] = useState(null); // Set to null for logged out state
  // const [user, setUser] = useState({ name: "John Doe", email: "john@example.com", image: null });

  const handleLogout = () => {
    setUser(null);
    // In real app: signOut()
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">UnMute</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/matches" className="text-muted-foreground hover:text-foreground transition-colors">
                  Matches
                </Link>
                <Link href="/appointments" className="text-muted-foreground hover:text-foreground transition-colors">
                  Appointments
                </Link>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </Link>
                <Link href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                  Testimonials
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <AuthDialog triggerText="Login" variant="ghost" />
                <AuthDialog triggerText="Sign Up" variant="default" isSignUp={true} />
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <Link 
                    href="/matches" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Matches
                  </Link>
                  <Link 
                    href="/appointments" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Appointments
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/#how-it-works" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How it Works
                  </Link>
                  <Link 
                    href="/#testimonials" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <div className="flex flex-col space-y-2 pt-2 border-t">
                    <AuthDialog triggerText="Login" variant="ghost" className="justify-start" />
                    <AuthDialog triggerText="Sign Up" variant="default" isSignUp={true} className="justify-start" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
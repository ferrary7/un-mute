"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Heart, User, Calendar, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import AuthDialog from "@/components/AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const user = session?.user;
  const isLoading = status === "loading";

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
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
                  Find Listeners
                </Link>
                <Link href="/matches/list" className="text-muted-foreground hover:text-foreground transition-colors">
                  Your Matches
                </Link>
                <Link href="/appointments" className="text-muted-foreground hover:text-foreground transition-colors">
                  Appointments
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
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{user.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex w-full items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/appointments" className="cursor-pointer flex w-full items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Appointments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : user ? (
                <>
                  {/* User profile section with dropdown */}
                  <DropdownMenu open={isMobileProfileOpen} onOpenChange={setIsMobileProfileOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 pb-3 mb-2 border-b w-full text-left focus:outline-none">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{user.name}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                          </div>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-full" style={{width: "calc(100% - 2rem)"}}>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild onClick={() => setIsMenuOpen(false)}>
                        <Link href="/profile" className="cursor-pointer flex w-full items-center">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }} className="cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Navigation Links */}
                  <Link 
                    href="/matches" 
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4 mr-3" />
                    Matches
                  </Link>
                  <Link 
                    href="/appointments" 
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Appointments
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/#how-it-works" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How it Works
                  </Link>
                  <Link 
                    href="/#testimonials" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <div className="flex flex-col space-y-3 pt-3 mt-2 border-t">
                    <AuthDialog triggerText="Login" variant="ghost" className="justify-start h-10" />
                    <AuthDialog triggerText="Sign Up" variant="default" isSignUp={true} className="justify-start h-10" />
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
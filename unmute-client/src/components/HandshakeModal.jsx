"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HandHeart, ThumbsUp, ThumbsDown, Star } from "lucide-react";

export default function HandshakeModal({
  appointment,
  isOpen,
  onClose,
  onHandshakeComplete,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handshakeSubmitted, setHandshakeSubmitted] = useState(false);
  const [userChoice, setUserChoice] = useState(null);

  const handleHandshake = async (agrees) => {
    setIsSubmitting(true);
    setUserChoice(agrees);

    try {
      const response = await fetch(
        `/api/appointments/${appointment.id}/handshake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userHandshake: agrees,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit handshake");
      }

      const result = await response.json();
      setHandshakeSubmitted(true);

      // Call parent callback
      if (onHandshakeComplete) {
        onHandshakeComplete(result);
      }
    } catch (error) {
      console.error("Error submitting handshake:", error);
      alert("Failed to submit handshake. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state for next time
    setTimeout(() => {
      setHandshakeSubmitted(false);
      setUserChoice(null);
    }, 500);
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {" "}
      <DialogContent className="max-w-md">
        {isSubmitting ? (
          /* Loading State - Big Handshake Animation */
          <div className="flex items-center justify-center py-16">
            <div className="text-8xl select-none animate-handshake">🤝</div>
          </div>
        ) : !handshakeSubmitted ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <HandHeart className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                Session Complete!
              </DialogTitle>
              <DialogDescription className="text-center">
                How was your introductory session with{" "}
                {appointment.practitioner.name}?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={appointment.practitioner.image}
                        alt={appointment.practitioner.name}
                      />
                      <AvatarFallback>
                        {appointment.practitioner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {appointment.practitioner.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.practitioner.specializations
                          ?.slice(0, 2)
                          .join(", ")}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">
                          {appointment.practitioner.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Would you like to continue working with this practitioner for
                  regular sessions?
                </p>

                <div className="flex space-x-3">
                  <Button
                    className="flex-1 h-auto py-4 flex flex-col space-y-2"
                    variant="outline"
                    onClick={() => handleHandshake(true)}
                    disabled={isSubmitting}
                  >
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                    <span>Yes, Continue</span>
                    <span className="text-xs text-muted-foreground">
                      Book regular sessions
                    </span>
                  </Button>
                  <Button
                    className="flex-1 h-auto py-4 flex flex-col space-y-2"
                    variant="outline"
                    onClick={() => handleHandshake(false)}
                    disabled={isSubmitting}
                  >
                    <ThumbsDown className="h-6 w-6 text-red-600" />
                    <span>No, Thanks</span>
                    <span className="text-xs text-muted-foreground">
                      Find someone else
                    </span>
                  </Button>{" "}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Handshake Result */
          <div className="text-center py-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                userChoice ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {userChoice ? (
                <ThumbsUp className="h-8 w-8 text-green-600" />
              ) : (
                <ThumbsDown className="h-8 w-8 text-blue-600" />
              )}
            </div>

            <DialogTitle className="text-xl mb-2">
              {userChoice ? "Great Choice!" : "Thank You!"}
            </DialogTitle>

            <DialogDescription className="text-base mb-6">
              {userChoice ? (
                <>
                  You can now book regular 50-minute sessions with{" "}
                  {appointment.practitioner.name}
                  at their standard rate.
                </>
              ) : (
                <>
                  No worries! You can continue exploring other practitioners who
                  might be a better fit for you.
                </>
              )}
            </DialogDescription>

            <div className="space-y-3">
              {userChoice ? (
                <Button className="w-full" onClick={handleClose}>
                  Book Next Session
                </Button>
              ) : (
                <Button className="w-full" onClick={handleClose}>
                  Find Other Practitioners
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

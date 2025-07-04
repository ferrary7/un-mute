import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Heart } from "lucide-react";
import { OnboardingProvider } from '@/context/OnboardingContext';
import { ToastProvider } from '@/context/ToastContext';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Un-Mute - Mental Wellness Platform",
  description: "Find your perfect mental wellness practitioner with our smart matching system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >        <SessionProvider>
          <OnboardingProvider>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </OnboardingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

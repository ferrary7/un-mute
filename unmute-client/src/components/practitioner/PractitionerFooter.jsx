"use client";

import Link from "next/link";
import { Stethoscope, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function PractitionerFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/practitioner" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Un-Mute Pro</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Professional platform for mental health practitioners. Manage your practice, 
              connect with clients, and provide quality care through our secure platform.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>24/7 Technical Support Available</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/practitioner" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/practitioner/appointments" className="text-gray-400 hover:text-white transition-colors">
                  Appointments
                </Link>
              </li>
              <li>
                <Link href="/practitioner/clients" className="text-gray-400 hover:text-white transition-colors">
                  Clients
                </Link>
              </li>
              <li>
                <Link href="/practitioner/handshakes" className="text-gray-400 hover:text-white transition-colors">
                  Handshakes
                </Link>
              </li>
              <li>
                <Link href="/practitioner/profile" className="text-gray-400 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/practitioner/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/practitioner/support" className="text-gray-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/practitioner/documentation" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/practitioner/training" className="text-gray-400 hover:text-white transition-colors">
                  Training Resources
                </Link>
              </li>
              <li>
                <Link href="/practitioner/billing" className="text-gray-400 hover:text-white transition-colors">
                  Billing Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 Un-Mute Pro. All rights reserved. Professional mental health platform.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/practitioner/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/practitioner/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/practitioner/compliance" className="text-gray-400 hover:text-white transition-colors">
                HIPAA Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

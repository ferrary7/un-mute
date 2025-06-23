import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '../../../../../../server/config/database';
import Appointment from '../../../../../../server/models/Appointment';
import User from '../../../../../../server/models/User';

// POST - Submit handshake for completed introductory session
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { userHandshake } = await request.json();

    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(id).populate('practitioner');
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    
    // Verify this appointment belongs to the user
    if (appointment.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Verify this is a completed introductory session
    if (!appointment.isIntroductorySession || appointment.status !== 'completed') {
      return NextResponse.json({ 
        error: "Handshake only available for completed introductory sessions" 
      }, { status: 400 });
    }
    
    // Update user's handshake
    appointment.userHandshake = userHandshake;
    
    // For demo purposes, simulate practitioner handshake (in real app, practitioner would submit separately)
    // We'll assume practitioner agrees if user agrees, and disagrees if user disagrees
    appointment.practitionerHandshake = userHandshake;
    
    // Check if both parties agree
    if (appointment.userHandshake && appointment.practitionerHandshake) {
      appointment.handshakeCompleted = true;
    } else {
      appointment.handshakeCompleted = false;
    }
    
    await appointment.save();

    return NextResponse.json({ 
      appointment,
      message: appointment.handshakeCompleted 
        ? 'Handshake successful! You can now book regular sessions with this practitioner.'
        : 'Handshake completed. You may want to try a different practitioner.'
    });
  } catch (error) {
    console.error('Handshake error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get handshake status for an appointment
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(id).populate('practitioner');
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    
    // Verify this appointment belongs to the user
    if (appointment.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ 
      handshakeStatus: {
        userHandshake: appointment.userHandshake,
        practitionerHandshake: appointment.practitionerHandshake,
        handshakeCompleted: appointment.handshakeCompleted,
        isIntroductorySession: appointment.isIntroductorySession
      }
    });
  } catch (error) {
    console.error('Get handshake status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

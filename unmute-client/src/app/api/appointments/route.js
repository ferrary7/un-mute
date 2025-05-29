import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '../../../../server/config/database';
import Appointment from '../../../../server/models/Appointment';
import User from '../../../../server/models/User';
import Practitioner from '../../../../server/models/Practitioner';

// GET - Get user appointments
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const appointments = await Appointment.find({ user: user._id })
      .populate('practitioner')
      .sort({ date: 1, time: 1 });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new appointment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
      await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check if practitioner exists
    const practitioner = await Practitioner.findById(data.practitionerId);
    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }
    
    // Generate unique booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const appointment = new Appointment({
      user: user._id,
      practitioner: data.practitionerId,
      date: data.date,
      time: data.time,
      sessionType: data.sessionType,
      bookingId,
      status: data.status || "confirmed",
      duration: data.duration || "50 minutes",
      notes: data.notes,
      quizParameters: data.quizParameters || {}
    });
    
    await appointment.save();
      // Update user's upcoming sessions count
    user.upcomingSessions = (user.upcomingSessions || 0) + 1;
    await user.save();
    
    // Populate practitioner data before returning
    await appointment.populate('practitioner');

    return NextResponse.json({ 
      appointment,
      message: 'Appointment booked successfully' 
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

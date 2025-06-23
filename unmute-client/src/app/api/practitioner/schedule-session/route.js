import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../../server/config/database";
import Practitioner from "../../../../../server/models/Practitioner";
import Appointment from "../../../../../server/models/Appointment";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    const body = await request.json();
    const { userId, practitionerId, date, time, sessionType, duration, notes } = body;

    await connectDB();

    // Verify practitioner
    const practitioner = await Practitioner.findOne({ 
      email: session.user.email 
    });

    if (!practitioner || practitioner._id.toString() !== practitionerId) {
      return NextResponse.json({ error: "Unauthorized practitioner" }, { status: 403 });
    }

    // Generate booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create new appointment
    const newAppointment = new Appointment({
      user: userId,
      practitioner: practitionerId,
      date,
      time,
      sessionType,
      duration,
      bookingId,
      status: 'confirmed',
      sessionPrice: practitioner.price,
      sessionNotes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newAppointment.save();

    // Update practitioner's total sessions count
    await Practitioner.findByIdAndUpdate(practitionerId, {
      $inc: { totalSessions: 1 }
    });

    return NextResponse.json({
      message: "Session scheduled successfully",
      appointment: newAppointment
    });
  } catch (error) {
    console.error("Error scheduling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

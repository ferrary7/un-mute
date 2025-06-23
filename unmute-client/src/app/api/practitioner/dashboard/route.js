import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../../server/config/database";
import Practitioner from "../../../../../server/models/Practitioner";
import Appointment from "../../../../../server/models/Appointment";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
      if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find practitioner
    const practitioner = await Practitioner.findOne({ 
      email: session.user.email 
    });

    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }

    // Get today's date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Get current month start and end
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Fetch today's appointments
    const todayAppointments = await Appointment.find({
      practitioner: practitioner._id,
      date: todayString,
      status: { $ne: 'cancelled' }
    }).populate('user', 'name email').sort({ time: 1 });

    // Fetch all appointments for calculations
    const allAppointments = await Appointment.find({
      practitioner: practitioner._id
    }).populate('user', 'name email location');

    // Calculate stats
    const totalClients = new Set(
      allAppointments.map(apt => apt.user._id.toString())
    ).size;

    const monthlyAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'completed';
    });

    const monthlyEarnings = monthlyAppointments.reduce((total, apt) => {
      return total + (parseFloat(apt.sessionPrice?.replace('₹', '').replace(',', '')) || 0);
    }, 0);

    const completedSessions = allAppointments.filter(apt => apt.status === 'completed').length;

    // Get pending handshakes (completed appointments waiting for practitioner response)
    const pendingHandshakes = await Appointment.find({
      practitioner: practitioner._id,
      status: 'completed',
      handshakeStatus: 'pending_practitioner'
    }).countDocuments();

    // Format upcoming appointments for today
    const upcomingAppointments = todayAppointments.map(apt => ({
      id: apt._id,
      clientName: apt.user.name,
      time: apt.time,
      duration: apt.duration,
      sessionType: apt.sessionType
    }));

    const stats = {
      todayAppointments: todayAppointments.length,
      totalClients,
      monthlyEarnings,
      completedSessions,
      pendingHandshakes,
      upcomingAppointments
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

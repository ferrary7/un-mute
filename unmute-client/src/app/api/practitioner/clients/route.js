import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../../server/config/database";
import Practitioner from "../../../../../server/models/Practitioner";
import Appointment from "../../../../../server/models/Appointment";
import User from "../../../../../server/models/User";

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

    // Get all appointments for this practitioner
    const appointments = await Appointment.find({
      practitioner: practitioner._id
    }).populate('user').sort({ createdAt: -1 });

    // Extract unique clients and aggregate their data
    const clientsMap = new Map();

    for (const appointment of appointments) {
      if (!appointment.user) continue;

      const userId = appointment.user._id.toString();
      
      if (!clientsMap.has(userId)) {
        // Get full user data
        const userData = await User.findById(appointment.user._id);
        
        clientsMap.set(userId, {
          _id: appointment.user._id,
          name: appointment.user.name,
          email: appointment.user.email,
          location: userData?.location || appointment.user.location,
          currentConcerns: userData?.currentConcerns || [],
          totalSessions: 0,
          completedSessions: 0,
          lastSession: null,
          firstSession: appointment.date,
          status: 'active'
        });
      }

      const client = clientsMap.get(userId);
      client.totalSessions++;
      
      if (appointment.status === 'completed') {
        client.completedSessions++;
      }

      // Update last session date
      if (!client.lastSession || appointment.date > client.lastSession) {
        client.lastSession = appointment.date;
      }
    }

    // Convert map to array and determine status
    const clients = Array.from(clientsMap.values()).map(client => {
      // Determine status based on last session
      const lastSessionDate = new Date(client.lastSession);
      const now = new Date();
      const daysSinceLastSession = (now - lastSessionDate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastSession > 30) {
        client.status = 'inactive';
      } else if (client.totalSessions <= 2) {
        client.status = 'new';
      } else {
        client.status = 'active';
      }

      return client;
    });

    // Sort by last session date (most recent first)
    clients.sort((a, b) => new Date(b.lastSession) - new Date(a.lastSession));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching practitioner clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

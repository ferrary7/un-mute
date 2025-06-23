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

    // Fetch appointments that are completed and waiting for practitioner handshake response
    const handshakes = await Appointment.find({
      practitioner: practitioner._id,
      status: 'completed',
      handshakeStatus: 'pending_practitioner'
    }).populate('user', 'name email location').sort({ updatedAt: -1 });

    return NextResponse.json({ handshakes });
  } catch (error) {
    console.error("Error fetching practitioner handshakes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

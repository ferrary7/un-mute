import { NextResponse } from "next/server";
import connectDB from "../../../../../server/config/database";
import Practitioner from "../../../../../server/models/Practitioner";

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const practitioner = await Practitioner.findById(params.id);
    
    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }
    
    // Return practitioner info without sensitive data
    return NextResponse.json({
      practitioner: {
        _id: practitioner._id,
        name: practitioner.name,
        email: practitioner.email,
        specializations: practitioner.specializations,
        experience: practitioner.experience,
        location: practitioner.location,
        bio: practitioner.bio,
        hasCredentials: !!(practitioner.email && practitioner.password)
      }
    });
  } catch (error) {
    console.error("Error fetching practitioner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../../server/config/database";
import Practitioner from "../../../../../server/models/Practitioner";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
      if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find practitioner by email (assuming practitioner login uses email)
    const practitioner = await Practitioner.findOne({ 
      email: session.user.email 
    });

    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }

    return NextResponse.json({
      practitioner: {
        _id: practitioner._id,
        name: practitioner.name,
        email: practitioner.email,
        specializations: practitioner.specializations,
        rating: practitioner.rating,
        experience: practitioner.experience,
        location: practitioner.location,
        bio: practitioner.bio,
        education: practitioner.education,
        languages: practitioner.languages,
        sessionTypes: practitioner.sessionTypes,
        price: practitioner.price,
        availability: practitioner.availability,
        totalSessions: practitioner.totalSessions,
        reviews: practitioner.reviews,
        verified: practitioner.verified,
        psychoshalaVerified: practitioner.psychoshalaVerified,
        image: practitioner.image
      }
    });
  } catch (error) {
    console.error("Error fetching practitioner profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    const body = await request.json();
    await connectDB();

    // Find and update practitioner
    const practitioner = await Practitioner.findOneAndUpdate(
      { email: session.user.email },
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      practitioner
    });
  } catch (error) {
    console.error("Error updating practitioner profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

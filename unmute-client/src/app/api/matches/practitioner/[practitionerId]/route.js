import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "../../../../../../server/config/database";
import User from "../../../../../../server/models/User";
import Practitioner from "../../../../../../server/models/Practitioner";
import Match from "../../../../../../server/models/Match";

// GET a specific match by practitioner ID
export async function GET(request, { params }) {
  try {
    const { practitionerId } = params;
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const matchType = searchParams.get('type');
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query
    const query = {
      user: user._id,
      practitioner: practitionerId
    };
    
    // Add match type if provided
    if (matchType) {
      query.matchType = matchType;
    }

    // Check if match exists
    const match = await Match.findOne(query);
    
    return NextResponse.json({ 
      isMatched: !!match,
      match: match || null
    }, { status: 200 });
  } catch (error) {
    console.error("Error checking match status:", error);
    return NextResponse.json({ error: "Failed to check match status" }, { status: 500 });
  }
}

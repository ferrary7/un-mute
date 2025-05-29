import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "../../../../server/config/database";
import User from "../../../../server/models/User";
import Practitioner from "../../../../server/models/Practitioner";
import Match from "../../../../server/models/Match";

// GET all matches for the current user
export async function GET(request) {
  try {
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const matchType = searchParams.get('type');
    const hasMessaged = searchParams.get('hasMessaged');
    
    // Build the query
    const query = { user: user._id };
    
    // Filter by match type if provided
    if (matchType) {
      query.matchType = matchType;
    } else {
      // Default to liked and shortlisted
      query.matchType = { $in: ['liked', 'shortlisted'] };
    }
    
    // Filter by message status if provided
    if (hasMessaged) {
      query.hasMessaged = hasMessaged === 'true';
    }

    // Get matches with populated practitioner data
    const matches = await Match.find(query).populate('practitioner');

    // Return matches
    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

// POST to create a new match
export async function POST(request) {
  try {
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

    // Get request body
    const { practitionerId, matchType } = await request.json();
    if (!practitionerId || !matchType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate matchType
    if (!['liked', 'shortlisted', 'passed'].includes(matchType)) {
      return NextResponse.json({ error: "Invalid match type" }, { status: 400 });
    }

    // Check if practitioner exists
    const practitioner = await Practitioner.findById(practitionerId);
    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      user: user._id,
      practitioner: practitionerId
    });

    if (existingMatch) {
      // Update existing match
      existingMatch.matchType = matchType;
      await existingMatch.save();
      return NextResponse.json({ match: existingMatch }, { status: 200 });
    } else {
      // Create new match
      const newMatch = await Match.create({
        user: user._id,
        practitioner: practitionerId,
        matchType
      });
      return NextResponse.json({ match: newMatch }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}

// Helper endpoint to handle message status
export async function PATCH(request) {
  try {
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

    // Get request body
    const { practitionerId, hasMessaged } = await request.json();
    if (!practitionerId) {
      return NextResponse.json({ error: "Missing practitioner ID" }, { status: 400 });
    }

    // Find the match
    const match = await Match.findOne({
      user: user._id,
      practitioner: practitionerId
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Update message status
    match.messageStatus = {
      hasMessaged: hasMessaged === true,
      messageDate: hasMessaged ? new Date() : null
    };

    await match.save();
    return NextResponse.json({ match }, { status: 200 });
  } catch (error) {
    console.error("Error updating message status:", error);
    return NextResponse.json({ error: "Failed to update message status" }, { status: 500 });
  }
}

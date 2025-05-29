import connectDB from '../../../../../server/config/database';
import User from '../../../../../server/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ shownPractitioners: user.shownPractitioners || [] });
  } catch (error) {
    console.error("Error fetching shown practitioners:", error);
    return NextResponse.json({ error: "Failed to fetch shown practitioners" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { practitionerIds } = await request.json();
    if (!Array.isArray(practitionerIds)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current shown practitioners or initialize empty array
    const currentShown = user.shownPractitioners || [];
    
    // Add new practitioners and remove duplicates
    const updatedShown = [...new Set([...currentShown, ...practitionerIds])];
    
    // Update user record
    user.shownPractitioners = updatedShown;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving shown practitioners:", error);
    return NextResponse.json({ error: "Failed to save shown practitioners" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear the shown practitioners list
    user.shownPractitioners = [];
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting practitioners queue:", error);
    return NextResponse.json({ error: "Failed to reset practitioners queue" }, { status: 500 });
  }
}

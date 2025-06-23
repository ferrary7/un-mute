import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../../server/config/database";
import Practitioner from "../../../../../server/models/Practitioner";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { practitionerId, email, password, confirmPassword } = await request.json();
    
    if (!email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
      if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if email already exists
    const existingPractitioner = await Practitioner.findOne({ email });
    if (existingPractitioner && existingPractitioner._id.toString() !== practitionerId) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update practitioner with credentials
    const updatedPractitioner = await Practitioner.findByIdAndUpdate(
      practitionerId,
      {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedPractitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      message: "Login credentials set successfully",
      practitioner: {
        _id: updatedPractitioner._id,
        name: updatedPractitioner.name,
        email: updatedPractitioner.email
      }
    });
    
  } catch (error) {
    console.error("Error setting up practitioner credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

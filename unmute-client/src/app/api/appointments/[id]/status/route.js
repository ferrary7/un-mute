import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '../../../../../../server/config/database';
import Appointment from '../../../../../../server/models/Appointment';
import User from '../../../../../../server/models/User';

// PATCH - Update appointment status (for testing purposes)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    
    // Verify this appointment belongs to the user
    if (appointment.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Update status
    appointment.status = status;
    await appointment.save();

    // Populate practitioner data before returning
    await appointment.populate('practitioner');

    return NextResponse.json({ 
      appointment,
      message: `Appointment status updated to ${status}` 
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

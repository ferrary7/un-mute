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
    }    // Get today's date information
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentDate = today.getDate();
    
    // Helper function to parse appointment date
    const parseAppointmentDate = (dateString) => {
      // Handle formats like "Fri, Jun 27" or "2025-06-27"
      if (dateString.includes('-')) {
        // ISO format
        return new Date(dateString);
      } else {
        // Handle "Fri, Jun 27" format
        const dateWithoutDay = dateString.replace(/^[A-Za-z]+,\s*/, ''); // Remove "Fri, "
        const [monthStr, dayStr] = dateWithoutDay.split(' ');
        
        const monthMap = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        const month = monthMap[monthStr];
        const day = parseInt(dayStr);
        
        // Assume current year, but if the date is before today, assume next year
        let year = currentYear;
        const testDate = new Date(year, month, day);
        if (testDate < today) {
          year = currentYear + 1;
        }
        
        return new Date(year, month, day);
      }
    };

    // Fetch all appointments for this practitioner
    const allAppointments = await Appointment.find({
      practitioner: practitioner._id
    }).populate('user', 'name email location').sort({ createdAt: -1 });

    // Categorize appointments
    const todayAppointments = allAppointments.filter(apt => {
      const aptDate = parseAppointmentDate(apt.date);
      return aptDate.toDateString() === today.toDateString() && apt.status !== 'cancelled';
    });

    const upcomingAppointments = allAppointments.filter(apt => {
      const aptDate = parseAppointmentDate(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      return aptDate > todayStart && apt.status === 'confirmed';
    });

    const completedAppointments = allAppointments.filter(apt => 
      apt.status === 'completed'
    );

    const cancelledAppointments = allAppointments.filter(apt => 
      apt.status === 'cancelled' || apt.status === 'no-show'
    );

    const appointments = {
      today: todayAppointments,
      upcoming: upcomingAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments
    };

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching practitioner appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

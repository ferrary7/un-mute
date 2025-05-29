import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '../../../../../server/config/database';
import User from '../../../../../server/models/User';

// POST - Complete onboarding
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('Unauthorized: No valid session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }   
     const data = await request.json();
    console.log('Onboarding data received:', JSON.stringify(data));
    console.log('Session user ID:', session.user.id);
    
    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: {
          ...data,
          onboardingCompleted: true
        }
      },
      { new: true, runValidators: true }
    ).select('-hashedPassword');
    
    console.log('Updated user:', user ? 'Success' : 'Not found');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user, message: 'Onboarding completed successfully' });  } catch (error) {
    console.error('Onboarding completion error:', error);
    
    // Provide more specific error message to client if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      return NextResponse.json({ 
        error: 'Validation error', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

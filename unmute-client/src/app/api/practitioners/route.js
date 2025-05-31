import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "../../../../server/config/database";
import Practitioner from "../../../../server/models/Practitioner";
import User from "../../../../server/models/User";
import Match from "../../../../server/models/Match";

console.log("Practitioners API module loaded");

// Helper function to get recommended practitioners based on user preferences
const getRecommendedPractitioners = async (user) => {
  // Create query for filtering practitioners based on user preferences
  const query = {};
  
  // Filter by user's primary reason and desired outcomes
  const userInterests = [];
  
  // Map new preferences to specializations
  if (user.preferences?.primaryReason) {
    const reasonMap = {
      'stuck': ['life-coaching', 'career-guidance'],
      'struggling': ['therapy', 'counseling', 'mental-health'],
      'improve': ['coaching', 'personal-development'],
      'communication': ['relationship-counseling', 'communication-skills'],
      'career': ['career-coaching', 'interview-prep'],
      'unsure': ['general-counseling', 'therapy']
    };
    userInterests.push(...(reasonMap[user.preferences.primaryReason] || []));
  }
  
  if (user.preferences?.desiredOutcome && user.preferences.desiredOutcome.length > 0) {
    const outcomeMap = {
      'clarity': ['therapy', 'counseling'],
      'direction': ['life-coaching', 'career-guidance'],
      'tools': ['cognitive-behavioral-therapy', 'anxiety-management'],
      'confidence': ['confidence-coaching', 'communication-skills'],
      'habits': ['behavioral-coaching', 'habit-formation'],
      'professional': ['career-coaching', 'interview-prep']
    };
    
    user.preferences.desiredOutcome.forEach(outcome => {
      userInterests.push(...(outcomeMap[outcome] || []));
    });
  }
  
  // Filter by specializations if we have user interests
  if (userInterests.length > 0) {
    query.specializations = { $in: userInterests };
  }
  
  // Get practitioners that match the filter criteria, sorted by rating
  const practitioners = await Practitioner.find(query).sort({ rating: -1 });
  
  // If no practitioners were found with filters, return all practitioners
  if (practitioners.length === 0) {
    console.log("No practitioners found with filters, returning all practitioners");
    return await Practitioner.find().sort({ rating: -1 });
  }
  
  return practitioners;
};

// Helper function to exclude already matched practitioners
const excludeMatchedPractitioners = async (practitioners, userId) => {
  // Get all practitioner IDs the user has interacted with (liked, shortlisted, or passed)
  const userMatches = await Match.find({ user: userId });
  const interactedPractitionerIds = userMatches.map(match => match.practitioner.toString());
  
  console.log(`User has interacted with ${interactedPractitionerIds.length} practitioners`);
  
  // Filter out practitioners the user has already interacted with
  const filteredPractitioners = practitioners.filter(practitioner => 
    !interactedPractitionerIds.includes(practitioner._id.toString())
  );
  
  // If all practitioners have been filtered out, we'll return an empty array
  // and the API will respond with the allPractitionersSeen flag
  return filteredPractitioners;
};

// GET recommended practitioners for the current user
export async function GET(request) {
  try {
    console.log("GET /api/practitioners called");
    
    // Connect to database first
    await connectDB();
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    console.log("Auth session:", session ? "Found" : "Not found");
    
    if (!session || !session.user) {
      console.log("No authenticated session, returning all practitioners");
      // Instead of returning 401, just return all practitioners
      const allPractitioners = await Practitioner.find().sort({ rating: -1 }).limit(10);
      console.log(`Found ${allPractitioners.length} practitioners without auth`);
      return NextResponse.json({ practitioners: allPractitioners }, { status: 200 });
    }

    // Get user from database to access preferences
    console.log("Looking up user:", session.user.email);
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log("User not found in database, returning all practitioners");
      // Instead of 404, return all practitioners
      const allPractitioners = await Practitioner.find().sort({ rating: -1 }).limit(10);
      console.log(`Found ${allPractitioners.length} practitioners without user`);
      return NextResponse.json({ practitioners: allPractitioners }, { status: 200 });
    }    // Get recommended practitioners based on user preferences
    let practitioners = await getRecommendedPractitioners(user);
    console.log(`Found ${practitioners.length} recommended practitioners for user`);
    
    // If no practitioners were found at all, just return all practitioners
    if (practitioners.length === 0) {
      console.log("No practitioners found with recommendations, returning all");
      practitioners = await Practitioner.find().sort({ rating: -1 }).limit(10);
    }
    
    // Exclude practitioners the user has already interacted with
    const filteredPractitioners = await excludeMatchedPractitioners(practitioners, user._id);
    console.log(`After filtering matches: ${filteredPractitioners.length} practitioners`);
      // If filtering removes all practitioners, return an empty array
    // This indicates to the frontend that no more practitioners are available
    if (filteredPractitioners.length === 0) {
      console.log("All practitioners were filtered out, returning empty array");
      return NextResponse.json({ practitioners: [], allPractitionersSeen: true }, { status: 200 });
    }

    // Return practitioners
    return NextResponse.json({ practitioners: filteredPractitioners }, { status: 200 });} catch (error) {
    console.error("Error fetching practitioners:", error);
    
    try {
      console.log("Error occurred");
    } catch (fallbackError) {
      return NextResponse.json({ error: "Failed to fetch practitioners" }, { status: 500 });
    }
  }
}

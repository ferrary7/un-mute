import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "../../../../../server/config/database";
import User from "../../../../../server/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" } // For registration
      },
      async authorize(credentials, req) {
        try {
          await connectDB();
          
          const { email, password, name } = credentials;
          
          // Check if this is a registration request (has name field)
          if (name) {
            // Registration flow
            const existingUser = await User.findOne({ email });
            if (existingUser) {
              throw new Error("User already exists");
            }
            
            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new User({
              name,
              email,
              hashedPassword,
              provider: 'credentials'
            });
            
            await newUser.save();
            
            return {
              id: newUser._id.toString(),
              name: newUser.name,
              email: newUser.email,
              image: newUser.image,
              onboardingCompleted: newUser.onboardingCompleted
            };
          } else {
            // Login flow
            const user = await User.findOne({ email, provider: 'credentials' });
            if (!user) {
              throw new Error("No user found");
            }
            
            const isValid = await bcrypt.compare(password, user.hashedPassword);
            if (!isValid) {
              throw new Error("Invalid credentials");
            }
            
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.image,
              onboardingCompleted: user.onboardingCompleted
            };
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          
          // Check if user exists
          let existingUser = await User.findOne({ 
            $or: [
              { email: user.email },
              { provider: 'google', providerId: account.providerAccountId }
            ]
          });
          
          if (!existingUser) {
            // Create new user for Google sign-in
            existingUser = new User({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: 'google',
              providerId: account.providerAccountId
            });
            await existingUser.save();
          } else if (existingUser.provider !== 'google') {
            // Link Google account to existing email-based account
            existingUser.provider = 'google';
            existingUser.providerId = account.providerAccountId;
            existingUser.image = user.image;
            await existingUser.save();
          }
          
          user.onboardingCompleted = existingUser.onboardingCompleted;
          user.id = existingUser._id.toString();
          
          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },      async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        // Store the ID both in token.id and token.sub for compatibility
        token.id = user.id;
        token.sub = user.id; 
        token.onboardingCompleted = user.onboardingCompleted;
        
        console.log('JWT callback - user ID set:', user.id);
      }
      
      // Update token if session is updated
      if (trigger === "update" && session) {
        console.log('JWT update triggered with session data');
        return { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id || token.sub;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    }
  },
  pages: {
    // We don't need custom pages since we're using the AuthDialog
    signIn: undefined,
    signUp: undefined,
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

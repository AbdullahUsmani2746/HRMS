import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import User from '@/models/user.models';
import connectDB from '@/utils/dbConnect';

export const authOptions = {
    session: {
      strategy: 'jwt',
      maxAge: 60*60*24, // 1 day in seconds
      updateAge: 60*60, // 1 hour in seconds (how often the session is updated)
    },
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          await connectDB();
          const user = await User.findOne({ username: credentials.username });
          if (!user) {
            throw new Error('No user found with the provided credentials.');
          }
  
          const isValidPassword = credentials.password === user.password;
  
          if (!isValidPassword) {
            throw new Error('Invalid password.');
          }
  
          return {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isManager: user.isManager || false, // Default to false if not explicitly set
            isResolver: user.isResolver || false, // Default to false if not explicitly set

          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        // Only add the user to the token if it's the initial sign-in
        if (user) {
          token.id = user.id;
          token.username = user.username;
          token.email = user.email;
          token.role = user.role;
          token.isManager = user.isManager; // Include the isManager field
          token.isResolver = user.isResolver; // Include the isManager field

        }
        return token;
      },
      async session({ session, token }) {
        // Attach token properties directly to the session user object
        session.user = {
          id: token.id,
          username: token.username,
          email: token.email,
          role: token.role,
          isManager: token.isManager, // Include isManager in the session
          isResolver: token.isResolver, // Include isManager in the session

        };
        return session;
      },
    },
    pages: {
      signIn: '/login', // Redirect to login page
      error: '/error', // Redirect to error page
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
  
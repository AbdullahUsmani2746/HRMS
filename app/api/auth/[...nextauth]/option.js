import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import User from '@/models/user.models';
import connectDB from '@/utils/dbConnect';

export const authOptions = {
  session: {
    strategy: 'jwt',
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
        // const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        const isValidPassword = credentials.password===user.password;
        console.log(isValidPassword)
        console.log(credentials.password)
        console.log(user)


        if (!isValidPassword) {
          throw new Error('Invalid password.');
        }
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role, // SuperAdmin, Admin, User
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      console.log(session.user.username)
      return session;
    },
  },
  pages: {
    signIn: '/login', // Redirect to login page
    error: '/error', // Redirect to error page
  },
};

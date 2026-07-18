import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";

class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
    // Override type to force it into the JSON response for redirect: false
    (this as any).type = message;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new CustomAuthError("Email and password are required.");
        }
        await connectDB();
        let user = await User.findOne({ email: credentials.email });

        if (!user) {
          // Auto-signup for new users to simplify flow
          const hashedPassword = await bcrypt.hash(credentials.password as string, 10);
          user = await User.create({
            name: (credentials.email as string).split("@")[0],
            email: credentials.email,
            password: hashedPassword,
          });
          return { id: user._id.toString(), email: user.email, name: user.name };
        }

        if (!user.password) {
          throw new CustomAuthError("This email is connected to Google. Please sign in with Google.");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) {
          throw new CustomAuthError("Invalid password. Please try again.");
        }

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        
        // When a user logs in, we need to check if they have filled their profile.
        // For Credentials login, we already fetched the user, but for Google we might not have.
        // It's safest to do a quick DB check here to populate isOnboarded.
        await connectDB();
        
        let dbUser = null;
        // If the ID is a valid MongoDB ObjectId (from Credentials login)
        if (user.id && user.id.match(/^[0-9a-fA-F]{24}$/)) {
          dbUser = await User.findById(user.id);
        }
        
        // If not found by ID (Google login), search by email
        if (!dbUser && user.email) {
          dbUser = await User.findOne({ email: user.email });
        }

        // If still no user in DB, this is a first-time Google login, create the user!
        if (!dbUser && user.email) {
          dbUser = await User.create({
            name: user.name || user.email.split("@")[0],
            email: user.email,
            image: user.image,
          });
        }

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.isOnboarded = !!(dbUser.targetRole && dbUser.college);
        } else {
          token.isOnboarded = false;
        }
      }

      if (trigger === "update" && session?.isOnboarded !== undefined) {
        token.isOnboarded = session.isOnboarded;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isOnboarded = token.isOnboarded as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

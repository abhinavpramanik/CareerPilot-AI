import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

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
          throw new Error("Invalid credentials");
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
          throw new Error("Please login with Google");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
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
        const dbUser = await User.findById(user.id) || await User.findOne({ email: user.email });
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

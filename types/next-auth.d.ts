import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isOnboarded: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

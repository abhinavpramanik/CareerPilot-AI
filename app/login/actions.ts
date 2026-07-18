"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticateUser(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // In Auth.js v5, the original error message thrown in authorize() is available here:
      const customMessage = error.cause?.err?.message;
      if (customMessage) {
        return { error: customMessage };
      }

      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // Non-auth errors
    return { error: "An unexpected error occurred." };
  }
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { headers } from "next/headers";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const headersList = await headers();
  const url = headersList.get("x-forwarded-url") || headersList.get("referer") || "";
  // Check the next-url header which Next.js sets to the requested path+query
  const nextUrl = headersList.get("x-invoke-path") || "";
  const isOnboarding = nextUrl.includes("onboarding=true") || url.includes("onboarding=true");

  // Full-screen immersive layout for onboarding
  if (isOnboarding || !session.user.isOnboarded) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // Normal sidebar layout for existing users editing their profile
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={session.user} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

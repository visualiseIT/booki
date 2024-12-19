import { ClerkProvider } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <ClerkProvider>
      <div className="h-full">
        {/* Add Dashboard Navbar component here later */}
        <main className="h-full pt-20 px-4">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
} 
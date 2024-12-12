import { ClerkProvider, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

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
import { ClerkProvider } from "@clerk/nextjs";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="h-full">
        {/* Add Navbar component here later */}
        <main className="h-full pt-40">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
} 
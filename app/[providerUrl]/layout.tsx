import { Toaster } from "@/components/ui/toaster";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
} 
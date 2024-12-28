import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex items-center justify-center flex-col">
        <h1 className="text-6xl font-bold text-center mb-6">
          Streamline Your Appointments
        </h1>
        <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl">
          Create your personalized booking page and let your clients schedule appointments seamlessly. Perfect for consultants, coaches, and service providers.
        </p>
        <div className="flex gap-4">
          {userId ? (
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started
              </Link>
            </Button>
          ) : (
            <SignInButton mode="modal" afterSignInUrl="/dashboard">
              <Button size="lg">
                Get Started
              </Button>
            </SignInButton>
          )}
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Booki?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Easy Setup",
    description: "Create your booking page in minutes. No technical knowledge required.",
  },
  {
    title: "Custom Branding",
    description: "Personalize your booking page to match your brand identity.",
  },
  {
    title: "Smart Scheduling",
    description: "Automatic timezone detection and availability management.",
  },
  {
    title: "Email Notifications",
    description: "Automated confirmations and reminders for you and your clients.",
  },
  {
    title: "Calendar Sync",
    description: "Sync with your favorite calendar to avoid double bookings.",
  },
  {
    title: "Analytics",
    description: "Track your bookings and understand your business better.",
  },
]; 
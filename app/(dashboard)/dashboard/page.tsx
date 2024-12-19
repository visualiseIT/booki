import { UserButton} from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server'
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your bookings and availability</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/availability">
                Set Availability
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/services">
                Manage Services
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Upcoming Appointments</h3>
          <p className="text-gray-600 text-sm">
            No upcoming appointments
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Your Booking Page</h3>
          <p className="text-sm text-gray-600 mb-4">
            Share this link with your clients to let them book appointments
          </p>
          <Button variant="outline" className="w-full">
            Copy Link
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="text-sm text-gray-600">
            No recent activity
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const provider = useQuery(api.providers.getProvider);
  const appointments = useQuery(api.appointments.getUpcomingAppointments, {});
  const services = useQuery(
    api.services.getServices,
    provider ? { providerId: provider._id } : "skip"
  );

  if (!provider) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Complete your profile setup to start accepting bookings
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/profile"
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Complete Setup <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/services">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Services
              </Link>
            </Button>
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/availability">
                <Clock className="mr-2 h-4 w-4" />
                Set Availability
              </Link>
            </Button>
          </div>
        </Card>

        {/* Booking Link */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Booking Link</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share this link with your clients to let them book appointments
          </p>
          <Button
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/${provider.customUrl}`
              );
            }}
          >
            Copy Link
          </Button>
        </Card>

        {/* Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Services</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900" data-testid="total-services">
                {services?.length ?? 0}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Upcoming Bookings</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900" data-testid="upcoming-bookings">
                {appointments?.length ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <div className="mt-6" data-testid="appointments-section">
          {appointments?.length ? (
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <div 
                  key={appointment._id} 
                  className="flex items-center justify-between py-4"
                  data-testid="appointment-item"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appointment.date), 'MMMM d, yyyy')} at {appointment.time}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming appointments</p>
          )}
        </div>
      </Card>
    </div>
  );
}
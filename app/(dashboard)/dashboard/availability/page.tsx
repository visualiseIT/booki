"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AvailabilityPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Availability</h1>
          <p className="text-gray-600">Set your working hours and manage your schedule</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="text-center py-8 text-gray-600">
          <p>No availability set</p>
          <p className="text-sm mt-1">Set your working hours to start accepting bookings</p>
          <Button className="mt-4">Set Working Hours</Button>
        </div>
      </Card>
    </div>
  );
} 
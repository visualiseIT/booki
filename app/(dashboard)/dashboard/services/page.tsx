"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button>Add Service</Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-8 text-gray-600">
          <p>No services added yet</p>
          <p className="text-sm mt-1">Add your first service to start accepting bookings</p>
        </div>
      </Card>
    </div>
  );
} 
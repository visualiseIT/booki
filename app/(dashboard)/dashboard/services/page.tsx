"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EditServiceDialog } from "./components/EditServiceDialog";

export default function ServicesPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const provider = useQuery(api.providers.getProvider);
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  );

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Complete your profile setup to manage services
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:opacity-75">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Services</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/services/new">Add Service</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {services?.map(service => (
          <Card key={service._id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-gray-500">
                  {service.description}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {service.duration} minutes • ${service.price}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Disabled"}
                </Badge>
                <Button
                  onClick={() => {
                    setSelectedService(service);
                    setEditDialogOpen(true);
                  }}
                  data-testid="edit-service-button"
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {services?.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No services found. Click "Add Service" to create one.
          </p>
        )}
      </div>

      {selectedService && (
        <EditServiceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          service={selectedService}
        />
      )}
    </div>
  );
} 
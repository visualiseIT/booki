"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddFieldDialog } from "./components/AddFieldDialog";
import { EditFieldDialog } from "./components/EditFieldDialog";
import { Id } from "@/convex/_generated/dataModel";

export default function FormFieldsPage() {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const provider = useQuery(api.providers.getProvider);
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  );
  const fields = useQuery(api.formFields.list,
    provider ? { providerId: provider._id } : "skip"
  );
  const toggleStatus = useMutation(api.formFields.toggleStatus);

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Complete your profile setup to manage form fields
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

  const filteredFields = selectedServiceId
    ? fields?.filter(field => field.serviceId === selectedServiceId)
    : fields;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:opacity-75">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Custom Form Fields</h1>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>Add Custom Field</Button>
      </div>

      {services && services.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Filter by Service</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedServiceId === null ? "secondary" : "outline"}
              onClick={() => setSelectedServiceId(null)}
            >
              All Services
            </Button>
            {services.map(service => (
              <Button
                key={service._id}
                variant={selectedServiceId === service._id ? "secondary" : "outline"}
                onClick={() => setSelectedServiceId(service._id)}
              >
                {service.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredFields?.map(field => (
          <Card key={field._id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{field.label}</h3>
                <p className="text-sm text-gray-500">
                  Type: {field.type}
                  {field.serviceId && services && (
                    <>
                      {" • "}
                      Service:{" "}
                      {services.find(s => s._id === field.serviceId)?.name}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={field.isActive ? "default" : "secondary"}>
                  {field.isActive ? "Active" : "Disabled"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedField(field);
                    setEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStatus({ id: field._id })}
                >
                  {field.isActive ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredFields?.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No custom fields found. Click "Add Custom Field" to create one.
          </p>
        )}
      </div>

      {services && (
        <AddFieldDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          services={services}
        />
      )}

      {services && selectedField && (
        <EditFieldDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          field={selectedField}
          services={services}
        />
      )}
    </div>
  );
} 
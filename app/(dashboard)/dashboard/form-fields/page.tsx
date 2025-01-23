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

export default function FormFieldsPage() {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const provider = useQuery(api.providers.getProvider);
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  );
  const formFields = useQuery(api.formFields.list, 
    provider ? { providerId: provider._id } : "skip"
  );

  const toggleFieldStatus = useMutation(api.formFields.toggleStatus);

  if (!provider) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Custom Form Fields</h1>
        <Card className="p-6">
          <p>Please complete your provider profile first.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/profile">Complete Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const filteredFields = selectedService
    ? formFields?.filter(field => !field.serviceId || field.serviceId === selectedService)
    : formFields;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Custom Form Fields</h1>
          <p className="text-muted-foreground">
            Customize the fields in your booking form
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={selectedService === null ? "default" : "outline"}
            onClick={() => setSelectedService(null)}
          >
            All Fields
          </Button>
          {services?.map(service => (
            <Button
              key={service._id}
              variant={selectedService === service._id ? "default" : "outline"}
              onClick={() => setSelectedService(service._id)}
            >
              {service.name}
            </Button>
          ))}
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Custom Field
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredFields?.map(field => (
          <Card key={field._id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{field.label}</h3>
                  {field.required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                  {field.serviceId && services?.find(s => s._id === field.serviceId) && (
                    <Badge variant="outline">
                      {services.find(s => s._id === field.serviceId)?.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Type: {field.type}
                  {field.placeholder && ` • Placeholder: ${field.placeholder}`}
                  {field.options?.length && ` • Options: ${field.options.join(", ")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFieldStatus({ id: field._id })}
                >
                  {field.isActive ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {(!filteredFields || filteredFields.length === 0) && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No custom fields found. Add your first custom field to enhance your booking form.
            </p>
          </Card>
        )}
      </div>

      <AddFieldDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        services={services || []}
      />
    </div>
  );
} 
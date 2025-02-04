"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { AddFieldDialog } from "../../form-fields/components/AddFieldDialog";

interface ServiceFieldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    _id: Id<"services">;
    name: string;
  };
}

export function ServiceFieldsDialog({
  open,
  onOpenChange,
  service,
}: ServiceFieldsDialogProps) {
  const { toast } = useToast();
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);

  const fields = useQuery(api.formFields.getFieldsForService, {
    serviceId: service._id,
  });

  const provider = useQuery(api.providers.getProvider);
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  );

  const deleteField = useMutation(api.formFields.deleteField);
  const toggleField = useMutation(api.formFields.toggleStatus);

  const handleDelete = async (fieldId: Id<"formFields">) => {
    try {
      await deleteField({ id: fieldId });
      toast({
        title: "Field deleted",
        description: "The field has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete field. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (fieldId: Id<"formFields">) => {
    try {
      await toggleField({ id: fieldId });
      toast({
        description: "Field status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update field status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Required Fields for {service.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Manage the required fields customers need to fill when booking this service.
            </p>
            <Button
              onClick={() => setAddFieldDialogOpen(true)}
              data-testid="add-field-button"
            >
              Add Field
            </Button>
          </div>

          <div className="space-y-4">
            {fields?.map((field) => (
              <Card key={field._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{field.label}</h3>
                    <p className="text-sm text-gray-500">
                      Type: {field.type}
                      {field.required && " • Required"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={field.isActive ? "default" : "secondary"}>
                      {field.isActive ? "Active" : "Disabled"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(field._id)}
                    >
                      {field.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(field._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {fields?.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No custom fields found. Click "Add Field" to create one.
              </p>
            )}
          </div>
        </div>
      </DialogContent>

      <AddFieldDialog
        open={addFieldDialogOpen}
        onOpenChange={setAddFieldDialogOpen}
        services={services || []}
      />
    </Dialog>
  );
} 
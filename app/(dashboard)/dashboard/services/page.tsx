"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useToast } from "@/components/ui/use-toast";

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
}

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createService = useMutation(api.services.create);
  const provider = useQuery(api.providers.getProvider);
  const services = useQuery(api.services.getServices, provider ? { providerId: provider._id } : "skip");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<ServiceFormData>();

  const onSubmit = async (data: ServiceFormData) => {
    try {
      await createService(data);
      toast({
        title: "Service created",
        description: "Your service has been created successfully."
      });
      setOpen(false);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Initial Consultation"
                  {...register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what this service includes..."
                  className="min-h-[100px]"
                  {...register("description", { required: true })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    placeholder="30"
                    {...register("duration", { 
                      required: true,
                      valueAsNumber: true,
                      min: 1 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="50"
                    {...register("price", { 
                      required: true,
                      valueAsNumber: true,
                      min: 0 
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {services?.length ? (
          <div className="divide-y">
            {services.map((service) => (
              <div key={service._id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <p>{service.duration} minutes</p>
                      <p>${service.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No services added yet</p>
            <p className="text-sm mt-1">Add your first service to start accepting bookings</p>
          </div>
        )}
      </Card>
    </div>
  );
} 
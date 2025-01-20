"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notFound } from "next/navigation";
import { use } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

interface BookingFormData {
  name: string;
  email: string;
  notes?: string;
  date: string;
  time: string;
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ providerUrl: string }>;
}) {
  const { providerUrl } = use(params);
  const { toast } = useToast();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  const provider = useQuery(api.providers.getProviderByUrl, { customUrl: providerUrl });
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  );
  const createAppointment = useMutation(api.appointments.createAppointment);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<BookingFormData>();

  // Show 404 if provider not found
  if (provider === null) {
    notFound();
  }

  // Show loading state
  if (provider === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: BookingFormData, event?: React.BaseSyntheticEvent) => {
    // Prevent default form submission
    event?.preventDefault();

    if (!selectedServiceId) {
      console.error('No service selected');
      return;
    }
    
    const selectedService = services?.find(s => s._id === selectedServiceId);
    if (!selectedService) {
      console.error('Selected service not found');
      return;
    }

    try {
      // Combine date and time
      const startTime = new Date(`${data.date}T${data.time}`).toISOString();
      const endTime = new Date(`${data.date}T${data.time}`);
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration);

      const appointmentData = {
        providerId: provider._id,
        serviceId: selectedService._id,
        customerName: data.name,
        customerEmail: data.email,
        startTime,
        endTime: endTime.toISOString(),
        notes: data.notes
      };

      console.log('Creating appointment with data:', appointmentData);

      // Close the modal before making the API call
      setSelectedServiceId(null);
      
      const appointment = await createAppointment(appointmentData);
      console.log('Appointment created:', appointment);

      // Reset form after successful creation
      reset();

      // Show success toast
      toast({
        title: "Success",
        description: "Your appointment has been scheduled successfully.",
        variant: "default",
        duration: 5000,
        className: "booking-success-toast"
      });
    } catch (error) {
      console.error('Error creating appointment:', error);

      // Show detailed error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule appointment. Please try again.",
        variant: "destructive",
        duration: 5000,
        className: "booking-error-toast"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{provider.businessName}</h1>
        <p className="text-gray-600">{provider.bio}</p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
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
                  <Dialog open={selectedServiceId === service._id} onOpenChange={(open) => setSelectedServiceId(open ? service._id : null)}>
                    <DialogTrigger asChild>
                      <Button>Book</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book {service.name}</DialogTitle>
                        <DialogDescription>
                          Fill in your details to schedule an appointment.
                        </DialogDescription>
                      </DialogHeader>
                      <form 
                        onSubmit={handleSubmit(onSubmit)} 
                        className="space-y-4" 
                        id="booking-form"
                        data-testid="booking-form"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input 
                            id="name" 
                            placeholder="John Smith"
                            {...register("name", { required: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email"
                            placeholder="john@example.com"
                            {...register("email", { required: true })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input 
                              id="date" 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              {...register("date", { required: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input 
                              id="time" 
                              type="time"
                              {...register("time", { required: true })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (optional)</Label>
                          <Textarea 
                            id="notes" 
                            placeholder="Any special requests or information..."
                            {...register("notes")}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedServiceId(null);
                              reset();
                            }} 
                            type="button"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            data-testid="confirm-booking"
                          >
                            {isSubmitting ? "Confirming..." : "Confirm Booking"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No services available yet</p>
            <p className="text-sm mt-1">Please check back later</p>
          </div>
        )}
      </Card>

      <div className="text-sm text-gray-500 mt-8">
        <p>Timezone: {provider.timezone}</p>
        <p>Contact: {provider.contactEmail}</p>
      </div>
    </div>
  );
} 
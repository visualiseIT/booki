"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { BookingForm } from "../components/BookingForm";
import { notFound } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { use } from "react";

export default function ServiceBookingPage({
  params,
}: {
  params: Promise<{ providerUrl: string; serviceId: string }>;
}) {
  const { providerUrl, serviceId } = use(params);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const provider = useQuery(api.providers.getProviderByUrl, {
    customUrl: providerUrl,
  });

  const service = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  )?.find(s => s._id === serviceId);

  const appointments = useQuery(api.appointments.getAppointmentsForDay, 
    selectedDate ? {
      providerId: provider?._id ?? "",
      date: format(selectedDate, 'yyyy-MM-dd')
    } : "skip"
  );

  const businessHours = useQuery(api.businessHours.getBusinessHours,
    provider ? { providerId: provider._id } : "skip"
  );

  if (provider === null || service === null) {
    notFound();
  }

  if (!provider || !service || !businessHours) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        </div>
      </div>
    );
  }

  // Generate available time slots for the selected date
  const getTimeSlots = () => {
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
    
    if (!dayHours?.isAvailable) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = dayHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayHours.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this slot is already booked
      const isBooked = appointments?.some(apt => 
        apt.time === timeString && 
        isSameDay(new Date(apt.date), selectedDate)
      );

      if (!isBooked) {
        slots.push(timeString);
      }

      // Increment by service duration
      currentMinute += service.duration;
      while (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
    }

    return slots;
  };

  const timeSlots = getTimeSlots();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
        <p className="text-gray-600">{service.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-gray-600">
          <p>{service.duration} minutes</p>
          <p>${service.price}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const dayOfWeek = date.getDay();
              const dayHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
              return (
                !dayHours?.isAvailable || 
                date < startOfDay(new Date()) ||
                date > addDays(new Date(), 60)
              );
            }}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDate 
              ? `Available Times for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'Select a date to view available times'}
          </h2>
          {selectedDate ? (
            timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant="outline"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No available time slots for this date
              </p>
            )
          ) : (
            <p className="text-gray-500 text-center py-8">
              Please select a date first
            </p>
          )}
        </Card>
      </div>

      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {service.name}</DialogTitle>
          </DialogHeader>
          <BookingForm
            providerId={provider._id}
            serviceId={service._id}
            onSuccess={() => setBookingModalOpen(false)}
            initialDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
            initialTime={selectedTime}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 
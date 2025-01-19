"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useToast } from "@/components/ui/use-toast";

interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface WorkingHoursFormData {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const defaultWorkingHours: WorkingHoursFormData = {
  monday: { dayOfWeek: 1, isAvailable: true, startTime: "09:00", endTime: "17:00" },
  tuesday: { dayOfWeek: 2, isAvailable: true, startTime: "09:00", endTime: "17:00" },
  wednesday: { dayOfWeek: 3, isAvailable: true, startTime: "09:00", endTime: "17:00" },
  thursday: { dayOfWeek: 4, isAvailable: true, startTime: "09:00", endTime: "17:00" },
  friday: { dayOfWeek: 5, isAvailable: true, startTime: "09:00", endTime: "17:00" },
  saturday: { dayOfWeek: 6, isAvailable: false, startTime: "09:00", endTime: "17:00" },
  sunday: { dayOfWeek: 0, isAvailable: false, startTime: "09:00", endTime: "17:00" },
};

export default function AvailabilityPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const provider = useQuery(api.providers.getProvider);
  const businessHours = useQuery(api.businessHours.getBusinessHours, 
    provider ? { providerId: provider._id } : "skip"
  );
  const setBusinessHours = useMutation(api.businessHours.setBusinessHours);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting }
  } = useForm<WorkingHoursFormData>({
    defaultValues: defaultWorkingHours
  });

  const onSubmit = async (data: WorkingHoursFormData) => {
    if (!provider) return;

    try {
      // Save each day's schedule
      const days = Object.values(data);
      for (const day of days) {
        await setBusinessHours({
          providerId: provider._id,
          ...day
        });
      }

      toast({
        title: "Success",
        description: "Working hours saved successfully."
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save working hours. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderDaySchedule = (day: keyof WorkingHoursFormData, label: string) => {
    const isAvailable = watch(`${day}.isAvailable`);

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`${day}-available`}
            {...register(`${day}.isAvailable`)}
          />
          <Label htmlFor={`${day}-available`}>{label}</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${day}-start`}>Start Time</Label>
            <Input
              id={`${day}-start`}
              type="time"
              disabled={!isAvailable}
              {...register(`${day}.startTime`)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${day}-end`}>End Time</Label>
            <Input
              id={`${day}-end`}
              type="time"
              disabled={!isAvailable}
              {...register(`${day}.endTime`)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Availability</h1>
          <p className="text-gray-600">Set your working hours and manage your schedule</p>
        </div>
      </div>

      <Card className="p-6">
        {businessHours?.length ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Working Hours</h2>
                <p className="text-sm text-gray-600 mt-1">Your current availability schedule</p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Edit Hours</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Set Working Hours</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {renderDaySchedule("monday", "Monday")}
                    {renderDaySchedule("tuesday", "Tuesday")}
                    {renderDaySchedule("wednesday", "Wednesday")}
                    {renderDaySchedule("thursday", "Thursday")}
                    {renderDaySchedule("friday", "Friday")}
                    {renderDaySchedule("saturday", "Saturday")}
                    {renderDaySchedule("sunday", "Sunday")}
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)} 
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

            <div className="grid gap-4">
              {businessHours.map((hours) => (
                <div key={hours._id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][hours.dayOfWeek]}
                    </p>
                    {hours.isAvailable ? (
                      <p className="text-sm text-gray-600">
                        {hours.startTime} - {hours.endTime}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Unavailable</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No availability set</p>
            <p className="text-sm mt-1">Set your working hours to start accepting bookings</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4">Set Working Hours</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Set Working Hours</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {renderDaySchedule("monday", "Monday")}
                  {renderDaySchedule("tuesday", "Tuesday")}
                  {renderDaySchedule("wednesday", "Wednesday")}
                  {renderDaySchedule("thursday", "Thursday")}
                  {renderDaySchedule("friday", "Friday")}
                  {renderDaySchedule("saturday", "Saturday")}
                  {renderDaySchedule("sunday", "Sunday")}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setOpen(false)} 
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
        )}
      </Card>
    </div>
  );
} 
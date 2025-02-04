"use client"

import { use } from "react"
import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { BookingForm } from "../../components/BookingForm"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { format, isSameDay } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ServiceBookingPage({ params }: { params: Promise<{ providerUrl: string; serviceId: string }> }) {
  const { providerUrl, serviceId } = use(params)
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [showBookingForm, setShowBookingForm] = useState(false)

  const provider = useQuery(api.providers.getProviderByUrl, { customUrl: providerUrl })
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  )
  const service = services?.find(s => s._id === serviceId)
  
  const appointments = useQuery(api.appointments.getAppointmentsForDay, 
    provider && selectedDate 
      ? { 
          providerId: provider._id,
          date: format(selectedDate, "yyyy-MM-dd")
        } 
      : "skip"
  )

  // Calculate available slots for a given date
  const getAvailableSlotsForDate = (date: Date) => {
    if (!service) return []
    
    const slots = []
    const startHour = 9 // 9 AM
    const endHour = 17 // 5 PM
    const durationInMinutes = service.duration
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += durationInMinutes) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        
        // Check if this slot overlaps with any existing appointments
        const isBooked = appointments?.some(apt => {
          const aptTime = apt.time
          const [aptHour, aptMinute] = aptTime.split(":").map(Number)
          const aptEndMinute = aptHour * 60 + aptMinute + apt.duration
          const slotMinute = hour * 60 + minute
          const slotEndMinute = slotMinute + durationInMinutes
          
          return (
            (slotMinute >= aptHour * 60 + aptMinute && slotMinute < aptEndMinute) ||
            (slotEndMinute > aptHour * 60 + aptMinute && slotEndMinute <= aptEndMinute)
          )
        })

        if (!isBooked) {
          slots.push(timeString)
        }
      }
    }
    
    return slots
  }

  // Get available slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    return getAvailableSlotsForDate(selectedDate)
  }, [selectedDate, appointments, service])

  // Calculate day availability status
  const getDayAvailability = (date: Date) => {
    const slots = getAvailableSlotsForDate(date)
    const totalPossibleSlots = Math.floor((17 - 9) * (60 / service!.duration))
    const availabilityRatio = slots.length / totalPossibleSlots

    if (slots.length === 0) return "fully-booked"
    if (availabilityRatio > 0.7) return "mostly-available"
    return "partially-booked"
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }

  if (!provider || !service) return <div>Loading...</div>

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push(`/${providerUrl}`)}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{service.name}</h1>
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
          <div className="p-[1px] border rounded-lg bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date(), after: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }}
              className="w-full"
              modifiers={{
                fullyBooked: (date) => getDayAvailability(date) === "fully-booked",
                mostlyAvailable: (date) => getDayAvailability(date) === "mostly-available",
                partiallyBooked: (date) => getDayAvailability(date) === "partially-booked",
              }}
              modifiersClassNames={{
                fullyBooked: "bg-red-50 text-red-600",
                mostlyAvailable: "bg-green-50 text-green-600",
                partiallyBooked: "bg-yellow-50 text-yellow-600",
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center text-lg mb-4",
                caption_label: "font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-10 sm:w-14 font-normal text-sm",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: cn(
                  "h-10 w-10 sm:h-14 sm:w-14 p-0 font-normal rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  "aria-selected:opacity-100"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "border border-accent",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
              }}
            />
          </div>
          <div className="flex gap-4 justify-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Mostly Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Partially Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Fully Booked</span>
            </div>
          </div>
        </div>

        {selectedDate && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Time Slots</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableSlots.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => handleTimeSelect(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
              {availableSlots.length === 0 && (
                <p className="col-span-full text-center text-gray-500 py-4">
                  No available slots for this date
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {showBookingForm && selectedDate && selectedTime && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <BookingForm
              providerId={provider._id}
              serviceId={serviceId}
              initialDate={format(selectedDate, "yyyy-MM-dd")}
              initialTime={selectedTime}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 
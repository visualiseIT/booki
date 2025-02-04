"use client"

import { use } from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { BookingForm } from "../../components/BookingForm"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

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

  if (!provider || !service) return <div>Loading...</div>

  // Generate time slots based on provider hours and service duration
  const generateTimeSlots = () => {
    if (!selectedDate || !service) return []
    
    const slots = []
    const startHour = 9 // 9 AM
    const endHour = 17 // 5 PM
    const durationInMinutes = service.duration
    
    // Loop through each time slot based on service duration
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
          
          // Check if there's any overlap
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

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }

  return (
    <div className="container mx-auto p-6">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
          <div className="p-[1px] border rounded-lg bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date(), after: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }}
              className="w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-8 w-8 p-0",
                day: "h-8 w-8 p-0 font-normal",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>

        {selectedDate && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Time Slots</h2>
            <div className="grid grid-cols-3 gap-2">
              {generateTimeSlots().map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => handleTimeSelect(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
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
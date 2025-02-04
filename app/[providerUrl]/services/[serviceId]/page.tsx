"use client"

import { use } from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { BookingForm } from "../../components/BookingForm"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"

export default function ServiceBookingPage({ params }: { params: Promise<{ providerUrl: string; serviceId: string }> }) {
  const { providerUrl, serviceId } = use(params)
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
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
          const slotMinute = hour * 60 + minute
          const slotEndMinute = slotMinute + durationInMinutes
          const aptSlotMinute = aptHour * 60 + aptMinute
          const aptSlotEndMinute = aptSlotMinute + service.duration
          
          return (
            (slotMinute >= aptSlotMinute && slotMinute < aptSlotEndMinute) ||
            (slotEndMinute > aptSlotMinute && slotEndMinute <= aptSlotEndMinute)
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
    // Past dates are always shown as past
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return "past"
    
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

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
          <div className="p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 sm:h-16" />
              ))}
              
              {days.map(day => {
                const availability = getDayAvailability(day)
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                const isPast = availability === "past"
                
                return (
                  <Button
                    key={day.toString()}
                    variant="ghost"
                    className={cn(
                      "h-12 sm:h-16 p-0 font-normal hover:bg-gray-100 relative",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      isPast && "bg-gray-50 text-gray-400 cursor-not-allowed hover:bg-gray-50",
                      availability === "mostly-available" && !isPast && "bg-green-50 text-green-700 hover:bg-green-100",
                      availability === "partially-booked" && !isPast && "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
                      availability === "fully-booked" && !isPast && "bg-red-50 text-red-700 hover:bg-red-100",
                      isToday(day) && !isSelected && "border-2 border-primary"
                    )}
                    disabled={isPast}
                    onClick={() => !isPast && setSelectedDate(day)}
                  >
                    <time dateTime={format(day, 'yyyy-MM-dd')} className="absolute top-1 left-1 text-xs">
                      {format(day, 'd')}
                    </time>
                    {!isPast && (
                      <div className="mt-4 text-xs">
                        {availability === "mostly-available" && "Available"}
                        {availability === "partially-booked" && "Limited"}
                        {availability === "fully-booked" && "Booked"}
                      </div>
                    )}
                  </Button>
                )
              })}
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
              serviceId={serviceId as Id<"services">}
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
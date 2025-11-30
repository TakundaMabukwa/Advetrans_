"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimePicker } from "@/components/ui/time-picker"

interface DateTimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DateTimePicker({ value, onChange, placeholder = "Pick a date and time" }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [time, setTime] = React.useState(value ? format(new Date(value), "HH:mm") : "")
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    updateDateTime(selectedDate, time)
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    updateDateTime(date, newTime)
  }

  const updateDateTime = (selectedDate: Date | undefined, selectedTime: string) => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onChange(newDate.toISOString())
    }
  }

  const handleConfirm = () => {
    setOpen(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP") + (time ? ` at ${time}` : "")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={5}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => date < today}
          initialFocus
        />
        <div className="p-3 border-t space-y-3">
          <TimePicker
            value={time}
            onChange={handleTimeChange}
            placeholder="Select time"
          />
          <Button onClick={handleConfirm} className="w-full">
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
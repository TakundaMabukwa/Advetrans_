"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TimePicker({ value, onChange, placeholder = "Select time" }: TimePickerProps) {
  const [hour, setHour] = React.useState(value ? value.split(':')[0] : "")
  const [minute, setMinute] = React.useState(value ? value.split(':')[1] : "")
  const [open, setOpen] = React.useState(false)

  const handleConfirm = () => {
    if (hour && minute) {
      onChange(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`)
    }
    setOpen(false)
  }

  const displayTime = value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start" side="right" sideOffset={5}>
        <div className="space-y-4">
          <div className="text-sm font-medium">Select Time</div>
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleConfirm} className="w-full">
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
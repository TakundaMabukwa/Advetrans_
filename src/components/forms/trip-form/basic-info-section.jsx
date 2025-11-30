'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function BasicInfoSection({
  formData,
  handleChange,
  handleDateChange,
  handleSelectChange,
  costCentres,
  stopPoints,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Information</CardTitle>
        <CardDescription>Enter the basic details for this trip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="id">Trip Number *</Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="e.g., TRP-2024-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costCentre">Cost Centre *</Label>
            <Select
              value={formData.costCentre}
              onValueChange={(value) => handleSelectChange('costCentre', value)}
            >
              <SelectTrigger id="costCentre" className=" w-full">
                <SelectValue placeholder="Select cost centre" />
              </SelectTrigger>
              <SelectContent>
                {costCentres?.map((centre) => (
                  <SelectItem key={centre.id} value={centre.id}>
                    {centre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate
                    ? format(new Date(formData.startDate), 'PPP')
                    : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.startDate
                      ? new Date(formData.startDate)
                      : undefined
                  }
                  onSelect={(date) => handleDateChange('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Expected End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate
                    ? format(new Date(formData.endDate), 'PPP')
                    : 'Select end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.endDate ? new Date(formData.endDate) : undefined
                  }
                  onSelect={(date) => handleDateChange('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin *</Label>
            <Select
              value={formData.origin}
              onValueChange={(value) => handleSelectChange('origin', value)}
            >
              <SelectTrigger id="origin">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                {stopPoints?.map((point) => (
                  <SelectItem key={point.id} value={point.name}>
                    {point.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination *</Label>
            <Select
              value={formData.destination}
              onValueChange={(value) =>
                handleSelectChange('destination', value)
              }
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {stopPoints?.map((point) => (
                  <SelectItem key={point.id} value={point.name}>
                    {point.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo Description</Label>
            <Input
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              placeholder="e.g., General merchandise, Electronics, Food items"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargoWeight">Cargo Weight</Label>
            <Input
              id="cargoWeight"
              name="cargoWeight"
              value={formData.cargoWeight}
              onChange={handleChange}
              placeholder="e.g., 24 tons, 500 kg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Trip Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information about this trip, special instructions, or notes"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  )
}

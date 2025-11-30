'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MapPin } from 'lucide-react'

export function WaypointsSection({
  formData,
  handleStopPointSelection,
  handleWaypointDetailsChange,
  stopPoints,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Waypoints</CardTitle>
        <CardDescription>
          Select stop points to add as waypoints for this trip
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Available Stop Points</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stopPoints.data.map((stopPoint) => (
              <div
                key={stopPoint.id}
                className="flex items-center space-x-2 p-3 border rounded-lg"
              >
                <Checkbox
                  id={`stop-point-${stopPoint.id}`}
                  checked={formData.selectedStopPoints.includes(stopPoint.id)}
                  onCheckedChange={(checked) =>
                    handleStopPointSelection(stopPoint.id, checked)
                  }
                />
                <Label
                  htmlFor={`stop-point-${stopPoint.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {stopPoint.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {formData.waypoints.length > 0 && (
          <>
            <Separator />
            <div className="space-y-6">
              <Label className="text-base font-medium">
                Selected Waypoints Details
              </Label>
              {formData.waypoints.map((waypoint) => (
                <div
                  key={waypoint.id}
                  className="space-y-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="px-2 py-1">
                      {waypoint.location}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`waypoint-arrival-${waypoint.id}`}>
                        Expected Arrival
                      </Label>
                      <Input
                        id={`waypoint-arrival-${waypoint.id}`}
                        type="datetime-local"
                        value={waypoint.arrivalTime}
                        onChange={(e) =>
                          handleWaypointDetailsChange(
                            waypoint.id,
                            'arrivalTime',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`waypoint-departure-${waypoint.id}`}>
                        Expected Departure
                      </Label>
                      <Input
                        id={`waypoint-departure-${waypoint.id}`}
                        type="datetime-local"
                        value={waypoint.departureTime}
                        onChange={(e) =>
                          handleWaypointDetailsChange(
                            waypoint.id,
                            'departureTime',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`waypoint-notes-${waypoint.id}`}>
                      Notes
                    </Label>
                    <Textarea
                      id={`waypoint-notes-${waypoint.id}`}
                      value={waypoint.notes}
                      onChange={(e) =>
                        handleWaypointDetailsChange(
                          waypoint.id,
                          'notes',
                          e.target.value
                        )
                      }
                      placeholder="Additional information about this waypoint"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {formData.waypoints.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No waypoints have been selected yet.</p>
            <p className="text-sm">
              Select stop points above to add them as waypoints.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

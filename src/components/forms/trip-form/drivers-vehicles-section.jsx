'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Users, Truck } from 'lucide-react'
import DetailCard from '@/components/ui/detail-card'
import { useAuth } from '@/context/auth-context/context'
import { useGlobalContext } from '@/context/global-context/context'

export function DriversVehiclesSection({
  formData,
  handleVehicleDriverChange,
  addVehicleDriver,
  removeVehicleDriver,
  handleVehicleTrailerChange,
  addVehicleTrailer,
  removeVehicleTrailer,
  handleVehicleChange,
  addVehicle,
  removeVehicle,
  drivers,
  vehicles,
  t,
}) {
  const { current_user } = useAuth()
  const { cost_centres } = useGlobalContext()

  console.log('current_user', current_user?.currentUser?.costCentre)
  const selectedCostCentre =
    cost_centres?.data.find((c) => c.id === formData.costCentre)?.name ||
    current_user?.currentUser?.costCentre

  // Show all vehicles and only available drivers
  const horses = vehicles || []
  const trailers = vehicles ? vehicles.filter((v) => v.type === 'trailer') : []
  const available_drivers = drivers ? drivers.filter(d => d.available === true) : []
  const available_vehicles = horses
  const available_trailers = trailers

  // Function to get vehicles assigned to a specific driver
  const getDriverVehicles = (driverId) => {
    if (!driverId) return []
    return vehicles.filter(v => v.driver_id === driverId)
  }

  return (
    <div className="space-y-6">
      <DetailCard
        title={'Vehicles, Drivers & Trailers'}
        description={
          'Assign vehicles with their drivers and trailers to this trip'
        }
      >
        {formData.vehicleAssignments.map((vehicleAssignment, vehicleIndex) => (
          <Card key={`vehicle-${vehicleIndex}`} className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    {vehicleIndex === 0
                      ? 'Primary Vehicle'
                      : `Vehicle ${vehicleIndex + 1}`}
                  </CardTitle>
                </div>
                {formData.vehicleAssignments.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVehicle(vehicleIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">


              {/* Drivers Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label className="text-base font-medium">
                    Drivers for this Vehicle
                  </Label>
                </div>

                {vehicleAssignment.drivers.map((driver, driverIndex) => (
                  <div
                    key={`vehicle-${vehicleIndex}-driver-${driverIndex}`}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="px-2 py-1">
                        {driverIndex === 0
                          ? 'Primary Driver'
                          : `Driver ${driverIndex + 1}`}
                      </Badge>
                      {vehicleAssignment.drivers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeVehicleDriver(vehicleIndex, driverIndex)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Select
                        value={driver.id}
                        onValueChange={(value) =>
                          handleVehicleDriverChange(
                            vehicleIndex,
                            driverIndex,
                            value
                          )
                        }
                      >
                        <SelectTrigger className="w-full border-[#d3d3d3]">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {available_drivers.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.first_name} - {d.license_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addVehicleDriver(vehicleIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Driver to this Vehicle
                </Button>
              </div>

              <Separator />

              {/* Vehicle Selection - Shows only vehicles assigned to selected drivers */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <Label className="text-base font-medium">
                    Available Vehicles
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`vehicle-${vehicleIndex}`}>
                    Select Vehicle
                  </Label>
                  <Select
                    value={vehicleAssignment.vehicle.id}
                    onValueChange={(value) =>
                      handleVehicleChange(vehicleIndex, value)
                    }
                  >
                    <SelectTrigger
                      id={`vehicle-${vehicleIndex}`}
                      className="w-full border-[#d3d3d3]"
                    >
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const assignedDriverIds = vehicleAssignment.drivers
                          .map(d => d.id)
                          .filter(id => id)
                        const availableVehicles = assignedDriverIds.length > 0
                          ? vehicles.filter(v => assignedDriverIds.includes(v.driver_id))
                          : []
                        return availableVehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.model} ({v.regNumber})
                          </SelectItem>
                        ))
                      })()
                      }
                    </SelectContent>
                  </Select>
                  {vehicleAssignment.drivers.some(d => d.id) && 
                   !vehicles.some(v => vehicleAssignment.drivers.map(d => d.id).includes(v.driver_id)) && (
                    <p className="text-sm text-muted-foreground">
                      No vehicles assigned to selected drivers
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Trailers Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <Label className="text-base font-medium">
                    Trailers for this Vehicle
                  </Label>
                </div>

                {vehicleAssignment.trailers.map((trailer, trailerIndex) => (
                  <div
                    key={`vehicle-${vehicleIndex}-trailer-${trailerIndex}`}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="px-2 py-1">
                        Trailer {trailerIndex + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeVehicleTrailer(vehicleIndex, trailerIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select
                      value={trailer.id}
                      onValueChange={(value) =>
                        handleVehicleTrailerChange(
                          vehicleIndex,
                          trailerIndex,
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trailer" />
                      </SelectTrigger>
                      <SelectContent>
                        {available_trailers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.model} ({t.regNumber}) - {t.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addVehicleTrailer(vehicleIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Trailer to this Vehicle
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addVehicle}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Another Vehicle
        </Button>
      </DetailCard>
    </div>
  )
}
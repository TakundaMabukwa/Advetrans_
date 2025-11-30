'use client'

// react
import { useEffect, useState, useRef } from 'react'

// leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// context
import { useGlobalContext } from '@/context/global-context/context'

// components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

// icons
import { MapPin, Truck, User, Calendar, Clock } from 'lucide-react'

// hooks
import { getTripStatusBadge } from '@/hooks/use-badges'
import PageLoader from '../ui/loader'
import { ClipLoader } from 'react-spinners'
import DetailCard from '../ui/detail-card'
import HighRiskOverlay from './high-risk-overlay'
// Create custom marker icon
const createCustomIcon = (status) => {
  if (typeof window === 'undefined') return null

  const L = require('leaflet')
  const colors = {
    'in-progress': '#3b82f6', // blue
    delayed: '#ef4444', // red
    completed: '#10b981', // green
    pending: '#f59e0b', // amber
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
        background-color: ${colors[status] || '#6b7280'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}
// async function geocodeAddress(address) {
//   const response = await fetch(
//     `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//       address
//     )}&format=json`
//   )

//   const data = await response.json()

//   if (data.length > 0) {
//     const { lat, lon } = data[0]
//     return { lat: parseFloat(lat), lng: parseFloat(lon) }
//   } else {
//     throw new Error('Address not found')
//   }
// }
async function geocodeAddress(address) {
  if (!address) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json`
    )
    const data = await res.json()
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (err) {
    console.error('Geocoding error:', err)
  }
  return null
}

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function TripMapView() {
  const { trips } = useGlobalContext()
  const [markers, setMarkers] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!trips?.data?.length) return

    const processTrips = async () => {
      const collectedMarkers = []

      for (const trip of trips.data) {
        const label = trip.id
        //console.log('label', label)
        // Geocode pickup locations
        for (const pickup of trip.pickupLocations || []) {
          console.log('pickup', pickup)
          const coords = await geocodeAddress(pickup.address)
          if (coords) {
            collectedMarkers.push({
              ...coords,
              label: `${label} - Pickup`,
              address: pickup.address,
            })
          }
        }

        // Geocode dropoff locations
        for (const dropoff of trip.dropoffLocations || []) {
          const coords = await geocodeAddress(dropoff.address)
          if (coords) {
            collectedMarkers.push({
              ...coords,
              label: `${label} - Dropoff`,
              address: dropoff.address,
            })
          }
        }

        // Geocode stop points if present
        for (const stop of trip.selectedStopPoints || []) {
          const coords = await geocodeAddress(stop.address)
          if (coords) {
            collectedMarkers.push({
              ...coords,
              label: `${label} - Stop`,
              address: stop.address,
            })
          }
        }
      }

      setMarkers(collectedMarkers)
    }

    processTrips()
  }, [trips])
  console.log(markers)
  // useEffect(() => {
  //   geocodeAddress('1600 Amphitheatre Parkway, Mountain View, CA')
  //     .then((coords) => console.log(coords)) // { lat: 37.422, lng: -122.084 }
  //     .catch(console.error)
  // }, [])

  return (
    <div className="w-full h-[100vh] rounded-md overflow-hidden">
      {trips?.data && markers?.length > 0 ? (
        <div className="w-full h-full relative">
          <MapContainer
            center={[-26.2041, 28.0473]}
            zoom={10}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              // attribution="&copy; OpenStreetMap contributors"
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              //url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* High-risk areas overlay */}
            <HighRiskOverlay />
            
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                icon={createCustomIcon(marker.status)}
                position={[marker.lat, marker.lng]}
              >
                <Popup>
                  <strong>{marker.label}</strong>
                  <br />
                  {marker.address}
                </Popup>
              </Marker>
            ))}

            {/* <Marker position={[-26.2041, 28.0473]}>
          <Popup>Hello from Johannesburg!</Popup>
        </Marker> */}
          </MapContainer>
          <div className="w-full h-[200px]  z-10 absolute bottom-0 left-0 ">
            <ScrollArea className="w-full h-[200px] whitespace-nowrap ">
              <div className="flex space-x-4 p-4 overflow-x-auto">
                {trips?.data?.map((trip) => (
                  <div key={trip.id} className="w-[350px] h-full">
                    <DetailCard
                      title={trip.id}
                      description={trip.clientDetails.name}
                    >
                      {trip.id}
                    </DetailCard>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/70 z-50">
          <ClipLoader color="#000" size={50} />
        </div>
      )}
    </div>
  )
}

// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import dynamic from 'next/dynamic'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { MapPin, Truck, User, Calendar, Clock } from 'lucide-react'
// import { useGlobalContext } from '@/context/global-context/context'
// import { getTripStatusBadge } from '@/hooks/use-badges'

// // Dynamically import Leaflet components to avoid SSR issues
// const MapContainer = dynamic(
//   () => import('react-leaflet').then((mod) => mod.MapContainer),
//   { ssr: false }
// )
// const TileLayer = dynamic(
//   () => import('react-leaflet').then((mod) => mod.TileLayer),
//   { ssr: false }
// )
// const Marker = dynamic(
//   () => import('react-leaflet').then((mod) => mod.Marker),
//   { ssr: false }
// )
// const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
//   ssr: false,
// })

// const TripMapView = () => {
// const { trips } = useGlobalContext()
// const [selectedTrip, setSelectedTrip] = useState(null)
// const [isClient, setIsClient] = useState(false)
// const mapRef = useRef(null)

//   // Ensure component only renders on client side
//   useEffect(() => {
//     setIsClient(true)
//   }, [])

//   // Generate sample trip data with coordinates for demonstration
//   const sampleTrips = [
//     {
//       id: 'TRP001',
//       costCentre: 'North Region',
//       clientDetails: { name: 'ABC Logistics' },
//       origin: 'New York, NY',
//       destination: 'Boston, MA',
//       startDate: '2024-01-15',
//       status: 'in-progress',
//       progress: 65,
//       coordinates: [40.7128, -74.006], // New York
//       vehicleAssignments: [
//         {
//           vehicle: { id: 'V001', model: 'Ford Transit' },
//           drivers: [{ name: 'John Smith' }],
//         },
//       ],
//       estimatedDuration: '4h 30m',
//       distance: '215 km',
//     },
//     {
//       id: 'TRP002',
//       costCentre: 'South Region',
//       clientDetails: { name: 'XYZ Transport' },
//       origin: 'Los Angeles, CA',
//       destination: 'San Diego, CA',
//       startDate: '2024-01-16',
//       status: 'delayed',
//       progress: 30,
//       coordinates: [34.0522, -118.2437], // Los Angeles
//       vehicleAssignments: [
//         {
//           vehicle: { id: 'V002', model: 'Mercedes Sprinter' },
//           drivers: [{ name: 'Sarah Johnson' }],
//         },
//       ],
//       estimatedDuration: '2h 15m',
//       distance: '120 km',
//     },
//     {
//       id: 'TRP003',
//       costCentre: 'East Region',
//       clientDetails: { name: 'Fast Freight Co' },
//       origin: 'Chicago, IL',
//       destination: 'Detroit, MI',
//       startDate: '2024-01-17',
//       status: 'completed',
//       progress: 100,
//       coordinates: [41.8781, -87.6298], // Chicago
//       vehicleAssignments: [
//         {
//           vehicle: { id: 'V003', model: 'Chevrolet Express' },
//           drivers: [{ name: 'Mike Wilson' }],
//         },
//       ],
//       estimatedDuration: '5h 45m',
//       distance: '280 km',
//     },
//     {
//       id: 'TRP004',
//       costCentre: 'West Region',
//       clientDetails: { name: 'Premium Logistics' },
//       origin: 'Seattle, WA',
//       destination: 'Portland, OR',
//       startDate: '2024-01-18',
//       status: 'pending',
//       progress: 0,
//       coordinates: [47.6062, -122.3321], // Seattle
//       vehicleAssignments: [
//         {
//           vehicle: { id: 'V004', model: 'Nissan NV' },
//           drivers: [{ name: 'Lisa Brown' }],
//         },
//       ],
//       estimatedDuration: '3h 20m',
//       distance: '175 km',
//     },
//   ]

//   // Use sample data for now, replace with actual trips data when available
//   const tripsData = trips?.data?.length > 0 ? trips.data : sampleTrips

//   // Debug logging
//   console.log('TripMapView - trips context:', trips)
//   console.log('TripMapView - tripsData:', tripsData)

//   // Filter and process trips to ensure they have valid coordinates
//   const processedTrips = tripsData.map((trip) => {
//     // If trip doesn't have coordinates, generate fallback coordinates based on origin/destination
//     if (
//       !trip.coordinates ||
//       !Array.isArray(trip.coordinates) ||
//       trip.coordinates.length !== 2
//     ) {
//       // Generate fallback coordinates based on trip ID or use default
//       const fallbackCoords = [
//         39.8283 + (Math.random() - 0.5) * 20, // Random latitude around center of USA
//         -98.5795 + (Math.random() - 0.5) * 40, // Random longitude around center of USA
//       ]
//       console.log(
//         `Trip ${trip.id} missing coordinates, using fallback:`,
//         fallbackCoords
//       )
//       return {
//         ...trip,
//         coordinates: fallbackCoords,
//         hasFallbackCoords: true,
//       }
//     }
//     return trip
//   })

//   // Filter out trips that still don't have valid coordinates
//   const validTrips = processedTrips.filter(
//     (trip) =>
//       trip.coordinates &&
//       Array.isArray(trip.coordinates) &&
//       trip.coordinates.length === 2 &&
//       typeof trip.coordinates[0] === 'number' &&
//       typeof trip.coordinates[1] === 'number' &&
//       !isNaN(trip.coordinates[0]) &&
//       !isNaN(trip.coordinates[1])
//   )

//   console.log('TripMapView - validTrips:', validTrips)

//   const handleTripSelect = (trip) => {
//     setSelectedTrip(trip)
//     // Center map on selected trip
//     if (mapRef.current && trip.coordinates) {
//       mapRef.current.setView(trip.coordinates, 12)
//     }
//   }

//   const handleMarkerClick = (trip) => {
//     setSelectedTrip(trip)
//   }

// // Create custom marker icon
// const createCustomIcon = (status) => {
//   if (typeof window === 'undefined') return null

//   const L = require('leaflet')
//   const colors = {
//     'in-progress': '#3b82f6', // blue
//     delayed: '#ef4444', // red
//     completed: '#10b981', // green
//     pending: '#f59e0b', // amber
//   }

//   return L.divIcon({
//     className: 'custom-marker',
//     html: `<div style="
//       background-color: ${colors[status] || '#6b7280'};
//       width: 20px;
//       height: 20px;
//       border-radius: 50%;
//       border: 3px solid white;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//       cursor: pointer;
//     "></div>`,
//     iconSize: [20, 20],
//     iconAnchor: [10, 10],
//   })
// }

//   const TripCard = ({ trip, isSelected, onClick }) => (
//     <Card
//       className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
//         isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
//       }`}
//       onClick={() => onClick(trip)}
//     >
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg">{trip.id}</CardTitle>
//           <div className="flex items-center gap-2">
//             {getTripStatusBadge(trip.status)}
//             {trip.hasFallbackCoords && (
//               <Badge variant="outline" className="text-xs">
//                 Estimated Location
//               </Badge>
//             )}
//           </div>
//         </div>
//         <p className="text-sm text-muted-foreground">{trip.costCentre}</p>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <div className="space-y-2">
//           <div className="flex items-center gap-2 text-sm">
//             <MapPin className="h-4 w-4 text-gray-500" />
//             <span className="font-medium">Route:</span>
//           </div>
//           <div className="ml-6 space-y-1">
//             <p className="text-sm">From: {trip.origin}</p>
//             <p className="text-sm">To: {trip.destination}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-4 text-sm">
//           <div className="flex items-center gap-1">
//             <Truck className="h-4 w-4 text-gray-500" />
//             <span>{trip.vehicleAssignments?.length || 0} vehicles</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <User className="h-4 w-4 text-gray-500" />
//             <span>
//               {trip.vehicleAssignments?.reduce(
//                 (total, assignment) =>
//                   total + (assignment.drivers?.length || 0),
//                 0
//               )}{' '}
//               drivers
//             </span>
//           </div>
//         </div>

//         <div className="flex items-center gap-4 text-sm">
//           <div className="flex items-center gap-1">
//             <Calendar className="h-4 w-4 text-gray-500" />
//             <span>{trip.startDate}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Clock className="h-4 w-4 text-gray-500" />
//             <span>{trip.estimatedDuration}</span>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span>Progress</span>
//             <span>{trip.progress}%</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className={`h-2 rounded-full transition-all duration-300 ${
//                 trip.status === 'delayed'
//                   ? 'bg-red-500'
//                   : trip.status === 'completed'
//                   ? 'bg-green-500'
//                   : trip.status === 'in-progress'
//                   ? 'bg-blue-500'
//                   : 'bg-amber-500'
//               }`}
//               style={{ width: `${trip.progress}%` }}
//             />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )

//   if (!isClient) {
//     return (
//       <div className="flex h-[calc(100vh-200px)] gap-4">
//         <div className="flex-1 bg-gray-100 rounded-lg animate-pulse" />
//         <div className="w-80 flex flex-col">
//           <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse" />
//           <div className="flex-1 space-y-4">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // h-[calc(100vh-200px)]

//   return (
//     <div
//       className="flex

//     h-full
//     gap-4"
//     >
//       {/* Map Section */}
//       <div className="flex-1 relative">
//         <MapContainer
//           ref={mapRef}
//           center={[39.8283, -98.5795]} // Center of USA
//           zoom={4}
//           className="h-full w-full rounded-lg"
//           style={{ minHeight: '500px' }}
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

// {validTrips.map((trip) => (
//   <Marker
//     key={trip.id}
//     position={trip.coordinates}
//     icon={createCustomIcon(trip.status)}
//     eventHandlers={{
//       click: () => handleMarkerClick(trip),
//     }}
//   >
//     <Popup>
//       <div className="p-2">
//         <h3 className="font-semibold">{trip.id}</h3>
//         <p className="text-sm text-gray-600">
//           {trip.origin} → {trip.destination}
//         </p>
//         <div className="flex items-center gap-2 mt-2">
//           <Badge
//             variant={
//               trip.status === 'delayed' ? 'destructive' : 'default'
//             }
//           >
//             {trip.status}
//           </Badge>
//           {trip.hasFallbackCoords && (
//             <Badge variant="outline" className="text-xs">
//               Estimated Location
//             </Badge>
//           )}
//         </div>
//       </div>
//     </Popup>
//   </Marker>
// ))}
//         </MapContainer>
//       </div>

//       {/* Trip Cards Aside */}
//       <div className="w-80 flex flex-col">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-semibold">Active Trips</h2>
//           <Badge variant="secondary">{validTrips.length} trips</Badge>
//         </div>

//         <div className="flex-1 overflow-y-auto pr-4">
//           <div className="space-y-4">
//             {validTrips.map((trip) => (
//               <TripCard
//                 key={trip.id}
//                 trip={trip}
//                 isSelected={selectedTrip?.id === trip.id}
//                 onClick={handleTripSelect}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TripMapView
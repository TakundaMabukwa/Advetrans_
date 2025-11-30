'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
// import 'mapbox-gl/dist/mapbox-gl.css'
import DetailCard from '../ui/detail-card'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

const TripViewMap = ({ trips }) => {
  console.log('trips :>> ', trips)
  const mapContainerRef = useRef(null)
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [28.0473, -26.2041], // Johannesburg
      zoom: 12,
    })

    const popup = new mapboxgl.Popup({ offset: 25 }).setText('test')

    new mapboxgl.Marker({
      scale: 0.6,
    })
      .setLngLat([28.0473, -26.2041])
      .setPopup(popup)
      .addTo(map)

    map.on('load', () => {
      map.addSource('ports', {
        type: 'geojson',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson',
      })

      map.addLayer({
        id: 'ports-layer',
        type: 'fill',
        source: 'ports',
        paint: {
          'fill-color': 'orange',
          'circle-radius': 4,
          'circle-color': '#007cbf',
        },
      })
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    return () => map.remove()
  }, [])
  return (
    <div className="relative w-full h-screen rounded-md overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      <ScrollArea className="w-full ">
        <div className="absolute bottom-0 left-0 right-0  flex flex-row  overflow-x-auto gap-4  z-2 p-4 space-y-4 whitespace-nowrap">
          {trips.map((trip) => (
            <div key={trip.id} className="w-[350px]">
              <DetailCard
                // className="shadow-sm h-[250px]"
                title={`${trip.id} - ${trip.status}`}
                description={trip.clientDetails.name}
              >
                {/* <CardHeader>
              <CardTitle className="text-base">
                {trip.id} - <span className="capitalize">{trip.status}</span>
              </CardTitle>
            </CardHeader> */}
                {/* <CardContent className="text-sm space-y-1"> */}
                {/* <p>
                  <strong>Cargo:</strong> {trip.cargo} ({trip.cargoWeight}kg)
                </p>
                <p>
                  <strong>Driver:</strong> {trip.driver}
                </p>
                <p>
                  <strong>Vehicle:</strong> {trip.vehicle}
                </p> */}
                {/* <p>
                  {trip.id} - <span className="capitalize">{trip.status}</span>
                </p> */}
                {/* <p>
                  <strong>Client:</strong> {trip.clientDetails.name}
                </p> */}
                {/* <p>
                  <strong>Address:</strong> {trip.clientDetails.address}
                </p>
                <p>
                  <strong>Contact:</strong> {trip.clientDetails.contactPerson} (
                  {trip.clientDetails.phone})
                </p> */}
                {/* <p>
                <strong>Start:</strong> {trip.startDate}
              </p>
              <p>
                <strong>End:</strong> {trip.endDate}
              </p> */}
                {/* </CardContent> */}
              </DetailCard>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default TripViewMap
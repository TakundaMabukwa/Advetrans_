// components/TechMap.tsx
'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface TechMapProps {
    lat: number;
    lng: number;
    name: string;
    routeCoordinates?: number[][];
}

export const TechMap = ({ lat, lng, name, routeCoordinates }: TechMapProps) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        const mapCenter = routeCoordinates && routeCoordinates.length > 0 
            ? routeCoordinates[0] 
            : [lng, lat];

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: mapCenter,
            zoom: 12,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Add driver location marker
        new mapboxgl.Marker({ color: '#22c55e' })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setText(name))
            .addTo(map.current);

        // Add route if coordinates provided
        const addRoute = () => {
            console.log('Adding route with coordinates:', routeCoordinates);
            if (!map.current || !routeCoordinates || routeCoordinates.length === 0) {
                console.log('No route to add - missing map, coordinates, or empty array');
                return;
            }

            try {
                // Add route source
                map.current.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: routeCoordinates
                        }
                    }
                });

                // Add route layer
                map.current.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#ef4444',
                        'line-width': 6,
                        'line-opacity': 0.8
                    }
                });

                // Add start point with custom icon
                const startEl = document.createElement('div');
                startEl.innerHTML = '🚩';
                startEl.style.fontSize = '24px';
                startEl.style.cursor = 'pointer';
                
                new mapboxgl.Marker(startEl)
                    .setLngLat(routeCoordinates[0])
                    .setPopup(new mapboxgl.Popup().setHTML('<div>Route Start</div>'))
                    .addTo(map.current);

                // Add end point with custom icon
                const endEl = document.createElement('div');
                endEl.innerHTML = '🏁';
                endEl.style.fontSize = '24px';
                endEl.style.cursor = 'pointer';
                
                new mapboxgl.Marker(endEl)
                    .setLngLat(routeCoordinates[routeCoordinates.length - 1])
                    .setPopup(new mapboxgl.Popup().setHTML('<div>Route End</div>'))
                    .addTo(map.current);

                console.log('Route added successfully');
            } catch (error) {
                console.error('Error adding route:', error);
            }
        };

        // Always try to add route after map loads
        map.current.on('load', () => {
            console.log('Map loaded, checking for route coordinates:', routeCoordinates);
            if (routeCoordinates && routeCoordinates.length > 0) {
                console.log('Adding route on map load');
                addRoute();
            } else {
                console.log('No route coordinates available on map load');
            }
        });

        // Also try immediately if map is already loaded
        if (routeCoordinates && routeCoordinates.length > 0) {
            console.log('Route coordinates available, trying immediate add');
            setTimeout(() => {
                if (map.current && map.current.isStyleLoaded()) {
                    console.log('Map style loaded, adding route immediately');
                    addRoute();
                }
            }, 1000);
        } else {
            console.log('No route coordinates for immediate add');
        }
    }, [lat, lng, name, routeCoordinates]);

    return <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />;
};

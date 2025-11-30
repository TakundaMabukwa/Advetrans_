"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route } from 'lucide-react';

interface RoutePreviewMapProps {
  origin: string;
  destination: string;
  routeData?: any;
  stopPoints?: Array<{
    id: number;
    name: string;
    coordinates: number[][];
  }> | string;
  getStopPointsData?: () => Promise<any[]>;
  driverLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
  clientLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
  selectedClient?: any;
  tripId?: string;
  preserveOrder?: boolean;
}

export function RoutePreviewMap({ origin, destination, routeData, stopPoints = [], getStopPointsData, driverLocation, clientLocation, selectedClient, tripId, preserveOrder = false }: RoutePreviewMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const lastUpdateRef = useRef<string>('');
  const cacheRef = useRef<Map<string, any>>(new Map());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || map.current) return;
      
      // Additional check to ensure container is valid
      if (!mapContainer.current || typeof mapContainer.current !== 'object') {
        console.error('Map container is not valid');
        return;
      }
      
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [28.0473, -26.2041],
          zoom: 6
        });

        map.current.on('load', () => {
          setMapLoaded(true);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Longer delay to ensure DOM is fully ready
    const timer = setTimeout(initializeMap, 300);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || (!origin && !destination && !selectedClient?.coordinates)) return;

    // Create cache key to prevent duplicate updates
    const stopPointsKey = Array.isArray(stopPoints) ? stopPoints.map(p => p?.id || p).join(',') : stopPoints || '';
    const driverKey = driverLocation ? `${driverLocation.lat}-${driverLocation.lng}-${driverLocation.name}` : '';
    const getStopPointsKey = getStopPointsData ? 'hasStopPoints' : 'noStopPoints';
    const preserveOrderKey = preserveOrder ? 'preserve' : 'optimize';
    const cacheKey = `${origin}-${destination}-${stopPointsKey}-${selectedClient?.id || ''}-${tripId || ''}-${driverKey}-${getStopPointsKey}-${preserveOrderKey}`;
    
    // Always update if locations changed or if we have async stop points
    const shouldUpdate = lastUpdateRef.current !== cacheKey || stopPoints === 'async';
    
    if (!shouldUpdate) return;
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Debounce updates to prevent flickering
    updateTimeoutRef.current = setTimeout(() => {
      lastUpdateRef.current = cacheKey;
      updateRoute();
    }, 200);

    const updateRoute = async () => {
      if (!map.current || !mapLoaded || !map.current.isStyleLoaded()) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      try {
        let originCoords = null;
        let destCoords = null;
        
        // Geocode locations if available
        if (origin && destination) {
          [originCoords, destCoords] = await Promise.all([
            geocodeLocation(origin),
            geocodeLocation(destination)
          ]);
        }

        // Add client route if available
        if (selectedClient?.coordinates) {
          try {
            const coords = selectedClient.coordinates.split(' ')
              .filter(coord => coord.trim())
              .map(coord => {
                const [lng, lat, alt] = coord.split(',')
                return [parseFloat(lng), parseFloat(lat)]
              })
              .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]))
            
            if (coords.length > 1) {
              // Remove existing client route
              if (map.current && map.current.getSource('client-route')) {
                map.current.removeLayer('client-route')
                map.current.removeSource('client-route')
              }
              
              // Add client route as connected line
              if (map.current) {
                map.current.addSource('client-route', {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: coords
                    }
                  }
                })
                
                map.current.addLayer({
                id: 'client-route',
                type: 'line',
                source: 'client-route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#8b5cf6',
                  'line-width': 4
                }
              })
              }
              

            }
          } catch (error) {
            console.error('Error plotting client route:', error)
          }
        }

        // Add driver location marker if available
        if (driverLocation) {
          const marker = new (await import('mapbox-gl')).default.Marker({ color: 'blue' })
            .setLngLat([driverLocation.lng, driverLocation.lat])
            .setPopup(new (await import('mapbox-gl')).default.Popup().setText(`Driver: ${driverLocation.name}`))
            .addTo(map.current);
          markersRef.current.push(marker);

          // Get route from driver to loading location
          const driverToLoadingRoute = await getRoute(
            { lat: driverLocation.lat, lng: driverLocation.lng },
            originCoords
          );

          if (driverToLoadingRoute && map.current.isStyleLoaded()) {
            if (map.current.getSource('driver-route')) {
              map.current.removeLayer('driver-route');
              map.current.removeSource('driver-route');
            }

            map.current.addSource('driver-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: driverToLoadingRoute
              }
            });

            map.current.addLayer({
              id: 'driver-route',
              type: 'line',
              source: 'driver-route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1e40af',
                'line-width': 3,
                'line-dasharray': [2, 2]
              }
            });
          }
        }

        // Add markers if coordinates are available
        if (originCoords && origin && map.current) {
          const marker = new (await import('mapbox-gl')).default.Marker({ color: 'green' })
            .setLngLat([originCoords.lng, originCoords.lat])
            .setPopup(new (await import('mapbox-gl')).default.Popup().setText(origin))
            .addTo(map.current);
          markersRef.current.push(marker);
        }

        if (destCoords && destination && map.current) {
          const marker = new (await import('mapbox-gl')).default.Marker({ color: 'blue' })
            .setLngLat([destCoords.lng, destCoords.lat])
            .setPopup(new (await import('mapbox-gl')).default.Popup().setText(destination))
            .addTo(map.current);
          markersRef.current.push(marker);
        }

        // Add stop point markers
        if (Array.isArray(stopPoints) && stopPoints.length > 0) {
          const mapboxgl = (await import('mapbox-gl')).default;
          stopPoints.forEach((stopPoint, index) => {
            const coords = stopPoint.coordinates;
            const avgLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
            const avgLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
            
            // Calculate radius from coordinate bounds
            const lngs = coords.map(coord => coord[0]);
            const lats = coords.map(coord => coord[1]);
            const maxLng = Math.max(...lngs);
            const minLng = Math.min(...lngs);
            const maxLat = Math.max(...lats);
            const minLat = Math.min(...lats);
            const radiusKm = Math.max(
              (maxLng - minLng) * 111.32 * Math.cos(avgLat * Math.PI / 180),
              (maxLat - minLat) * 110.54
            ) / 2;
            const radiusMeters = radiusKm * 1000;
            
            // Add circle for stop point radius
            const circleId = `stop-circle-${stopPoint.id}`;
            if (map.current.getSource(circleId)) {
              map.current.removeLayer(circleId);
              map.current.removeSource(circleId);
            }
            
            map.current.addSource(circleId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [avgLng, avgLat]
                }
              }
            });
            
            map.current.addLayer({
              id: circleId,
              type: 'circle',
              source: circleId,
              paint: {
                'circle-radius': {
                  stops: [
                    [0, 0],
                    [20, radiusMeters / 10]
                  ],
                  base: 2
                },
                'circle-color': '#87CEEB',
                'circle-opacity': 0.3,
                'circle-stroke-color': '#4682B4',
                'circle-stroke-width': 2
              }
            });
            
            // Add orange marker for stop point
            const marker = new mapboxgl.Marker({ color: 'orange' })
              .setLngLat([avgLng, avgLat])
              .setPopup(new mapboxgl.Popup().setText(`Stop ${index + 1}: ${stopPoint.name}`))
              .addTo(map.current);
            markersRef.current.push(marker);
            
            // Add directional arrow from previous point
            if (index > 0) {
              const prevStop = stopPoints[index - 1];
              const prevCoords = prevStop.coordinates;
              const prevAvgLng = prevCoords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / prevCoords.length;
              const prevAvgLat = prevCoords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / prevCoords.length;
              
              const arrowId = `arrow-${prevStop.id}-${stopPoint.id}`;
              if (map.current.getSource(arrowId)) {
                map.current.removeLayer(arrowId);
                map.current.removeSource(arrowId);
              }
              
              map.current.addSource(arrowId, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [[prevAvgLng, prevAvgLat], [avgLng, avgLat]]
                  }
                }
              });
              
              map.current.addLayer({
                id: arrowId,
                type: 'line',
                source: arrowId,
                paint: {
                  'line-color': '#ff6b35',
                  'line-width': 3,
                  'line-dasharray': [2, 1]
                }
              });
            }
          });
        }

        // Load overlays (cached)
        if (!cacheRef.current.has('overlays-loaded')) {
          await loadMapOverlays();
          cacheRef.current.set('overlays-loaded', true);
        }

        // Fetch route from API if tripId is provided, otherwise use routeData or calculate
        let mainRoute = routeData?.geometry;
        
        if (tripId && !mainRoute) {
          try {
            const response = await fetch(`/api/trip-route?tripId=${tripId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.coordinates && data.coordinates.length > 0) {
                mainRoute = {
                  type: 'LineString',
                  coordinates: data.coordinates.map((coord: any) => [coord.longitude, coord.latitude])
                };
              }
            }
          } catch (error) {
            console.error('Error fetching trip route:', error);
          }
        }
        
        if (!mainRoute && originCoords && destCoords) {
          console.log('Calculating optimized route from', originCoords, 'to', destCoords);
          let routeStopPoints = [];
          if (stopPoints === 'async' && getStopPointsData) {
            routeStopPoints = await getStopPointsData();
          } else if (Array.isArray(stopPoints)) {
            routeStopPoints = stopPoints;
          }
          mainRoute = await getRoute(originCoords, destCoords, routeStopPoints);
          console.log('Calculated optimized route:', mainRoute);
        } else if (originCoords && destCoords) {
          // Always recalculate with optimization when coordinates change
          console.log('Recalculating optimized route');
          let routeStopPoints = [];
          if (stopPoints === 'async' && getStopPointsData) {
            routeStopPoints = await getStopPointsData();
          } else if (Array.isArray(stopPoints)) {
            routeStopPoints = stopPoints;
          }
          mainRoute = await getRoute(originCoords, destCoords, routeStopPoints);
          console.log('Recalculated optimized route:', mainRoute);
        }
        
        if (mainRoute) {
          console.log('Adding main route to map:', mainRoute);
          // Remove existing route
          if (map.current && map.current.getSource('main-route')) {
            map.current.removeLayer('main-route');
            map.current.removeSource('main-route');
          }

          // Add route immediately if map is ready
          if (map.current && map.current.isStyleLoaded()) {
            try {
              if (map.current.getSource('main-route')) {
                map.current.removeLayer('main-route');
                map.current.removeSource('main-route');
              }
              
              map.current.addSource('main-route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: mainRoute
                }
              });

              map.current.addLayer({
                id: 'main-route',
                type: 'line',
                source: 'main-route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#3b82f6',
                  'line-width': 6
                }
              });
              
              console.log('Route layer added successfully');
              console.log('Map has source:', !!map.current.getSource('main-route'));
              console.log('Map has layer:', !!map.current.getLayer('main-route'));
              
              // Add directional arrows along the route
              const coords = mainRoute.coordinates;
              const arrowInterval = Math.max(1, Math.floor(coords.length / 8));
              
              for (let i = arrowInterval; i < coords.length; i += arrowInterval) {
                const [lng1, lat1] = coords[i - 1];
                const [lng2, lat2] = coords[i];
                const angle = Math.atan2(lat2 - lat1, lng2 - lng1) * 180 / Math.PI;
                
                const arrowEl = document.createElement('div');
                arrowEl.innerHTML = '▶';
                arrowEl.style.cssText = `
                  color: #10b981;
                  font-size: 12px;
                  transform: rotate(${angle}deg);
                  pointer-events: none;
                `;
                
                const arrowMarker = new (await import('mapbox-gl')).default.Marker({
                  element: arrowEl,
                  anchor: 'center'
                })
                .setLngLat([lng2, lat2])
                .addTo(map.current);
                
                markersRef.current.push(arrowMarker);
              }
              
              console.log('Route added successfully');
            } catch (error) {
              console.error('Route error:', error);
            }
          }

          // Fit map to all elements - force immediate bounds update
          if (mainRoute?.coordinates && mainRoute.coordinates.length > 0 && map.current) {
            const coordinates = mainRoute.coordinates;
            const bounds = coordinates.reduce((bounds: any, coord: any) => {
              return bounds.extend(coord);
            }, new (await import('mapbox-gl')).default.LngLatBounds(coordinates[0], coordinates[0]));

            // Include driver location in bounds if available
            if (driverLocation) {
              bounds.extend([driverLocation.lng, driverLocation.lat]);
            }

            // Include client location in bounds if available
            if (clientLocation) {
              bounds.extend([clientLocation.lng, clientLocation.lat]);
            }

            // Force immediate bounds update
            setTimeout(() => {
              if (map.current) {
                map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
              }
            }, 100);
          } else if (selectedClient?.coordinates && map.current) {
            // Fit to client coordinates if no main route
            const coords = selectedClient.coordinates.split(' ')
              .filter(coord => coord.trim())
              .map(coord => {
                const [lng, lat, alt] = coord.split(',')
                return [parseFloat(lng), parseFloat(lat)]
              })
              .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]))
            
            if (coords.length > 0) {
              const bounds = coords.reduce((bounds: any, coord: any) => {
                return bounds.extend(coord);
              }, new (await import('mapbox-gl')).default.LngLatBounds(coords[0], coords[0]));
              
              map.current.fitBounds(bounds, { padding: 50 });
            }
          }
        }

        // Add stop points from async data
        console.log('Checking async stop points:', { stopPoints, hasGetStopPointsData: !!getStopPointsData });
        if (stopPoints === 'async' && getStopPointsData) {
          try {
            console.log('Calling getStopPointsData...');
            const asyncStopPoints = await getStopPointsData();
            console.log('Async stop points received:', asyncStopPoints);
            
            if (asyncStopPoints && asyncStopPoints.length > 0) {
              const mapboxgl = (await import('mapbox-gl')).default;
              asyncStopPoints.forEach((stopPoint, index) => {
                console.log('Processing async stop point:', stopPoint);
                if (stopPoint.coordinates && stopPoint.coordinates.length > 0) {
                  // Calculate center point for marker
                  const coords = stopPoint.coordinates;
                  const avgLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
                  const avgLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
                  
                  console.log('Adding marker at:', avgLng, avgLat);
                  // Add numbered marker for stop point
                  if (map.current) {
                    const markerEl = document.createElement('div');
                    markerEl.style.cssText = `
                      width: 30px;
                      height: 30px;
                      background-color: #3b82f6;
                      border: 2px solid white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                      font-size: 12px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    `;
                    markerEl.textContent = (index + 1).toString();
                    
                    const marker = new mapboxgl.Marker({ element: markerEl })
                      .setLngLat([avgLng, avgLat])
                      .setPopup(new mapboxgl.Popup().setText(`${index + 1}. ${stopPoint.name}`))
                      .addTo(map.current);
                    markersRef.current.push(marker);
                  }
                }
              });
            }
          } catch (error) {
            console.error('Error loading async stop points:', error);
          }
        }
        
        // Add stop points if available
        console.log('Stop points to render:', stopPoints);
        if (Array.isArray(stopPoints) && stopPoints.length > 0) {
          stopPoints.forEach((stopPoint, index) => {
            console.log('Processing stop point:', stopPoint);
            if (stopPoint.coordinates && stopPoint.coordinates.length > 0) {
              // Add stop point zones as polygons
              const sourceId = `stop-point-${stopPoint.id}`;
              const layerId = `stop-point-layer-${stopPoint.id}`;
              
              // Remove existing layers
              if (map.current.getLayer(`${layerId}-border`)) {
                map.current.removeLayer(`${layerId}-border`);
              }
              if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
              }
              if (map.current.getSource(sourceId)) {
                map.current.removeSource(sourceId);
              }

              console.log('Adding polygon with coordinates:', stopPoint.coordinates);
              if (!map.current.isStyleLoaded()) return;
              map.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {
                    name: stopPoint.name
                  },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [stopPoint.coordinates]
                  }
                }
              });

              map.current.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': `hsl(${(index * 60) % 360}, 70%, 50%)`,
                  'fill-opacity': 0.4
                }
              });

              // Add border
              map.current.addLayer({
                id: `${layerId}-border`,
                type: 'line',
                source: sourceId,
                paint: {
                  'line-color': `hsl(${(index * 60) % 360}, 70%, 40%)`,
                  'line-width': 2
                }
              });

              // Add popup on click
              map.current.on('click', layerId, async (e: any) => {
                const mapboxgl = (await import('mapbox-gl')).default;
                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`<strong>${stopPoint.name}</strong>`)
                  .addTo(map.current);
              });
            }
          });
        }

      } catch (error) {
        console.error('Error updating route:', error);
      }
    };

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [mapLoaded, origin, destination, selectedClient, tripId, stopPoints, driverLocation, getStopPointsData, preserveOrder, routeData]);

  const geocodeLocation = async (location: string) => {
    const cacheKey = `geocode-${location}`;
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=za&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const result = { lat, lng };
        cacheRef.current.set(cacheKey, result);
        return result;
      }
      cacheRef.current.set(cacheKey, null);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const loadMapOverlays = async () => {
    if (!map.current) return;
    
    try {
      // Traffic overlay
      if (!map.current.getSource('mapbox-traffic')) {
        map.current.addSource('mapbox-traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        });
      }
      
      if (!map.current.getLayer('traffic')) {
        map.current.addLayer({
          id: 'traffic',
          type: 'line',
          source: 'mapbox-traffic',
          'source-layer': 'traffic',
          paint: {
            'line-width': 2,
            'line-color': [
              'case',
              ['==', ['get', 'congestion'], 'low'], '#00ff00',
              ['==', ['get', 'congestion'], 'moderate'], '#ffff00', 
              ['==', ['get', 'congestion'], 'heavy'], '#ff8800',
              ['==', ['get', 'congestion'], 'severe'], '#ff0000',
              '#888888'
            ]
          }
        });
      }
      
      // High-risk areas
      const response = await fetch('/api/high-risk-areas');
      if (response.ok) {
        const { data: areas } = await response.json();
        areas?.forEach((area: any) => {
          if (!area.coordinates || !map.current) return;
          
          const coords = area.coordinates
            .split(' ')
            .filter((coord: string) => coord.trim())
            .map((coord: string) => {
              const [lng, lat] = coord.split(',');
              return [parseFloat(lng), parseFloat(lat)];
            })
            .filter((coord: number[]) => !isNaN(coord[0]) && !isNaN(coord[1]));
          
          if (coords.length >= 3) {
            const sourceId = `risk-${area.id}`;
            
            if (!map.current.getSource(sourceId)) {
              map.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [coords.concat([coords[0]])]
                  }
                }
              });
              
              map.current.addLayer({
                id: `${sourceId}-fill`,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': '#ef4444',
                  'fill-opacity': 0.3
                }
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Map overlays error:', error);
    }
  };

  const getRoute = async (origin: any, destination: any, stopPoints: any[] = []) => {
    try {
      let coordinates = `${origin.lng},${origin.lat}`;
      
      if (stopPoints && stopPoints.length > 0) {
        const waypoints = stopPoints.map(point => {
          const coords = point.coordinates;
          const avgLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
          const avgLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
          return `${avgLng},${avgLat}`;
        });
        coordinates += `;${waypoints.join(';')}`;
      }
      
      coordinates += `;${destination.lng},${destination.lat}`;
      
      // Add return to loading site for round trip
      coordinates += `;${origin.lng},${origin.lat}`;
      
      // Always use directions API for reliable routing
      const endpoint = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`;
      const params = new URLSearchParams({
        geometries: 'geojson',
        overview: 'full',
        exclude: 'ferry'
      });
      
      const response = await fetch(`/api/mapbox?endpoint=${encodeURIComponent(endpoint)}&${params.toString()}`);
      const data = await response.json();
      
      console.log('Route API response:', data);
      return data.routes?.[0]?.geometry;
    } catch (error) {
      console.error('Route error:', error);
      return null;
    }
  };

  if (!origin && !destination && !selectedClient?.coordinates) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a client or set loading and drop-off locations to preview route</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '384px', position: 'relative' }}
          id={`map-container-${Math.random().toString(36).substr(2, 9)}`}
        />
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Loading: {origin}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Drop-off: {destination}</span>
            </div>
            {Array.isArray(stopPoints) && stopPoints.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Stop Points: {stopPoints.length} zones</span>
              </div>
            )}
            {selectedClient && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Client Route: {selectedClient.name}</span>
              </div>
            )}
            {driverLocation && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Driver: {driverLocation.name}</span>
              </div>
            )}


          </div>
          
          {Array.isArray(stopPoints) && stopPoints.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Stop Points:</h4>
              <div className="flex flex-wrap gap-2">
                {stopPoints.map((point, index) => (
                  <span 
                    key={point.id} 
                    className="px-2 py-1 text-xs rounded"
                    style={{ 
                      backgroundColor: `hsl(${(index * 60) % 360}, 70%, 90%)`,
                      color: `hsl(${(index * 60) % 360}, 70%, 30%)`
                    }}
                  >
                    {point.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          

        </div>
      </CardContent>
    </Card>
  );
}
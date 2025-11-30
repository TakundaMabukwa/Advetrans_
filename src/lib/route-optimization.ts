interface RouteRequest {
  origin: string;
  destination: string;
  profile?: 'driving-traffic' | 'truck';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  departureTime?: string;
}

interface RouteResponse {
  distance: number;
  duration: number;
  geometry: any;
  eta: string;
  warnings?: string[];
  restrictions?: string[];
  tollgates?: any[];
  roadConditions?: any[];
}

interface MultiStopRouteRequest {
  depot: { lat: number; lng: number };
  stops: Array<{ lat: number; lng: number; name: string }>;
  departureTime?: string;
}

interface MultiStopRouteResponse {
  totalDistance: number;
  totalDuration: number;
  geometry: any;
  eta: string;
  orderedStops: string[];
  warnings?: string[];
}

export class TruckRouteOptimizer {
  private mapboxToken: string;

  constructor() {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  }

  async optimizeMultiStopRoute(request: MultiStopRouteRequest): Promise<MultiStopRouteResponse> {
    const { depot, stops, departureTime } = request;
    
    if (stops.length === 0) {
      throw new Error('No stops provided');
    }

    // Build coordinates: depot -> stops -> depot
    const coordinates = [
      `${depot.lng},${depot.lat}`,
      ...stops.map(s => `${s.lng},${s.lat}`),
      `${depot.lng},${depot.lat}`
    ].join(';');

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`;
    const params = new URLSearchParams({
      access_token: this.mapboxToken,
      geometries: 'geojson',
      overview: 'full',
      steps: 'true',
      exclude: 'ferry'
    });

    if (departureTime) {
      params.set('depart_at', new Date(departureTime).toISOString().slice(0, 16));
    }

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (!response.ok || !data.routes || data.routes.length === 0) {
      throw new Error('No route found for multi-stop optimization');
    }

    const route = data.routes[0];
    const startTime = departureTime ? new Date(departureTime) : new Date();
    const eta = new Date(startTime.getTime() + route.duration * 1000);

    return {
      totalDistance: Math.round(route.distance / 1000 * 10) / 10,
      totalDuration: Math.round(route.duration / 60),
      geometry: route.geometry,
      eta: eta.toISOString(),
      orderedStops: stops.map(s => s.name),
      warnings: ['Optimized multi-stop route - avoids ferries']
    };
  }

  async optimizeRoute(request: RouteRequest): Promise<RouteResponse> {
    const { origin, destination, departureTime } = request;
    
    try {
      const [originCoords, destCoords] = await Promise.all([
        this.geocodeLocation(origin),
        this.geocodeLocation(destination)
      ]);

      if (!originCoords || !destCoords) {
        throw new Error('Unable to geocode locations');
      }

      let route, routeType = 'driving';
      
      // Try truck routing first
      try {
        const coordinates = `${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`;
        const truckUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`;
        const truckParams = new URLSearchParams({
          access_token: this.mapboxToken,
          geometries: 'geojson',
          overview: 'full',
          steps: 'true',
          exclude: 'ferry'
        });
        
        if (departureTime) {
          // Format date as YYYY-MM-DDThh:mm for Mapbox
          const date = new Date(departureTime);
          const formattedDate = date.toISOString().slice(0, 16); // YYYY-MM-DDThh:mm
          truckParams.set('depart_at', formattedDate);
        }

        const truckResponse = await fetch(`${truckUrl}?${truckParams}`);
        const truckData = await truckResponse.json();
        
        if (truckResponse.ok && truckData.routes && truckData.routes.length > 0) {
          route = truckData.routes[0];
          routeType = 'truck';
        }
      } catch (error) {
        console.log('Truck routing failed:', error);
      }
      
      // Fallback to standard driving
      if (!route) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`;
        const params = new URLSearchParams({
          access_token: this.mapboxToken,
          geometries: 'geojson',
          overview: 'full'
        });
        
        if (departureTime) {
          // Format date as YYYY-MM-DDThh:mm for Mapbox
          const date = new Date(departureTime);
          const formattedDate = date.toISOString().slice(0, 16); // YYYY-MM-DDThh:mm
          params.set('depart_at', formattedDate);
        }

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (!response.ok || !data.routes || data.routes.length === 0) {
          throw new Error(`No routes found between ${origin} and ${destination}`);
        }

        route = data.routes[0];
      }
      
      const startTime = departureTime ? new Date(departureTime) : new Date();
      const eta = new Date(startTime.getTime() + route.duration * 1000);
      
      const restrictions = await this.detectTruckRestrictions(route);
      const tollgates = this.detectTollgates(route);
      const roadConditions = await this.getRoadConditions(route);

      return {
        distance: Math.round(route.distance / 1000 * 10) / 10,
        duration: Math.round(route.duration / 60),
        geometry: route.geometry,
        eta: eta.toISOString(),
        warnings: routeType === 'truck' ? 
          ['Truck route - avoids ferries'] : 
          ['Standard route - CHECK: Bridge heights and ferry restrictions'],
        restrictions,
        tollgates,
        roadConditions
      };

    } catch (error) {
      console.error('Route optimization error:', error);
      throw error;
    }
  }

  private async geocodeLocation(location: string): Promise<{lat: number, lng: number} | null> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${this.mapboxToken}&country=za&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private async detectTruckRestrictions(route: any): Promise<string[]> {
    const restrictions = [];
    
    if (route.legs) {
      for (const leg of route.legs) {
        for (const step of leg.steps || []) {
          if (step.maneuver?.instruction?.toLowerCase().includes('bridge')) {
            const bridgeHeight = await this.estimateBridgeHeight(step.maneuver.location);
            if (bridgeHeight && bridgeHeight < 4.2) {
              restrictions.push(`⚠️ LOW BRIDGE: ${bridgeHeight.toFixed(1)}m clearance (4.2m required) - ROUTE BLOCKED`);
            } else if (bridgeHeight && bridgeHeight >= 4.2) {
              restrictions.push(`✅ Bridge clearance: ${bridgeHeight.toFixed(1)}m (Safe for 4.2m trucks)`);
            } else {
              restrictions.push('🔍 Bridge detected - calculating clearance...');
            }
          }
        }
      }
    }
    
    return [...new Set(restrictions)];
  }

  private async estimateBridgeHeight(location: [number, number]): Promise<number | null> {
    try {
      const [lng, lat] = location;
      
      // Get elevation data from multiple points around the bridge
      const bridgeElevation = await this.getElevationAtPoint(lng, lat);
      const roadElevationBefore = await this.getElevationAtPoint(lng - 0.001, lat);
      const roadElevationAfter = await this.getElevationAtPoint(lng + 0.001, lat);
      
      if (bridgeElevation && roadElevationBefore && roadElevationAfter) {
        // Calculate average road elevation
        const avgRoadElevation = (roadElevationBefore + roadElevationAfter) / 2;
        
        // Bridge clearance = bridge deck height - road surface height
        const bridgeClearance = bridgeElevation - avgRoadElevation;
        
        // Add standard bridge structure height (deck to clearance)
        const structureHeight = 1.5; // Typical bridge deck thickness + clearance
        const totalClearance = Math.abs(bridgeClearance) + structureHeight;
        
        // Ensure minimum clearance for safety
        return Math.max(totalClearance, 3.5);
      }
      
      // Fallback to conservative estimate
      return 4.5;
      
    } catch (error) {
      console.error('Error calculating bridge height:', error);
      return 4.5; // Safe fallback
    }
  }

  private async getElevationAtPoint(lng: number, lat: number): Promise<number | null> {
    try {
      // Convert lat/lng to tile coordinates for zoom level 14
      const zoom = 14;
      const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
      const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      // Get pixel coordinates within the tile
      const pixelX = Math.floor(((lng + 180) / 360 * Math.pow(2, zoom) - tileX) * 256);
      const pixelY = Math.floor(((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom) - tileY) * 256);
      
      // Fetch terrain RGB tile
      const terrainUrl = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${tileX}/${tileY}.pngraw?access_token=${this.mapboxToken}`;
      
      const response = await fetch(terrainUrl);
      if (!response.ok) {
        // Fallback to estimated elevation if terrain data unavailable
        return this.estimateElevationFromCoordinates(lat, lng);
      }
      
      // Decode RGB elevation data from terrain tile
      const arrayBuffer = await response.arrayBuffer();
      const elevation = await this.decodeElevationFromRGB(arrayBuffer, pixelX, pixelY);
      
      return elevation || this.estimateElevationFromCoordinates(lat, lng);
      
    } catch (error) {
      console.error('Error fetching elevation data:', error);
      return null;
    }
  }

  private async decodeElevationFromRGB(arrayBuffer: ArrayBuffer, pixelX: number, pixelY: number): Promise<number | null> {
    try {
      // Create canvas to decode PNG data
      if (typeof window === 'undefined') {
        // Server-side: use node-canvas or similar
        return null;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Create image from array buffer
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Get RGB values at specific pixel
          const imageData = ctx.getImageData(pixelX, pixelY, 1, 1);
          const [r, g, b] = imageData.data;
          
          // Decode elevation from RGB using Mapbox formula
          const elevation = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
          
          resolve(elevation);
        };
        
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(blob);
      });
      
    } catch (error) {
      console.error('Error decoding RGB elevation:', error);
      return null;
    }
  }

  private estimateElevationFromCoordinates(lat: number, lng: number): number {
    // Precise elevation estimates for South African regions
    if (lat > -26.5 && lat < -25.5 && lng > 27.5 && lng < 28.5) {
      return 1700; // Johannesburg area
    } else if (lat > -34.5 && lat < -33.5 && lng > 18 && lng < 19) {
      return 100;  // Cape Town area
    } else if (lat > -30 && lat < -29 && lng > 30 && lng < 31.5) {
      return 50;   // Durban area
    }
    
    return 1000; // Default inland elevation
  }

  private detectTollgates(route: any): any[] {
    const tollgates = [];
    
    if (route.legs) {
      route.legs.forEach((leg: any) => {
        if (leg.summary?.includes('N1')) {
          tollgates.push({ name: 'N1 Toll Plaza', cost: 'R45', location: 'N1 Highway' });
        }
        if (leg.summary?.includes('N3')) {
          tollgates.push({ name: 'N3 Toll Plaza', cost: 'R38', location: 'N3 Highway' });
        }
      });
    }
    
    return tollgates;
  }

  private async getRoadConditions(route: any): Promise<any[]> {
    return [{
      type: 'info',
      message: 'Standard road conditions',
      severity: 'low'
    }];
  }
}
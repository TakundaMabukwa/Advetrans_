"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, Clock, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

interface RouteOptimizerProps {
  origin: string;
  destination: string;
  vehicleId?: string;
  orderId?: string;
  pickupTime?: string;
  onRouteOptimized?: (route: any) => void;
}

export function RouteOptimizer({ origin, destination, vehicleId, orderId, pickupTime, onRouteOptimized }: RouteOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const optimizeRoute = async () => {
    if (!origin || !destination) {
      setError('Origin and destination are required');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          vehicleId,
          orderId,
          pickupTime
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize route');
      }

      setOptimizedRoute(data.route);
      onRouteOptimized?.(data.route);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatETA = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Truck Route Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">From:</p>
            <p className="text-sm text-gray-600">{origin}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">To:</p>
            <p className="text-sm text-gray-600">{destination}</p>
          </div>
        </div>

        <Button 
          onClick={optimizeRoute} 
          disabled={isOptimizing || !origin || !destination}
          className="w-full"
        >
          {isOptimizing ? (
            <>
              <Navigation className="h-4 w-4 mr-2 animate-spin" />
              Optimizing Route...
            </>
          ) : (
            <>
              <Route className="h-4 w-4 mr-2" />
              Optimize Truck Route
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {optimizedRoute && (
          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">Route Optimized</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{optimizedRoute.distance} km</p>
                <p className="text-sm text-green-600">Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">{formatDuration(optimizedRoute.duration)}</p>
                <p className="text-sm text-blue-600">Duration</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-orange-700">ETA</p>
                </div>
                <p className="text-xs text-orange-600">{formatETA(optimizedRoute.eta)}</p>
              </div>
            </div>

            {optimizedRoute.warnings && optimizedRoute.warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-700">Warnings:</p>
                {optimizedRoute.warnings.map((warning: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-300">
                    {warning}
                  </Badge>
                ))}
              </div>
            )}

            {optimizedRoute.restrictions && optimizedRoute.restrictions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">Truck Restrictions:</p>
                {optimizedRoute.restrictions.map((restriction: string, index: number) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {restriction}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
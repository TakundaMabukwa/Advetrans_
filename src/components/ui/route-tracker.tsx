"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, Clock, AlertTriangle, MapPin, Truck, RefreshCw } from 'lucide-react';

interface RouteTrackerProps {
  orderId: string;
  vehicleId?: string;
}

interface RouteData {
  id: string;
  start_points: string;
  end_points: string;
  distance_km: number;
  duration_minutes: number;
  estimated_eta: string;
  status: string;
  truck_restrictions: string[];
  traffic_warnings: string[];
  actual_start_time?: string;
  created_at: string;
}

export function RouteTracker({ orderId, vehicleId }: RouteTrackerProps) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/routes?orderId=${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch routes');
      }

      setRoutes(data.routes || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchRoutes();
    }
  }, [orderId]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading routes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Navigation className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No routes found for this order</p>
            <p className="text-sm">Create a load plan to generate optimized routes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Route Tracking</h3>
        <Button onClick={fetchRoutes} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {routes.map((route) => (
        <Card key={route.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <span>Route #{route.id}</span>
              </div>
              <Badge className={getStatusColor(route.status)}>
                {route.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">From:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{route.start_points}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">To:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{route.end_points}</p>
              </div>
            </div>

            {/* Route Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{route.distance_km} km</p>
                <p className="text-sm text-gray-600">Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatDuration(route.duration_minutes)}</p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-orange-600">ETA</p>
                </div>
                <p className="text-xs text-gray-600">{formatDateTime(route.estimated_eta)}</p>
              </div>
            </div>

            {/* Truck Restrictions */}
            {route.truck_restrictions && route.truck_restrictions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Truck Restrictions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {route.truck_restrictions.map((restriction, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Traffic Warnings */}
            {route.traffic_warnings && route.traffic_warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Traffic Warnings
                </h4>
                <div className="flex flex-wrap gap-2">
                  {route.traffic_warnings.map((warning, index) => (
                    <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-300 text-xs">
                      {warning}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700">Timeline</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Created:</span> {formatDateTime(route.created_at)}
                </p>
                {route.actual_start_time && (
                  <p className="text-green-600">
                    <span className="font-medium">Started:</span> {formatDateTime(route.actual_start_time)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
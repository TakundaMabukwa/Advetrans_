"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, Route } from "lucide-react";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Routes Management</h1>
        <Button>
          <Route className="w-4 h-4 mr-2" />
          Create Route
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Route className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No routes found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first route.
            </p>
            <Button>Create Route</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
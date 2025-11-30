"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoutePreviewMap } from './route-preview-map';
import { AlertTriangle, DollarSign, Clock, Route, CheckCircle } from 'lucide-react';

interface RouteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  origin: string;
  destination: string;
  routeData?: any;
}

export function RouteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  origin, 
  destination, 
  routeData 
}: RouteConfirmationModalProps) {
  const [tollgates, setTollgates] = useState<any[]>([]);
  const [roadConditions, setRoadConditions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && routeData) {
      // Simulate tollgate detection
      setTollgates([
        { name: 'N1 Grasmere Toll Plaza', cost: 'R45', location: 'N1 Highway' },
        { name: 'N3 Heidelberg Toll Plaza', cost: 'R38', location: 'N3 Highway' }
      ]);
      
      // Simulate road conditions
      setRoadConditions([
        { type: 'construction', message: 'Road works on N1 - expect 15min delay', severity: 'medium' },
        { type: 'weather', message: 'Clear conditions expected', severity: 'low' }
      ]);
    }
  }, [isOpen, routeData]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const totalTollCost = tollgates.reduce((sum, toll) => sum + parseInt(toll.cost.replace('R', '')), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Confirm Route & Create Load
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Route Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{routeData?.distance || 0} km</p>
              <p className="text-sm text-blue-600">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{formatDuration(routeData?.duration || 0)}</p>
              <p className="text-sm text-green-600">Duration</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-700">ETA</p>
              </div>
              <p className="text-xs text-orange-600">
                {routeData?.eta ? new Date(routeData.eta).toLocaleString() : 'Not calculated'}
              </p>
            </div>
          </div>

          {/* Map Preview */}
          <RoutePreviewMap 
            origin={origin} 
            destination={destination} 
            routeData={routeData} 
          />

          {/* Tollgates */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Tollgates on Route
            </h3>
            {tollgates.length > 0 ? (
              <div className="space-y-2">
                {tollgates.map((toll, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border">
                    <div>
                      <p className="font-medium">{toll.name}</p>
                      <p className="text-sm text-gray-600">{toll.location}</p>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {toll.cost}
                    </Badge>
                  </div>
                ))}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-green-800">Total Toll Cost: R{totalTollCost}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tollgates detected on this route</p>
            )}
          </div>

          {/* Road Conditions & Blockages */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Road Conditions & Alerts
            </h3>
            {roadConditions.length > 0 ? (
              <div className="space-y-2">
                {roadConditions.map((condition, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    condition.severity === 'high' ? 'bg-red-50 border-red-200' :
                    condition.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        condition.severity === 'high' ? 'text-red-600' :
                        condition.severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <p className="text-sm">{condition.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700">No road blockages or major issues detected</p>
                </div>
              </div>
            )}
          </div>

          {/* Truck Restrictions */}
          {routeData?.restrictions && routeData.restrictions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Truck Restrictions
              </h3>
              <div className="flex flex-wrap gap-2">
                {routeData.restrictions.map((restriction: string, index: number) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm & Create Load
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
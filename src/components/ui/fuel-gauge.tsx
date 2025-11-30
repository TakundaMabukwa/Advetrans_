'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Thermometer, Droplets, Gauge, Clock, NotebookPen } from 'lucide-react';
import { formatForDisplay } from '@/lib/utils/date-formatter';

interface FuelGaugeProps {
  location: string;
  fuelLevel: number;
  temperature: number;
  volume: number;

  status: string;
  lastUpdated: string;
  updated_at?: string;
  lastFuelFill?: {
    time: string;
    amount: number;
    previousLevel: number;
  };
  className?: string;
  onAddNote?: (location: string, id?: string | number) => void;
  hasNotes?: boolean;
  notes?: string | null;
  id?: string | number;
}

export function FuelGauge({
  location,
  fuelLevel,
  temperature,
  volume,

  status,
  lastUpdated,
  updated_at,
  lastFuelFill,
  className,
  onAddNote,
  hasNotes,
  notes,
  id
}: FuelGaugeProps) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (fuelLevel / 100) * circumference;

  const getStatusColor = (status: string) => {
    if (status.includes('OFF') || status.includes('off')) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (status.includes('ON') || status.includes('on')) return 'bg-green-100 text-green-700 border-green-200';
    if (status.includes('No Signal')) return 'bg-red-100 text-red-700 border-red-200';
    if (status.includes('Possible Fuel Fill')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getFuelColor = (level: number) => {
    if (level < 25) return '#ef4444'; // red
    if (level < 50) return '#f97316'; // orange
    if (level < 75) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  return (
    <div className={cn(
      "shadow-sm hover:shadow-md p-3 border rounded-lg transition-all duration-300 relative overflow-visible bg-white border-gray-200",
      className
    )}>
      {/* Header */}
      <div className="mb-3 text-center">
        <h3 className="mb-2 font-semibold text-gray-900 text-base">{location}</h3>

        

      </div>

      {/* Fuel Gauge */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="-rotate-90 transform"
          >
            {/* Background Circle */}
            <circle
              stroke="#f1f5f9"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress Circle */}
            <circle
              stroke={getFuelColor(fuelLevel)}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <Gauge className="mb-1 w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-500 text-sm">Fuel</span>
            <span className="mt-1 font-bold text-gray-900 text-2xl">{fuelLevel}</span>
            <span className="text-gray-500 text-xs">L</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-2">
        <div className={cn(
          "flex justify-between items-center p-2 rounded-lg",
          status.includes('ON') || status.includes('on') 
            ? "bg-green-100" 
            : status.includes('No Signal')
            ? "bg-red-100"
            : "bg-gray-50"
        )}>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-500" />
            <span className={cn(
              "font-medium text-sm",
              status.includes('ON') || status.includes('on') 
                ? "text-green-800" 
                : status.includes('No Signal')
                ? "text-red-800"
                : "text-gray-700"
            )}>{temperature}°C</span>
          </div>
          <span className={cn(
            "text-xs",
            status.includes('ON') || status.includes('on') 
              ? "text-green-600" 
              : status.includes('No Signal')
              ? "text-red-600"
              : "text-gray-500"
          )}>Temperature</span>
        </div>



        <div className={cn(
          "flex items-center gap-2 p-2 rounded-lg",
          status.includes('ON') || status.includes('on') 
            ? "bg-green-100" 
            : status.includes('No Signal')
            ? "bg-red-100"
            : "bg-gray-50"
        )}>
          <Clock className="w-4 h-4 text-gray-400" />
          <span className={cn(
            "text-xs",
            status.includes('ON') || status.includes('on') 
              ? "text-green-700" 
              : status.includes('No Signal')
              ? "text-red-700"
              : "text-gray-600"
          )}>{formatForDisplay(lastUpdated)}</span>
        </div>

        {/* Last Fuel Fill Information */}
        {lastFuelFill && (
          <div className="bg-green-50 p-2 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-green-900 text-sm">Last Fill</span>
              <span className="font-bold text-green-900 text-sm">{lastFuelFill.amount.toFixed(1)}L</span>
            </div>
            <div className="text-green-700 text-xs">
              {formatForDisplay(lastFuelFill.time)}
            </div>
            <div className="text-green-600 text-xs">
              From {lastFuelFill.previousLevel.toFixed(1)}% to {fuelLevel.toFixed(1)}%
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
}
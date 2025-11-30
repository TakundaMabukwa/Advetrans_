import React from 'react'
import { ProgressWithWaypoints } from './progress-with-waypoints'
import { Check, Circle } from 'lucide-react'

/**
 * SideBySideCards
 * - Shows a trip card (top) with progress and waypoints and a driver card (bottom)
 * - Renders side-by-side on md+ screens and stacks on small screens
 * - Keeps styling minimal and uses existing Tailwind design tokens
 */
export function SideBySideCards({ trip = {}, driver = {}, className = '' }) {
    const { value = 0, waypoints = [] } = trip

    return (
        <div className={`w-full ${className}`}>
            <div className="grid gap-4 md:grid-cols-2">
                {/* Trip card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">{trip.title || 'Trip'}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{trip.subtitle || ''}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{trip.badge}</div>
                    </div>

                    <div className="mt-4">
                        <ProgressWithWaypoints value={value} waypoints={waypoints} variant="stepped" />
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-3">
                        <button className="px-3 py-1.5 bg-green-600 text-white rounded-md shadow-sm text-sm">Complete Trip</button>
                        <button className="px-3 py-1.5 bg-transparent border border-gray-200 dark:border-slate-700 rounded-md text-sm">Pickup Time</button>
                    </div>
                </div>

                {/* Driver card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-medium">{(driver.name || 'NA').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                        <div>
                            <div className="text-sm font-semibold">{driver.name || 'Driver Name'}</div>
                            <div className="text-xs text-muted-foreground mt-1">{driver.code || '000000'}</div>
                        </div>
                        <div className="ml-auto text-sm text-green-600 font-medium">{driver.status || 'Available'}</div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm shadow-sm">Map</button>
                        <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm shadow-sm">Load</button>
                        <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm shadow-sm">Change</button>
                        <button className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm shadow-sm">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBySideCards

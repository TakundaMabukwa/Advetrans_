'use client';

import {
    MorphingDialog,
    MorphingDialogTrigger,
    MorphingDialogContent,
    MorphingDialogTitle,
    MorphingDialogSubtitle,
    MorphingDialogClose,
    MorphingDialogDescription,
    MorphingDialogContainer,
} from '@/components/ui/morphing-dialog';
import { MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { TechMap } from './techMap';
import { fetchRouteByTripId } from '@/lib/route-fetcher';

interface MorphingDialogBasicOneProps {
    name: string;
    location: string;
    tripId?: string;
    routeCoordinates?: number[][];
}

export function MorphingDialogBasicOne({ name, location, tripId, routeCoordinates }: MorphingDialogBasicOneProps) {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [fetchedRoute, setFetchedRoute] = useState<number[][] | null>(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
            );
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                setCoords({ lat, lng });
            }
        };

        fetchCoordinates();
    }, [location]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (tripId && !routeCoordinates) {
                console.log('🚛 FETCHING ROUTE FOR TRIP:', tripId);
                const route = await fetchRouteByTripId(tripId);
                console.log('📍 ROUTE RESULT:', route);
                setFetchedRoute(route);
            }
        };
        fetchRoute();
    }, [tripId, routeCoordinates]);

    console.log('AdvanceMap - routeCoordinates:', routeCoordinates, 'fetchedRoute:', fetchedRoute);

    return (
        <MorphingDialog
            transition={{
                type: 'spring',
                bounce: 0.05,
                duration: 0.25,
            }}
        >
            <MorphingDialogTrigger
                style={{ borderRadius: '12px', width: '100%' }}
                className="flex max-w-[270px] flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 items-center justify-center px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => console.log('Track button clicked for tripId:', tripId)}
            >
                <MapPin className="h-4 w-4 mr-1" />
                Track
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
                <MorphingDialogContent
                    style={{ borderRadius: '24px', width: '50%', padding: '10px'}}
                    className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px]"
                >
                    <div className="p-6">
                        <MorphingDialogTitle className="text-xl text-zinc-950 dark:text-zinc-50">
                            {name}
                        </MorphingDialogTitle>
                        <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
                            {name} current location radius coverage is: {location}
                        </MorphingDialogSubtitle>
                        <MorphingDialogDescription
                            disableLayoutAnimation
                            variants={{
                                initial: { opacity: 0, scale: 0.8, y: 100 },
                                animate: { opacity: 1, scale: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.8, y: 100 },
                            }}
                        >
                            {coords ? (
                                <TechMap 
                                    lat={coords.lat} 
                                    lng={coords.lng} 
                                    name={name} 
                                    routeCoordinates={routeCoordinates || fetchedRoute}
                                />
                            ) : (
                                <div className="text-sm text-zinc-500">Loading map...</div>
                            )}
                        </MorphingDialogDescription>
                    </div>
                    <MorphingDialogClose className="text-zinc-50" />
                </MorphingDialogContent>
            </MorphingDialogContainer>
        </MorphingDialog>
    );
}

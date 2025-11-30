'use client';

import React, { useState, useEffect } from 'react';
import { FuelGauge } from '@/components/ui/fuel-gauge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Fuel, Save } from 'lucide-react';
import { formatForDisplay } from '@/lib/utils/date-formatter';
import { toast } from '@/hooks/use-toast';

interface FuelGaugesViewProps {
  onBack: () => void;
}

interface FuelConsumptionData {
  id?: string | number;
  plate: string;
  branch: string;
  company: string;
  fuel_probe_1_level_percentage: number;
  fuel_probe_1_volume_in_tank: number;
  fuel_probe_2_level_percentage: number;
  fuel_probe_2_volume_in_tank: number;
  current_status: string;
  last_message_date: string;
  updated_at?: string;
  fuel_anomaly?: string;
  fuel_anomaly_note?: string;
  lastFuelFill?: any;
  notes?: string | null;
}

interface GaugeNote {
  id: string;
  gaugeId: string | number;
  location: string;
  text: string;
  timestamp: string;
}

export function FuelGaugesView({ onBack }: FuelGaugesViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fuelConsumptionData, setFuelConsumptionData] = useState<FuelConsumptionData[]>([
    {
      id: 1,
      plate: 'SPUR THUVL',
      branch: 'Johannesburg',
      company: 'SPUR Corporation',
      fuel_probe_1_level_percentage: 78,
      fuel_probe_1_volume_in_tank: 125.5,
      fuel_probe_2_level_percentage: 76,
      fuel_probe_2_volume_in_tank: 120.2,
      current_status: 'Active',
      last_message_date: new Date().toISOString(),
      fuel_anomaly: '',
      fuel_anomaly_note: ''
    },
    {
      id: 2,
      plate: 'KFC WEST',
      branch: 'Cape Town',
      company: 'YUM Equity',
      fuel_probe_1_level_percentage: 65,
      fuel_probe_1_volume_in_tank: 98.2,
      fuel_probe_2_level_percentage: 63,
      fuel_probe_2_volume_in_tank: 95.1,
      current_status: 'Active',
      last_message_date: new Date().toISOString(),
      fuel_anomaly: '',
      fuel_anomaly_note: ''
    },
    {
      id: 3,
      plate: 'MUSHROOM',
      branch: 'Durban',
      company: 'Mushroom Group',
      fuel_probe_1_level_percentage: 82,
      fuel_probe_1_volume_in_tank: 145.8,
      fuel_probe_2_level_percentage: 80,
      fuel_probe_2_volume_in_tank: 142.3,
      current_status: 'Active',
      last_message_date: new Date().toISOString(),
      fuel_anomaly: '',
      fuel_anomaly_note: ''
    }
  ]);
  
  // Notes data structure
  const [gaugeNotes, setGaugeNotes] = useState<GaugeNote[]>([]);
  
  // Note dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [viewNotesDialogOpen, setViewNotesDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedGaugeId, setSelectedGaugeId] = useState<string | number | undefined>();
  
  // Handler for opening the note dialog
  const handleAddNote = (location: string, id?: string | number) => {
    setSelectedLocation(location);
    setSelectedGaugeId(id);
    setCurrentNote('');
    setNoteDialogOpen(true);
  };
  
  // Get notes for the selected gauge
  const getGaugeNotes = (id?: string | number): GaugeNote[] => {
    if (!id) return [];
    return gaugeNotes.filter(note => note.gaugeId === id);
  };
  
  // Fetch notes for vehicles from API
  const fetchVehicleNotes = async (vehicles: any[]) => {
    // If we don't have any vehicles, don't try to fetch notes
    if (!vehicles || vehicles.length === 0) return;
    
    try {
      // For now, the notes are already included in the vehicles data
      // In the future, we could fetch them separately if needed
      console.log('✅ Vehicle notes data available from context');
    } catch (err) {
      console.warn('⚠️ Could not fetch vehicle notes:', err);
    }
  };
  
  // Refresh notes for a specific vehicle
  const refreshVehicleNote = async (vehicleId?: string | number) => {
    if (!vehicleId) return;
    
    toast({
      title: 'Refreshing Notes',
      description: `Refreshing notes for ${selectedLocation}...`,
    });
    
    try {
      // Fetch the latest vehicle data from API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://64.227.138.235:3000'}/api/energy-rite/vehicles/${vehicleId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicle data: ${response.status}`);
      }
      
      const vehicleData = await response.json();
      
      if (vehicleData && vehicleData.data) {
        // Update the notes in the fuelConsumptionData state
        setFuelConsumptionData(prevData => 
          prevData.map(item => {
            if (item.id === vehicleId) {
              return { ...item, notes: vehicleData.data.notes || null };
            }
            return item;
          })
        );
        
        toast({
          title: 'Notes Refreshed',
          description: `Notes for ${selectedLocation} have been refreshed.`,
        });
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('Error refreshing notes:', error);
      toast({
        title: 'Error',
        description: `Failed to refresh notes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handler for saving notes
  const handleSaveNote = async () => {
    if (!selectedGaugeId || !currentNote.trim()) return;
    
    // Show loading toast
    toast({
      title: 'Saving Note',
      description: `Saving note for ${selectedLocation}...`,
    });
    
    try {
      // Send note to the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://64.227.138.235:3000'}/api/energy-rite/vehicles/update-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedGaugeId,
          notes: currentNote
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save note: ${response.status} ${response.statusText}`);
      }
      
      // Create a new local note for immediate display
      const newNote: GaugeNote = {
        id: `note-${Date.now()}`, // Generate a unique ID
        gaugeId: selectedGaugeId,
        location: selectedLocation,
        text: currentNote,
        timestamp: new Date().toISOString()
      };
      
      // Add to notes array
      setGaugeNotes(prevNotes => [...prevNotes, newNote]);
      
      // Update the notes in the fuelConsumptionData state
      setFuelConsumptionData(prevData => 
        prevData.map(item => {
          if (item.id === selectedGaugeId) {
            // Append to existing notes or set as new notes
            const updatedNotes = item.notes 
              ? `${item.notes}\n\n${currentNote}` 
              : currentNote;
            
            return { ...item, notes: updatedNotes };
          }
          return item;
        })
      );
      
      toast({
        title: 'Note Saved',
        description: `Note for ${selectedLocation} has been saved.`,
      });
      
      // Close the dialog
      setNoteDialogOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: `Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Fetch fuel data from EPS API
  const fetchFuelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/eps-vehicles');
      if (!response.ok) {
        throw new Error(`Failed to fetch EPS vehicles: ${response.status}`);
      }
      
      const vehicles = await response.json();
      
      const mapped: FuelConsumptionData[] = vehicles.map((vehicle: any, index: number) => {
        const fuelPercentage = parseFloat(vehicle.fuel_percentage) || 0;
        const fuelLevel = parseFloat(vehicle.fuel_level) || 0;
        const fuelVolume = parseFloat(vehicle.fuel_volume) || 0;
        const fuelTemp = parseFloat(vehicle.fuel_temperature) || 25;
        
        return {
          id: vehicle.plate || `vehicle-${index + 1}`,
          plate: vehicle.plate || 'Unknown Plate',
          branch: vehicle.driver_name || 'Unknown Driver',
          company: 'EPS Fleet',
          fuel_probe_1_level_percentage: Math.max(0, Math.min(100, fuelPercentage)),
          fuel_probe_1_volume_in_tank: Math.max(0, fuelVolume),
          fuel_probe_2_level_percentage: fuelPercentage,
          fuel_probe_2_volume_in_tank: fuelVolume,
          current_status: vehicle.speed > 5 ? 'Active' : 'Idle',
          last_message_date: vehicle.last_update || new Date().toISOString(),
          updated_at: vehicle.last_update,
          fuel_anomaly: false,
          fuel_anomaly_note: '',
          notes: null,
          lastFuelFill: undefined,
          fuel_probe_1_temperature: fuelTemp
        };
      });

      setFuelConsumptionData(mapped);
      console.log('✅ Fuel data fetched from EPS API:', mapped.length);
    } catch (err) {
      console.error('❌ Error fetching EPS vehicle data:', err);
      setError('Failed to load EPS vehicle data. Please try again.');
      
      // Fallback to dummy data
      const dummyFuelData: FuelConsumptionData[] = [
        {
          plate: 'HY74XFGP',
          branch: 'Driver A',
          company: 'EPS Fleet',
          fuel_probe_1_level_percentage: 78,
          fuel_probe_1_volume_in_tank: 125.5,
          fuel_probe_2_level_percentage: 76,
          fuel_probe_2_volume_in_tank: 120.2,
          current_status: 'Active',
          last_message_date: new Date().toISOString(),
          fuel_anomaly: false,
          fuel_anomaly_note: ''
        }
      ];
      
      setFuelConsumptionData(dummyFuelData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelData();
    const interval = setInterval(fetchFuelData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Convert fuel consumption data to fuel gauge format
  const getFuelGaugeData = () => {
    return fuelConsumptionData
      .map((vehicle, index) => {
        // Use parseFloat for better string to number conversion
        const percent = parseFloat(vehicle.fuel_probe_1_level_percentage) || 0;
        const capacity = parseFloat(vehicle.fuel_probe_1_volume_in_tank) || 0;
        const remaining = capacity * (percent / 100);

        return ({
        id: vehicle.id || index + 1,
        location: vehicle.branch || vehicle.plate || 'Unknown Location',
        fuelLevel: percent || 0,
        temperature: parseFloat(vehicle.fuel_probe_1_temperature) || 25,
        volume: capacity,
        remaining: `${capacity.toFixed(1)}L / ${remaining.toFixed(1)}L`,
        status: vehicle.current_status || 'active',
        lastUpdated: formatForDisplay(vehicle.last_message_date || new Date().toISOString()),
        updated_at: vehicle.updated_at,
        anomaly: !!vehicle.fuel_anomaly,
        anomalyNote: vehicle.fuel_anomaly_note || '',
        lastFuelFill: vehicle.lastFuelFill,
        notes: vehicle.notes
      });
    })
    .sort((a, b) => {
      // Sort purely alphabetically by location name
      return a.location.localeCompare(b.location);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-b-2 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-gray-600">Loading fuel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 text-red-500 text-6xl">⚠️</div>
          <p className="mb-4 text-red-600">Error loading fuel data</p>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={fetchFuelData} variant="outline">
            <RefreshCw className="mr-2 w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 h-full">
      {/* Gauges Grid */}
      <div className="p-4">
        {fuelConsumptionData.length > 0 ? (
          <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 xl:grid-cols-5">
            {getFuelGaugeData().map((data) => (
              <FuelGauge
                key={data.id}
                id={data.id}
                location={data.location}
                fuelLevel={data.fuelLevel}
                temperature={data.temperature}
                volume={data.volume}
                remaining={data.remaining}
                status={data.status}
                lastUpdated={data.lastUpdated}
                updated_at={data.updated_at}
                lastFuelFill={data.lastFuelFill}
                onAddNote={handleAddNote}
                hasNotes={!!data.notes}
                notes={data.notes}
                className="hover:scale-105 transition-transform duration-200 transform"
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Fuel className="mx-auto mb-4 w-16 h-16 text-gray-400" />
              <p className="text-gray-500 text-lg">No fuel data available</p>
              <p className="text-gray-400 text-sm">Check your connection to the Energy Rite server</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Note for {selectedLocation}</DialogTitle>
            <DialogDescription>
              Enter your note about this fuel gauge. This will be saved for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter your notes here..."
              className="min-h-[100px]"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote} disabled={!currentNote.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* We've removed the View Notes button, but we'll keep the dialog functionality for now,
          just in case we need to re-enable it in the future */}
      <Dialog open={viewNotesDialogOpen} onOpenChange={setViewNotesDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notes for {selectedLocation}</DialogTitle>
            <DialogDescription>
              View existing notes for this fuel gauge.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedGaugeId && fuelConsumptionData.find(data => data.id === selectedGaugeId)?.notes ? (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-700 text-sm whitespace-pre-wrap">
                  {fuelConsumptionData.find(data => data.id === selectedGaugeId)?.notes}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No notes available.</div>
            )}
            
            {/* Show manually added notes */}
            {getGaugeNotes(selectedGaugeId).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                {getGaugeNotes(selectedGaugeId).map((note) => (
                  <div key={note.id} className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{note.text}</div>
                    <div className="mt-1 text-gray-500 text-xs">{formatForDisplay(note.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewNotesDialogOpen(false)}>Close</Button>
            <Button variant="outline" onClick={() => refreshVehicleNote(selectedGaugeId)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => {
              setViewNotesDialogOpen(false);
              handleAddNote(selectedLocation, selectedGaugeId);
            }}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
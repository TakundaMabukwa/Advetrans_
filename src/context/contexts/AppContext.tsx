'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { costCenterService, HierarchicalCostCenter } from '@/lib/supabase/cost-centers';
import { getLastFuelFill } from '@/lib/fuel-fill-detector';
import { useUser } from './UserContext';

interface Route {
  id: string;
  route: string;
  locationCode: string;
  serviceDays: string[];
  userGroup: string;
  created: string;
}

interface FuelData {
  id: string;
  location: string;
  fuelLevel: number;
  temperature: number;
  volume: number;
  remaining: string;
  status: string;
  lastUpdated: string;
  lastFuelFill?: {
    time: string;
    amount: number;
    previousLevel: number;
  };
}

// Use the HierarchicalCostCenter from the service
type CostCenter = HierarchicalCostCenter;

interface AppContextType {
  routes: Route[];
  fuelData: FuelData[];
  vehicles: EnergyRiteVehicle[];
  costCenters: CostCenter[];
  selectedRoute: Route | null;
  activeTab: string;
  sidebarCollapsed: boolean;
  setRoutes: (routes: Route[]) => void;
  setFuelData: (fuelData: FuelData[]) => void;
  setVehicles: (vehicles: EnergyRiteVehicle[]) => void;
  setCostCenters: (costCenters: CostCenter[]) => void;
  setSelectedRoute: (route: Route | null) => void;
  setActiveTab: (tab: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateFuelDataForCostCenter: (costCenter: CostCenter) => Promise<void>;
  loadDataForUser: () => Promise<void>;
  clearAllData: () => void;
  loading: boolean;
  sseConnected: boolean;
  lastSseUpdate?: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, userCostCode } = useUser();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [fuelData, setFuelData] = useState<FuelData[]>([]);
  const [vehicles, setVehicles] = useState<EnergyRiteVehicle[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [lastSseUpdate, setLastSseUpdate] = useState<string | null>(null);

  // Handle URL parameters for navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    const route = searchParams.get('route');
    const view = searchParams.get('view');
    
    if (tab && ['dashboard', 'store', 'cost-centres'].includes(tab)) {
      setActiveTab(tab);
    }
    
    if (route) {
      const foundRoute = routes.find(r => r.id === route);
      if (foundRoute) {
        setSelectedRoute(foundRoute);
      }
    }
  }, [searchParams, routes]);

  // Update URL when activeTab changes
  const updateActiveTab = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Update URL when selectedRoute changes
  const updateSelectedRoute = (route: Route | null) => {
    setSelectedRoute(route);
    const params = new URLSearchParams(searchParams.toString());
    if (route) {
      params.set('route', route.id);
    } else {
      params.delete('route');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Load data based on user role and cost code
  const loadDataForUser = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading data for user:', { isAdmin, userCostCode, userRole: user?.role, userEmail: user?.email });

      if (isAdmin) {
        // Admin users see all data
        console.log('👑 Admin user - loading all data');
        
        // Load all cost centers
        const costCentersData = await costCenterService.fetchAllCostCenters();
        setCostCenters(costCentersData);
        
        // Load all vehicles
        const resp = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/vehicles`);
        if (resp.ok) {
          const json = await resp.json();
          if (json?.success && Array.isArray(json.data)) {
            setVehicles(json.data);
            setLastSseUpdate(new Date().toISOString());
            console.log('✅ Loaded all vehicles for admin:', json.data.length);
          }
        }
      } else if (userCostCode) {
        // Non-admin users see only their cost code data
        console.log('👤 Regular user - loading data for cost code:', userCostCode);
        
        // Load vehicles filtered by cost code
        const resp = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/vehicles?cost_code=${userCostCode}`);
        if (resp.ok) {
          const json = await resp.json();
          if (json?.success && Array.isArray(json.data)) {
            setVehicles(json.data);
            setLastSseUpdate(new Date().toISOString());
            console.log('✅ Loaded vehicles for user cost code:', json.data.length);
            
            // Automatically set fuel data for the user's cost code
            await updateFuelDataForCostCode(userCostCode);
          }
        }
        
        // Set a single cost center for the user
        const userCostCenter: CostCenter = {
          id: userCostCode,
          name: user?.company || 'User Cost Center',
          costCode: userCostCode,
          company: user?.company || 'Unknown Company',
          branch: user?.company || 'User Branch',
          subBranch: null,
          level: 1,
          children: [],
          path: user?.company || 'User Cost Center',
          newAccountNumber: 'ENER-0001',
          parentId: null,
          hasChildren: false
        };
        setCostCenters([userCostCenter]);
        
        // Set the selected route to the user's cost center
        setSelectedRoute({
          id: userCostCode,
          route: userCostCenter.name,
          locationCode: userCostCode,
          costCode: userCostCode
        });
      } else {
        console.log('⚠️ User has no cost code - setting empty data');
        setCostCenters([]);
        setVehicles([]);
        setFuelData([]);
      }
    } catch (error) {
      console.error('❌ Error loading data for user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear all data when user logs out
  const clearAllData = () => {
    console.log('🧹 Clearing all AppContext data...');
    setRoutes([]);
    setFuelData([]);
    setVehicles([]);
    setCostCenters([]);
    setSelectedRoute(null);
    setActiveTab('dashboard');
    setSidebarCollapsed(false);
    setSseConnected(false);
    setLastSseUpdate(null);
    console.log('✅ All AppContext data cleared');
  };

  // Update fuel data for a specific cost code (simplified version)
  const updateFuelDataForCostCode = async (costCode: string) => {
    try {
      console.log('📊 Fetching vehicle data for cost code:', costCode);
      
      // Filter vehicles by cost code
      const filteredVehicles = vehicles.filter(v => v.cost_code === costCode);
      
      if (filteredVehicles.length > 0) {
        const formattedFuelData: FuelData[] = filteredVehicles.map((vehicle, index) => {
          const percentage = Number(vehicle.fuel_probe_1_level_percentage ?? vehicle.fuel_probe_1_level ?? 0);
          const capacity = Number(typeof vehicle.volume === 'number' ? vehicle.volume : vehicle.volume ?? 0);
          const remainingLiters = (Number.isFinite(capacity) && Number.isFinite(percentage))
            ? (capacity * (percentage / 100))
            : 0;

          return ({
            id: vehicle.id || `vehicle-${index + 1}`,
            location: vehicle.branch || vehicle.plate || 'Unknown Vehicle',
            fuelLevel: Math.max(0, Math.min(100, Number(percentage) || 0)),
            temperature: Number(vehicle.fuel_probe_1_temperature ?? 25),
            volume: Math.max(0, Number(capacity || 0)),
            remaining: `${Math.max(0, Number(capacity || 0)).toFixed(1)}L / ${Math.max(0, Number(remainingLiters || 0)).toFixed(1)}L`,
            status: vehicle.drivername || 'Unknown',
            lastUpdated: vehicle.last_message_date || vehicle.updated_at || new Date().toLocaleString(),
            lastFuelFill: undefined
          });
        });

        // Fetch activity report data to detect fuel fills
        try {
          const today = new Date().toISOString().split('T')[0];
          const activityUrl = `http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/reports/activity-report?date=${today}&cost_code=${costCode}`;
          
          console.log('🔍 Fetching activity report for fuel fill detection:', activityUrl);
          const activityResponse = await fetch(activityUrl);
          
          if (activityResponse.ok) {
            const activityData = await activityResponse.json();
            
            if (activityData.success && activityData.data?.sites) {
              const sitesWithFills = activityData.data.sites.map((site: any) => {
                const lastFill = getLastFuelFill(
                  site.snapshots || [], 
                  site.site_id || site.id, 
                  site.branch || site.name
                );
                return { siteId: site.site_id || site.id, lastFill };
              });

              formattedFuelData.forEach(vehicle => {
                const siteData = sitesWithFills.find(s => s.siteId === vehicle.id);
                if (siteData?.lastFill) {
                  vehicle.lastFuelFill = siteData.lastFill;
                }
              });

              console.log('✅ Fuel fills detected for cost code:', sitesWithFills.filter(s => s.lastFill).length);
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch activity report for fuel fills:', err);
        }

        setFuelData(formattedFuelData);
        console.log('✅ Updated fuel data for cost code:', formattedFuelData.length, 'vehicles');
      } else {
        console.log('⚠️ No vehicles found for cost code:', costCode);
        setFuelData([]);
      }
    } catch (error) {
      console.error('❌ Error updating fuel data for cost code:', error);
      setFuelData([]);
    }
  };

  // Update fuel data using vehicles from SSE/context (filter by cost code)
  const updateFuelDataForCostCenter = async (costCenter: CostCenter) => {
    try {
      console.log('📊 Fetching vehicle data for cost center:', costCenter.costCode);
      
      if (!costCenter.costCode) {
        console.log('⚠️ No cost code available for this cost center');
        setFuelData([]);
        return;
      }
      
      // Filter from in-memory vehicles
      let filteredVehicles: any[] = (vehicles as any[]).filter((v: any) => v.cost_code === costCenter.costCode);

      if ((!filteredVehicles || filteredVehicles.length === 0) && (!vehicles || vehicles.length === 0)) {
        // Load vehicles once if not present, then filter
        try {
          const resp = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/vehicles`);
          if (resp.ok) {
            const json = await resp.json();
            if (json?.success && Array.isArray(json.data)) {
              setVehicles(json.data);
              filteredVehicles = json.data.filter((v: any) => v.cost_code === costCenter.costCode);
            }
          }
        } catch {}
      }

      if (filteredVehicles && filteredVehicles.length > 0) {
        const formattedFuelData: FuelData[] = filteredVehicles.map((vehicle: any, index: number) => {
          const percentage = Number(vehicle.fuel_probe_1_level_percentage ?? vehicle.fuel_probe_1_level ?? 0);
          // Treat `volume` as TANK CAPACITY. Do NOT use feed remaining directly.
          const capacity = Number(typeof vehicle.volume === 'number' ? vehicle.volume : vehicle.volume ?? 0);
          const remainingLiters = (Number.isFinite(capacity) && Number.isFinite(percentage))
            ? (capacity * (percentage / 100))
            : 0;

          return ({
            id: vehicle.id || `vehicle-${index + 1}`,
            location: vehicle.branch || vehicle.plate || 'Unknown Vehicle',
            fuelLevel: Math.max(0, Math.min(100, Number(percentage) || 0)),
            temperature: Number(vehicle.fuel_probe_1_temperature ?? 25),
            volume: Math.max(0, Number(capacity || 0)),
            remaining: `${Math.max(0, Number(capacity || 0)).toFixed(1)}L / ${Math.max(0, Number(remainingLiters || 0)).toFixed(1)}L`,
            status: vehicle.drivername || 'Unknown',
            lastUpdated: vehicle.last_message_date || vehicle.updated_at || new Date().toLocaleString(),
            lastFuelFill: undefined // Will be populated below
          });
        });

        // Fetch activity report data to detect fuel fills
        try {
          const today = new Date().toISOString().split('T')[0];
          const activityUrl = `http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/reports/activity-report?date=${today}&cost_code=${costCenter.costCode}`;
          
          console.log('🔍 Fetching activity report for fuel fill detection:', activityUrl);
          const activityResponse = await fetch(activityUrl);
          
          if (activityResponse.ok) {
            const activityData = await activityResponse.json();
            
            if (activityData.success && activityData.data?.sites) {
              // Process each site to detect fuel fills
              const sitesWithFills = activityData.data.sites.map((site: any) => {
                const lastFill = getLastFuelFill(
                  site.snapshots || [], 
                  site.site_id || site.id, 
                  site.branch || site.name
                );
                return { siteId: site.site_id || site.id, lastFill };
              });

              // Update formatted data with fuel fill information
              formattedFuelData.forEach(vehicle => {
                const siteData = sitesWithFills.find(s => s.siteId === vehicle.id);
                if (siteData?.lastFill) {
                  vehicle.lastFuelFill = siteData.lastFill;
                }
              });

              console.log('✅ Fuel fills detected for cost center:', sitesWithFills.filter(s => s.lastFill).length);
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch activity report for fuel fills:', err);
        }

        setFuelData(formattedFuelData);
        console.log('✅ Updated fuel data from SSE/context vehicles:', formattedFuelData.length, 'vehicles');
      } else {
        console.log('⚠️ No vehicle data found for cost code in context:', costCenter.costCode, '→ fetching vehicles from external once');
        const resp = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/vehicles`);
        if (resp.ok) {
          const json = await resp.json();
          if (json?.success && Array.isArray(json.data)) {
            setVehicles(json.data);
            filteredVehicles = json.data.filter((v: any) => v.cost_code === costCenter.costCode);
            const formattedFuelData: FuelData[] = filteredVehicles.map((vehicle: any, index: number) => ({
              id: vehicle.id || `vehicle-${index + 1}`,
              location: vehicle.branch || vehicle.plate || 'Unknown Vehicle',
              fuelLevel: Number(vehicle.fuel_probe_1_level ?? vehicle.fuel_probe_1_level_percentage ?? 0),
              temperature: Number(vehicle.fuel_probe_1_temperature ?? 25),
              volume: Number(typeof vehicle.volume === 'number' ? vehicle.volume : (vehicle.fuel_probe_1_volume_in_tank ?? vehicle.volume ?? 0)),
              remaining: `${Number(typeof vehicle.volume === 'number' ? vehicle.volume : (vehicle.fuel_probe_1_volume_in_tank ?? vehicle.volume ?? 0))}L`,
              status: vehicle.drivername || 'Unknown',
              lastUpdated: vehicle.last_message_date || vehicle.updated_at || new Date().toLocaleString(),
              lastFuelFill: undefined // Will be populated below
            }));

            // Fetch activity report data to detect fuel fills
            try {
              const today = new Date().toISOString().split('T')[0];
              const activityUrl = `http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/energy-rite/reports/activity-report?date=${today}&cost_code=${costCenter.costCode}`;
              
              console.log('🔍 Fetching activity report for fuel fill detection (fallback):', activityUrl);
              const activityResponse = await fetch(activityUrl);
              
              if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                
                if (activityData.success && activityData.data?.sites) {
                  // Process each site to detect fuel fills
                  const sitesWithFills = activityData.data.sites.map((site: any) => {
                    const lastFill = getLastFuelFill(
                      site.snapshots || [], 
                      site.site_id || site.id, 
                      site.branch || site.name
                    );
                    return { siteId: site.site_id || site.id, lastFill };
                  });

                  // Update formatted data with fuel fill information
                  formattedFuelData.forEach(vehicle => {
                    const siteData = sitesWithFills.find(s => s.siteId === vehicle.id);
                    if (siteData?.lastFill) {
                      vehicle.lastFuelFill = siteData.lastFill;
                    }
                  });

                  console.log('✅ Fuel fills detected for cost center (fallback):', sitesWithFills.filter(s => s.lastFill).length);
                }
              }
            } catch (err) {
              console.warn('⚠️ Could not fetch activity report for fuel fills (fallback):', err);
            }

            setFuelData(formattedFuelData);
            console.log('✅ Updated fuel data from local API:', formattedFuelData.length, 'vehicles');
          } else {
            console.log('⚠️ Local API returned no data for cost code:', costCenter.costCode);
            setFuelData([]);
          }
        } else {
          console.warn('⚠️ Local API error:', resp.status);
          setFuelData([]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching vehicle data for cost center:', error);
      
      // Set dummy fuel data when API fails
      const dummyFuelData: FuelData[] = [
        {
          id: 'vehicle-1',
          location: 'Johannesburg - SPUR THUVL',
          fuelLevel: 78,
          temperature: 24,
          volume: 125.5,
          remaining: '125.5L',
          status: 'Active',
          lastUpdated: new Date().toLocaleString()
        },
        {
          id: 'vehicle-2',
          location: 'Cape Town - KFC WEST',
          fuelLevel: 65,
          temperature: 22,
          volume: 98.2,
          remaining: '98.2L',
          status: 'Active',
          lastUpdated: new Date().toLocaleString()
        },
        {
          id: 'vehicle-3',
          location: 'Durban - MUSHROOM',
          fuelLevel: 82,
          temperature: 26,
          volume: 145.8,
          remaining: '145.8L',
          status: 'Active',
          lastUpdated: new Date().toLocaleString()
        },
        {
          id: 'vehicle-4',
          location: 'Pretoria - SPUR CENTRAL',
          fuelLevel: 45,
          temperature: 25,
          volume: 67.3,
          remaining: '67.3L',
          status: 'Low Fuel',
          lastUpdated: new Date().toLocaleString()
        },
        {
          id: 'vehicle-5',
          location: 'Port Elizabeth - KFC EAST',
          fuelLevel: 91,
          temperature: 23,
          volume: 156.7,
          remaining: '156.7L',
          status: 'Active',
          lastUpdated: new Date().toLocaleString()
        }
      ];
      
      setFuelData(dummyFuelData);
      console.log('🔄 Using dummy fuel data due to API error');
    }
  };

  useEffect(() => {
    if (user !== null) { // Only load data when user is loaded (including null for unauthenticated)
      loadDataForUser();
    }
  }, [user, isAdmin, userCostCode]);

  // Realtime disabled: we fetch once on load per requirements

  return (
    <AppContext.Provider
      value={{
        routes,
        fuelData,
        vehicles,
        costCenters,
        selectedRoute,
        activeTab,
        sidebarCollapsed,
        setRoutes,
        setFuelData,
        setVehicles,
        setCostCenters,
        setSelectedRoute: updateSelectedRoute,
        setActiveTab: updateActiveTab,
        setSidebarCollapsed,
        updateFuelDataForCostCenter,
        loadDataForUser,
        clearAllData,
        loading,
        sseConnected,
        lastSseUpdate
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Minimal vehicle type capturing known fields from the table; allows additional fields
export interface EnergyRiteVehicle {
  id?: string | number;
  plate?: string;
  branch?: string;
  company?: string;
  cost_code?: string;
  speed?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  fuel_probe_1_level?: number | null;
  fuel_probe_1_volume_in_tank?: number | null;
  fuel_probe_1_temperature?: number | null;
  fuel_probe_1_level_percentage?: number | null;
  fuel_probe_2_level?: number | null;
  fuel_probe_2_volume_in_tank?: number | null;
  fuel_probe_2_temperature?: number | null;
  fuel_probe_2_level_percentage?: number | null;
  is_active?: boolean | null;
  volume?: number | string | null;
  status?: string | null;
  drivername?: string | null;
  last_notification?: string | null;
  [key: string]: any;
}
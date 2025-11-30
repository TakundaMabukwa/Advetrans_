"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  Car,
  ChartBar,
  DollarSign,
  Phone,
  PlusSquare,
  QrCode,
  Settings,
  Settings2Icon,
  Truck,
  Users,
  Wrench,
  Route,
  Construction,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Fuel,
} from "lucide-react";
import GlobalProvider from "@/context/global-context/provider";
import { PAGES, Permission, hasPermission } from "@/lib/permissions/permissions";
import { createClient } from "@/lib/supabase/client";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// Client-side only date display to prevent hydration mismatch
function DateTimeDisplay() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="text-right text-sm text-gray-500">
        <div>Loading...</div>
        <div className="font-medium text-gray-700">--:--</div>
      </div>
    );
  }

  return (
    <div className="text-right text-sm text-gray-500">
      <div>
        {currentTime.toLocaleDateString('en-US', {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>
      <div className="font-medium text-gray-700">
        {currentTime.toLocaleTimeString('en-US', {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}



// Role-based navigation
const roleNavigation = {
  admin: [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Fleet Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
    { name: "Load Plan", href: "/load-plan", Icon: <Route /> },
    { name: "Fuel Can Bus", href: "/fuel", Icon: <Fuel /> },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Truck /> },
    { name: "Cost Centers", href: "/ccenter", Icon: <DollarSign /> },
    { name: "Financials", href: "/audit", Icon: <Settings2Icon /> },
    {
      name: "Inspections",
      href: "/fleetManager/inspections",
      Icon: <QrCode />,
    },
    { name: "User Management", href: "/userManagement", Icon: <PlusSquare /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
  "fleet manager": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Fleet Manager", href: "/fleetManager", Icon: <Truck /> },
    {
      name: "Inspections",
      href: "/fleetManager/inspections",
      Icon: <Briefcase />,
    },
    { name: "Financials", href: "/audit", Icon: <Settings2Icon /> },
    { name: "Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
    { name: "User Management", href: "/userManagement", Icon: <PlusSquare /> },
  ],
  fc: [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Load Plan", href: "/load-plan", Icon: <Route /> },
  ],
  "call centre": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Jobs", href: "/jobs", Icon: <Briefcase /> },
    { name: "Call Center", href: "/callcenter", Icon: <Phone /> },
    {
      name: "Technicians Assignment",
      href: "/callcenter/technician",
      Icon: <Wrench />,
    },
    {
      name: "Technician Vehicles",
      href: "/callcenter/breakdowns",
      Icon: <Truck />,
    },
    { name: "Workshops", href: "/callcenter/clients", Icon: <Users /> },
    // { name: "Qoute Management", href: "/ccenter", Icon: <Building2 /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
  customer: [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Drivers", href: "/drivers", Icon: <Users /> },
    { name: "Vehicles", href: "/vehicles", Icon: <Car /> },
    { name: "Fuel Can Bus", href: "/fuel", Icon: <Truck /> },
    { name: "Technicians Assignment", href: "/extechnicians", Icon: <Users /> },
    { name: "Workshop Vehicles", href: "/exvehicles", Icon: <Car /> },
    { name: "Financials", href: "/audit", Icon: <Settings2Icon /> },
    // { name: "Qoute Management", href: "/workshopQoute", Icon: <Building2 /> },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
  "cost centre": [
    { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
    { name: "Cost", href: "/ccenter", Icon: <Building2 /> },
    // {
    //   name: "Qoute Management",
    //   href: "/ccenter/create-qoutation",
    //   Icon: <DollarSign />,
    // },
    { name: "System Settings", href: "/settings", Icon: <Settings /> },
  ],
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [navigation, setNavigation] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const fetchUserPermissions = async () => {
      const userId = getCookie("userId");
      if (userId) {
        const { data: user } = await supabase
          .from('users')
          .select('permissions')
          .eq('id', userId)
          .single();
        
        if (user?.permissions) {
          setUserPermissions(user.permissions);
        }
      }
    };

    const role = decodeURIComponent(getCookie("role") || "");

    if (role) {
      setUserRole(role);
      fetchUserPermissions();
    } else {
      window.location.href = "/login";
    }
  }, []);

  // Generate navigation from user permissions
  useEffect(() => {
    if (userPermissions.length > 0) {
      const pageToNavMap = {
        dashboard: { name: "Dashboard", href: "/dashboard", Icon: <ChartBar /> },
        fleetJobs: { name: "Fleet Jobs", href: "/jobsFleet", Icon: <Briefcase /> },
        loadPlan: { name: "Load Plan", href: "/load-plan", Icon: <Route /> },
        fuel: { name: "Fuel Can Bus", href: "/fuel", Icon: <Fuel /> },
        drivers: { name: "Drivers", href: "/drivers", Icon: <Users /> },
        vehicles: { name: "Vehicles", href: "/vehicles", Icon: <Truck /> },
        costCenters: { name: "Cost Centers", href: "/ccenter", Icon: <DollarSign /> },
        financials: { name: "Financials", href: "/audit", Icon: <Settings2Icon /> },
        inspections: { name: "Inspections", href: "/fleetManager/inspections", Icon: <QrCode /> },
        userManagement: { name: "User Management", href: "/userManagement", Icon: <PlusSquare /> },
        systemSettings: { name: "System Settings", href: "/settings", Icon: <Settings /> }
      };
      
      const permissionBasedNav = userPermissions
        .filter(permission => permission.actions.includes('view'))
        .map(permission => pageToNavMap[permission.page])
        .filter(Boolean);
      
      setNavigation(permissionBasedNav);
    }
  }, [userPermissions]);

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-gradient-to-br from-blue-950 to-blue-800 text-white shadow-2xl transition-width duration-300 ease-in-out overflow-hidden ${sidebarExpanded ? "w-64" : "w-20"
          }`}
      >


        {/* Company Name */}
        <div className="px-3 py-4">
          <div className="text-center">
            <span className="text-white text-xl font-bold italic" style={{fontFamily: 'cursive'}}>
              {sidebarExpanded ? 'Adventrans' : 'A'}
            </span>
          </div>
        </div>

        {/* Navigation: scrollable */}
        <nav
          className="flex-1 px-2 pb-4 overflow-y-auto"
          // allow keyboard/scroll focus
          tabIndex={0}
        >
          <ul className="flex flex-col items-center space-y-2">

            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="w-full">
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 p-2 rounded-xl transition-colors duration-200 w-full
                      ${isActive
                        ? "bg-white/90 text-blue-900 shadow-md"
                        : "text-gray-300 hover:text-white hover:bg-blue-900/40"
                      }`}
                  >
                    <span
                      title={item.name}
                      className={`flex-shrink-0 flex items-center justify-center ${sidebarExpanded ? "ml-1" : "mx-auto"
                        }`}
                    >
                      <span
                        className={`p-2 rounded-full flex items-center justify-center transition-colors duration-150
                          ${isActive
                            ? "bg-white text-blue-900"
                            : "bg-white/10 text-white group-hover:bg-white/20 group-hover:text-white"
                          }`}
                        style={{ width: 36, height: 36 }}
                      >
                        {item.Icon}
                      </span>
                    </span>

                    {sidebarExpanded && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="flex flex-col items-center mb-4 px-3">
          <Button
            onClick={handleLogout}
            size="icon"
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ease-in-out ${sidebarExpanded ? "ml-64" : "ml-20"
          }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <Button
              size="icon"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="text-white bg-blue-700 hover:bg-blue-800"
              aria-label="Toggle sidebar"
            >
              {sidebarExpanded ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>

            <DateTimeDisplay />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <GlobalProvider>{children}</GlobalProvider>
          </div>
        </main>
      </div>
    </div>
  );
}

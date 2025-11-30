"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SecureButton } from "@/components/SecureButton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@radix-ui/react-label"
import UpdatePswrd from "@/components/updatePwrd"
import { createClient } from "@/lib/supabase/client"
import { profile } from "console"
import MapView from "@/components/map/display-map"

interface User {
    id: string
    name: string
    email: string
    role: "call-center" | "fleet-manager" | "cost-center" | "customer" | "admin"
    status: "active" | "inactive"
    lastLogin: string
    permissions: string[]
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

interface SystemSetting {
    id: string
    category: string
    name: string
    value: string
    description: string
    type: "text" | "number" | "boolean" | "select"
    options?: string[]
}

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const supabase = createClient()

    useEffect(() => {

        const UserData = async () => {
            const { data: session, error } = await supabase.auth.getSession()
            const userId = session.session?.user.id;

            if (userId) {
                const { data: user, error: userError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", userId)
                    .single();
                setUsers(user as any)
                if (userError) {
                    console.error("Error fetching user:", userError);
                    return;
                }
            }
        }
        UserData();
        setRoles([
            {
                id: "1",
                name: "Administrator",
                description: "Full system access and configuration",
                permissions: ["all"],
            },
            {
                id: "2",
                name: "Fleet Manager",
                description: "Manage vehicles, drivers, and approve jobs",
                permissions: ["manage_vehicles", "manage_drivers", "approve_jobs", "view_reports"],
            },
            {
                id: "3",
                name: "Call Center",
                description: "Handle breakdown requests and dispatch technicians",
                permissions: ["view_breakdowns", "dispatch_technicians", "manage_technicians"],
            },
            {
                id: "4",
                name: "Cost Center",
                description: "Create and manage quotations",
                permissions: ["create_quotations", "view_jobs", "manage_costs"],
            },
            {
                id: "5",
                name: "Customer",
                description: "Request breakdown services and view own requests",
                permissions: ["request_breakdown", "view_own_requests", "approve_quotations"],
            },
        ])

        setSettings([
            {
                id: "1",
                category: "General",
                name: "Company Name",
                value: "",
                description: "The name of your company",
                type: "text",
            },
            {
                id: "2",
                category: "General",
                name: "Default Location",
                value: "Johannesburg, South Africa",
                description: "Default location for new breakdowns",
                type: "text",
            },
            {
                id: "3",
                category: "Notifications",
                name: "Email Notifications",
                value: "true",
                description: "Enable email notifications for breakdowns",
                type: "boolean",
            },
            {
                id: "4",
                category: "Notifications",
                name: "SMS Notifications",
                value: "false",
                description: "Enable SMS notifications for urgent breakdowns",
                type: "boolean",
            },
            {
                id: "5",
                category: "System",
                name: "Auto-assign Technicians",
                value: "true",
                description: "Automatically assign nearest available technician",
                type: "boolean",
            },
            {
                id: "6",
                category: "System",
                name: "Breakdown Timeout",
                value: "30",
                description: "Minutes before escalating unassigned breakdowns",
                type: "number",
            },
        ])
    }, [])

    const handleUpdateSetting = (settingId: string, newValue: string) => {
        setSettings((prev) => prev.map((setting) => (setting.id === settingId ? { ...setting, value: newValue } : setting)))
        toast.success("The setting has been updated successfully.")
    }

    const groupedSettings = settings.reduce(
        (acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = []
            }
            acc[setting.category].push(setting)
            return acc
        },
        {} as Record<string, SystemSetting[]>,
    )

    return (
        <>
            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Settings & Administration</h2>
                </div>

                <Tabs defaultValue="system" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="system">System Settings</TabsTrigger>
                        <TabsTrigger value="locations">Locations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="system" className="space-y-4">
                        <h3 className="text-lg font-semibold">System Settings</h3>
                        <div className="space-y-6">
                            {groupedSettings && Object.entries(groupedSettings).map(([category, categorySettings]) => (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{category} Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {categorySettings.map((setting) => (
                                            <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{setting.name}</h4>
                                                    <p className="text-sm text-gray-600">{setting.description}</p>
                                                </div>
                                                <div className="w-48">
                                                    <div className="flex items-center gap-2">
                                                        {setting.type === "boolean" ? (
                                                            <Switch
                                                                checked={setting.value === "true"}
                                                                onCheckedChange={(checked) => handleUpdateSetting(setting.id, checked.toString())}
                                                                disabled={false}
                                                            />
                                                        ) : setting.type === "select" && setting.options ? (
                                                            <Select
                                                                value={setting.value}
                                                                onValueChange={(value) => handleUpdateSetting(setting.id, value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {setting.options.map((option) => (
                                                                        <SelectItem key={option} value={option}>
                                                                            {option}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Input
                                                                type={setting.type === "number" ? "number" : "text"}
                                                                value={setting.value}
                                                                onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                                                            />
                                                        )}
                                                        <SecureButton
                                                            page="systemSettings"
                                                            action="edit"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateSetting(setting.id, setting.value)}
                                                        >
                                                            Save
                                                        </SecureButton>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="border-2 p-3 rounded-2xl">
                            <h1 className="font-bold">Change Password</h1>
                            <UpdatePswrd />
                        </div>
                    </TabsContent>

                    <TabsContent value="locations" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Location Management</h3>
                            {/* <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Location
                            </Button> */}
                        </div>
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center text-gray-500">
                                    <MapView />
                                    {/* <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>Location management interface will be implemented here</p>
                                    <p className="text-sm mt-2">Configure service areas, technician locations, and coverage zones</p> */}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

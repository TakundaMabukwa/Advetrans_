"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    useEffect(() => {
        // Mock data
        setUsers([
            {
                id: "1",
                name: "John Admin",
                email: "admin@company.com",
                role: "admin",
                status: "active",
                lastLogin: "2025-01-15 09:30",
                permissions: ["all"],
            },
            {
                id: "2",
                name: "Sarah Manager",
                email: "sarah@company.com",
                role: "fleet-manager",
                status: "active",
                lastLogin: "2025-01-15 08:45",
                permissions: ["manage_vehicles", "manage_drivers", "approve_jobs"],
            },
            {
                id: "3",
                name: "Mike Operator",
                email: "mike@company.com",
                role: "call-center",
                status: "active",
                lastLogin: "2025-01-15 10:15",
                permissions: ["view_breakdowns", "dispatch_technicians"],
            },
        ])

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
                value: "Fleet Management Solutions",
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

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)

        const newUser: User = {
            id: Date.now().toString(),
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            role: formData.get("role") as any,
            status: "active",
            lastLogin: "Never",
            permissions:
                roles.find((r) => r.name.toLowerCase().replace(" ", "-") === formData.get("role"))?.permissions || [],
        }

        setUsers((prev) => [...prev, newUser])
        setIsAddUserOpen(false)
        toast.success(`User ${newUser.name} has been added to the system.`)
    }

    const handleUpdateSetting = (settingId: string, newValue: string) => {
        setSettings((prev) => prev.map((setting) => (setting.id === settingId ? { ...setting, value: newValue } : setting)))
        toast.success("The setting has been updated successfully.")
    }

    const handleToggleUserStatus = (userId: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
            ),
        )
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-800"
            case "fleet-manager":
                return "bg-blue-100 text-blue-800"
            case "call-center":
                return "bg-green-100 text-green-800"
            case "cost-center":
                return "bg-orange-100 text-orange-800"
            case "customer":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
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

                <Tabs defaultValue="users" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                        <TabsTrigger value="system">System Settings</TabsTrigger>
                        <TabsTrigger value="locations">Locations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">User Management</h3>
                            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add New User</DialogTitle>
                                        <DialogDescription>
                                            Create a new user account with appropriate role and permissions.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddUser} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" name="email" type="email" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="role">Role</Label>
                                            <Select name="role" required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                    <SelectItem value="fleet-manager">Fleet Manager</SelectItem>
                                                    <SelectItem value="call-center">Call Center</SelectItem>
                                                    <SelectItem value="cost-center">Cost Center</SelectItem>
                                                    <SelectItem value="customer">Customer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Create User
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Login</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleBadgeColor(user.role)}>
                                                        {user.role.replace("-", " ").toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={user.status === "active"}
                                                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                                                        />
                                                        <span className={user.status === "active" ? "text-green-600" : "text-red-600"}>
                                                            {user.status}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.lastLogin}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="roles" className="space-y-4">
                        <h3 className="text-lg font-semibold">Roles & Permissions</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {roles.map((role) => (
                                <Card key={role.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{role.name}</CardTitle>
                                                <CardDescription>{role.description}</CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedRole(role)
                                                    setIsEditRoleOpen(true)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Permissions:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.map((permission) => (
                                                    <Badge key={permission} variant="secondary" className="text-xs">
                                                        {permission.replace("_", " ")}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4">
                        <h3 className="text-lg font-semibold">System Configuration</h3>
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
                                                    {setting.type === "boolean" ? (
                                                        <Switch
                                                            checked={setting.value === "true"}
                                                            onCheckedChange={(checked) => handleUpdateSetting(setting.id, checked.toString())}
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
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="locations" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Location Management</h3>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Location
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center text-gray-500">
                                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>Location management interface will be implemented here</p>
                                    <p className="text-sm mt-2">Configure service areas, technician locations, and coverage zones</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

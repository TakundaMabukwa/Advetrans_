"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signup } from "@/lib/action/auth"
import { Phone, Truck, DollarSign, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState("")
  const [message, setMessage] = useState("")

  const roles = [
    { value: "call centre", label: "Call Centre", icon: Phone },
    { value: "fleet manager", label: "Fleet Manager", icon: Truck },
    { value: "cost centre", label: "Cost Centre", icon: DollarSign },
    { value: "customer", label: "Customer", icon: User },
  ]

  return (
    <>

      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <p className="text-gray-600 mt-2">Sign up to get started</p>
      </CardHeader>

      <form action={signup}>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              className="w-full"
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required
              name="role"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    <div className="flex items-center gap-2">
                      <roleOption.icon className="h-4 w-4" />
                      {roleOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </CardFooter>
      </form>

    </>
  )
}

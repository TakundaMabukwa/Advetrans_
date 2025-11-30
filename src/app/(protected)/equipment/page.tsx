"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

type Equipment = {
  id: number
  company: string
  reg: string
  skylink_pro_ip: string
  keypad: string
  beame_1: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const supabase = createClient()

  // Get user role from cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }
    const role = decodeURIComponent(getCookie('role') || '')
    setUserRole(role)
  }, [])

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, company, reg, skylink_pro_ip, keypad, beame_1')
      
      if (error) {
        console.error('Error fetching equipment:', error)
        toast.error('Failed to fetch equipment data')
        return
      }
      
      setEquipment(data || [])
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to fetch equipment data')
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  // Form state for Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [company, setCompany] = useState('EPS COURIER SERVICES')
  const [reg, setReg] = useState('')
  const [skylinkProIp, setSkylinkProIp] = useState('')
  const [keypad, setKeypad] = useState('')
  const [beame1, setBeame1] = useState('')

  // Inline editing state
  const [editingEquipment, setEditingEquipment] = useState<{[key: number]: Equipment}>({})
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  const resetForm = () => {
    setCompany('EPS COURIER SERVICES')
    setReg('')
    setSkylinkProIp('')
    setKeypad('')
    setBeame1('')
  }

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!company.trim() || !reg.trim()) {
      toast.error('Please fill required fields')
      return
    }

    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert([{
          company: company.trim(),
          reg: reg.trim(),
          skylink_pro_ip: skylinkProIp.trim(),
          keypad: keypad.trim(),
          beame_1: beame1.trim()
        }])
        .select()

      if (error) {
        console.error('Error adding equipment:', error)
        toast.error('Failed to add equipment')
        return
      }

      toast.success('Equipment added')
      resetForm()
      setIsAddOpen(false)
      fetchEquipment() // Refresh the list
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to add equipment')
    }
  }

  const handleFieldChange = (id: number, field: string, value: string) => {
    setEditingEquipment(prev => ({
      ...prev,
      [id]: {
        ...equipment.find(eq => eq.id === id)!,
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSave = async (id: number) => {
    const updatedEquipment = editingEquipment[id]
    if (!updatedEquipment) return

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          reg: updatedEquipment.reg,
          skylink_pro_ip: updatedEquipment.skylink_pro_ip,
          keypad: updatedEquipment.keypad,
          beame_1: updatedEquipment.beame_1
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating equipment:', error)
        toast.error('Failed to update equipment')
        return
      }

      toast.success('Equipment updated')
      setEditingEquipment(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      fetchEquipment()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to update equipment')
    }
  }

  const handleCancel = (id: number) => {
    setEditingEquipment(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete equipment?')) return
    
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting equipment:', error)
        toast.error('Failed to delete equipment')
        return
      }

      toast.success('Equipment deleted')
      fetchEquipment()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to delete equipment')
    }
  }

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(eq => 
    eq.reg?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-600 mt-1">Manage equipment records for your fleet</p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>

            <DialogContent className="w-11/12 md:w-2/5 max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle>Add Equipment</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" value={company} readOnly className="bg-gray-100" />
                </div>

                <div>
                  <Label htmlFor="reg">Registration *</Label>
                  <Input id="reg" value={reg} onChange={(e) => setReg(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="skylinkProIp">Skylink Pro IP</Label>
                  <Input id="skylinkProIp" value={skylinkProIp} onChange={(e) => setSkylinkProIp(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="keypad">Keypad</Label>
                  <Input id="keypad" value={keypad} onChange={(e) => setKeypad(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="beame1">Beame 1</Label>
                  <Input id="beame1" value={beame1} onChange={(e) => setBeame1(e.target.value)} />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); resetForm() }}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Equipment</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by vehicle registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Registration</TableHead>
                  <TableHead className="font-semibold">Skylink Pro IP</TableHead>
                  <TableHead className="font-semibold">Keypad</TableHead>
                  <TableHead className="font-semibold">Beame</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No equipment matches your search' : 'No equipment found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map(eq => {
                    const isEditing = editingEquipment[eq.id]
                    const currentData = isEditing || eq
                    return (
                      <TableRow key={eq.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-sm">{eq.company}</TableCell>
                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Input 
                              value={currentData.reg || ''} 
                              onChange={(e) => handleFieldChange(eq.id, 'reg', e.target.value)}
                              className="h-8 text-sm"
                            />
                          ) : eq.reg}
                        </TableCell>
                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Input 
                              value={currentData.skylink_pro_ip || ''} 
                              onChange={(e) => handleFieldChange(eq.id, 'skylink_pro_ip', e.target.value)}
                              className="h-8 text-sm"
                            />
                          ) : eq.skylink_pro_ip}
                        </TableCell>
                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Input 
                              value={currentData.keypad || ''} 
                              onChange={(e) => handleFieldChange(eq.id, 'keypad', e.target.value)}
                              className="h-8 text-sm"
                            />
                          ) : eq.keypad}
                        </TableCell>
                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Input 
                              value={currentData.beame_1 || ''} 
                              onChange={(e) => handleFieldChange(eq.id, 'beame_1', e.target.value)}
                              className="h-8 text-sm"
                            />
                          ) : eq.beame_1}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 items-center">
                            {userRole === 'admin' && (
                              isEditing ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleSave(eq.id)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={() => handleCancel(eq.id)}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => setEditingEquipment(prev => ({ ...prev, [eq.id]: eq }))}>Edit</Button>
                                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDelete(eq.id)}>
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

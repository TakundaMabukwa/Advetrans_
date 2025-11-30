'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ClientSection({
  formData,
  handleClientChange,
  handleClientDetailsChange,
  clients,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
        <CardDescription>
          Select an existing client or enter new client details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="selectedClient">Select Client (Optional)</Label>
          <Select
            value={formData.selectedClient}
            onValueChange={handleClientChange}
          >
            <SelectTrigger id="selectedClient">
              <SelectValue placeholder="Select existing client or leave blank for new client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Client (Manual Entry)</SelectItem>
              {clients?.data?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientDetails.name}
              onChange={(e) =>
                handleClientDetailsChange('name', e.target.value)
              }
              placeholder="Enter client name"
              disabled={!!formData.selectedClient}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientDetails.email}
              onChange={(e) =>
                handleClientDetailsChange('email', e.target.value)
              }
              placeholder="Enter email address"
              disabled={!!formData.selectedClient}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone</Label>
            <Input
              id="clientPhone"
              value={formData.clientDetails.phone}
              onChange={(e) =>
                handleClientDetailsChange('phone', e.target.value)
              }
              placeholder="Enter phone number"
              disabled={!!formData.selectedClient}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={formData.clientDetails.contactPerson}
              onChange={(e) =>
                handleClientDetailsChange('contactPerson', e.target.value)
              }
              placeholder="Enter contact person name"
              disabled={!!formData.selectedClient}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientAddress">Address</Label>
          <Textarea
            id="clientAddress"
            value={formData.clientDetails.address}
            onChange={(e) =>
              handleClientDetailsChange('address', e.target.value)
            }
            placeholder="Enter client address"
            rows={3}
            disabled={!!formData.selectedClient}
          />
        </div>

        {formData.selectedClient && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Client details are auto-populated from the
              selected client. To edit these details, select "New Client (Manual
              Entry)" from the dropdown above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

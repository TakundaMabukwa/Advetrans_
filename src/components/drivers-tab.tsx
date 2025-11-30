'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, ChevronDown, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { DriverTableSkeleton } from "@/components/loading-skeletons"
import { EpsDriver, DriversResponse } from "@/lib/actions/drivers"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, AlertTriangle, Star } from "lucide-react"
import DriverPerformanceModal from "@/components/modals/DriverPerformanceModal"

interface DriversTabProps {
  drivers: DriversResponse | null
  loading: boolean
  error: string
  onFetchDrivers: (page?: number, limit?: number, search?: string) => Promise<void>
}

export function DriversTab({ drivers, loading, error, onFetchDrivers }: DriversTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false)

  // Load drivers on component mount
  useEffect(() => {
    if (!drivers) {
      onFetchDrivers(1, 20)
    }
  }, [drivers, onFetchDrivers])

  // Handle search
  const handleSearch = async () => {
    setIsSearching(true)
    setCurrentPage(1)
    await onFetchDrivers(1, 20, searchTerm)
    setIsSearching(false)
  }

  // Handle page change
  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    await onFetchDrivers(page, 20, searchTerm)
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value === '') {
      // Clear search when input is empty
      handleSearch()
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // Format managed code display
  const formatManagedCode = (managedCode: string | null) => {
    if (!managedCode) return 'N/A'
    return managedCode
  }

  // Format additional info display
  const formatAdditionalInfo = (additionalInfo: string | null) => {
    if (!additionalInfo) return 'N/A'
    return additionalInfo.length > 50 ? `${additionalInfo.substring(0, 50)}...` : additionalInfo
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-gray-200 border-b">
        <div className="flex justify-between items-center">
          <div className="relative">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
             <Input
               placeholder="Search by name, code, address, cellular..."
               className="pl-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 w-80"
               value={searchTerm}
               onChange={(e) => handleSearchChange(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
             />
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-transparent border-gray-300 hover:border-cyan-500 hover:text-cyan-600"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-transparent border-gray-300 hover:border-cyan-500 hover:text-cyan-600"
            >
              <span>Columns</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <DriverTableSkeleton />
      ) : error ? (
        <div className="p-12 text-center">
          <div className="mb-2 font-medium text-red-600 text-lg">Error loading drivers</div>
          <div className="mb-4 text-gray-500 text-sm">{error}</div>
          <Button onClick={() => onFetchDrivers(currentPage, 20, searchTerm)}>
            Try Again
          </Button>
        </div>
      ) : !drivers || drivers.drivers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-500 text-lg">No drivers found</div>
          {searchTerm && (
            <div className="mt-2 text-gray-400 text-sm">
              No drivers match your search criteria
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                 <tr>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     First Name
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Surname
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Code
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Managed Code
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Address
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Cellular
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Additional Info
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Performance
                   </th>
                   <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.drivers.map((driver: EpsDriver, index: number) => {
                  return (
                    <tr
                      key={driver.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-cyan-50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                        {driver.first_name}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {driver.surname}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {driver.code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {formatManagedCode(driver.managed_code)}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {driver.address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {driver.cellular || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {formatAdditionalInfo(driver.additional_info)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 text-xs"
                          onClick={() => {
                            setSelectedDriver(`${driver.first_name} ${driver.surname}`)
                            setPerformanceModalOpen(true)
                          }}
                        >
                          <Star className="w-3 h-3" />
                          View
                        </Button>
                      </td>
                      <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                            title="Edit Driver"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                            title="Remove Driver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {drivers.totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-gray-200 border-t">
              <div className="flex justify-between items-center">
                <div className="text-gray-700 text-sm">
                  Showing {((drivers.page - 1) * drivers.limit) + 1} to {Math.min(drivers.page * drivers.limit, drivers.total)} of {drivers.total} drivers
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isSearching}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, drivers.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(drivers.totalPages - 4, currentPage - 2)) + i
                      if (pageNum > drivers.totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isSearching}
                          className="p-0 w-8 h-8"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === drivers.totalPages || isSearching}
                    className="flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <DriverPerformanceModal
        isOpen={performanceModalOpen}
        onClose={() => setPerformanceModalOpen(false)}
        driverName={selectedDriver || ''}
      />
    </div>
  )
}

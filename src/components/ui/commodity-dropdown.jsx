"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMODITIES = [
  { comId: 'BR', comGroup: '', comName: 'BREEZE' },
  { comId: 'Cl', comGroup: '', comName: 'Coal' },
  { comId: 'ST', comGroup: '', comName: 'STANDING TIME' },
  { comId: 'FS', comGroup: '', comName: 'FINE SPEEDING' },
  { comId: 'FO', comGroup: '', comName: 'FINE OVERLOAD' },
  { comId: 'FW', comGroup: '', comName: 'FINE OVERWEIGHT' },
  { comId: 'FC', comGroup: '', comName: 'FORKLIFT CHARGE' },
  { comId: 'FMCG', comGroup: '', comName: 'FAST MOVING CONSUMER GOODS' },
  { comId: 'GENC', comGroup: '', comName: 'GEN CARGO' },
  { comId: 'CIT', comGroup: '', comName: 'CITRUS' },
  { comId: 'BRD', comGroup: '', comName: 'BOARDS' },
  { comId: 'PNT', comGroup: '', comName: 'PAINT' },
  { comId: 'CMT', comGroup: '', comName: 'CEMENT' },
  { comId: 'HCON', comGroup: '', comName: 'HOUSEHOLD CONSUMABLES' },
  { comId: 'CONT', comGroup: '', comName: 'CONTAINER' },
  { comId: 'GNL', comGroup: '0', comName: 'GENERAL CARGO' },
  { comId: 'GF', comGroup: '0', comName: 'GRAPE FRUIT' },
  { comId: 'THDW', comGroup: '0', comName: 'TILES / HARDWARE' },
  { comId: 'WH', comGroup: '0', comName: 'WHEAT' },
  { comId: 'TI', comGroup: '0', comName: 'TILES' },
  { comId: 'PAL', comGroup: '0', comName: 'PALLETS' },
  { comId: 'FERT', comGroup: '0', comName: 'FERTILIZER' },
  { comId: 'FL', comGroup: '0', comName: 'FLOUR' },
  { comId: 'STEEL', comGroup: '0', comName: 'STEEL' },
  { comId: 'SHV', comGroup: '0', comName: 'SHAVINGS' },
  { comId: 'TYRE', comGroup: '0', comName: 'TYRES' },
  { comId: 'SLT', comGroup: '0', comName: 'SALT' },
  { comId: 'GRAIN', comGroup: '0', comName: 'GRAINS' },
  { comId: 'EMP', comGroup: '0', comName: 'EMPTY' },
  { comId: 'MDD', comGroup: '0', comName: 'MDD LOADS' },
  { comId: 'BUILD', comGroup: '0', comName: 'BUILDERS WAREHOUSE' },
  { comId: 'SALE', comGroup: '0', comName: 'SALEABLE LOADS MLS' },
  { comId: 'MAKRO', comGroup: '0', comName: 'MAKRO FIXED' },
  { comId: 'JUMBO', comGroup: '0', comName: 'JUMBO' },
  { comId: 'CNCLDN', comGroup: '0', comName: 'CANCELLED DN' },
  { comId: 'DFT', comGroup: '0', comName: 'DFT ADHOC TRIP' },
  { comId: 'MDD TRIP RATE', comGroup: '0', comName: 'MDD TRIP RATE' },
  { comId: 'CHEP', comGroup: '0', comName: 'CHEP' },
  { comId: 'BRK', comGroup: '0', comName: 'BROKER LOAD' },
  { comId: 'HEIN', comGroup: '0', comName: 'HEINEKEN (MASSMART)' },
  { comId: 'QSUGAR', comGroup: '0', comName: 'QUALITY SUGAR (MASSMART)' },
  { comId: 'SHU', comGroup: '0', comName: 'SHUNTER' },
  { comId: 'JM', comGroup: '0', comName: 'JUMBO (MASSMART)' },
  { comId: 'M5', comGroup: '0', comName: 'MASSMART M5' },
  { comId: 'CAM', comGroup: '0', comName: 'CAMBRIDGE DENVER' },
  { comId: 'MC', comGroup: '0', comName: 'MASSCASH' },
  { comId: 'RH', comGroup: '0', comName: 'RHINO' },
  { comId: 'FD', comGroup: '0', comName: 'FOOD' },
  { comId: 'SAL', comGroup: '0', comName: 'SA LADDER' },
  { comId: 'UML', comGroup: '0', comName: 'UMLILO' },
  { comId: 'MDD DAY RT', comGroup: '0', comName: 'MDD DAY RATE' },
  { comId: 'BRKDN', comGroup: '0', comName: 'BREAKDOWN' },
  { comId: 'SERV/COF', comGroup: '0', comName: 'SERVICE / COF' },
  { comId: 'NEWV', comGroup: '0', comName: 'NEW VEHICLE' },
  { comId: 'BBGD', comGroup: '0', comName: 'BAKKIE BRIGADE' },
  { comId: 'GRMR', comGroup: '0', comName: 'GROMOR' },
  { comId: 'HMCPT', comGroup: '0', comName: 'HOME CONCEPTS' },
  { comId: 'REVLOGS', comGroup: '0', comName: 'REVERSE LOGISTICS' },
  { comId: 'REDLR', comGroup: '0', comName: 'RE-DELIVERY' },
  { comId: 'MT', comGroup: '0', comName: 'MAKRO TRIPS' },
  { comId: 'MR', comGroup: '0', comName: 'MILKRUN' },
  { comId: 'MDFT', comGroup: '0', comName: 'MAKRO DFT' },
  { comId: 'CLTHM', comGroup: '0', comName: 'CLOTHING MASSMART' },
  { comId: 'SAPPI', comGroup: '0', comName: 'SAPPI' },
  { comId: 'CAM140', comGroup: '0', comName: 'CAMBRIDGE RDC140' },
  { comId: 'CAM148', comGroup: '0', comName: 'CAMBRIDGE RDC148' },
  { comId: 'CAMZULU', comGroup: '0', comName: 'CAMBRIDGE ZULULAND' },
  { comId: 'CAM PINE', comGroup: '0', comName: 'CAMBRIDGE PINETOWN' },
  { comId: 'CAMTR', comGroup: '0', comName: 'CAMBRIDGE TRIPS' },
  { comId: 'BDFT', comGroup: '0', comName: 'BUILDERS DFT' },
  { comId: 'KELL', comGroup: '0', comName: 'KELLOGGS' },
  { comId: 'ULT', comGroup: '0', comName: 'ULTRA-CHEM' },
  { comId: 'REPL', comGroup: '0', comName: 'REPLACEMENT' },
  { comId: 'BRAK', comGroup: '0', comName: 'BRAKEN GATE' },
  { comId: 'RUST', comGroup: '0', comName: 'RUSTENBURG PROJECT' },
  { comId: 'BUILDF', comGroup: '0', comName: 'BUILDERS FIXED' },
  { comId: 'HUL', comGroup: '0', comName: 'HULETT SUGAR' },
  { comId: 'ILOV', comGroup: '0', comName: 'ILLOVO SUGAR' },
  { comId: 'AFRO', comGroup: '0', comName: 'AFRO FISHING' },
  { comId: 'ILL', comGroup: '0', comName: 'ILLOVO DFT' },
  { comId: 'SAP', comGroup: '0', comName: 'SAPPI DFT' },
  { comId: 'P&G', comGroup: '0', comName: 'P&G  BOKSBURG (MASSMART)' },
  { comId: 'VIP', comGroup: '0', comName: 'VIP LIQOURS' },
  { comId: 'DFTST', comGroup: '0', comName: 'DFT STRIDE' },
  { comId: 'OMNI', comGroup: '0', comName: 'MDD OMNI' },
  { comId: 'SPEC', comGroup: '0', comName: 'SPECIAL PROJECTS' },
  { comId: 'SAINT', comGroup: '0', comName: 'SAINT GOBAIN FIX FLEET' },
  { comId: 'LAD', comGroup: '0', comName: 'LADDER PROJECT' },
  { comId: 'BXM', comGroup: '0', comName: 'CROSS BORDER MOZAMBIQUE' },
  { comId: 'VEG', comGroup: '0', comName: 'VEGGIES' },
  { comId: 'CRAD', comGroup: '0', comName: 'CRADLESTONE PROJECT' },
  { comId: 'TVP', comGroup: '0', comName: 'TV PROJECT' },
  { comId: 'PALL', comGroup: '0', comName: 'PALLET PROJECT' },
  { comId: 'TIP', comGroup: '0', comName: 'TIPPER LOAD' },
  { comId: 'SALB', comGroup: '0', comName: 'SALEABLE LOADS' },
  { comId: 'CLEAR', comGroup: '0', comName: 'CLEARANCE FEES BORDER' }
]

export function CommodityDropdown({ value, onChange, placeholder = "Select commodity" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const filteredCommodities = COMMODITIES.filter(commodity =>
    commodity.comId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commodity.comName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (commodity) => {
    onChange(commodity.comId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <span>
          {value ? (
            <span>
              <span className="font-medium">{value}</span>
              {COMMODITIES.find(c => c.comId === value)?.comName && (
                <span className="text-muted-foreground ml-2">
                  - {COMMODITIES.find(c => c.comId === value).comName}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={searchInputRef}
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredCommodities.length === 0 ? (
              <div className="py-6 text-center text-sm">No commodities found.</div>
            ) : (
              filteredCommodities.map((commodity) => (
                <div
                  key={commodity.comId}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === commodity.comId && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(commodity)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{commodity.comId}</span>
                    {commodity.comName && (
                      <span className="text-xs text-muted-foreground">{commodity.comName}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
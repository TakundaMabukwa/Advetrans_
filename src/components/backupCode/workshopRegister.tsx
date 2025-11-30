"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  FileText,
  DollarSign,
  Shield,
  Award,
  Wrench,
  Car,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Define your interface with all fields exactly as given:
interface WorkshopFormData {
  // 1. Workshop Details
  work_name: string
  trading_name: string
  number_of_working_days: number
  labour_rate: number
  fleet_rate: number
  company_registration_doc: string
  after_hours_number: string
  franchise: string

  // 2. VAT Information
  vat_number: number
  vat_certificate: string
  vat_cert_expiry_date: string

  // 3. BBBEE Information
  bbbee_level: string
  bbbee_doc: string
  hdi_perc: string
  bbbee_expire_date: string

  // 4. Insurance Information
  insurance_policy_number: number
  insurance_company_name: string
  insurance_policy_doc: string

  // 5. Workshop Assosiated (booleans + docs)
  dekra: boolean
  apmma: boolean
  cra: boolean
  era: boolean
  mibco: boolean
  miwa: boolean
  raaf: boolean
  rmi: boolean
  saarsa: boolean
  sambra: boolean
  saqa: boolean
  sata: boolean

  dekra_doc: string
  apmma_doc: string
  cra_doc: string
  era_doc: string
  mibco_doc: string
  miwa_doc: string
  raaf_doc: string
  rmi_doc: string
  saarsa_doc: string
  sambra_doc: string
  saqa_doc: string
  sata_doc: string

  // 6. Type of Vehicles
  type_of_vehicle: string[]

  // 7. Workshop Type
  type_of_workshop: string[]

  // 8. Engineer shop capability  
  engineering_shop_capability: string[]
  block_boring: boolean
  crank_grinding: boolean
  valve_grinding: boolean
  block_pressure_test: boolean
  engine_block_resurfacing: boolean

  // 9. engineering shop tools (booleans + pictures)
  micrometer: boolean
  vernier_caliper: boolean
  aluminum_welding: boolean
  straight_Edge: boolean
  depth_gauge: boolean
  lathe_guage: boolean
  lathe_machine: boolean
  honing_tool: boolean

  micrometer_picture: string
  vernier_caliper_picture: string
  aluminum_welding_picture: string
  straight_Edge_picture: string
  depth_gauge_picture: string
  lathe_guage_picture: string
  lathe_machine_picture: string
  honing_tool_picture: string

  // 10. Car wash capability (booleans)
  standard_wash: boolean
  valet: boolean
  vehicles_detailing: boolean

  // 11. Car Wash Tools (booleans + pictures)
  high_pressure_wash: boolean
  polisher_machine: boolean
  vacuum_cleaner: boolean

  high_pressure_wash_picture: string
  polisher_machine_picture: string
  vacuum_cleaner_picture: string

  // 12. Mechanical Capability (booleans)
  suspension: boolean
  service: boolean
  m_brakes: boolean
  minor_repairs: boolean
  major_repairs: boolean
  engine_overhuals: boolean
  drive_line: boolean
  clutch_overhuals: boolean

  // 13. Mechanical Tools (booleans + pictures)
  four_two: boolean
  engine_crane_mech: boolean
  jack_mech: boolean
  mechanical_tool: boolean
  trestles: boolean
  compression_tester: boolean
  compressor_mech: boolean
  pneumatic_tool: boolean

  four_two_picture: string
  engine_crane_mech_picture: string
  jack_mech_picture: string
  mechanical_tool_picture: string
  trestles_picture: string
  compression_tester_picture: string
  compressor_mech_picture: string
  pneumatic_tool_picture: string

  // 14. Electrical Capability (booleans)
  wiring_minor: boolean
  wiring_major: boolean
  starters: boolean
  light_retros: boolean
  radios_audio: boolean
  two_way_radio: boolean

  // 15. Electrical Tool (booleans + pictures)
  starter: boolean
  alternator: boolean
  multi_meter: boolean
  batter_charge_tool: boolean

  starter_picture: string
  alternator_picture: string
  multi_meter_picture: string
  batter_charge_tool_picture: string

  // 16. Panel Beater Capability (booleans)
  msr: boolean
  nsr: boolean
  hail_demage: boolean
  couch_builder: boolean
  body_modification: boolean
  ambulance: boolean
  cash_in_transit: boolean
  dent_vehicles: boolean

  // 17. Panel Beater Tools (booleans + pictures)
  spray_booth: boolean
  spray_gun: boolean
  jig: boolean
  mixing_booth: boolean
  compressor_tool: boolean
  straighning_tool: boolean
  tig_welder_tool: boolean
  mig_welder_tool: boolean

  spray_booth_picture: string
  spray_gun_picture: string
  jig_picture: string
  mixing_booth_picture: string
  compressor_tool_picture: string
  straighning_tool_picture: string
  tig_welder_tool_picture: string
  mig_welder_tool_picture: string

  // 18. Fitment Center Tyre Tools (booleans + pictures)
  wheel_alignment: boolean
  wheel_balancing: boolean

  wheel_alignment_machine_picture: string
  wheel_balancing_machine_picture: string

  // 19. Fitment Center Exhuast tools (booleans + pictures)
  tig_welder: boolean
  mig_welder: boolean
  pipe_bender: boolean

  tig_welder_picture: string
  mig_welder_picture: string
  pipe_bender_picture: string

  // 20. Fitment center battery tools (booleans + pictures array)
  battery_charge: boolean
  battery_tester: boolean

  battery_charge_doc: string
  battery_tester_pictures: string[] // array upload

  // 21. Driver Line Capability options (booleans only)
  brakes: boolean
  driver_line_cv_joints: boolean
  clutch_over_huals: boolean
  gearbox_bench: boolean
  propshaft_bench: boolean

  // 22. Driver line tools and docs (booleans + docs)
  four_or_two_post_hoist: boolean
  engine_crane: boolean
  jack: boolean
  mechanical_tools: boolean
  trestle: boolean
  press: boolean
  compressor: boolean
  pneumatic_tools: boolean
  gearbox_test_bench: boolean
  propshaft_test_bench: boolean

  four_or_two_post_hoist_doc: string
  engine_crane_doc: string
  jack_doc: string
  mechanical_tools_doc: string
  trestle_doc: string
  press_doc: string
  compressor_doc: string
  pneumatic_tools_doc: string
  gearbox_test_bench_doc: string
  propshaft_test_bench_doc: string

  // 23. banking details
  payment_method: string[]
  bank_name: string
  account_no: number
  bank_letter: string

  // 24. physical address
  province: string
  street: string
  city: string
  town: string
  postal_code: number
}

// Arrays for selections:

const vehicleTypes = [
  "passenger",
  "sport utility vehicle (SUV)",
  "light delivery vehicles",
  "multi utility vehicles",
  "commercial",
  "passenger carrying",
  "yellow metals",
  "motorcycle",
  "special",
  "trailers",
  "boats",
]

const workshopTypes = [
  "breakdown",
  "car wash",
  "driver line repairs",
  "electrical",
  "fitment centre (Batteries)",
  "fitment centre (Glass)",
  "fitment centre (Tyres)",
  "fitment centre (Exhaust)",
  "fitment centre (Retro Fitments)",
  "mechanical",
  "towing",
  "vehicle testing station",
  "engineering shop",
  "check overall",
  "due for service",
]

const engineeringCapabilities = [
  "crank grinding",
  "head pressure test",
  "engine block resurfacing",
  "block pressure test",
  "valve grinding",
  "block boring",
]

const bbbeelevels = [
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5",
  "Level 6",
  "Level 7",
  "Level 8",
  "Non-Compliant",
]

const paymentMethods = ["EFT"]

// Reusable Boolean + Optional File Input component

interface BooleanFileInputProps {
  label: string
  boolField: keyof WorkshopFormData
  fileField?: keyof WorkshopFormData
  formData: WorkshopFormData
  setFormData: React.Dispatch<React.SetStateAction<WorkshopFormData>>
  accept?: string
  multipleFile?: boolean // for array file uploads only, default false
}

function BooleanFileInput({
  label,
  boolField,
  fileField,
  formData,
  setFormData,
  accept = ".pdf,.jpg,.jpeg,.png",
  multipleFile = false,
}: BooleanFileInputProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={boolField}
          checked={formData[boolField] as boolean}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              [boolField]: checked,
              ...(checked === false && fileField ? { [fileField]: multipleFile ? [] : "" } : {}),
            }))
          }
        />
        <Label htmlFor={boolField}>{label}</Label>
      </div>

      {fileField && formData[boolField] && (
        <div className="mt-2">
          <Label htmlFor={fileField}>Upload {label} Document/Image</Label>
          <Input
            id={String(fileField)}
            type="file"
            accept={accept}
            multiple={multipleFile}
            onChange={(e) => {
              const files = e.target.files
              if (files && fileField) {
                if (multipleFile) {
                  // Read names of all files
                  const fileNames = Array.from(files).map((file) => file.name)
                  setFormData((prev) => ({
                    ...prev,
                    [fileField]: fileNames,
                  }))
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    [fileField]: files[0]?.name || "",
                  }))
                }
              }
            }}
          />
          {/* Show uploaded file(s) */}
          {multipleFile ? (
            Array.isArray(formData[fileField]) &&
            formData[fileField].length > 0 && (
              <ul className="text-sm mt-1 text-gray-700 list-disc ml-4">
                {(formData[fileField] as string[]).map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            )
          ) : (
            formData[fileField] && (
              <p className="text-sm mt-1 text-gray-700">Uploaded file: {formData[fileField]}</p>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkshopRegistrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { id: 1, title: "Workshop Details", description: "Basic workshop information", icon: <Building2 className="h-2 w-2" /> },
    { id: 2, title: "VAT Information", description: "VAT details and documents", icon: <DollarSign className="h-2 w-2" /> },
    { id: 3, title: "BBBEE Information", description: "BBBEE certification", icon: <Award className="h-2 w-2" /> },
    { id: 4, title: "Insurance Information", description: "Insurance policy details", icon: <Shield className="h-2 w-2" /> },
    { id: 5, title: "Workshop Associations", description: "Associations and certificates", icon: <FileText className="h-2 w-2" /> },
    { id: 6, title: "Vehicle Types", description: "Specify vehicle types handled", icon: <Car className="h-2 w-2" /> },
    { id: 7, title: "Workshop Types", description: "Workshop service types", icon: <Wrench className="h-2 w-2" /> },
    { id: 8, title: "Engineer Shop Capability", description: "Engineering capabilities", icon: <Wrench className="h-2 w-2" /> },
    { id: 9, title: "Engineering Shop Tools", description: "Tools for engineering shop", icon: <Wrench className="h-2 w-2" /> },
    { id: 10, title: "Car Wash Capability", description: "Car wash services", icon: <Car className="h-2 w-2" /> },
    { id: 11, title: "Car Wash Tools", description: "Tools for car wash", icon: <Car className="h-2 w-2" /> },
    { id: 12, title: "Mechanical Capability", description: "Mechanical repair capabilities", icon: <Wrench className="h-2 w-2" /> },
    { id: 13, title: "Mechanical Tools", description: "Mechanical tools list", icon: <Wrench className="h-2 w-2" /> },
    { id: 14, title: "Electrical Capability", description: "Electrical repair capabilities", icon: <Wrench className="h-2 w-2" /> },
    { id: 15, title: "Electrical Tools", description: "Electrical tools list", icon: <Wrench className="h-2 w-2" /> },
    { id: 16, title: "Panel Beater Capability", description: "Panel beating services", icon: <Wrench className="h-2 w-2" /> },
    { id: 17, title: "Panel Beater Tools", description: "Tools for panel beating", icon: <Wrench className="h-2 w-2" /> },
    { id: 18, title: "Fitment Center Tyre Tools", description: "Tyre related tools", icon: <Wrench className="h-2 w-2" /> },
    { id: 19, title: "Fitment Center Exhaust Tools", description: "Exhaust repair tools", icon: <Wrench className="h-2 w-2" /> },
    { id: 20, title: "Fitment Center Battery Tools", description: "Battery tools and pictures", icon: <Wrench className="h-2 w-2" /> },
    { id: 21, title: "Driver Line Capability", description: "Driver line capabilities", icon: <Wrench className="h-2 w-2" /> },
    { id: 22, title: "Driver Line Tools & Docs", description: "Driver line tools and documents", icon: <Wrench className="h-2 w-2" /> },
    { id: 23, title: "Banking Details", description: "Bank account information", icon: <Award className="h-2 w-2" /> },
    { id: 24, title: "Physical Address", description: "Workshop physical location", icon: <Building2 className="h-2 w-2" /> },
  ]

  const [formData, setFormData] = useState<WorkshopFormData>({
    work_name: "",
    trading_name: "",
    number_of_working_days: 5,
    labour_rate: 0,
    fleet_rate: 0,
    company_registration_doc: "",
    after_hours_number: "",
    franchise: "",

    vat_number: 0,
    vat_certificate: "",
    vat_cert_expiry_date: "",

    bbbee_level: "",
    bbbee_doc: "",
    hdi_perc: "",
    bbbee_expire_date: "",

    insurance_policy_number: 0,
    insurance_company_name: "",
    insurance_policy_doc: "",

    dekra: false,
    apmma: false,
    cra: false,
    era: false,
    mibco: false,
    miwa: false,
    raaf: false,
    rmi: false,
    saarsa: false,
    sambra: false,
    saqa: false,
    sata: false,

    dekra_doc: "",
    apmma_doc: "",
    cra_doc: "",
    era_doc: "",
    mibco_doc: "",
    miwa_doc: "",
    raaf_doc: "",
    rmi_doc: "",
    saarsa_doc: "",
    sambra_doc: "",
    saqa_doc: "",
    sata_doc: "",

    type_of_vehicle: [],

    type_of_workshop: [],

    engineering_shop_capability: [],
    block_boring: false,
    crank_grinding: false,
    valve_grinding: false,
    block_pressure_test: false,
    engine_block_resurfacing: false,

    micrometer: false,
    vernier_caliper: false,
    aluminum_welding: false,
    straight_Edge: false,
    depth_gauge: false,
    lathe_guage: false,
    lathe_machine: false,
    honing_tool: false,

    micrometer_picture: "",
    vernier_caliper_picture: "",
    aluminum_welding_picture: "",
    straight_Edge_picture: "",
    depth_gauge_picture: "",
    lathe_guage_picture: "",
    lathe_machine_picture: "",
    honing_tool_picture: "",

    standard_wash: false,
    valet: false,
    vehicles_detailing: false,

    high_pressure_wash: false,
    polisher_machine: false,
    vacuum_cleaner: false,

    high_pressure_wash_picture: "",
    polisher_machine_picture: "",
    vacuum_cleaner_picture: "",

    suspension: false,
    service: false,
    m_brakes: false,
    minor_repairs: false,
    major_repairs: false,
    engine_overhuals: false,
    drive_line: false,
    clutch_overhuals: false,

    four_two: false,
    engine_crane_mech: false,
    jack_mech: false,
    mechanical_tool: false,
    trestles: false,
    compression_tester: false,
    compressor_mech: false,
    pneumatic_tool: false,

    four_two_picture: "",
    engine_crane_mech_picture: "",
    jack_mech_picture: "",
    mechanical_tool_picture: "",
    trestles_picture: "",
    compression_tester_picture: "",
    compressor_mech_picture: "",
    pneumatic_tool_picture: "",

    wiring_minor: false,
    wiring_major: false,
    starters: false,
    light_retros: false,
    radios_audio: false,
    two_way_radio: false,

    starter: false,
    alternator: false,
    multi_meter: false,
    batter_charge_tool: false,

    starter_picture: "",
    alternator_picture: "",
    multi_meter_picture: "",
    batter_charge_tool_picture: "",

    msr: false,
    nsr: false,
    hail_demage: false,
    couch_builder: false,
    body_modification: false,
    ambulance: false,
    cash_in_transit: false,
    dent_vehicles: false,

    spray_booth: false,
    spray_gun: false,
    jig: false,
    mixing_booth: false,
    compressor_tool: false,
    straighning_tool: false,
    tig_welder_tool: false,
    mig_welder_tool: false,

    spray_booth_picture: "",
    spray_gun_picture: "",
    jig_picture: "",
    mixing_booth_picture: "",
    compressor_tool_picture: "",
    straighning_tool_picture: "",
    tig_welder_tool_picture: "",
    mig_welder_tool_picture: "",

    wheel_alignment: false,
    wheel_balancing: false,

    wheel_alignment_machine_picture: "",
    wheel_balancing_machine_picture: "",

    tig_welder: false,
    mig_welder: false,
    pipe_bender: false,

    tig_welder_picture: "",
    mig_welder_picture: "",
    pipe_bender_picture: "",

    battery_charge: false,
    battery_tester: false,
    battery_charge_doc: "",
    battery_tester_pictures: [],

    brakes: false,
    driver_line_cv_joints: false,
    clutch_over_huals: false,
    gearbox_bench: false,
    propshaft_bench: false,

    four_or_two_post_hoist: false,
    engine_crane: false,
    jack: false,
    mechanical_tools: false,
    trestle: false,
    press: false,
    compressor: false,
    pneumatic_tools: false,
    gearbox_test_bench: false,
    propshaft_test_bench: false,

    four_or_two_post_hoist_doc: "",
    engine_crane_doc: "",
    jack_doc: "",
    mechanical_tools_doc: "",
    trestle_doc: "",
    press_doc: "",
    compressor_doc: "",
    pneumatic_tools_doc: "",
    gearbox_test_bench_doc: "",
    propshaft_test_bench_doc: "",

    payment_method: [],
    bank_name: "",
    account_no: 0,
    bank_letter: "",

    province: "",
    street: "",
    city: "",
    town: "",
    postal_code: 0,
  })

  // Helpers

  const handleArrayChange = (field: keyof WorkshopFormData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const arr = prev[field] as string[]
      if (checked) {
        return { ...prev, [field]: [...arr, value] }
      } else {
        return { ...prev, [field]: arr.filter((v) => v !== value) }
      }
    })
  }

  // Navigation

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const progress = (currentStep / steps.length) * 100

  // Render Step Content

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Step 1: Workshop Details */}
            <div className="mb-2">
              <Label htmlFor="work_name">Workshop Name *</Label>
              <Input
                id="work_name"
                required
                value={formData.work_name}
                onChange={(e) => setFormData((f) => ({ ...f, work_name: e.target.value }))}
                placeholder="Official workshop name"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="trading_name">Trading Name</Label>
              <Input
                id="trading_name"
                value={formData.trading_name}
                onChange={(e) => setFormData((f) => ({ ...f, trading_name: e.target.value }))}
                placeholder="Trading name"
              />
            </div>
            <div className="mb-2">
              <Label>Working Days per Week *</Label>
              <Select
                value={formData.number_of_working_days.toString()}
                onValueChange={(v) => setFormData((f) => ({ ...f, number_of_working_days: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Days</SelectItem>
                  <SelectItem value="6">6 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <Label htmlFor="labour_rate">Labour Rate (per hour) *</Label>
              <Input
                id="labour_rate"
                type="number"
                min={0}
                step={0.01}
                required
                value={formData.labour_rate || ""}
                onChange={(e) => setFormData((f) => ({ ...f, labour_rate: Number(e.target.value) }))}
                placeholder="e.g., 100.00"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="fleet_rate">Fleet Rate (per hour) *</Label>
              <Input
                id="fleet_rate"
                type="number"
                min={0}
                step={0.01}
                required
                value={formData.fleet_rate || ""}
                onChange={(e) => setFormData((f) => ({ ...f, fleet_rate: Number(e.target.value) }))}
                placeholder="e.g., 90.00"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="after_hours_number">After Hours Contact Number</Label>
              <Input
                id="after_hours_number"
                type="tel"
                value={formData.after_hours_number}
                onChange={(e) => setFormData((f) => ({ ...f, after_hours_number: e.target.value }))}
                placeholder="+27 XX XXX XXXX"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="franchise">Franchise/Brand Affiliation</Label>
              <Input
                id="franchise"
                value={formData.franchise}
                onChange={(e) => setFormData((f) => ({ ...f, franchise: e.target.value }))}
                placeholder="e.g., Bosch, AA"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="company_registration_doc">Company Registration Document</Label>
              <Input
                id="company_registration_doc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file)
                    setFormData((f) => ({ ...f, company_registration_doc: file.name }))
                }}
              />
              {formData.company_registration_doc && (
                <p className="text-sm mt-1">Uploaded: {formData.company_registration_doc}</p>
              )}
            </div>
          </>
        )
      case 2:
        return (
          <>
            {/* Step 2: VAT Information */}
            <div className="mb-2">
              <Label htmlFor="vat_number">VAT Number *</Label>
              <Input
                id="vat_number"
                type="number"
                required
                value={formData.vat_number || ""}
                onChange={(e) => setFormData((f) => ({ ...f, vat_number: Number(e.target.value) }))}
                placeholder="VAT registration number"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="vat_cert_expiry_date">VAT Certificate Expiry Date *</Label>
              <Input
                id="vat_cert_expiry_date"
                type="date"
                required
                value={formData.vat_cert_expiry_date}
                onChange={(e) => setFormData((f) => ({ ...f, vat_cert_expiry_date: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="vat_certificate">VAT Certificate</Label>
              <Input
                id="vat_certificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file)
                    setFormData((f) => ({ ...f, vat_certificate: file.name }))
                }}
              />
              {formData.vat_certificate && <p className="text-sm mt-1">Uploaded: {formData.vat_certificate}</p>}
            </div>
          </>
        )
      case 3:
        return (
          <>
            {/* Step 3: BBBEE Information */}
            <div className="mb-2">
              <Label htmlFor="bbbee_level">BBBEE Level *</Label>
              <Select
                value={formData.bbbee_level}
                onValueChange={(v) => setFormData((f) => ({ ...f, bbbee_level: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select BBBEE Level" />
                </SelectTrigger>
                <SelectContent>
                  {bbbeelevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <Label htmlFor="hdi_perc">HDI Percentage</Label>
              <Input
                id="hdi_perc"
                value={formData.hdi_perc}
                onChange={(e) => setFormData((f) => ({ ...f, hdi_perc: e.target.value }))}
                placeholder="e.g. 51%"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="bbbee_expire_date">BBBEE Certificate Expiry *</Label>
              <Input
                id="bbbee_expire_date"
                type="date"
                required
                value={formData.bbbee_expire_date}
                onChange={(e) => setFormData((f) => ({ ...f, bbbee_expire_date: e.target.value }))}
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="bbbee_doc">BBBEE Certificate</Label>
              <Input
                id="bbbee_doc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData((f) => ({ ...f, bbbee_doc: file.name }))
                }}
              />
              {formData.bbbee_doc && <p className="text-sm mt-1">Uploaded: {formData.bbbee_doc}</p>}
            </div>
          </>
        )
      case 4:
        return (
          <>
            {/* Step 4: Insurance Information */}
            <div className="mb-2">
              <Label htmlFor="insurance_policy_number">Insurance Policy Number *</Label>
              <Input
                id="insurance_policy_number"
                type="number"
                required
                value={formData.insurance_policy_number || ""}
                onChange={(e) => setFormData((f) => ({ ...f, insurance_policy_number: Number(e.target.value) }))}
                placeholder="Policy number"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="insurance_company_name">Insurance Company Name *</Label>
              <Input
                id="insurance_company_name"
                required
                value={formData.insurance_company_name}
                onChange={(e) => setFormData((f) => ({ ...f, insurance_company_name: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="insurance_policy_doc">Insurance Policy Document</Label>
              <Input
                id="insurance_policy_doc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData((f) => ({ ...f, insurance_policy_doc: file.name }))
                }}
              />
              {formData.insurance_policy_doc && (
                <p className="text-sm mt-1">Uploaded: {formData.insurance_policy_doc}</p>
              )}
            </div>
          </>
        )
      case 5:
        return (
          <>
            {/* Step 5: Workshop Associated (booleans + docs) */}
            {[
              { bool: "dekra", doc: "dekra_doc", label: "DEKRA" },
              { bool: "apmma", doc: "apmma_doc", label: "APMMA" },
              { bool: "cra", doc: "cra_doc", label: "CRA" },
              { bool: "era", doc: "era_doc", label: "ERA" },
              { bool: "mibco", doc: "mibco_doc", label: "MIBCO" },
              { bool: "miwa", doc: "miwa_doc", label: "MIWA" },
              { bool: "raaf", doc: "raaf_doc", label: "RAAF" },
              { bool: "rmi", doc: "rmi_doc", label: "RMI" },
              { bool: "saarsa", doc: "saarsa_doc", label: "SAARSA" },
              { bool: "sambra", doc: "sambra_doc", label: "SAMBRA" },
              { bool: "saqa", doc: "saqa_doc", label: "SAQA" },
              { bool: "sata", doc: "sata_doc", label: "SATA" },
            ].map(({ bool, doc, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={doc as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 6:
        return (
          <>
            {/* Step 6: Type of Vehicles */}
            <h3 className="font-semibold mb-2">Vehicle Types Handled</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto border p-2 rounded">
              {vehicleTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vehicle-${type}`}
                    checked={formData.type_of_vehicle.includes(type)}
                    onCheckedChange={(checked) => handleArrayChange("type_of_vehicle", type, checked as boolean)}
                  />
                  <Label htmlFor={`vehicle-${type}`} className="capitalize text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </>
        )
      case 7:
        return (
          <>
            {/* Step 7: Workshop Type */}
            <h3 className="font-semibold mb-2">Workshop Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto border p-2 rounded">
              {workshopTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`workshop-${type}`}
                    checked={formData.type_of_workshop.includes(type)}
                    onCheckedChange={(checked) => handleArrayChange("type_of_workshop", type, checked as boolean)}
                  />
                  <Label htmlFor={`workshop-${type}`} className="capitalize text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </>
        )
      case 8:
        return (
          <>
            {/* Step 8: Engineer shop capability */}
            <h3 className="font-semibold mb-2">Engineering Shop Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto border p-2 rounded">
              {engineeringCapabilities.map((cap) => (
                <div key={cap} className="flex items-center space-x-2">
                  <Checkbox
                    id={`eng-${cap}`}
                    checked={formData.engineering_shop_capability.includes(cap)}
                    onCheckedChange={(checked) => handleArrayChange("engineering_shop_capability", cap, checked as boolean)}
                  />
                  <Label htmlFor={`eng-${cap}`} className="capitalize text-sm">{cap}</Label>
                </div>
              ))}
            </div>
          </>
        )
      case 9:
        return (
          <>
            {/* Step 9: engineering shop tools (boolean + picture) */}
            {[
              { bool: "micrometer", file: "micrometer_picture", label: "Micrometer" },
              { bool: "vernier_caliper", file: "vernier_caliper_picture", label: "Vernier Caliper" },
              { bool: "aluminum_welding", file: "aluminum_welding_picture", label: "Aluminum Welding" },
              { bool: "straight_Edge", file: "straight_Edge_picture", label: "Straight Edge" },
              { bool: "depth_gauge", file: "depth_gauge_picture", label: "Depth Gauge" },
              { bool: "lathe_guage", file: "lathe_guage_picture", label: "Lathe Gauge" },
              { bool: "lathe_machine", file: "lathe_machine_picture", label: "Lathe Machine" },
              { bool: "honing_tool", file: "honing_tool_picture", label: "Honing Tool" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 10:
        return (
          <>
            {/* Step 10: Car wash capability (booleans only) */}
            {[
              { bool: "standard_wash", label: "Standard Wash" },
              { bool: "valet", label: "Valet" },
              { bool: "vehicles_detailing", label: "Vehicles Detailing" },
            ].map(({ bool, label }) => (
              <div key={bool} className="mb-4 flex items-center space-x-2">
                <Checkbox
                  id={bool}
                  checked={formData[bool as keyof WorkshopFormData] as boolean}
                  onCheckedChange={(checked) =>
                    setFormData((f) => ({ ...f, [bool]: checked }))
                  }
                />
                <Label htmlFor={bool}>{label}</Label>
              </div>
            ))}
          </>
        )
      case 11:
        return (
          <>
            {/* Step 11: Car Wash Tools (booleans + pictures) */}
            {[
              { bool: "high_pressure_wash", file: "high_pressure_wash_picture", label: "High Pressure Wash" },
              { bool: "polisher_machine", file: "polisher_machine_picture", label: "Polisher Machine" },
              { bool: "vacuum_cleaner", file: "vacuum_cleaner_picture", label: "Vacuum Cleaner" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 12:
        return (
          <>
            {/* Step 12: Mechanical Capability (booleans only) */}
            {[
              "suspension",
              "service",
              "m_brakes",
              "minor_repairs",
              "major_repairs",
              "engine_overhuals",
              "drive_line",
              "clutch_overhuals",
            ].map((key) => (
              <div key={key} className="mb-4 flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof WorkshopFormData] as boolean}
                  onCheckedChange={(checked) =>
                    setFormData((f) => ({ ...f, [key]: checked }))
                  }
                />
                <Label htmlFor={key}>{key.replace(/_/g, " ")}</Label>
              </div>
            ))}
          </>
        )
      case 13:
        return (
          <>
            {/* Step 13: Mechanical Tools (booleans + pictures) */}
            {[
              { bool: "four_two", file: "four_two_picture", label: "Four Two" },
              { bool: "engine_crane_mech", file: "engine_crane_mech_picture", label: "Engine Crane" },
              { bool: "jack_mech", file: "jack_mech_picture", label: "Jack" },
              { bool: "mechanical_tool", file: "mechanical_tool_picture", label: "Mechanical Tool" },
              { bool: "trestles", file: "trestles_picture", label: "Trestles" },
              { bool: "compression_tester", file: "compression_tester_picture", label: "Compression Tester" },
              { bool: "compressor_mech", file: "compressor_mech_picture", label: "Compressor" },
              { bool: "pneumatic_tool", file: "pneumatic_tool_picture", label: "Pneumatic Tool" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 14:
        return (
          <>
            {/* Step 14: Electrical Capability (booleans only) */}
            {[
              "wiring_minor",
              "wiring_major",
              "starters",
              "light_retros",
              "radios_audio",
              "two_way_radio",
            ].map((key) => (
              <div key={key} className="mb-4 flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof WorkshopFormData] as boolean}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, [key]: checked }))}
                />
                <Label htmlFor={key}>{key.replace(/_/g, " ")}</Label>
              </div>
            ))}
          </>
        )
      case 15:
        return (
          <>
            {/* Step 15: Electrical Tools (booleans + pictures) */}
            {[
              { bool: "starter", file: "starter_picture", label: "Starter" },
              { bool: "alternator", file: "alternator_picture", label: "Alternator" },
              { bool: "multi_meter", file: "multi_meter_picture", label: "Multi Meter" },
              { bool: "batter_charge_tool", file: "batter_charge_tool_picture", label: "Battery Charge Tool" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 16:
        return (
          <>
            {/* Step 16: Panel Beater Capability (booleans only) */}
            {[
              "msr",
              "nsr",
              "hail_demage",
              "couch_builder",
              "body_modification",
              "ambulance",
              "cash_in_transit",
              "dent_vehicles",
            ].map((key) => (
              <div key={key} className="mb-4 flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof WorkshopFormData] as boolean}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, [key]: checked }))}
                />
                <Label htmlFor={key}>{key.replace(/_/g, " ")}</Label>
              </div>
            ))}
          </>
        )
      case 17:
        return (
          <>
            {/* Step 17: Panel Beater Tools (booleans + pictures) */}
            {[
              { bool: "spray_booth", file: "spray_booth_picture", label: "Spray Booth" },
              { bool: "spray_gun", file: "spray_gun_picture", label: "Spray Gun" },
              { bool: "jig", file: "jig_picture", label: "Jig" },
              { bool: "mixing_booth", file: "mixing_booth_picture", label: "Mixing Booth" },
              { bool: "compressor_tool", file: "compressor_tool_picture", label: "Compressor" },
              { bool: "straighning_tool", file: "straighning_tool_picture", label: "Straightening Tool" },
              { bool: "tig_welder_tool", file: "tig_welder_tool_picture", label: "TIG Welder" },
              { bool: "mig_welder_tool", file: "mig_welder_tool_picture", label: "MIG Welder" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 18:
        return (
          <>
            {/* Step 18: Fitment Center Tyre Tools */}
            {[
              { bool: "wheel_alignment", file: "wheel_alignment_machine_picture", label: "Wheel Alignment Machine" },
              { bool: "wheel_balancing", file: "wheel_balancing_machine_picture", label: "Wheel Balancing Machine" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 19:
        return (
          <>
            {/* Step 19: Fitment Center Exhaust tools */}
            {[
              { bool: "tig_welder", file: "tig_welder_picture", label: "TIG Welder" },
              { bool: "mig_welder", file: "mig_welder_picture", label: "MIG Welder" },
              { bool: "pipe_bender", file: "pipe_bender_picture", label: "Pipe Bender" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 20:
        return (
          <>
            {/* Step 20: Fitment Center Battery Tools */}
            <BooleanFileInput
              label="Battery Charge"
              boolField="battery_charge"
              fileField="battery_charge_doc"
              formData={formData}
              setFormData={setFormData}
            />
            <BooleanFileInput
              label="Battery Tester"
              boolField="battery_tester"
              fileField="battery_tester_pictures"
              formData={formData}
              setFormData={setFormData}
              multipleFile
            />
          </>
        )
      case 21:
        return (
          <>
            {/* Step 21: Driver Line Capability options */}
            {[
              "brakes",
              "driver_line_cv_joints",
              "clutch_over_huals",
              "gearbox_bench",
              "propshaft_bench",
            ].map((key) => (
              <div key={key} className="mb-4 flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof WorkshopFormData] as boolean}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, [key]: checked }))}
                />
                <Label htmlFor={key}>{key.replace(/_/g, " ")}</Label>
              </div>
            ))}
          </>
        )
      case 22:
        return (
          <>
            {/* Step 22: Driver line tools and docs */}
            {[
              { bool: "four_or_two_post_hoist", file: "four_or_two_post_hoist_doc", label: "Four or Two Post Hoist" },
              { bool: "engine_crane", file: "engine_crane_doc", label: "Engine Crane" },
              { bool: "jack", file: "jack_doc", label: "Jack" },
              { bool: "mechanical_tools", file: "mechanical_tools_doc", label: "Mechanical Tools" },
              { bool: "trestle", file: "trestle_doc", label: "Trestle" },
              { bool: "press", file: "press_doc", label: "Press" },
              { bool: "compressor", file: "compressor_doc", label: "Compressor" },
              { bool: "pneumatic_tools", file: "pneumatic_tools_doc", label: "Pneumatic Tools" },
              { bool: "gearbox_test_bench", file: "gearbox_test_bench_doc", label: "Gearbox Test Bench" },
              { bool: "propshaft_test_bench", file: "propshaft_test_bench_doc", label: "Propshaft Test Bench" },
            ].map(({ bool, file, label }) => (
              <BooleanFileInput
                key={bool}
                label={label}
                boolField={bool as keyof WorkshopFormData}
                fileField={file as keyof WorkshopFormData}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </>
        )
      case 23:
        return (
          <>
            {/* Step 23: banking details */}
            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method.join(",")}
                onValueChange={(v) =>
                  setFormData((f) => ({
                    ...f,
                    payment_method: v.includes(",") ? v.split(",") : [v],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                required
                value={formData.bank_name}
                onChange={(e) => setFormData((f) => ({ ...f, bank_name: e.target.value }))}
                placeholder="Bank Name"
              />
            </div>
            <div>
              <Label htmlFor="account_no">Account Number *</Label>
              <Input
                id="account_no"
                type="number"
                required
                value={formData.account_no || ""}
                onChange={(e) => setFormData((f) => ({ ...f, account_no: Number(e.target.value) }))}
                placeholder="Account Number"
              />
            </div>
            <div>
              <Label htmlFor="bank_letter">Bank Letter</Label>
              <Input
                id="bank_letter"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData((f) => ({ ...f, bank_letter: file.name }))
                }}
              />
              {formData.bank_letter && <p className="text-sm mt-1">Uploaded: {formData.bank_letter}</p>}
            </div>
          </>
        )
      case 24:
        return (
          <>
            {/* Step 24: physical address */}
            <div>
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                required
                value={formData.province}
                onChange={(e) => setFormData((f) => ({ ...f, province: e.target.value }))}
                placeholder="Province"
              />
            </div>
            <div>
              <Label htmlFor="street">Street *</Label>
              <Input
                id="street"
                required
                value={formData.street}
                onChange={(e) => setFormData((f) => ({ ...f, street: e.target.value }))}
                placeholder="Street Address"
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="town">Town</Label>
              <Input
                id="town"
                value={formData.town}
                onChange={(e) => setFormData((f) => ({ ...f, town: e.target.value }))}
                placeholder="Town"
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                type="number"
                required
                value={formData.postal_code || ""}
                onChange={(e) => setFormData((f) => ({ ...f, postal_code: Number(e.target.value) }))}
                placeholder="Postal Code"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  // On submit

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // You can add validation here...
    localStorage.setItem("workshopRegistrationData", JSON.stringify(formData))
    router.push("/register/workshop/success")
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Workshop Registration</h1>

      {/* Steps Progress Bar */}
      <div className="mb-6">
        {/* <div className="flex justify-between items-center mb-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
              >
                {step.icon}
              </div>
              {step.id < steps.length && (
                <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
              )}
            </div>
          ))}
        </div> */}
        <Progress value={progress} className="h-2" />
        <p className="text-center mt-1 text-gray-600">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].icon}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" disabled={currentStep === 1} variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Complete Registration
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Summary badges */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Registration Progress</h3>
        <div className="flex flex-wrap gap-2">
          {formData.work_name && <Badge variant="secondary">Workshop Name Set</Badge>}
          {formData.labour_rate > 0 && <Badge variant="secondary">Rates Configured</Badge>}
          {formData.vat_number > 0 && <Badge variant="secondary">VAT Registered</Badge>}
          {formData.bbbee_level && <Badge variant="secondary">BBBEE Level Set</Badge>}
          {formData.type_of_vehicle.length > 0 && (
            <Badge variant="secondary">{formData.type_of_vehicle.length} Vehicle Types</Badge>
          )}
          {formData.type_of_workshop.length > 0 && (
            <Badge variant="secondary">{formData.type_of_workshop.length} Workshop Types</Badge>
          )}
          {formData.bank_name && <Badge variant="secondary">Bank Info Provided</Badge>}
          {formData.province && <Badge variant="secondary">Physical Address Set</Badge>}
        </div>
      </div>
    </div>
  )
}

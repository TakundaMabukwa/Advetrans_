export const reportsData = [
    {
        id: "fuel-entries-by-vehicle",
        name: "Fuel Entries by Vehicle",
        description: "Listing of fuel entries by vehicle.",
        category: "fuel",
        type: "Fuel",
    },
    {
        id: "fuel-summary",
        name: "Fuel Summary",
        description: "Listing of summarized fuel metrics by vehicles.",
        category: "fuel",
        type: "Fuel",
    },
    {
        id: "fuel-summary-by-location",
        name: "Fuel Summary by Location",
        description: "Aggregate fuel volume and price data grouped by location and fuel type.",
        category: "fuel",
        type: "Fuel",
    },
    {
        id: "inspection-submission-list",
        name: "Inspection Submission List",
        description: "Listing of all inspection submissions.",
        category: "inspections",
        type: "Inspections",
    },
    {
        id: "inspection-failures-list",
        name: "Inspection Failures List",
        description: "Listing of all failed inspection items.",
        category: "inspections",
        type: "Inspections",
    },
    {
        id: "inspection-schedules",
        name: "Inspection Schedules",
        description: "Listing of all inspection schedules.",
        category: "inspections",
        type: "Inspections",
    },
    {
        id: "inspection-submissions-summary",
        name: "Inspection Submissions Summary",
        description: "Aggregate inspection data grouped by user or vehicle.",
        category: "inspections",
        type: "Inspections",
    },
    {
        id: "faults-summary",
        name: "Faults Summary",
        description: "Listing of summarized fault metrics for particular fault codes and vehicles.",
        category: "issues",
        type: "Issues",
    },
    {
        id: "issues-list",
        name: "Issues List",
        description: "Lists basic details of all vehicle-related issues.",
        category: "issues",
        type: "Issues",
    },
    {
        id: "parts-by-vehicle",
        name: "Parts by Vehicle",
        description: "Listing of all parts used on each vehicle.",
        category: "parts",
        type: "Parts",
    },
    {
        id: "repair-priority-class-summary",
        name: "Repair Priority Class Summary",
        description: "Aggregate Service Data breakdown of Scheduled, Non-Scheduled, and Emergency Repairs.",
        category: "service",
        type: "Service",
    },
    {
        id: "service-history-by-vehicle",
        name: "Service History by Vehicle",
        description: "Listing of all service by vehicle grouped by entry or task.",
        category: "service",
        type: "Service",
    },
    {
        id: "service-entries-summary",
        name: "Service Entries Summary",
        description: "Listing of summarized service history for vehicles.",
        category: "service",
        type: "Service",
    },
    {
        id: "service-reminder-compliance",
        name: "Service Reminder Compliance",
        description: "Shows history of completed Service Reminders as On Time/Late.",
        category: "service",
        type: "Service",
    },
    {
        id: "service-reminders",
        name: "Service Reminders",
        description: "Lists all service reminders.",
        category: "service",
        type: "Service",
    },
    {
        id: "service-task-summary",
        name: "Service Task Summary",
        description: "Aggregate service data grouped by Service Task.",
        category: "service",
        type: "Service",
    },
    {
        id: "vehicle-without-service",
        name: "Vehicle Without Service",
        description: "Lists all vehicles that haven't had a service in X days/months/years.",
        category: "service",
        type: "Service",
    },
    {
        id: "vehicle-list",
        name: "Vehicle List",
        description: "List of all vehicles.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-utilization",
        name: "Vehicle Utilization",
        description: "Summary of vehicle utilization metrics.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-cost-per-mile",
        name: "Vehicle Cost Per Mile",
        description: "Summary of vehicle cost per mile.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-depreciation",
        name: "Vehicle Depreciation",
        description: "Summary of vehicle depreciation.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-maintenance-summary",
        name: "Vehicle Maintenance Summary",
        description: "Summary of vehicle maintenance costs and history.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-fuel-efficiency",
        name: "Vehicle Fuel Efficiency",
        description: "Summary of vehicle fuel efficiency.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-inspections-due",
        name: "Vehicle Inspections Due",
        description: "Lists vehicles with upcoming inspections.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-reminders-due",
        name: "Vehicle Reminders Due",
        description: "Lists vehicles with upcoming service reminders.",
        category: "vehicles",
        type: "Vehicles",
    },
    {
        id: "vehicle-assignments-summary",
        name: "Vehicle Assignments Summary",
        description: "Summary of current vehicle assignments.",
        category: "vehicle-assignments",
        type: "Vehicle Assignments",
    },
    {
        id: "vehicle-assignment-history",
        name: "Vehicle Assignment History",
        description: "History of vehicle assignments.",
        category: "vehicle-assignments",
        type: "Vehicle Assignments",
    },
]

export type Report = (typeof reportsData)[number]

export const getReportsByCategory = () => {
    return reportsData.reduce(
        (acc, report) => {
            if (!acc[report.category]) {
                acc[report.category] = []
            }
            acc[report.category].push(report)
            return acc
        },
        {} as Record<string, Report[]>,
    )
}

export const getReportCountsByCategory = () => {
    const categories = getReportsByCategory()
    return Object.keys(categories).map((category) => ({
        category,
        count: categories[category].length,
    }))
}

export const getReportBySlug = (category: string, slug: string) => {
    return reportsData.find((report) => report.category === category && report.id === slug)
}

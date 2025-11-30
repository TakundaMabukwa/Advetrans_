"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

interface JobAssignment {
    id: number;
    description: string;
    status: string;
    created_at: string;
    priority: string | null;
    client_name: string | null;
}

const STATUSES = [
    "pending",
    "assigned",
    "inprogress",
    "awaiting-approval",
    "approved",
    "completed",
    "cancelled",
    "Breakdown Request",
    "Breakdown assigned",
    "Technician accepted",
    "Technician on site",
    "Technician working",
    "Tow requested",
];

const chartConfig = STATUSES.reduce((acc, status, idx) => {
    acc[status] = {
        label: status.replace(/-/g, " "),
        color: `var(--chart-${(idx % 5) + 1})`,
    };
    return acc;
}, {} as Record<string, { label: string; color: string }>);

function getDateRange(value: string): { start: Date; end: Date } {
    const now = new Date();
    switch (value) {
        case "today": {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
        case "last7": {
            const end = new Date(now);
            end.setHours(23, 59, 59, 999);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        }
        case "month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
        default:
            return { start: now, end: now };
    }
}

export default function JobAssignmentsDashboard() {
    const supabase = createClient();
    const [jobs, setJobs] = useState<JobAssignment[]>([]);
    const [chartData, setChartData] = useState(
        STATUSES.map((status) => ({
            status,
            count: 0,
            fill: chartConfig[status].color,
        }))
    );
    const [selectedRange, setSelectedRange] = useState("today");
    const [dateRange, setDateRange] = useState(getDateRange("today"));

    useEffect(() => {
        setDateRange(getDateRange(selectedRange));
    }, [selectedRange]);

    useEffect(() => {
        async function fetchJobs() {
            const { start, end } = dateRange;

            const { data, error } = await supabase
                .from("job_assignments")
                .select("id, description, status, created_at, priority, client_name")
                .in("status", STATUSES)
                .gte("created_at", start.toISOString())
                .lte("created_at", end.toISOString());

            if (error) {
                console.error("Error fetching jobs:", error);
                return;
            }

            const jobData = data || [];
            setJobs(jobData as any);

            const counts = STATUSES.map((status) => ({
                status,
                count: jobData.filter((job) => job.status === status).length,
                fill: chartConfig[status].color,
            }));

            setChartData(counts);
        }

        fetchJobs();
    }, [dateRange, supabase]);

    return (
        <div className="max-w-full mx-auto p-8 space-y-10 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 shadow-inner">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                    Job Card Information
                </h2>
                <Select value={selectedRange} onValueChange={(value) => setSelectedRange(value)}>
                    <SelectTrigger className="w-[200px] rounded-lg border-gray-300 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                        <SelectValue placeholder="Select Date Range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-lg">
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last7">Last 7 Days</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Chart Section */}
            <Card className="max-w-full mx-auto rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Job Status Breakdown</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Overview of job counts by status for selected range
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <ChartContainer
                            config={chartConfig}
                            className="w-full max-w-full h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-12"
                        >
                            <BarChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="status"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => chartConfig[value]?.label ?? value}
                                    angle={-8}
                                    className="text-xs text-black font-bold"
                                />
                                <YAxis
                                    dataKey="count"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    className="text-xs text-black font-bold"
                                />

                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Bar dataKey="count" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Job Table */}
            <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Job Assignments</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        List of jobs created and their current status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">ID</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Description</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Created At</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Priority</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            No jobs found for selected date range.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job, i) => (
                                        <TableRow
                                            key={job.id}
                                            className={`transition-colors hover:bg-muted/30 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-muted/20"
                                                }`}
                                        >
                                            <TableCell className="font-medium">{job.id}</TableCell>
                                            <TableCell className="max-w-xs truncate">{job.description}</TableCell>
                                            <TableCell>
                                                <span
                                                    className="px-2 py-1 rounded-md text-xs font-medium 
                                                            bg-blue-100 text-blue-700 
                                                            dark:bg-blue-900/40 dark:text-blue-300"
                                                >
                                                    {job.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(job.created_at).toLocaleString(undefined, {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </TableCell>
                                            <TableCell className="text-sm">{job.priority ?? "-"}</TableCell>
                                            <TableCell className="text-sm">{job.client_name ?? "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>

    );
}

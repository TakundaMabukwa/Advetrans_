"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecentActivity {
    id: string;
    job_id: string;
    type: "breakdown" | "approval" | "completion" | "quotation" | string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
}

interface Vehicle {
    id: number;
    registration_number: string
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case "breakdown":
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case "approval":
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "completion":
            return <CheckCircle className="h-4 w-4 text-blue-500" />;
        case "quotation":
            return <DollarSign className="h-4 w-4 text-yellow-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-500" />;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "urgent":
            return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
        case "approved":
            return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
        case "completed":
            return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
        case "pending":
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        default:
            return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
};

export default function RecentActivityList() {
    const supabase = createClient();
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        let isMounted = true;
        const channel = supabase.channel("dashboard-realtime");

        async function fetchRecentActivity() {
            // Customize query here to fetch last 10 activities from relevant tables
            // Possibly join or parallel fetch if needed. This example mocks a unified fetch.
            const unionData: RecentActivity[] = [];

            // Example fetch from job_assignments:
            const { data: jobs, error: jobsError } = await supabase
                .from("job_assignments")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(3);

            if (!jobsError && jobs) {
                jobs.forEach((j) =>
                    unionData.push({
                        id: `job-${j.id}`,
                        type: "completion",
                        title: `Job - ${j.job_id}`,
                        description: j.description ?? "",
                        timestamp: j.created_at ? new Date(j.created_at).toLocaleString() : "",
                        status: j.status ?? "",
                        job_id: j.job_id ?? "",
                    })
                );
            }

            // Additional queries for 'breakdowns', 'approvals', 'quotations' etc. can be added similarly

            if (isMounted) {
                unionData.sort(
                    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setRecentActivity(unionData.slice(0, 10)); // latest 10 events
            }
        }

        fetchRecentActivity();

        // Real-time subscription for recent changes, update list live
        channel
            .on("postgres_changes", { event: "*", schema: "public", table: "job_assignments" }, () => {
                fetchRecentActivity();
            })
            // Add subscriptions to other tables like "breakdowns", "approvals" as needed here
            .subscribe();

        return () => {
            isMounted = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentActivity.length === 0 && (
                        <div className="text-gray-400 text-sm">No recent activity yet.</div>
                    )}
                    {recentActivity.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                        >
                            {getActivityIcon(activity.type)}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium truncate">{activity.title}</p>
                                    {getStatusBadge(activity.status)}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

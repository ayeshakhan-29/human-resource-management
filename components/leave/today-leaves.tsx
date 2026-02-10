"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTodaysLeavesAction } from "@/lib/actions/leave.actions";
import { LeaveRequest } from "@/lib/types/leave.types";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Building, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function TodayLeaves() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTodayLeaves() {
            const res = await getTodaysLeavesAction({ status: "approved" });
            if ('data' in res && res.data) setLeaves(res.data);
            setLoading(false);
        }
        fetchTodayLeaves();
    }, []);

    return (
        <Card className="w-full border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
            <CardHeader className="bg-white/50 border-b border-blue-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="text-blue-600 size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-800">Employees on Leave</CardTitle>
                            <CardDescription className="text-xs">Active approved leaves for today, {format(new Date(), "MMMM dd, yyyy")}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 font-bold">
                        {loading ? "..." : leaves.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        ))
                    ) : leaves.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center gap-2">
                            <div className="p-4 bg-gray-50 rounded-full mb-2">
                                <User className="text-gray-300 size-8" />
                            </div>
                            <p className="text-gray-500 font-medium">No employees on leave today</p>
                            <p className="text-xs text-gray-400">Everyone is present! (at least officially)</p>
                        </div>
                    ) : (
                        leaves.map((leave) => (
                            <div key={leave.id} className="p-4 flex items-center gap-4 hover:bg-white/80 transition-all group">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                                    {leave.user?.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800 truncate">{leave.user?.fullName}</h4>
                                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{leave.leaveMode}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Building className="size-3 text-gray-400" />
                                            <span className="truncate">{leave.user?.userInfo?.department || "General"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Clock className="size-3 text-gray-400" />
                                            <span>{leave.leaveType?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
                                            <MapPin className="size-3 text-gray-400" />
                                            <span className="italic">&quot;{leave.reason.length > 40 ? leave.reason.substring(0, 40) + "..." : leave.reason}&quot;</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

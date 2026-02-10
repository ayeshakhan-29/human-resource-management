"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllLeaveTypes, getMyLeavesAction } from "@/lib/actions/leave.actions";
import { LeaveType, LeaveRequest } from "@/lib/types/leave.types";
import { Progress } from "@/components/ui/progress";
import { PieChart, Calendar, Briefcase, HeartPulse } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeaveBalancePage() {
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [typeResp, leaveResp] = await Promise.all([
                getAllLeaveTypes(),
                getMyLeavesAction()
            ]);
            if ('data' in typeResp && typeResp.data) setTypes(typeResp.data.filter(t => t.status === "active" && t.annual_quota > 0));
            if ('data' in leaveResp && leaveResp.data) setLeaves(leaveResp.data);
            setLoading(false);
        }
        fetchData();
    }, []);

    const getUsedCount = (typeId: number) => {
        return leaves
            .filter(l => l.leaveTypeId === typeId && l.status === "approved")
            .reduce((acc, curr) => acc + curr.totalDays, 0);
    };

    const getIcon = (name: string) => {
        if (name.toLowerCase().includes('sick')) return <HeartPulse className="text-red-500" />;
        if (name.toLowerCase().includes('annual')) return <Calendar className="text-blue-500" />;
        return <Briefcase className="text-green-500" />;
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Balance</h1>
                <p className="text-gray-500">Overview of your available and used leaves for the current year.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-md">
                            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                        </Card>
                    ))
                ) : types.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl shadow-inner italic text-gray-400">
                        No quota-based leave types configured.
                    </div>
                ) : (
                    types.map((type) => {
                        const used = getUsedCount(type.id);
                        const remaining = Math.max(0, type.annual_quota - used);
                        const percentage = (used / type.annual_quota) * 100;

                        return (
                            <Card key={type.id} className="border-none shadow-xl bg-white hover:shadow-2xl transition-all group overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-bold text-gray-700">{type.name}</CardTitle>
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                        {getIcon(type.name)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-4xl font-extrabold text-gray-900">{remaining}</span>
                                            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Days Available</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-600">{used} / {type.annual_quota}</span>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Total Quota</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Progress value={percentage} className="h-2 bg-gray-100" />
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                            <span>USED: {used}D</span>
                                            <span>{Math.round(percentage)}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

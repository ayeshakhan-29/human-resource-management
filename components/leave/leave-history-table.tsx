"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyLeavesAction } from "@/lib/actions/leave.actions";
import { LeaveRequest } from "@/lib/types/leave.types";
import { format } from "date-fns";
import { Calendar, History, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaveHistoryTable() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaves() {
            const result = await getMyLeavesAction();
            if ("data" in result && result.data) {
                setLeaves(result.data);
            }
            setLoading(false);
        }
        fetchLeaves();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex w-fit gap-1 items-center"><CheckCircle2 className="size-3" /> Approved</Badge>;
            case "rejected":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none flex w-fit gap-1 items-center"><XCircle className="size-3" /> Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none flex w-fit gap-1 items-center"><Clock className="size-3" /> Pending</Badge>;
        }
    };

    return (
        <Card className="w-full border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <History className="text-blue-600" />
                    My Leave History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Comments</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    </TableRow>
                                ))
                            ) : leaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                                        No leave applications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaves.map((leave) => (
                                    <TableRow key={leave.id} className="hover:bg-gray-50/30 transition-colors">
                                        <TableCell className="font-medium">{leave.leaveType?.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {format(new Date(leave.startDate), "MMM dd, yyyy")}
                                                </span>
                                                {leave.startDate !== leave.endDate && (
                                                    <span className="text-xs text-muted-foreground">
                                                        to {format(new Date(leave.endDate), "MMM dd, yyyy")}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{leave.totalDays} day(s)</TableCell>
                                        <TableCell className="capitalize">{leave.leaveMode.replace("-", " ")}</TableCell>
                                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                        <TableCell className="max-w-[200px] truncate group relative">
                                            <span className="truncate block">{leave.status === 'rejected' ? leave.rejectionReason : leave.reason}</span>
                                            <div className="absolute hidden group-hover:block bg-black text-white text-[10px] p-2 rounded -top-8 left-0 z-10 w-48 shadow-xl">
                                                {leave.status === 'rejected' ? `Rejected: ${leave.rejectionReason}` : leave.reason}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

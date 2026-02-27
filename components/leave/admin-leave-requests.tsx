"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllLeavesAdminAction, approveLeaveAction, rejectLeaveAction } from "@/lib/actions/leave.actions";
import { LeaveRequest } from "@/lib/types/leave.types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, X, RotateCcw, User, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AdminLeaveRequests() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const fetchLeaves = async () => {
        setLoading(true);
        const res = await getAllLeavesAdminAction({
            status: "pending",
            page: currentPage,
            limit: limit
        });
        if ('data' in res && res.data) {
            setLeaves(res.data);
            if (res.pagination) {
                setTotalPages(res.pagination.totalPages);
                setTotalItems(res.pagination.totalItems);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaves();
    }, [currentPage]);

    const handleApprove = async (id: number) => {
        setProcessing(true);
        const res = await approveLeaveAction(id);
        setProcessing(false);
        if ('error' in res && res.error) {
            toast.error(res.error);
        } else {
            toast.success("Leave approved");
            fetchLeaves();
        }
    };

    const handleReject = async () => {
        if (!selectedLeave) return;
        if (!rejectionReason) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setProcessing(true);
        const res = await rejectLeaveAction(selectedLeave.id, rejectionReason);
        setProcessing(false);
        if ('error' in res && res.error) {
            toast.error(res.error);
        } else {
            toast.success("Leave rejected");
            setRejectionDialogOpen(false);
            setRejectionReason("");
            setSelectedLeave(null);
            fetchLeaves();
        }
    };

    return (
        <Card className="w-full border-none shadow-xl bg-white/60 backdrop-blur-md">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Pending Leave Requests</CardTitle>
                        <CardDescription>Review and manage employee leave applications</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchLeaves} className="gap-2 w-full sm:w-auto">
                        <RotateCcw className="size-4" /> Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Total Days</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : leaves.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500 italic bg-gray-50/20">
                                            No pending leave requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaves.map((leave) => (
                                        <TableRow key={leave.id} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                        {leave.user?.fullName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900">{leave.user?.fullName}</span>
                                                        <span className="text-xs text-gray-500">{leave.user?.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-none font-medium">
                                                    {leave.leaveType?.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-700">{format(new Date(leave.startDate), "MMM dd")}</span>
                                                    {leave.startDate !== leave.endDate && (
                                                        <span className="text-gray-400"> - {format(new Date(leave.endDate), "MMM dd, yyyy")}</span>
                                                    )}
                                                    {leave.startDate === leave.endDate && <span className="text-gray-400">, {format(new Date(leave.endDate), "yyyy")}</span>}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400">{leave.leaveMode}</div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-700">{leave.totalDays} days</TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <p className="text-sm text-gray-600 truncate italic" title={leave.reason}>&quot;{leave.reason}&quot;</p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                                                        onClick={() => handleApprove(leave.id)}
                                                        disabled={processing}
                                                    >
                                                        <Check className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                                        onClick={() => {
                                                            setSelectedLeave(leave);
                                                            setRejectionDialogOpen(true);
                                                        }}
                                                        disabled={processing}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-2">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(currentPage * limit, totalItems)}
                            </span>{" "}
                            of <span className="font-medium">{totalItems}</span> requests
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="h-8"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center px-4 text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="h-8"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Reject Leave Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {selectedLeave?.user?.fullName}&apos;s leave request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason" className="text-sm font-semibold text-gray-700">Rejection Reason</Label>
                            <Textarea
                                id="rejectReason"
                                placeholder="Entry not valid, workload high, etc."
                                className="min-h-[100px] border-gray-200 focus:ring-red-500"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex sm:justify-end gap-2">
                        <Button variant="outline" onClick={() => setRejectionDialogOpen(false)} disabled={processing}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={processing}>
                            {processing ? "Processing..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

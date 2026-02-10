"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Info } from "lucide-react";
import { getAllLeaveTypes, applyLeaveAction } from "@/lib/actions/leave.actions";
import { LeaveType } from "@/lib/types/leave.types";

export function ApplyLeaveForm() {
    const router = useRouter();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        leaveTypeId: string;
        startDate: string;
        endDate: string;
        leaveMode: "full-day" | "half-day";
        reason: string;
    }>({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        leaveMode: "full-day",
        reason: "",
    });

    useEffect(() => {
        async function fetchLeaveTypes() {
            const result = await getAllLeaveTypes();
            if ("data" in result && result.data) {
                setLeaveTypes(result.data.filter(t => t.status === "active"));
            }
        }
        fetchLeaveTypes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await applyLeaveAction({
            ...formData,
            leaveTypeId: parseInt(formData.leaveTypeId),
        });

        setLoading(false);
        if ("error" in result && result.error) {
            toast.error(result.error);
        } else {
            toast.success("Leave application submitted successfully");
            router.push("/employee/leave/requests");
        }
    };

    const selectedType = leaveTypes.find(t => t.id.toString() === formData.leaveTypeId);

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Apply for Leave
                </CardTitle>
                <CardDescription>
                    Fill out the form below to submit your leave request.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="leaveType">Leave Type</Label>
                        <Select
                            value={formData.leaveTypeId}
                            onValueChange={(val) => setFormData({ ...formData, leaveTypeId: val })}
                            required
                        >
                            <SelectTrigger id="leaveType" className="bg-white">
                                <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name} {selectedType?.id === type.id && `(Quota: ${type.annual_quota} days)`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedType && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Info className="size-3" />
                                {selectedType.is_paid ? "Paid Leave" : "Unpaid Leave"} •
                                Max consecutive: {selectedType.max_consecutive_days || "No limit"} •
                                Half-day: {selectedType.half_day_allowed ? "Allowed" : "Not allowed"}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                className="bg-white"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className={formData.leaveMode === "half-day" ? "opacity-50" : ""}>End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                className="bg-white"
                                disabled={formData.leaveMode === "half-day"}
                                value={formData.leaveMode === "half-day" ? formData.startDate : formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required={formData.leaveMode !== "half-day"}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leaveMode">Leave Mode</Label>
                        <Select
                            value={formData.leaveMode}
                            onValueChange={(val) => {
                                setFormData({
                                    ...formData,
                                    leaveMode: val as "full-day" | "half-day",
                                    endDate: val === "half-day" ? formData.startDate : formData.endDate
                                });
                            }}
                        >
                            <SelectTrigger id="leaveMode" className="bg-white">
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full-day">Full Day</SelectItem>
                                <SelectItem value="half-day" disabled={selectedType && !selectedType.half_day_allowed}>
                                    Half Day
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Leave</Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a clear reason for your leave request"
                            className="min-h-[100px] bg-white"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

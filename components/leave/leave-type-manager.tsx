"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getAllLeaveTypes, createLeaveTypeAction, updateLeaveTypeAction } from "@/lib/actions/leave.actions";
import { LeaveType } from "@/lib/types/leave.types";
import { toast } from "sonner";
import { Plus, Edit2, RotateCcw, Settings, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaveTypeManager() {
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState<Partial<LeaveType>>({
        name: "",
        is_paid: true,
        annual_quota: 10,
        requires_approval: true,
        max_consecutive_days: 0,
        half_day_allowed: true,
        status: "active",
    });

    const fetchTypes = async () => {
        setLoading(true);
        const result = await getAllLeaveTypes();
        if ("data" in result && result.data) setTypes(result.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleOpenDialog = (type?: LeaveType) => {
        if (type) {
            setEditingType(type);
            setFormData(type);
        } else {
            setEditingType(null);
            setFormData({
                name: "",
                is_paid: true,
                annual_quota: 10,
                requires_approval: true,
                max_consecutive_days: 0,
                half_day_allowed: true,
                status: "active",
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const payload = { ...formData };
        if (!payload.max_consecutive_days) payload.max_consecutive_days = null;

        let result;
        if (editingType) {
            result = await updateLeaveTypeAction(editingType.id, payload);
        } else {
            result = await createLeaveTypeAction(payload);
        }

        setProcessing(false);
        if ("error" in result && result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Leave type ${editingType ? "updated" : "created"} successfully`);
            setDialogOpen(false);
            fetchTypes();
        }
    };

    return (
        <Card className="w-full border-none shadow-xl bg-white/70 backdrop-blur-md">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Settings className="text-blue-600 size-6" />
                            Leave Policies
                        </CardTitle>
                        <CardDescription>Configure different types of leaves and their rules</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 gap-2 w-full sm:w-auto">
                        <Plus className="size-4" /> Add Leave Type
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Paid/Unpaid</TableHead>
                                    <TableHead>Annual Quota</TableHead>
                                    <TableHead>Max Consecutive</TableHead>
                                    <TableHead>Half-Day</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    types.map((type) => (
                                        <TableRow key={type.id} className="hover:bg-blue-50/20">
                                            <TableCell className="font-bold text-gray-700">{type.name}</TableCell>
                                            <TableCell>
                                                {type.is_paid ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium">Paid</Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none font-medium">Unpaid</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-600">{type.annual_quota} days</TableCell>
                                            <TableCell className="text-gray-500">{type.max_consecutive_days || "No limit"}</TableCell>
                                            <TableCell>
                                                {type.half_day_allowed ? (
                                                    <Check className="size-4 text-green-600" />
                                                ) : (
                                                    <X className="size-4 text-red-400" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={type.status === 'active' ? 'outline' : 'secondary'} className={type.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                                    {type.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" onClick={() => handleOpenDialog(type)}>
                                                    <Edit2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingType ? "Edit Leave Type" : "Create New Leave Type"}</DialogTitle>
                            <DialogDescription>Set rules and limits for this leave category.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Sick Leave, Annual Leave"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="quota">Annual Quota (Days)</Label>
                                    <Input
                                        id="quota"
                                        type="number"
                                        value={formData.annual_quota}
                                        onChange={(e) => setFormData({ ...formData, annual_quota: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max">Max Consecutive Days</Label>
                                    <Input
                                        id="max"
                                        type="number"
                                        value={formData.max_consecutive_days || 0}
                                        onChange={(e) => setFormData({ ...formData, max_consecutive_days: parseInt(e.target.value) })}
                                        placeholder="0 for no limit"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                                    <div className="space-y-0.5">
                                        <Label>Is Paid Leave?</Label>
                                        <p className="text-xs text-muted-foreground font-normal">Salary will not be deducted</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_paid}
                                        onCheckedChange={(val) => setFormData({ ...formData, is_paid: val })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                                    <div className="space-y-0.5">
                                        <Label>Half-Day Allowed?</Label>
                                        <p className="text-xs text-muted-foreground font-normal">Allows 0.5 day requests</p>
                                    </div>
                                    <Switch
                                        checked={formData.half_day_allowed}
                                        onCheckedChange={(val) => setFormData({ ...formData, half_day_allowed: val })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                                    <div className="space-y-0.5">
                                        <Label>Status</Label>
                                        <p className="text-xs text-muted-foreground font-normal">Active leave types are visible to employees</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold">{formData.status === 'active' ? 'ENABLED' : 'DISABLED'}</span>
                                        <Switch
                                            checked={formData.status === 'active'}
                                            onCheckedChange={(val) => setFormData({ ...formData, status: val ? 'active' : 'inactive' })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={processing}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                                {processing ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

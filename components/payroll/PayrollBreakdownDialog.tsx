"use client";

import { Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmployeePayroll, PayrollSnapshot } from "@/lib/types/payroll.types";

interface PayrollBreakdownDialogProps {
    payroll: EmployeePayroll | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDownload: (id: number) => void;
}

export function PayrollBreakdownDialog({
    payroll,
    open,
    onOpenChange,
    onDownload,
}: PayrollBreakdownDialogProps) {
    if (!payroll) return null;

    // Handle case where snapshot might be stringified (comes from DB as JSON string in some setups)
    const snapshot = (typeof payroll.snapshot === 'string'
        ? JSON.parse(payroll.snapshot)
        : payroll.snapshot) as PayrollSnapshot;

    const standardDays = Number(snapshot?.standardWorkingDays || 22);
    const baseSalary = Number(snapshot?.baseSalary || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Salary Breakdown: {payroll.period?.name}</DialogTitle>
                    <DialogDescription>
                        Detailed calculation snapshot for this payroll period.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Attendance Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-lg">
                        <div className="space-y-1 text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                Attendance
                            </p>
                            <p className="text-lg font-bold">
                                {snapshot?.totalAttendanceDays || 0} Days
                            </p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                Worked hrs
                            </p>
                            <p className="text-lg font-bold">
                                {Number(snapshot?.totalWorkedHours || 0).toFixed(1)} hrs
                            </p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                Overtime
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                                {Number(snapshot?.overtimeHours || 0).toFixed(1)} hrs
                            </p>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                Lates
                            </p>
                            <p className="text-lg font-bold text-red-600">
                                {snapshot?.lateCounts || 0}
                            </p>
                        </div>
                    </div>

                    {/* Earnings Section */}
                    <div className="space-y-3">
                        <h4 className="font-bold border-b pb-1">Earnings</h4>
                        <div className="flex justify-between text-sm">
                            <span>Base Salary ({snapshot?.salaryType})</span>
                            <span className="font-medium">
                                Rs {baseSalary.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Overtime Pay</span>
                            <span className="font-medium text-blue-600">
                                +Rs {Number(snapshot?.overtimePay || 0).toFixed(2)}
                            </span>
                        </div>
                        {/* Individual Bonuses */}
                        {snapshot?.adjustments?.filter((adj) => adj.type === 'bonus').map((adj, idx: number) => (
                            <div key={`bonus-${idx}`} className="flex justify-between text-sm items-center">
                                <div className="flex items-center gap-1.5">
                                    <span>Bonus</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button className="text-muted-foreground hover:text-blue-600 transition-colors">
                                                    <Info className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{adj.reason || "No reason provided"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <span className="font-medium text-green-600">
                                    +Rs {Number(adj.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Gross Totals</span>
                            <span>Rs {Number(payroll.gross_salary).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="space-y-3">
                        <h4 className="font-bold border-b pb-1">Deductions</h4>
                        <div className="flex justify-between text-sm">
                            <span>
                                Unpaid Leave ({snapshot?.unpaidLeaveDays || 0} days)
                            </span>
                            <span className="font-medium text-red-600">
                                -Rs {(Number(snapshot?.unpaidLeaveDays || 0) * (baseSalary / standardDays)).toFixed(2)}
                            </span>
                        </div>
                        {Number(snapshot?.absentDays || 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>
                                    Absent Days ({snapshot?.absentDays} days)
                                </span>
                                <span className="font-medium text-red-600">
                                    -Rs {(Number(snapshot?.absentDays) * (baseSalary / standardDays)).toFixed(2)}
                                </span>
                            </div>
                        )}
                        {Number(snapshot?.unaccountedDays || 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>
                                    Missing Days ({snapshot?.unaccountedDays} days)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button className="ml-1 text-muted-foreground"><Info className="h-3 w-3" /></button>
                                            </TooltipTrigger>
                                            <TooltipContent>Days without attendance or leave records within working schedule.</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </span>
                                <span className="font-medium text-red-600">
                                    -Rs {(Number(snapshot?.unaccountedDays) * (baseSalary / standardDays)).toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span>
                                Lateness Penalty ({snapshot?.lateCounts || 0} times)
                            </span>
                            <span className="font-medium text-red-600">
                                -Rs {Number(snapshot?.latePenalty || 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax ({snapshot?.taxPercentage || 0}%)</span>
                            <span className="font-medium text-red-600">
                                -Rs {Number(snapshot?.taxAmount || 0).toFixed(2)}
                            </span>
                        </div>
                        {/* Individual Penalties & Negative Corrections */}
                        {snapshot?.adjustments?.filter((adj) => adj.type === 'penalty' || (adj.type === 'correction' && Number(adj.amount) < 0)).map((adj, idx: number) => (
                            <div key={`penalty-${idx}`} className="flex justify-between text-sm items-center">
                                <div className="flex items-center gap-1.5">
                                    <span>{adj.type === 'penalty' ? 'Penalty' : 'Adjustment'}</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button className="text-muted-foreground hover:text-red-600 transition-colors">
                                                    <Info className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{adj.reason || "No reason provided"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <span className="font-medium text-red-600">
                                    -Rs {Math.abs(Number(adj.amount)).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total Deductions</span>
                            <span className="text-red-600">
                                -Rs {Number(payroll.total_deductions).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Net Payable */}
                    <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100 mt-2">
                        <span className="text-blue-900 font-extrabold text-xl uppercase tracking-tighter">
                            Calculated Salary
                        </span>
                        <span className="text-blue-900 font-extrabold text-3xl tracking-tighter">
                            Rs {Math.floor(Number(payroll.net_salary))}
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close Breakdown
                    </Button>
                    <Button onClick={() => onDownload(payroll.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Payslip
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    createPayrollProfile,
    getEmployeesWithoutProfiles,
} from "@/lib/actions/payroll.actions";
import { EmployeeWithoutProfile } from "@/lib/types/payroll.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/header";

export default function CreatePayrollProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedEmployeeId = searchParams.get("employeeId");

    const [employees, setEmployees] = useState<EmployeeWithoutProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        employee_id: preselectedEmployeeId || "",
        salary_type: "monthly",
        base_salary: "",
        standard_working_days: "22",
        standard_working_hours: "8",
        overtime_eligible: false,
        overtime_rate: "0",
        tax_percentage: "0",
        late_penalty_enabled: false,
        late_penalty_amount: "0",
        leave_deduction_enabled: false,
        leave_deduction_amount: "0",
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await getEmployeesWithoutProfiles();
                if (res.success) {
                    setEmployees(res.data);
                }
            } catch (error) {
                toast.error("Failed to load employees");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // Update base salary when employee selection changes
    useEffect(() => {
        if (formData.employee_id) {
            const selectedEmployee = employees.find(emp => String(emp.id) === String(formData.employee_id));
            if (selectedEmployee && selectedEmployee.salary) {
                setFormData(prev => ({
                    ...prev,
                    base_salary: String(selectedEmployee.salary)
                }));
            }
        }
    }, [formData.employee_id, employees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employee_id) {
            toast.error("Please select an employee");
            return;
        }

        try {
            setIsSubmitting(true);

            const latePenaltyRule = formData.late_penalty_enabled
                ? {
                    enabled: true,
                    penalty_per_late: Number(formData.late_penalty_amount),
                }
                : null;

            const leaveDeductionRule = formData.leave_deduction_enabled
                ? {
                    enabled: true,
                    deduction_per_day: Number(formData.leave_deduction_amount),
                }
                : null;

            const res = await createPayrollProfile({
                employee_id: Number(formData.employee_id),
                salary_type: formData.salary_type,
                base_salary: Number(formData.base_salary),
                standard_working_days: Number(formData.standard_working_days),
                standard_working_hours: Number(formData.standard_working_hours),
                overtime_eligible: formData.overtime_eligible,
                overtime_rate: Number(formData.overtime_rate),
                late_penalty_rule: latePenaltyRule,
                leave_deduction_rule: leaveDeductionRule,
                tax_percentage: Number(formData.tax_percentage),
            });

            if (res.success) {
                toast.success("Payroll profile created successfully");
                router.push("/admin/payroll/profiles");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to create payroll profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Payroll", href: "/admin/payroll" },
                    { label: "Profiles", href: "/admin/payroll/profiles" },
                    { label: "Create Profile" },
                ]}
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Create Payroll Profile
                        </h1>
                        <p className="text-muted-foreground">
                            Set up salary configuration for an employee.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>
                                Configure salary type, base pay, and payroll rules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Employee Selection */}
                            <div className="grid gap-2">
                                <Label htmlFor="employee">Employee *</Label>
                                {isLoading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading employees...
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.employee_id}
                                        onValueChange={(v) =>
                                            setFormData({ ...formData, employee_id: v })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={String(emp.id)}>
                                                    {emp.fullName} ({emp.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Salary Configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="salary_type">Salary Type *</Label>
                                    <Select
                                        value={formData.salary_type}
                                        onValueChange={(v) =>
                                            setFormData({ ...formData, salary_type: v })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="base_salary">Base Salary *</Label>
                                    <Input
                                        id="base_salary"
                                        type="number"
                                        step="0.01"
                                        placeholder="5000.00"
                                        value={formData.base_salary}
                                        onChange={(e) =>
                                            setFormData({ ...formData, base_salary: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* Working Standards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="working_days">Standard Working Days</Label>
                                    <Input
                                        id="working_days"
                                        type="number"
                                        value={formData.standard_working_days}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                standard_working_days: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="working_hours">Standard Working Hours</Label>
                                    <Input
                                        id="working_hours"
                                        type="number"
                                        value={formData.standard_working_hours}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                standard_working_hours: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Overtime */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Overtime Eligible</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable overtime pay for this employee
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.overtime_eligible}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, overtime_eligible: checked })
                                        }
                                    />
                                </div>

                                {formData.overtime_eligible && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="overtime_rate">Overtime Rate (per hour)</Label>
                                        <Input
                                            id="overtime_rate"
                                            type="number"
                                            step="0.01"
                                            placeholder="15.00"
                                            value={formData.overtime_rate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    overtime_rate: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tax */}
                            <div className="grid gap-2">
                                <Label htmlFor="tax">Tax Percentage</Label>
                                <Input
                                    id="tax"
                                    type="number"
                                    step="0.01"
                                    placeholder="10.00"
                                    value={formData.tax_percentage}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tax_percentage: e.target.value })
                                    }
                                />
                            </div>

                            {/* Late Penalty */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Late Penalty</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Deduct amount for each late arrival
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.late_penalty_enabled}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, late_penalty_enabled: checked })
                                        }
                                    />
                                </div>

                                {formData.late_penalty_enabled && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="late_penalty">Penalty per Late</Label>
                                        <Input
                                            id="late_penalty"
                                            type="number"
                                            step="0.01"
                                            placeholder="50.00"
                                            value={formData.late_penalty_amount}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    late_penalty_amount: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Leave Deduction */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Leave Deduction</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Deduct amount for unpaid leave days
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.leave_deduction_enabled}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                leave_deduction_enabled: checked,
                                            })
                                        }
                                    />
                                </div>

                                {formData.leave_deduction_enabled && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="leave_deduction">Deduction per Day</Label>
                                        <Input
                                            id="leave_deduction"
                                            type="number"
                                            step="0.01"
                                            placeholder="100.00"
                                            value={formData.leave_deduction_amount}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    leave_deduction_amount: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Profile"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

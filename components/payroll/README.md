# Payroll Components

Reusable components for the payroll system.

## Components

### PayrollBreakdownDialog

Modal dialog showing detailed salary breakdown.

**Usage**:
```tsx
import { PayrollBreakdownDialog } from "@/components/payroll/PayrollBreakdownDialog";

<PayrollBreakdownDialog
    payroll={selectedPayroll}
    open={isOpen}
    onOpenChange={setIsOpen}
    onDownload={handleDownload}
/>
```

**Props**:
- `payroll`: EmployeePayroll | null - The payroll data to display
- `open`: boolean - Dialog open state
- `onOpenChange`: (open: boolean) => void - Callback when dialog state changes
- `onDownload`: (id: number) => void - Callback for download button

**Features**:
- Attendance metrics display
- Earnings breakdown
- Deductions breakdown
- Net payable calculation
- Download payslip button

---

### EmptyPayrollState

Empty state component for when no data is available.

**Usage**:
```tsx
import { EmptyPayrollState } from "@/components/payroll/EmptyPayrollState";
import { FileText } from "lucide-react";

<EmptyPayrollState
    icon={FileText}
    title="No payroll history found"
    description="Contact HR if you believe this is an error."
/>
```

**Props**:
- `icon`: LucideIcon - Icon component to display
- `title`: string - Main message
- `description`: string - Supporting text

---

### PayrollStatsCard

Statistics card for displaying key metrics.

**Usage**:
```tsx
import { PayrollStatsCard } from "@/components/payroll/PayrollStatsCard";
import { TrendingUp } from "lucide-react";

<PayrollStatsCard
    title="Monthly Average"
    value="$5,250.00"
    description="Based on the last 6 months"
    icon={TrendingUp}
    iconColor="text-green-600"
/>
```

**Props**:
- `title`: string - Card title
- `value`: string | number - Main value to display
- `description?`: string - Optional description text
- `icon`: LucideIcon - Icon component
- `iconColor?`: string - Tailwind color class (default: "text-blue-600")

---

### PayrollPeriodCard

Card component for displaying payroll period in a list.

**Usage**:
```tsx
import { PayrollPeriodCard } from "@/components/payroll/PayrollPeriodCard";

<PayrollPeriodCard
    period={period}
    href={`/admin/payroll/${period.id}`}
/>
```

**Props**:
- `period`: PayrollPeriod - Period data
- `href`: string - Link destination

**Features**:
- Status badge with semantic colors
- Period date range
- Creator information
- Payroll type display
- Hover effects
- Responsive layout

---

## Styling

All components use the existing theme system and follow these principles:

1. **Consistent spacing**: Use Tailwind spacing scale
2. **Theme colors**: Use CSS variables from globals.css
3. **Responsive**: Mobile-first approach
4. **Accessible**: Semantic HTML and ARIA labels
5. **Reusable**: Props for customization

## Examples

### Complete Admin Dashboard

```tsx
import { PayrollStatsCard } from "@/components/payroll/PayrollStatsCard";
import { PayrollPeriodCard } from "@/components/payroll/PayrollPeriodCard";
import { EmptyPayrollState } from "@/components/payroll/EmptyPayrollState";
import { Clock, FileText, CheckCircle2, Calendar } from "lucide-react";

export default function PayrollDashboard() {
    const [periods, setPeriods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PayrollStatsCard
                    title="Pending Approvals"
                    value={periods.filter(p => p.status === 'reviewed').length}
                    description="Periods waiting for sign-off"
                    icon={Clock}
                    iconColor="text-blue-600"
                />
                <PayrollStatsCard
                    title="Draft Periods"
                    value={periods.filter(p => p.status === 'draft').length}
                    description="In calculation phase"
                    icon={FileText}
                    iconColor="text-amber-600"
                />
                <PayrollStatsCard
                    title="Paid this Month"
                    value={periods.filter(p => p.status === 'paid').length}
                    description="Successfully disbursed"
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                />
            </div>

            {/* Period List */}
            {isLoading ? (
                <div>Loading...</div>
            ) : periods.length === 0 ? (
                <EmptyPayrollState
                    icon={Calendar}
                    title="No payroll periods found"
                    description="Generate your first payroll period to get started."
                />
            ) : (
                <div className="space-y-4">
                    {periods.map((period) => (
                        <PayrollPeriodCard
                            key={period.id}
                            period={period}
                            href={`/admin/payroll/${period.id}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Employee Payroll View

```tsx
import { PayrollBreakdownDialog } from "@/components/payroll/PayrollBreakdownDialog";
import { PayrollStatsCard } from "@/components/payroll/PayrollStatsCard";
import { TrendingUp, TrendingDown, Receipt } from "lucide-react";

export default function EmployeePayroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    const handleDownload = (id: number) => {
        // PDF generation logic
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PayrollStatsCard
                    title="Monthly Average"
                    value={`$${calculateAverage(payrolls)}`}
                    description={`Based on ${payrolls.length} months`}
                    icon={TrendingUp}
                    iconColor="text-green-600"
                />
                <PayrollStatsCard
                    title="Total Deductions (YTD)"
                    value={`$${calculateDeductions(payrolls)}`}
                    description="Taxes, penalties & leaves"
                    icon={TrendingDown}
                    iconColor="text-red-600"
                />
                <PayrollStatsCard
                    title="Next Expected Payroll"
                    value="TBA"
                    description="Pending cycle generation"
                    icon={Receipt}
                    iconColor="text-blue-600"
                />
            </div>

            {/* Breakdown Dialog */}
            <PayrollBreakdownDialog
                payroll={selectedPayroll}
                open={!!selectedPayroll}
                onOpenChange={(open) => !open && setSelectedPayroll(null)}
                onDownload={handleDownload}
            />
        </div>
    );
}
```

## Best Practices

1. **Always handle null/undefined**: Check data before rendering
2. **Use proper TypeScript types**: Import from payroll.types.ts
3. **Provide loading states**: Show skeletons or spinners
4. **Handle errors gracefully**: Use toast notifications
5. **Keep components pure**: Avoid side effects in render
6. **Memoize expensive calculations**: Use useMemo when needed
7. **Test edge cases**: Empty states, errors, loading

## Contributing

When adding new payroll components:

1. Follow existing naming conventions
2. Add TypeScript types
3. Include JSDoc comments
4. Update this README
5. Add usage examples
6. Test responsive behavior
7. Ensure accessibility

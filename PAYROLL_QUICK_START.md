# Payroll UI - Quick Start Guide

## 🚀 Getting Started

This guide will help you quickly understand and work with the Payroll UI system.

## 📍 Routes

### Admin Routes
```
/admin/payroll              → Payroll Dashboard
/admin/payroll/[id]         → Period Details
```

### Employee Routes
```
/employee/payroll           → My Payroll History
```

## 🎯 Quick Actions

### As Admin

#### Create New Payroll Period
```typescript
// Navigate to /admin/payroll
// Click "Generate Payroll" button
// Fill form:
{
  name: "February 2026 Payroll",
  startDate: "2026-02-01",
  endDate: "2026-02-28",
  payrollType: "monthly"
}
// Click "Generate"
```

#### Process Payroll
```typescript
// 1. Calculate salaries
await calculatePayroll(payrollId);

// 2. Submit for review
await reviewPayrollPeriod(periodId);

// 3. Approve
await approvePayrollPeriod(periodId);

// 4. Mark as paid
await markPayrollAsPaid(periodId);
```

#### Add Adjustment
```typescript
await addAdjustment({
  employee_payroll_id: 123,
  type: "bonus",        // or "penalty" or "correction"
  amount: 500,
  reason: "Performance bonus"
});
```

### As Employee

#### View Payroll History
```typescript
// Navigate to /employee/payroll
// Click any row to see breakdown
// Click "Download Payslip" for PDF
```

## 🧩 Component Usage

### PayrollStatsCard
```tsx
import { PayrollStatsCard } from "@/components/payroll/PayrollStatsCard";
import { TrendingUp } from "lucide-react";

<PayrollStatsCard
  title="Monthly Average"
  value="$5,250"
  description="Last 6 months"
  icon={TrendingUp}
  iconColor="text-green-600"
/>
```

### PayrollBreakdownDialog
```tsx
import { PayrollBreakdownDialog } from "@/components/payroll/PayrollBreakdownDialog";

<PayrollBreakdownDialog
  payroll={selectedPayroll}
  open={isOpen}
  onOpenChange={setIsOpen}
  onDownload={(id) => console.log("Download", id)}
/>
```

### EmptyPayrollState
```tsx
import { EmptyPayrollState } from "@/components/payroll/EmptyPayrollState";
import { Calendar } from "lucide-react";

<EmptyPayrollState
  icon={Calendar}
  title="No periods found"
  description="Create your first period"
/>
```

### PayrollPeriodCard
```tsx
import { PayrollPeriodCard } from "@/components/payroll/PayrollPeriodCard";

<PayrollPeriodCard
  period={period}
  href={`/admin/payroll/${period.id}`}
/>
```

## 🔌 API Integration

### Import Actions
```typescript
import {
  createPayrollPeriod,
  getPayrollPeriods,
  getPayrollPeriodDetails,
  calculatePayroll,
  addAdjustment,
  reviewPayrollPeriod,
  approvePayrollPeriod,
  markPayrollAsPaid,
  getEmployeePayrollHistory
} from "@/lib/actions/payroll.actions";
```

### Fetch Periods
```typescript
const fetchPeriods = async () => {
  try {
    const res = await getPayrollPeriods();
    if (res.success) {
      setPeriods(res.data);
    }
  } catch (error) {
    toast.error("Failed to load periods");
  }
};
```

### Create Period
```typescript
const handleCreate = async (data) => {
  try {
    const res = await createPayrollPeriod(data);
    if (res.success) {
      toast.success("Period created");
      fetchPeriods();
    }
  } catch (error) {
    toast.error("Failed to create");
  }
};
```

## 🎨 Styling

### Status Colors
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "text-gray-600";
    case "reviewed": return "text-blue-600";
    case "approved": return "text-green-600";
    case "paid": return "text-green-700";
  }
};
```

### Badge Variants
```tsx
// Draft
<Badge variant="secondary">Draft</Badge>

// Reviewed
<Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
  Reviewed
</Badge>

// Approved
<Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
  Approved
</Badge>

// Paid
<Badge variant="default" className="bg-green-600">
  Paid
</Badge>
```

## 🔒 Authentication

### Check User Role
```typescript
import { useAuth } from "@/context/AuthContext";

const { user } = useAuth();
const isAdmin = user?.role === "admin";

{isAdmin && (
  <Button onClick={handleAdminAction}>
    Admin Only Action
  </Button>
)}
```

### Protected API Call
```typescript
import { getAuthToken } from "@/lib/auth/token";

const token = getAuthToken();
const response = await fetch(url, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

## 📊 Data Types

### PayrollPeriod
```typescript
interface PayrollPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  payroll_type: "monthly" | "weekly";
  status: "draft" | "reviewed" | "approved" | "paid";
  created_by: number;
  payrolls?: EmployeePayroll[];
}
```

### EmployeePayroll
```typescript
interface EmployeePayroll {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  gross_salary: string | number;
  total_deductions: string | number;
  net_salary: string | number;
  status: "draft" | "calculated" | "paid";
  locked: boolean;
  snapshot: {
    baseSalary: number;
    overtimePay: number;
    totalBonuses: number;
    unpaidDeduction: number;
    latePenalty: number;
    taxAmount: number;
    // ... more fields
  };
}
```

## 🐛 Common Issues

### Issue: Payroll not calculating
**Solution**: Ensure employee has complete profile data (salary, tax rate, etc.)

### Issue: Empty period list
**Solution**: Check API connection and authentication token

### Issue: Cannot approve payroll
**Solution**: Verify all payrolls are calculated and period is in "reviewed" status

### Issue: Download not working
**Solution**: PDF generation is a placeholder - implement backend endpoint

## 🧪 Testing

### Test Admin Flow
```bash
1. Login as admin
2. Navigate to /admin/payroll
3. Click "Generate Payroll"
4. Fill form and submit
5. Click on created period
6. Click "Calculate All"
7. Click "Submit for Review"
8. Click "Approve Payroll"
9. Click "Mark as Paid"
```

### Test Employee Flow
```bash
1. Login as employee
2. Navigate to /employee/payroll
3. View recent disbursement card
4. Click on payroll row
5. View breakdown dialog
6. Click "Download Payslip"
```

## 📚 Resources

- **Full Documentation**: `/docs/PAYROLL_UI.md`
- **Component Docs**: `/components/payroll/README.md`
- **Implementation Summary**: `/PAYROLL_IMPLEMENTATION_SUMMARY.md`
- **Backend API**: Check backend documentation

## 💡 Tips

1. **Always handle loading states** - Use Skeleton or Loader2
2. **Show user feedback** - Use toast notifications
3. **Validate before submit** - Check required fields
4. **Handle errors gracefully** - Try-catch all API calls
5. **Test responsive design** - Check mobile, tablet, desktop
6. **Use TypeScript** - Leverage type safety
7. **Follow existing patterns** - Check other pages for consistency

## 🎓 Next Steps

1. Read full documentation in `/docs/PAYROLL_UI.md`
2. Explore component examples in `/components/payroll/README.md`
3. Review existing pages for patterns
4. Test all user flows
5. Implement PDF generation (backend)
6. Add email notifications (optional)
7. Set up monitoring and logging

## 🤝 Contributing

When adding features:
1. Follow existing code style
2. Add TypeScript types
3. Update documentation
4. Test thoroughly
5. Handle edge cases
6. Add loading/error states

---

**Need Help?** Check the full documentation or contact the development team.

**Last Updated**: February 21, 2026

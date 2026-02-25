# Payroll UI Documentation

## Overview

The Payroll UI system provides a comprehensive interface for managing employee payroll, including period management, salary calculations, and payslip generation. The system follows the existing design language and uses the established component library.

## Architecture

### Pages Structure

```
app/(protected)/
├── admin/
│   └── payroll/
│       ├── page.tsx                    # Payroll Dashboard (Admin)
│       └── [id]/
│           └── page.tsx                # Payroll Period Details (Admin)
└── employee/
    └── payroll/
        └── page.tsx                    # Employee Payroll History
```

### Components Structure

```
components/payroll/
├── PayrollBreakdownDialog.tsx          # Reusable salary breakdown modal
├── EmptyPayrollState.tsx               # Empty state component
├── PayrollStatsCard.tsx                # Statistics card component
└── PayrollPeriodCard.tsx               # Payroll period list item
```

## Features

### 1. Admin Payroll Dashboard (`/admin/payroll`)

**Purpose**: Central hub for managing all payroll periods

**Features**:
- View all payroll periods with status badges
- Quick statistics (Pending Approvals, Draft Periods, Paid)
- Generate new payroll periods
- Search and filter periods
- Navigate to period details

**Key Components**:
- `PayrollStatsCard` - Displays key metrics
- `PayrollPeriodCard` - Individual period cards
- `EmptyPayrollState` - No data state

**Status Flow**:
```
draft → reviewed → approved → paid
```

**Actions**:
- Generate Payroll: Creates a new period with employee records
- View Details: Navigate to period detail page

### 2. Payroll Period Details (`/admin/payroll/[id]`)

**Purpose**: Detailed view and management of a specific payroll period

**Features**:
- View all employee payroll records
- Calculate/recalculate individual or all payrolls
- Add adjustments (bonuses, penalties, corrections)
- Status transitions (Review, Approve, Mark as Paid)
- Search employees
- View detailed breakdowns

**Key Metrics**:
- Total Gross Salary
- Total Deductions
- Net Disbursement
- Employee Count

**Actions by Status**:

**Draft Status**:
- Calculate All: Bulk recalculation
- Submit for Review: Move to reviewed status

**Reviewed Status**:
- Approve Payroll: Move to approved status

**Approved Status**:
- Mark as Paid: Finalize payroll

**Paid Status**:
- Read-only, no actions available

**Per-Employee Actions**:
- Recalculate: Refresh salary calculation
- Add Adjustment: Apply bonus/penalty/correction
- View Breakdown: See detailed salary components

### 3. Employee Payroll View (`/employee/payroll`)

**Purpose**: Employee self-service portal for viewing salary information

**Features**:
- View payroll history
- See most recent disbursement (highlighted card)
- View salary breakdowns
- Download payslips (PDF placeholder)
- Statistics (Monthly Average, Total Deductions YTD)

**Key Components**:
- Recent Disbursement Card: Prominent display of latest payment
- Payroll History Table: All past payrolls
- `PayrollBreakdownDialog`: Detailed salary breakdown

**Breakdown Details**:
- Attendance metrics (Days, Hours, Overtime, Lates)
- Earnings (Base Salary, Overtime Pay, Bonuses)
- Deductions (Unpaid Leave, Lateness Penalty, Tax, Penalties)
- Net Payable amount

## API Integration

### Actions (`lib/actions/payroll.actions.ts`)

```typescript
// Period Management
createPayrollPeriod(data)
getPayrollPeriods()
getPayrollPeriodDetails(id)

// Calculations
calculatePayroll(id)

// Adjustments
addAdjustment(data)

// Status Transitions
reviewPayrollPeriod(id)
approvePayrollPeriod(id)
markPayrollAsPaid(id)

// Employee View
getEmployeePayrollHistory()
```

### Data Types (`lib/types/payroll.types.ts`)

```typescript
interface PayrollPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    payroll_type: "monthly" | "weekly";
    status: "draft" | "reviewed" | "approved" | "paid";
    created_by: number;
    created_at: string;
    creator?: { id: number; fullName: string };
    payrolls?: EmployeePayroll[];
}

interface EmployeePayroll {
    id: number;
    payroll_period_id: number;
    employee_id: number;
    gross_salary: string | number;
    total_deductions: string | number;
    net_salary: string | number;
    status: "draft" | "calculated" | "paid";
    locked: boolean;
    snapshot: any;
    created_at: string;
    employee?: { id: number; fullName: string; email: string };
    period?: PayrollPeriod;
}

interface PayrollAdjustment {
    id: number;
    employee_payroll_id: number;
    type: "bonus" | "penalty" | "correction";
    amount: string | number;
    reason: string;
    created_by: number;
    created_at: string;
}
```

## Design System Compliance

### Theme Colors

The UI uses the existing theme variables defined in `globals.css`:

- Primary: `--primary` (Dark gray/black)
- Secondary: `--secondary` (Light gray)
- Destructive: `--destructive` (Red for errors/penalties)
- Muted: `--muted` (Subtle backgrounds)
- Border: `--border` (Consistent borders)

### Component Usage

All components follow the established patterns:

- **Card**: Main container for sections
- **Button**: Actions with variants (default, outline, ghost, destructive)
- **Badge**: Status indicators with semantic colors
- **Table**: Data display with hover states
- **Dialog**: Modal interactions
- **Input**: Form fields with consistent styling

### Status Badge Colors

```typescript
draft: Badge variant="secondary" (gray)
reviewed: Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50"
approved: Badge variant="outline" className="text-green-600 border-green-600 bg-green-50"
paid: Badge variant="default" className="bg-green-600"
```

## Security & Access Control

### Role-Based Access

**Admin**:
- Full access to all payroll periods
- Can create, calculate, review, approve, and mark as paid
- Can add adjustments
- View all employee payrolls

**Employee**:
- View own payroll history only
- View salary breakdowns
- Download own payslips
- No modification capabilities

### Protected Routes

All payroll routes are under `(protected)` layout which:
- Checks authentication via `AuthContext`
- Redirects to login if not authenticated
- Validates user role for admin routes

### API Security

- All API calls include Bearer token authentication
- Token retrieved via `getAuthToken()` helper
- Server-side validation of user permissions

## Loading States

### Skeleton Loaders

Used during data fetching:
- Period list loading
- Employee payroll table loading
- Stats cards loading

### Empty States

Custom empty state components for:
- No payroll periods
- No payroll history
- No search results

### Processing States

Button states during actions:
- Calculating: Shows spinner + "Calculating..."
- Submitting: Shows spinner + "Generating..."
- Processing: Disabled state with visual feedback

## Error Handling

### Toast Notifications

Using `sonner` library for user feedback:

```typescript
toast.success("Payroll period generated successfully")
toast.error("Failed to load payroll periods")
toast.info("Payslip generation is a placeholder")
```

### Try-Catch Blocks

All API calls wrapped in try-catch:
- Graceful error handling
- User-friendly error messages
- Fallback UI states

## Responsive Design

### Breakpoints

- Mobile: Single column layouts
- Tablet (md): 2-3 column grids
- Desktop (lg): Full 4 column layouts

### Mobile Optimizations

- Collapsible table columns
- Stacked cards on mobile
- Touch-friendly button sizes
- Responsive dialogs

## Future Enhancements

### Planned Features

1. **PDF Generation**: Real payslip PDF download
2. **Email Notifications**: Auto-send payslips to employees
3. **Bulk Actions**: Select multiple employees for actions
4. **Export**: CSV/Excel export of payroll data
5. **Audit Trail**: Track all payroll modifications
6. **Payroll Templates**: Reusable period templates
7. **Advanced Filters**: Filter by department, status, date range
8. **Charts**: Visual payroll analytics

### Technical Improvements

1. **Optimistic Updates**: Immediate UI feedback
2. **Caching**: SWR for better performance
3. **Pagination**: Handle large employee lists
4. **Real-time Updates**: WebSocket for live status changes
5. **Batch Processing**: Background job for bulk calculations

## Testing Checklist

### Admin Flow

- [ ] Create new payroll period
- [ ] View period list with correct statuses
- [ ] Navigate to period details
- [ ] Calculate individual payroll
- [ ] Calculate all payrolls
- [ ] Add bonus adjustment
- [ ] Add penalty adjustment
- [ ] Submit for review
- [ ] Approve payroll
- [ ] Mark as paid
- [ ] Search employees
- [ ] View breakdown

### Employee Flow

- [ ] View payroll history
- [ ] See recent disbursement card
- [ ] Click to view breakdown
- [ ] View detailed salary components
- [ ] Download payslip (placeholder)
- [ ] View statistics

### Edge Cases

- [ ] Empty payroll list
- [ ] No employee payrolls
- [ ] Locked payroll (no recalculation)
- [ ] Network errors
- [ ] Invalid data
- [ ] Unauthorized access

## Maintenance

### Code Organization

- Keep components small and focused
- Use TypeScript for type safety
- Follow existing naming conventions
- Document complex logic
- Extract reusable utilities

### Performance

- Lazy load heavy components
- Memoize expensive calculations
- Debounce search inputs
- Optimize re-renders
- Use proper React keys

### Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Screen reader support

## Support

For issues or questions:
1. Check backend API documentation
2. Review error logs
3. Verify authentication tokens
4. Check network requests
5. Contact development team

---

**Last Updated**: February 21, 2026
**Version**: 1.0.0

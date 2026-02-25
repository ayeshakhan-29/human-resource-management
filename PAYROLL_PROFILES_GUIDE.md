# Payroll Profiles Setup Guide

## Problem Solved

When generating payroll, you may encounter this error:
```
The following employees are missing payroll profiles: [Employee Names]. 
All active employees must have a profile before generating payroll.
```

This happens because employees need payroll profiles configured before their salaries can be calculated.

## Solution

### Step 1: Access Payroll Profiles

1. Navigate to `/admin/payroll`
2. Click the "Manage Profiles" button
3. You'll see the Payroll Profiles page

### Step 2: View Missing Profiles

On the Payroll Profiles page, you'll see:
- A warning card listing all employees without profiles
- Statistics showing total profiles, missing profiles, and total employees
- A table of existing payroll profiles

### Step 3: Create Payroll Profiles

**Option A: From the Warning Card**
1. Click "Create Profile" next to any employee in the warning card
2. The form will pre-select that employee

**Option B: From the Main Button**
1. Click "Create Profile" button at the top right
2. Select an employee from the dropdown

### Step 4: Configure Profile Settings

Fill in the following required fields:

**Basic Information:**
- Employee: Select from dropdown
- Salary Type: Monthly, Hourly, or Daily
- Base Salary: The employee's base pay amount

**Working Standards:**
- Standard Working Days: Default 22 days/month
- Standard Working Hours: Default 8 hours/day

**Optional Settings:**

**Overtime:**
- Toggle "Overtime Eligible" if employee can earn overtime
- Set "Overtime Rate" (per hour)

**Tax:**
- Set "Tax Percentage" (e.g., 10 for 10%)

**Late Penalty:**
- Toggle "Late Penalty" to enable
- Set "Penalty per Late" amount

**Leave Deduction:**
- Toggle "Leave Deduction" to enable
- Set "Deduction per Day" for unpaid leave

### Step 5: Save Profile

1. Click "Create Profile"
2. You'll be redirected back to the profiles list
3. The employee will now appear in the profiles table

### Step 6: Generate Payroll

Once all active employees have profiles:
1. Go back to `/admin/payroll`
2. Click "Generate Payroll"
3. Fill in the period details
4. Click "Generate"

The system will now successfully create payroll records for all employees.

## API Endpoints

### Backend Routes (Already Added)

```javascript
GET    /api/payroll/profiles              // Get all profiles
GET    /api/payroll/profiles/missing      // Get employees without profiles
GET    /api/payroll/profile/:employeeId   // Get specific profile
POST   /api/payroll/profile               // Create profile
PUT    /api/payroll/profile/:id           // Update profile
DELETE /api/payroll/profile/:id           // Delete profile
```

### Frontend Actions

```typescript
import {
    getAllPayrollProfiles,
    getEmployeesWithoutProfiles,
    getPayrollProfile,
    createPayrollProfile,
    updatePayrollProfile,
    deletePayrollProfile,
} from "@/lib/actions/payroll.actions";
```

## Data Structure

### PayrollProfile Type

```typescript
interface PayrollProfile {
    id: number;
    employee_id: number;
    salary_type: "monthly" | "hourly" | "daily";
    base_salary: number;
    standard_working_days: number;
    standard_working_hours: number;
    overtime_eligible: boolean;
    overtime_rate: number;
    late_penalty_rule: {
        enabled: boolean;
        penalty_per_late: number;
    } | null;
    leave_deduction_rule: {
        enabled: boolean;
        deduction_per_day: number;
    } | null;
    tax_percentage: number;
}
```

## Example Profile Configuration

### Monthly Salaried Employee

```json
{
    "employee_id": 1,
    "salary_type": "monthly",
    "base_salary": 5000,
    "standard_working_days": 22,
    "standard_working_hours": 8,
    "overtime_eligible": true,
    "overtime_rate": 15,
    "tax_percentage": 10,
    "late_penalty_rule": {
        "enabled": true,
        "penalty_per_late": 50
    },
    "leave_deduction_rule": {
        "enabled": true,
        "deduction_per_day": 200
    }
}
```

### Hourly Employee

```json
{
    "employee_id": 2,
    "salary_type": "hourly",
    "base_salary": 25,
    "standard_working_days": 22,
    "standard_working_hours": 8,
    "overtime_eligible": true,
    "overtime_rate": 37.5,
    "tax_percentage": 8,
    "late_penalty_rule": null,
    "leave_deduction_rule": null
}
```

## Troubleshooting

### Issue: Employee not showing in dropdown

**Solution**: The employee might already have a profile. Check the profiles table.

### Issue: Cannot generate payroll after creating profiles

**Solution**: 
1. Ensure ALL active employees have profiles
2. Check the "Missing Profiles" count is 0
3. Refresh the page and try again

### Issue: Profile creation fails

**Solution**:
1. Verify all required fields are filled
2. Check that base salary is a valid number
3. Ensure the employee exists and is active

## Best Practices

1. **Create profiles for all employees before first payroll**
   - Prevents errors during payroll generation
   - Ensures consistent salary calculations

2. **Review profiles regularly**
   - Update when salaries change
   - Adjust tax percentages as needed
   - Enable/disable overtime as required

3. **Use consistent settings**
   - Standard working days: 22 for monthly
   - Standard working hours: 8 per day
   - Tax percentage: Based on local regulations

4. **Document special cases**
   - Note why certain employees have different settings
   - Keep records of salary changes

## Quick Reference

### Navigation
- Payroll Dashboard: `/admin/payroll`
- Payroll Profiles: `/admin/payroll/profiles`
- Create Profile: `/admin/payroll/profiles/create`

### Key Features
- ✅ View all payroll profiles
- ✅ See employees without profiles
- ✅ Create new profiles
- ✅ Edit existing profiles
- ✅ Delete profiles
- ✅ Quick access from warning card

### Status Indicators
- 🟢 Green badge: Overtime enabled
- ⚪ Gray badge: Overtime disabled
- 🟡 Yellow warning: Missing profiles
- 📊 Statistics cards: Profile counts

---

**Last Updated**: February 22, 2026
**Version**: 1.0.0

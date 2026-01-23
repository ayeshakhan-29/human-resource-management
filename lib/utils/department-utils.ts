import { Department } from "@/lib/actions/department.actions";

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  userInfo?: {
    department?: string;
    position?: string;
  };
}

/**
 * Filter employees by department name
 */
export function filterEmployeesByDepartment(
  employees: Employee[],
  departmentName: string
): Employee[] {
  if (!departmentName) return employees;
  
  return employees.filter(
    (employee) =>
      employee.userInfo?.department?.toLowerCase() === departmentName.toLowerCase()
  );
}

/**
 * Group employees by their departments
 */
export function groupEmployeesByDepartment(
  employees: Employee[]
): Record<string, Employee[]> {
  const grouped: Record<string, Employee[]> = {};
  
  employees.forEach((employee) => {
    const department = employee.userInfo?.department || "Unassigned";
    if (!grouped[department]) {
      grouped[department] = [];
    }
    grouped[department].push(employee);
  });
  
  return grouped;
}

/**
 * Get unique departments from employee list
 */
export function getUniqueDepartmentsFromEmployees(
  employees: Employee[]
): string[] {
  const departments = new Set<string>();
  
  employees.forEach((employee) => {
    if (employee.userInfo?.department) {
      departments.add(employee.userInfo.department);
    }
  });
  
  return Array.from(departments).sort();
}

/**
 * Check if a department name exists in the departments list
 */
export function isDepartmentValid(
  departmentName: string,
  departments: Department[]
): boolean {
  return departments.some(
    (dept) => dept.name.toLowerCase() === departmentName.toLowerCase()
  );
}

/**
 * Get department statistics
 */
export function getDepartmentStats(
  employees: Employee[],
  departments: Department[]
): Array<{
  department: string;
  employeeCount: number;
  isActive: boolean;
}> {
  const grouped = groupEmployeesByDepartment(employees);
  
  return departments.map((dept) => ({
    department: dept.name,
    employeeCount: grouped[dept.name]?.length || 0,
    isActive: dept.isActive ?? true,
  }));
}
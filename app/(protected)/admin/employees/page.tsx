"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { getAllEmployees } from "@/lib/actions/employee.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/header";
import { AddEmployeeForm } from "@/components/add-employee-form";

import { Employee, UserInfo } from "@/lib/types/employee.types";

// Define the valid status types
type EmployeeStatus = "active" | "inactive" | "suspended" | "on_leave";

// Extend the Employee type to include the status type
interface EmployeeWithStatus extends Omit<Employee, "status"> {
  status: EmployeeStatus;
}

// Helper function to normalize status
const normalizeStatus = (status: string): EmployeeStatus => {
  switch (status) {
    case "active":
    case "inactive":
    case "suspended":
    case "on_leave":
      return status;
    default:
      return "inactive";
  }
};

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await getAllEmployees();
        console.log(response, "response");
        if (response.success) {
          const normalizedEmployees = response.data.map((emp) => ({
            ...emp,
            status: normalizeStatus(emp.status),
          }));
          setEmployees(normalizedEmployees);
        } else {
          throw new Error("Failed to fetch employees");
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees. Please try again later.");
        toast.error("Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.userInfo?.department || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  console.log(filteredEmployees, "filteredEmployees");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employee Information" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.length}
              </div>
              <p className="text-xs text-muted-foreground">Employees in system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Engineering, Marketing, Sales, HR
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((emp) => emp.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  employees.filter(
                    (employee) =>
                      employee.status === "on_leave" ||
                      employee.status === "inactive"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Temporary absence</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>
                  Manage your team members and their details
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/admin/employees/add">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {employee.profilePicture && (
                              <AvatarImage 
                                src={employee.profilePicture} 
                                alt={employee.fullName}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback>
                              {employee.fullName
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.userInfo?.department
                          ? employee.userInfo.department
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : "Not specified"}
                      </TableCell>
                      <TableCell>
                        {employee.userInfo?.position
                          ? employee.userInfo.position
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")
                          : "Not specified"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === "active"
                              ? "default"
                              : employee.status === "on_leave"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(employee.userInfo as UserInfo)?.startDate
                          ? new Date(
                              (employee.userInfo as UserInfo).startDate!
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

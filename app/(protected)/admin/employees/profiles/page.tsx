"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Edit, MoreHorizontal, Loader2, User, Key } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getAllEmployees } from "@/lib/actions/employee.actions";
import { useRouter } from "next/navigation";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/header";

import { Employee } from "@/lib/types/employee.types";

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

export default function EmployeeProfilesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
 useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await getAllEmployees();
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
        setError("Failed to load employee profiles. Please try again later.");
        toast.error("Failed to load employee profiles");
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
        .includes(searchTerm.toLowerCase()) ||
      (employee.userInfo?.position || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading employee profiles...</span>
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
          { label: "Employee Management", href: "/admin/employees" },
          { label: "Employee Profiles" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Profiles</h1>
            <p className="text-muted-foreground">
              View and manage detailed employee profiles and information
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/employees">
                <User className="mr-2 h-4 w-4" />
                All Employees
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/employees/add">
                <User className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Employees</CardTitle>
            <CardDescription>
              Find employees by name, email, department, or position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, department, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>   
     {/* Employee Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    {employee.profilePicture && (
                      <AvatarImage 
                        src={employee.profilePicture} 
                        alt={employee.fullName}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-lg">
                      {employee.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {employee.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {employee.email}
                    </p>
                    <Badge
                      variant={
                        employee.status === "active"
                          ? "default"
                          : employee.status === "on_leave"
                          ? "secondary"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {employee.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/employees/${employee.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/employees/${employee.id}?edit=true`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/employees/${employee.id}?password=true`)}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>       
       <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">
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
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Position</p>
                      <p className="font-medium">
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
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employee ID</p>
                      <p className="font-medium">#{employee.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Join Date</p>
                      <p className="font-medium">
                        {employee.userInfo?.startDate
                          ? new Date(employee.userInfo.startDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {employee.userInfo?.phone && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Contact</p>
                      <p className="font-medium">{employee.userInfo.phone}</p>
                    </div>
                  )}

                  {employee.userInfo?.department && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{employee.userInfo.department}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/admin/employees/${employee.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/employees/${employee.id}?edit=true`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> 
       {filteredEmployees.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? "No employees match your search criteria. Try adjusting your search terms."
                  : "No employees have been added to the system yet."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/admin/employees/add">
                    Add First Employee
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
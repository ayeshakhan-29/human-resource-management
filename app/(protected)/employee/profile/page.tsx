"use client";

import { Edit, Phone, Mail, MapPin, Calendar, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getEmployeeInfoById } from "@/lib/actions/employee.actions";
import { EmployeeInfoResponse } from "@/lib/types/employee.types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth/token";

interface ProfileInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

const ProfileInfoItem = ({ icon, label, value }: ProfileInfoItemProps) => (
  <div className="flex items-start gap-4 py-2">
    <div className="bg-muted p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  </div>
);

export default function EmployeeProfilePage() {
  const [employee, setEmployee] = useState<EmployeeInfoResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const fetchUserId = () => {
      if (typeof window === "undefined") return;

      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            setEmployeeId(Number(user.id));
          } else {
            toast.error("User information not found. Please log in again.");
          }
        } catch (error) {
          toast.error("Error loading user information");
        }
      } else {
        toast.error("Please log in to view this page");
        router.push("/login");
      }
    };

    fetchUserId();
  }, [router]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) return;

      try {
        setLoading(true);
        const response = await getEmployeeInfoById(employeeId);
        if (response && response.success) {
          setEmployee(response.data);
        } else {
          throw new Error("Failed to load employee data");
        }
      } catch (error) {
        toast.error("Failed to load employee profile");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No employee data found</p>
      </div>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Employee", href: "/employee" },
          { label: "My Information" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Information
          </h2>
          <p className="text-gray-600">
            View and manage your personal and work details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl">
                  {employee?.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{employee?.fullName}</CardTitle>
              <CardDescription>
                {employee?.personalInfo?.position}
              </CardDescription>
              <Button className="mt-4" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Join Date</p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.startDate
                        ? new Date(
                            employee.personalInfo.startDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm text-gray-600">{employee?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-sm text-gray-600">
                        {employee?.personalInfo?.contactNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>
                  Your employment and work details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Position
                    </p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.position || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Department
                    </p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Manager</p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.reportingManager || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Join Date
                    </p>
                    <p className="text-sm text-gray-600">
                      {employee?.personalInfo?.startDate
                        ? new Date(
                            employee.personalInfo.startDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Contact person in case of emergency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-600">
                      {mockEmployee.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Relationship
                    </p>
                    <p className="text-sm text-gray-600">
                      {mockEmployee.emergencyContact.relationship}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Phone Number
                    </p>
                    <p className="text-sm text-gray-600">
                      {mockEmployee.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { PersonalInformationForm } from "@/components/forms/personal-information-form";
import { WorkInformationForm } from "@/components/forms/work-information-form";
import { EmployeeAttachmentsForm } from "@/components/forms/employee-attachments-form";
import { FormSuccess } from "@/components/forms/form-success";
import { FormActions } from "@/components/forms/form-actions";
import {
  type EmployeeFormData,
  initialEmployeeFormData,
  type InviteEmployeeBody,
} from "@/lib/types/employee.types";
import { inviteEmployee, uploadEmployeeAttachments } from "@/lib/actions/employee.actions";
import { z } from "zod";
import { employeeFormSchema } from "@/lib/validations/employee.schema";

export default function AddEmployeePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Record<string, { message: string }>
  >({});
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialEmployeeFormData
  );

  const validateField = (field: string, value: string | number) => {
    const errors: Record<string, { message: string }> = {};

    try {
      const tempData = { [field]: value };
      employeeFormSchema.pick({ [field]: true }).parse(tempData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          if (issue.path[0] === field) {
            errors[field] = { message: issue.message };
          }
        });
      }
    }

    return errors;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "salary" && typeof value === "string"
          ? value === ""
            ? ""
            : parseInt(value, 10) || 0
          : value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    const fieldErrors = validateField(
      field,
      field === "salary" && typeof value === "string"
        ? parseInt(value, 10) || 0
        : value
    );
    if (Object.keys(fieldErrors).length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        ...fieldErrors,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for required fields
    const requiredFields = [
      "fullName",
      "email",
      "contactNumber",
      "cnic",
      "department",
      "position",
      "startDate",
      "employmentType",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData];
      return value === "" || value === undefined || value === null;
    });

    if (missingFields.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        form: {
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
      }));
      return;
    }
    setIsLoading(true);

    try {
      const employeeData: InviteEmployeeBody = {
        fullName: formData.fullName,
        email: formData.email,
        role: "employee",
        cnic: formData.cnic,
        contactNumber: formData.contactNumber,
        address: formData.address,
        dob: formData.dob
          ? new Date(formData.dob).toISOString()
          : new Date().toISOString(),
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : new Date().toISOString(),
        department: formData.department,
        reportingManager: formData.reportingManager || "",
        probationEndDate: formData.probationEndDate
          ? new Date(formData.probationEndDate).toISOString()
          : "",
        employmentStatus: formData.employmentType,
        salary: formData.salary ? parseInt(formData.salary as string) : 0,
        designation: formData.position,
        team: formData.team || "",
      };

      const result = await inviteEmployee(employeeData);

      if (result) {
        // Upload attachments if any
        if (formData.attachments && formData.attachments.length > 0) {
          try {
            await uploadEmployeeAttachments(result.userId, formData.attachments);
            toast.success("Employee added and attachments uploaded successfully!");
          } catch (attachmentError) {
            console.error("Failed to upload attachments:", attachmentError);
            toast.warning("Employee added but failed to upload some attachments");
          }
        }
        
        setSuccess(true);
      } else {
        throw new Error("Failed to add employee: No result returned");
      }
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || "Failed to add employee";

      toast.error(errorMessage);
      setFormErrors((prev) => ({
        ...prev,
        form: { message: errorMessage },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setSuccess(false);
    setFormData({
      ...initialEmployeeFormData,
    });
    setFormErrors({});
  };

  if (success) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Employees", href: "/admin/employees" },
            { label: "Add Employee" },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <FormSuccess
            employeeName={formData.fullName}
            onAddAnother={handleAddAnother}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employees", href: "/admin/employees" },
          { label: "Add Employee" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Add New Employee
            </h2>
            <p className="text-gray-600">
              Enter employee information to add them to the system
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          id="addEmployeeForm"
        >
          <PersonalInformationForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={formErrors}
          />
          <WorkInformationForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={formErrors}
          />
          <EmployeeAttachmentsForm
            attachments={formData.attachments}
            onAttachmentsChange={(attachments) => handleInputChange("attachments", attachments as any)}
            errors={formErrors}
          />
          <FormActions isLoading={isLoading} />
        </form>
      </div>
    </>
  );
}

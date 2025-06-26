"use client";

import type React from "react";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { PersonalInformationForm } from "@/components/forms/personal-information-form";
import { WorkInformationForm } from "@/components/forms/work-information-form";
import { AdditionalInformationForm } from "@/components/forms/additional-information-form";
import { FormSuccess } from "@/components/forms/form-success";
import { FormActions } from "@/components/forms/form-actions";
import {
  type EmployeeFormData,
  initialEmployeeFormData,
} from "@/lib/types/employee.types";
import { BankInformationForm } from "@/components/forms/bank-information-form";

export default function AddEmployeePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialEmployeeFormData
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate employee ID if not provided
      if (!formData.employeeId) {
        const randomId = `EMP${String(
          Math.floor(Math.random() * 9999) + 1
        ).padStart(3, "0")}`;
        setFormData((prev) => ({ ...prev, employeeId: randomId }));
      }

      setSuccess(true);
    } catch (err) {
      setError("Failed to add employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setSuccess(false);
    setFormData(initialEmployeeFormData);
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
            employeeName={`${formData.firstName} ${formData.lastName}`}
            employeeId={formData.employeeId}
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

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInformationForm
            formData={formData}
            onInputChange={handleInputChange}
          />
          <WorkInformationForm
            formData={formData}
            onInputChange={handleInputChange}
          />
          <BankInformationForm
            formData={formData}
            onInputChange={handleInputChange}
          />
          <AdditionalInformationForm
            formData={formData}
            onInputChange={handleInputChange}
          />
          <FormActions isLoading={isLoading} />
        </form>
      </div>
    </>
  );
}

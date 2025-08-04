"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PersonalInformationFormProps {
  formData: {
    fullName: string;
    email: string;
    contactNumber: string;
    cnic: string;
    dob: string;
    address: string;
  };
  onInputChange: (field: string, value: string) => void;
  errors?: Record<string, { message?: string }>;
}

export function PersonalInformationForm({
  formData,
  onInputChange,
  errors = {},
}: PersonalInformationFormProps) {
  const fieldHasError = (field: string) => !!errors?.[field]?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Basic personal details of the employee
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              placeholder="Ayesha"
              className={fieldHasError("fullName") ? "border-red-500" : ""}
            />
            {fieldHasError("fullName") && (
              <p className="text-red-500 text-sm">{errors.fullName?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              placeholder="ayesha@example.com"
              className={fieldHasError("email") ? "border-red-500" : ""}
            />
            {fieldHasError("email") && (
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Phone Number *</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => onInputChange("contactNumber", e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={fieldHasError("contactNumber") ? "border-red-500" : ""}
            />
            {fieldHasError("contactNumber") && (
              <p className="text-red-500 text-sm">
                {errors.contactNumber?.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnic">CNIC *</Label>
            <Input
              id="cnic"
              value={formData.cnic}
              onChange={(e) => onInputChange("cnic", e.target.value)}
              placeholder="12345-1234567-1"
              className={fieldHasError("cnic") ? "border-red-500" : ""}
            />
            {fieldHasError("cnic") && (
              <p className="text-red-500 text-sm">{errors.cnic?.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => onInputChange("dob", e.target.value)}
              className={fieldHasError("dob") ? "border-red-500" : ""}
            />
            {fieldHasError("dob") && (
              <p className="text-red-500 text-sm">{errors.dob?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange("address", e.target.value)}
              placeholder="123 Main Street"
              className={fieldHasError("address") ? "border-red-500" : ""}
            />
            {fieldHasError("address") && (
              <p className="text-red-500 text-sm">{errors.address?.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

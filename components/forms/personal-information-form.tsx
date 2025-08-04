"use client";

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
    city: string;
    state: string;
    zipCode: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function PersonalInformationForm({
  formData,
  onInputChange,
}: PersonalInformationFormProps) {
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
              placeholder="Ayesha"
              onChange={(e) => onInputChange("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              placeholder="ayesha@example.com"
              onChange={(e) => onInputChange("email", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Phone Number *</Label>
            <Input
              id="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => onInputChange("contactNumber", e.target.value)}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnic">CNIC *</Label>
            <Input
              id="cnic"
              value={formData.cnic}
              onChange={(e) => onInputChange("cnic", e.target.value)}
              placeholder="12345-1234567-1"
              required
            />
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange("address", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

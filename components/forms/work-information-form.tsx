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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS = [
  "development",
  "design",
  "seo",
  "marketing",
  "content writing",
] as const;

const EMPLOYMENT_TYPES = [
  "permanent",
  "contract",
  "internship",
  "terminated",
  "probation",
] as const;

const TEAMS = [
  "Royal Executive Limo (REL)",
  "MTM",
  "XCEL HVAC",
  "Ankadiversify",
  "ADS",
  "Team C2",
];

type WorkInfoFormValues = {
  employeeId: string;
  department: string;
  position: string;
  reportingManager: string;
  startDate: string;
  employmentType: string;
  salary: string | number;
  team: string;
  probationEndDate: string;
};

interface WorkInformationFormProps {
  formData: WorkInfoFormValues;
  onInputChange: (field: string, value: string | number) => void;
  errors?: Record<string, { message?: string }>;
}

export function WorkInformationForm({
  formData,
  onInputChange,
  errors = {},
}: WorkInformationFormProps) {
  const fieldHasError = (field: string) => !!errors[field]?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Information</CardTitle>
        <CardDescription>
          Employment details and work-related information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department */}
          <div className="space-y-2">
            <Label>Department *</Label>
            <div
              className={
                fieldHasError("department") ? "border-red-500 rounded-md" : ""
              }
            >
              <Select
                onValueChange={(value) => onInputChange("department", value)}
                value={formData.department}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {fieldHasError("department") && (
              <p className="text-red-500 text-sm">
                {errors.department?.message}
              </p>
            )}
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => onInputChange("position", e.target.value)}
              placeholder="Software Engineer"
              className={fieldHasError("position") ? "border-red-500" : ""}
            />
            {fieldHasError("position") && (
              <p className="text-red-500 text-sm">{errors.position?.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reporting Manager */}
          <div className="space-y-2">
            <Label>Reporting Manager</Label>
            <Select
              onValueChange={(value) =>
                onInputChange("reportingManager", value)
              }
              value={formData.reportingManager}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {["ayesha-rashid", "shamiam", "areej", "waleed"].map(
                  (manager) => (
                    <SelectItem key={manager} value={manager}>
                      {manager
                        .replace("-", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label>Employment Type *</Label>
            <div
              className={
                fieldHasError("employmentType")
                  ? "border-red-500 rounded-md"
                  : ""
              }
            >
              <Select
                onValueChange={(value) =>
                  onInputChange("employmentType", value)
                }
                value={formData.employmentType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {fieldHasError("employmentType") && (
              <p className="text-red-500 text-sm">
                {errors.employmentType?.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Monthly Salary</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => onInputChange("salary", e.target.value)}
              placeholder="50000"
              className={fieldHasError("salary") ? "border-red-500" : ""}
            />
            {fieldHasError("salary") && (
              <p className="text-red-500 text-sm">{errors.salary?.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => onInputChange("startDate", e.target.value)}
              className={fieldHasError("startDate") ? "border-red-500" : ""}
            />
            {fieldHasError("startDate") && (
              <p className="text-red-500 text-sm">
                {errors.startDate?.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Probation End Date */}
          <div className="space-y-2">
            <Label htmlFor="probationEndDate">Probation End Date</Label>
            <Input
              id="probationEndDate"
              type="date"
              value={formData.probationEndDate}
              onChange={(e) =>
                onInputChange("probationEndDate", e.target.value)
              }
            />
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select
              onValueChange={(value) => onInputChange("team", value)}
              value={formData.team}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

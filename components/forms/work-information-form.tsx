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
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => onInputChange("department", e.target.value)}
              placeholder="Enter department (e.g., Development, Design, Marketing)"
              className={fieldHasError("department") ? "border-red-500" : ""}
            />
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
            <Label htmlFor="reportingManager">Reporting Manager</Label>
            <Input
              id="reportingManager"
              value={formData.reportingManager}
              onChange={(e) => onInputChange("reportingManager", e.target.value)}
              placeholder="Enter manager name"
              className={fieldHasError("reportingManager") ? "border-red-500" : ""}
            />
            {fieldHasError("reportingManager") && (
              <p className="text-red-500 text-sm">{errors.reportingManager?.message}</p>
            )}
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label>Employment Type *</Label>
            <Select
              onValueChange={(value) =>
                onInputChange("employmentType", value)
              }
              value={formData.employmentType}
            >
              <SelectTrigger className={`w-full ${fieldHasError("employmentType") ? "border-red-500" : ""}`}>
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
              className={fieldHasError("probationEndDate") ? "border-red-500" : ""}
            />
            {fieldHasError("probationEndDate") && (
              <p className="text-red-500 text-sm">{errors.probationEndDate?.message}</p>
            )}
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select
              onValueChange={(value) => onInputChange("team", value)}
              value={formData.team}
            >
              <SelectTrigger className={fieldHasError("team") ? "border-red-500" : ""}>
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
            {fieldHasError("team") && (
              <p className="text-red-500 text-sm">{errors.team?.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

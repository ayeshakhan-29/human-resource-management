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

// Define the allowed department and team values
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

interface WorkInformationFormProps {
  formData: {
    employeeId: string;
    department: string;
    position: string;
    reportingManager: string;
    startDate: string;
    employmentType: string;
    workLocation: string;
    salary: string | number;
    team: string;
    probationEndDate: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function WorkInformationForm({
  formData,
  onInputChange,
}: WorkInformationFormProps) {
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
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => onInputChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => onInputChange("position", e.target.value)}
              placeholder="Software Engineer"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportingManager">Reporting Manager</Label>
            <Select
              value={formData.reportingManager}
              onValueChange={(value) => {
                console.log("Selected reporting manager:", value);
                onInputChange("reportingManager", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ayesha-rashid">Ayesha Rashid</SelectItem>
                <SelectItem value="shamiam">Shamiam</SelectItem>
                <SelectItem value="areej">Areej</SelectItem>
                <SelectItem value="waleed">Waleed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type *</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => onInputChange("employmentType", value)}
            >
              <SelectTrigger>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary">Monthly Salary</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => onInputChange("salary", e.target.value)}
              placeholder="50000"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => onInputChange("startDate", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="probationEndDate">Probation End Date</Label>
            <Input
              id="probationEndDate"
              type="date"
              value={formData.probationEndDate}
              onChange={(e) =>
                onInputChange("probationEndDate", e.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select
              value={formData.team}
              onValueChange={(value) => onInputChange("team", value)}
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

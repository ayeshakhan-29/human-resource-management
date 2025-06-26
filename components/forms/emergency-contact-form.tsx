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

interface EmergencyContactFormProps {
  formData: {
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function EmergencyContactForm({
  formData,
  onInputChange,
}: EmergencyContactFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contact</CardTitle>
        <CardDescription>Contact person in case of emergency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Contact Name</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) =>
                onInputChange("emergencyContactName", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
            <Select
              value={formData.emergencyContactRelationship}
              onValueChange={(value) =>
                onInputChange("emergencyContactRelationship", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) =>
              onInputChange("emergencyContactPhone", e.target.value)
            }
            placeholder="+1 (555) 987-6543"
          />
        </div>
      </CardContent>
    </Card>
  );
}

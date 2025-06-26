"use client";

import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalInformationFormProps {
  formData: {
    notes: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function AdditionalInformationForm({
  formData,
  onInputChange,
}: AdditionalInformationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
        <CardDescription>Any additional notes or comments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange("notes", e.target.value)}
            placeholder="Any additional information about the employee..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

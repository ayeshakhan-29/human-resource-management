"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FormSuccessProps {
  employeeName: string;
  onAddAnother: () => void;
}

export function FormSuccess({ employeeName, onAddAnother }: FormSuccessProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Employee Added Successfully! They will receive login credentials
              via email.
            </h2>
            <p className="text-gray-600 mb-4">
              {employeeName} has been added to the system.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/employees">View All Employees</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onAddAnother}
              >
                Add Another Employee
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

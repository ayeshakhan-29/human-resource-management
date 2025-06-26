"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  onCancel?: () => void;
  cancelHref?: string;
}

export function FormActions({
  isLoading,
  onCancel,
  cancelHref = "/admin/employees",
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end space-x-4 pt-4">
      {onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      ) : (
        <Button type="button" variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Adding Employee...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </>
        )}
      </Button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getEmployeeBankDetails,
  updateEmployeeBankDetails,
  EmployeeBankInfo,
} from "@/lib/actions/employee.actions";
import { BankDetailsFormValues } from "@/lib/types/bank.types";
import { BankInformationForm } from "@/components/forms/bank-information-form";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export default function EmployeeBankInfoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<BankDetailsFormValues>({
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    branchCode: "",
    branchAddress: "",
  });

  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getEmployeeBankDetails(Number(user.id));
        if (data) {
          setFormData({
            bankName: data.bankName || "",
            accountTitle: data.accountTitle || "",
            accountNumber: data.accountNumber || "",
            iban: data.IBAN || "",
            branchCode: data.branchCode || "",
            branchAddress: data.branchAddress || "",
          });
        }
        console.log("Fetched bank details:", data);
      } catch (error) {
        console.error("Error fetching bank details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankDetails();
  }, [user?.id]);

  const handleSubmit = async (data: BankDetailsFormValues) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const isNewEntry = !formData.bankName;
    setIsLoading(true);

    try {
      let result;

      if (isNewEntry) {
        result = await EmployeeBankInfo(Number(user.id), data);
      } else {
        result = await updateEmployeeBankDetails(Number(user.id), data);
      }

      if (result.success) {
        toast.success(
          isNewEntry
            ? "Bank information saved successfully"
            : "Bank information updated successfully"
        );
        setFormData(data);
        router.refresh();
      } else {
        throw new Error(result.message || "Failed to save bank information");
      }
    } catch (error: any) {
      console.error("Error saving bank information:", error);
      toast.error(
        error.message || "An error occurred while saving bank information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Employee", href: "/employee" },
          { label: "Bank Information" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bank Account Information
            </h2>
            <p className="text-gray-600">
              Manage your banking details for salary payments
            </p>
          </div>
          <Badge variant="outline" className="ml-4">
            Required
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <BankInformationForm
                onSubmit={handleSubmit}
                defaultValues={formData}
                key={JSON.stringify(formData)}
              />
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Bank Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Your bank details are securely encrypted and will only be used
                  for salary processing.
                </p>
                <p className="mt-2">
                  Please ensure all information is accurate to avoid any payment
                  delays.
                </p>
                <p>
                  <strong>Verification:</strong> Please ensure all details are
                  accurate to avoid payment delays.
                </p>
                <p>
                  <strong>Processing Time:</strong> It may take 1-2 business
                  days to verify your bank details.
                </p>
                <p>
                  <strong>Updates:</strong> You can update your banking
                  information anytime from this page.
                </p>
                <p>
                  <strong>Support:</strong> Contact HR if you need assistance
                  with your banking details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

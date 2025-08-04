"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankInformationSchema } from "@/lib/validations/bank-information-schema";
import { BankDetailsFormValues } from "@/lib/types/bank.types";

const bankOptions = [
  { value: "hbl", label: "Habib Bank Limited (HBL)" },
  { value: "ubl", label: "United Bank Limited (UBL)" },
  { value: "mcb", label: "MCB Bank Limited" },
  { value: "abl", label: "Allied Bank Limited (ABL)" },
  { value: "nbp", label: "National Bank of Pakistan (NBP)" },
  { value: "bafl", label: "Bank Alfalah Limited" },
  { value: "jsbl", label: "JS Bank Limited" },
  { value: "faysal", label: "Faysal Bank Limited" },
  { value: "other", label: "Other" },
];

// Map bank abbreviations to their full names
const getBankName = (abbreviation: string): string => {
  const bank = bankOptions.find((bank) => bank.value === abbreviation);
  return bank ? bank.label : abbreviation; // Return the abbreviation if not found
};

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

interface BankInformationFormProps {
  onSubmit: (data: BankDetailsFormValues) => void;
  defaultValues?: Partial<BankDetailsFormValues>;
}

export function BankInformationForm({
  onSubmit: onSubmitProp,
  defaultValues = {},
}: BankInformationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankInformationSchema),
    mode: "onChange",
    defaultValues: {
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
      branchCode: "",
      branchAddress: "",
      ...defaultValues
    },
  });

  // Check if there are any changes in the form
  const hasChanges = isDirty;

  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onFormSubmit = handleSubmit((data) => {
    const formattedData = {
      ...data,
      IBAN: data.iban,
    };
    delete (formattedData as any).iban;

    onSubmitProp(formattedData as any);
  });

  const handleBankChange = async (value: string) => {
    setValue("bankName", value);
    await trigger("bankName");
  };

  return (
    <form onSubmit={onFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Bank Account Information</CardTitle>
          <CardDescription>Banking details for salary payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Select
                onValueChange={handleBankChange}
                value={
                  getBankName(watch("bankName")) === watch("bankName")
                    ? ""
                    : watch("bankName")
                }
              >
                <SelectTrigger
                  className={`w-full ${
                    errors.bankName ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select bank">
                    {getBankName(watch("bankName"))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankName && (
                <p className="text-red-500 text-sm">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountTitle">Account Title *</Label>
              <Input
                id="accountTitle"
                placeholder="Account holder name"
                {...register("accountTitle")}
                className={errors.accountTitle ? "border-red-500" : ""}
              />
              {errors.accountTitle && (
                <p className="text-red-500 text-sm">
                  {errors.accountTitle.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890123456"
                {...register("accountNumber")}
                className={errors.accountNumber ? "border-red-500" : ""}
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-sm">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                placeholder="PK36SCBL0000001123456702"
                {...register("iban")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                placeholder="1234"
                {...register("branchCode")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchAddress">Branch Address</Label>
              <Input
                id="branchAddress"
                placeholder="Branch location"
                {...register("branchAddress")}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!hasChanges}
              className={`px-4 py-2 rounded ${
                hasChanges 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasChanges ? 'Update' : 'Saved'}
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

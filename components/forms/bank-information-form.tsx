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

interface BankInformationFormProps {
  formData: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchCode: string;
    branchAddress: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function BankInformationForm({
  formData,
  onInputChange,
}: BankInformationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Information</CardTitle>
        <CardDescription>Banking details for salary payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Select
              value={formData.bankName}
              onValueChange={(value) => onInputChange("bankName", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hbl">Habib Bank Limited (HBL)</SelectItem>
                <SelectItem value="ubl">United Bank Limited (UBL)</SelectItem>
                <SelectItem value="mcb">MCB Bank Limited</SelectItem>
                <SelectItem value="abl">Allied Bank Limited (ABL)</SelectItem>
                <SelectItem value="nbl">National Bank of Pakistan</SelectItem>
                <SelectItem value="bafl">Bank Alfalah Limited</SelectItem>
                <SelectItem value="jsbl">JS Bank Limited</SelectItem>
                <SelectItem value="faysal">Faysal Bank Limited</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountTitle">Account Title *</Label>
            <Input
              id="accountTitle"
              value={formData.accountTitle}
              onChange={(e) => onInputChange("accountTitle", e.target.value)}
              placeholder="Account holder name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => onInputChange("accountNumber", e.target.value)}
              placeholder="1234567890123456"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={formData.iban}
              onChange={(e) => onInputChange("iban", e.target.value)}
              placeholder="PK36SCBL0000001123456702"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branchCode">Branch Code</Label>
            <Input
              id="branchCode"
              value={formData.branchCode}
              onChange={(e) => onInputChange("branchCode", e.target.value)}
              placeholder="1234"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchAddress">Branch Address</Label>
            <Input
              id="branchAddress"
              value={formData.branchAddress}
              onChange={(e) => onInputChange("branchAddress", e.target.value)}
              placeholder="Branch location"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

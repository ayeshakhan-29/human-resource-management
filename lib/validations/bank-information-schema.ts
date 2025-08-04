// lib/validations/bank-information-schema.ts
import { z } from "zod";
import { BankDetailsFormValues } from "@/lib/types/bank.types";

// Create a schema that matches BankDetailsFormValues
export const bankInformationSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountTitle: z.string().min(1, "Account title is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  iban: z.string().min(1, "IBAN is required"),
  branchCode: z.string().optional(),
  branchAddress: z.string().optional(),
}) satisfies z.ZodType<BankDetailsFormValues>;

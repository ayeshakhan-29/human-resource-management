// lib/validations/bank-information-schema.ts
import { z } from "zod";

export const bankInformationSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountTitle: z.string().min(1, "Account title is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  iban: z.string().optional(),
  branchCode: z.string().optional(),
  branchAddress: z.string().optional(),
});

export type BankInformationFormValues = z.infer<typeof bankInformationSchema>;

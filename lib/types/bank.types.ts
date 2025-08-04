export interface UpdateBankDetailsResponse {
  success: boolean;
  message: string;
  data: BankDetails;
}

export interface BankDetails {
  id: number;
  userId: number;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  IBAN: string;
  branchCode: string;
  branchAddress: string;
  createdAt: string;
  updatedAt: string;
}

// Make all fields optional for form handling
export interface BankDetailsFormValues {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchCode?: string;
  branchAddress?: string;
}

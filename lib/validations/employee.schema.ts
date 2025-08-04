import { z } from "zod";

// Helper function to check if date is not in the future
const isNotFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part to ensure we only compare dates
  return date <= today;
};

// Personal Information Schema
export const personalInformationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  cnic: z
    .string()
    .min(1, "CNIC is required")
    .refine(
      async (val) => {
        return true;
      },
      {
        message:
          "This CNIC is already registered. Please use a different CNIC.",
      }
    ),
  dob: z
    .string()
    .refine((val) => !val || isNotFutureDate(val), {
      message: "Date of birth cannot be in the future",
    })
    .optional(),
  address: z.string().optional(),
});

export type PersonalInformationFormValues = z.infer<
  typeof personalInformationSchema
>;

// Work Information Schema
export const workInformationSchema = z.object({
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  reportingManager: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  salary: z
    .union([
      z.string().min(1, "Salary is required").transform(Number),
      z.number().min(0, "Salary must be a positive number"),
    ])
    .refine((val) => !isNaN(val), {
      message: "Salary must be a valid number",
    }),
  team: z.string().optional(),
  probationEndDate: z.string().optional(),
});

export type WorkInformationFormValues = z.infer<typeof workInformationSchema>;

// Combined Schema
export const employeeFormSchema = personalInformationSchema.merge(
  workInformationSchema
);
export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

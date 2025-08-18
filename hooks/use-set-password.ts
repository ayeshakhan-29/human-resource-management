import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setPasswordAction } from "@/lib/actions/auth.actions";
import { SetPasswordFormValues } from "@/lib/validations/set-password-schema";

export function useSetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSetPassword = async (data: SetPasswordFormValues & { token: string }) => {
    setIsLoading(true);
    try {
      const result = await setPasswordAction(data);
      
      if ("error" in result) {
        throw new Error(result.message || "Failed to set password");
      }

      toast.success("Password set successfully! Redirecting to login...");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
      return { success: true };
    } catch (error) {
      console.error("Set password error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to set password. Please try again."
      );
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSetPassword, isLoading };
}

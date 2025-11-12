"use client";

import { toast as sonnerToast } from "sonner";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const toast = (opts: ToastInput) => {
    const { title, description, variant = "default" } = opts || {};
    const message = description ?? title ?? "";

    if (variant === "destructive") {
      sonnerToast.error(message);
    } else {
      sonnerToast(message);
    }
  };

  const success = (message: string) => sonnerToast.success(message);
  const error = (message: string) => sonnerToast.error(message);
  const info = (message: string) => sonnerToast.message(message);
  const dismiss = (id?: string | number) => sonnerToast.dismiss(id as any);

  return { toast, success, error, info, dismiss };
}
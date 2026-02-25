"use client";

import { LucideIcon } from "lucide-react";

interface EmptyPayrollStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function EmptyPayrollState({
    icon: Icon,
    title,
    description,
}: EmptyPayrollStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
            <Icon className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">{title}</p>
            <p className="text-sm">{description}</p>
        </div>
    );
}

"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PayrollStatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    iconColor?: string;
}

export function PayrollStatsCard({
    title,
    value,
    description,
    icon: Icon,
    iconColor = "text-blue-600",
}: PayrollStatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-xl sm:text-2xl font-bold truncate">{value}</div>
                {description && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

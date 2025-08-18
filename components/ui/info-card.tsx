import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function InfoCard({
  title,
  description,
  children,
  icon: Icon,
  className,
}: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

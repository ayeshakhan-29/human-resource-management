"use client";

import { Calendar, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PayrollPeriod } from "@/lib/types/payroll.types";

interface PayrollPeriodCardProps {
    period: PayrollPeriod;
    href: string;
    onDelete?: (id: number) => void;
}

export function PayrollPeriodCard({ period, href, onDelete }: PayrollPeriodCardProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="secondary">Draft</Badge>;
            case "reviewed":
                return (
                    <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
                        Reviewed
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                        Approved
                    </Badge>
                );
            case "paid":
                return <Badge variant="default" className="bg-green-600">Paid</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="group relative">
            <Link href={href} className="block transition-all">
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{period.name}</h3>
                                {getStatusBadge(period.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {new Date(period.start_date).toLocaleDateString()} -{" "}
                                {new Date(period.end_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                        <div className="hidden md:block">
                            <p className="text-muted-foreground">Created By</p>
                            <p className="font-medium">{period.creator?.fullName || "Admin"}</p>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium capitalize">{period.payroll_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDelete(period.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group-hover:translate-x-1 transition-transform"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

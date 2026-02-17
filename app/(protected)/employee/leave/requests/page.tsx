import { LeaveHistoryTable } from "@/components/leave/leave-history-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MyLeavesPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Leave Requests</h1>
                    <p className="text-gray-500">View and track your leave application status.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:scale-105 w-full sm:w-auto">
                    <Link href="/employee/leave/apply" className="flex items-center justify-center gap-2">
                        <Plus className="size-4" /> Apply for Leave
                    </Link>
                </Button>
            </div>
            <div className="grid gap-8">
                <LeaveHistoryTable />
            </div>
        </div>
    );
}

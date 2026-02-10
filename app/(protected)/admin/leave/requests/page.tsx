import { AdminLeaveRequests } from "@/components/leave/admin-leave-requests";
import { TodayLeaves } from "@/components/leave/today-leaves";

export default function AdminLeaveRequestsPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Leave Management</h1>
                <p className="text-gray-500 max-w-2xl">
                    Manage all employee leave requests and see who&apos;s out of office today.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <AdminLeaveRequests />
                </div>
                <div className="lg:col-span-4 sticky top-6">
                    <TodayLeaves />
                </div>
            </div>
        </div>
    );
}

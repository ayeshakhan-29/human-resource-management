import { ApplyLeaveForm } from "@/components/leave/apply-leave-form";
import { Header } from "@/components/header";

export default function ApplyLeavePage() {
    return (
        <>
            <Header
                breadcrumbs={[
                    { label: "Employee", href: "/employee/dashboard" },
                    { label: "Leave Management", href: "/employee/leave/requests" },
                    { label: "Apply for Leave" },
                ]}
            />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Application</h1>
                    <p className="text-gray-500">Submit a new request for time off.</p>
                </div>
                <ApplyLeaveForm />
            </div>
        </>
    );
}

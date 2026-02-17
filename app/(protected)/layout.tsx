"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user or token exists in localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!user && !token) {
            router.push("/login");
        } else {
            setLoading(false);
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-lg text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

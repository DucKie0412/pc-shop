"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/auth/login");
            return;
        }

        if (!allowedRoles.includes(session.user.role)) {
            router.push("/admin/dashboard");
            return;
        }
    }, [session, status, allowedRoles, router]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Đang tải...</span>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    if (!allowedRoles.includes(session.user.role)) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
                    <p className="text-gray-600 mb-4">
                        Bạn không có quyền truy cập trang này.
                    </p>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                        Quay về Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 
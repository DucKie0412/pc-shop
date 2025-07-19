"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";
import { RoleGuard } from "@/components/auth/role-guard";

function UsersPageContent() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await sendRequest<IBackendRes<IUser[]>>({
                    method: "GET",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
                    headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
                    nextOption: { cache: "no-store" }
                });

                setUsers(res.data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (session) {
            fetchUsers();
        }
    }, [session]);

    const filteredUsers = users.filter(user =>
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!session) {
        return <div className="container mx-auto py-10">Vui lòng đăng nhập để xem danh sách người dùng.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Người dùng</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Nhập tên hoặc email cần tìm kiếm..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-4 text-center">Đang tải dữ liệu...</div>
                    ) : (
                        <DataTable columns={columns} data={filteredUsers} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UsersPage() {
    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <UsersPageContent />
        </RoleGuard>
    );
}

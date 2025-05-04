"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";

export default function UsersPage() {
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
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!session) {
        return <div className="container mx-auto py-10">Please sign in to view users.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Users</h1>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        <Link href="/admin/users/create">Add User</Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search user by name..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        <DataTable columns={columns} data={filteredUsers} />
                    )}
                </div>
            </div>
        </div>
    );
}

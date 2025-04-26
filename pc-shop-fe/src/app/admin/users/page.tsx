import { auth } from "@/auth";
import { DataTable } from "@/components/ui/data-table";
import { sendRequest } from "@/utils/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IUser } from "@/types/next-auth";


async function getUsers(): Promise<IUser[]> {
    const session = await auth();
    try {
        const res = await sendRequest<IBackendRes<IUser[]>>({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
            nextOption: { cache: "no-store" }
        });

        return res.data || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Users</h1>
                    <Button asChild>
                        <Link href="/admin/users/create">Add User</Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search users..."
                        className="max-w-sm"
                    />
                </div>
                <div className="rounded-md border">
                    <DataTable columns={columns} data={users} />
                </div>
            </div>
        </div>
    );
}

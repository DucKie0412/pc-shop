"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/next-auth";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export const Columns: ColumnDef<IUser>[] = [
    {
        header: "ID",
        accessorKey: "_id",
        enableSorting: false,
        size: 50,
    },
    {
        header: ({ column }) => (
            <div
                onClick={column.getToggleSortingHandler()}
                className="cursor-pointer flex items-center gap-1"
            >
                Name
                {column.getCanSort() && (
                    <span>
                        {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : "↕"}
                    </span>
                )}
            </div>
        ),
        accessorKey: "name",
        enableResizing: true,

        size: 100,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => (
            <div
                onClick={column.getToggleSortingHandler()}
                className="cursor-pointer flex items-center gap-1"
            >
                Email
                {column.getCanSort() && (
                    <span>
                        {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : "↕"}
                    </span>
                )}
            </div>
        ), accessorKey: "email",
        size: 120,
        enableResizing: true,

        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Phone",
        accessorKey: "phone",
        enableSorting: false,
        size: 110,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Address",
        accessorKey: "address",
        enableSorting: false,
        size: 150,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => (
            <div
                onClick={column.getToggleSortingHandler()}
                className="cursor-pointer flex items-center gap-1"
            >
                Active Status
                {column.getCanSort() && (
                    <span>
                        {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : "↕"}
                    </span>
                )}
            </div>
        ), accessorKey: "isActive",
        enableSorting: true,
        size: 50,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return <Badge className={isActive ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                : "border-transparent bg-rose-500 text-primary-foreground shadow hover:bg-rose-500/80"}>
                {isActive ? "Active" : "Inactive"}
            </Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            const router = useRouter()
            const session = useSession();

            async function handleDelete() {
                const res = await sendRequest<IBackendRes<any>>({
                    method: "DELETE",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/users/${user._id}`,
                    headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
                });
                console.log("User deleted:", res);
                if (res?.statusCode === 200) {
                    toast.success("User deleted successfully!", { autoClose: 2300 });
                    router.refresh();
                }

                if (res?.statusCode === 400) {
                    toast.warning("Server error!", { autoClose: 2000 });
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(user._id)}
                        >
                            Copy user ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            router.push(`/admin/users/edit/${user._id}`)
                        }}>Edit user</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete}>Delete user</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
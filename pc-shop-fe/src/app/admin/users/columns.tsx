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
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export const columns: ColumnDef<IUser>[] = [
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
        ),
        accessorKey: "email",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Phone",
        accessorKey: "phone",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Address",
        accessorKey: "address",
        size: 120,
        enableResizing: true,
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
        ),
        accessorKey: "isActive",
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
                        <DeleteConfirmationModal
                            title="Are you sure?"
                            description="This action cannot be undone. This will permanently delete the user account for"
                            itemName={`${user.name} (${user.email})`}
                            itemId={user._id}
                            apiEndpoint="/users"
                            successMessage="User deleted successfully!"
                            errorMessage="An error occurred while deleting the user"
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Delete user
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
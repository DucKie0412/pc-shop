"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export type User = {
    id: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    isActive: boolean
}

export const Columns: ColumnDef<User>[] = [
    {
        header: "ID",
        accessorKey: "id",
    },
    {
        header: "Name",
        accessorKey: "name",
    },
    {
        header: "Email",
        accessorKey: "email",
    },
    {
        header: "Phone",
        accessorKey: "phone",
    },
    {
        header: "Address",
        accessorKey: "address",
    },
    {
        header: "Active Status",
        accessorKey: "isActive",
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
                            onClick={() => navigator.clipboard.writeText(user.id)}
                        >
                            Copy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
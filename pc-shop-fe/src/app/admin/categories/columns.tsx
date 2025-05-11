"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ICategory } from "@/types/category";
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
import { SortableHeader } from "@/components/ui/sortable-header";
import Image from "next/image";

export const columns = (refreshTable: () => void): ColumnDef<ICategory>[] => [
    {
        header: "ID",
        accessorKey: "_id",
        enableSorting: false,
        size: 50,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        accessorKey: "name",
        enableResizing: true,
        size: 100,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Description" />,
        accessorKey: "description",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const category = row.original
            const router = useRouter()
            const session = useSession();

            async function handleDelete() {
                const res = await sendRequest<IBackendRes<any>>({
                    method: "DELETE",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/categories/${category._id}`,
                    headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
                });
                if (res?.statusCode === 200) {
                    toast.success("Category deleted successfully!", { autoClose: 2300 });
                    refreshTable();
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
                            onClick={() => navigator.clipboard.writeText(category._id)}
                        >
                            Copy category ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            router.push(`/admin/categories/${category._id}/edit`)
                        }}>Edit category</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete}>Delete category</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
] 
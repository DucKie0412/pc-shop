"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IManufacturer } from "@/types/manufacturer";
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
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export const columns: ColumnDef<IManufacturer>[] = [
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
        header: ({ column }) => <SortableHeader column={column} title="Website" />,
        accessorKey: "website",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Logo" />,
        accessorKey: "logo",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const manufacturer = row.original;
            return (
                <div className="flex justify-center">
                    {manufacturer.logo ? (
                        <Image 
                            src={manufacturer.logo} 
                            alt={manufacturer.name} 
                            width={100} 
                            height={100}
                            className="rounded-md object-cover"
                        />
                    ) : null}
                </div>
            );
        },
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Type" />,
        accessorKey: "type",
        size: 100,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const manufacturer = row.original
            const router = useRouter()
            const session = useSession();

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
                            onClick={() => navigator.clipboard.writeText(manufacturer._id)}
                        >
                            Copy manufacturer ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            router.push(`/admin/manufacturers/${manufacturer._id}/edit`)
                        }}>Edit manufacturer</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteConfirmationModal
                            title="Are you sure?"
                            description="This action cannot be undone. This will permanently delete the manufacturer:"
                            itemName={manufacturer.name}
                            itemId={manufacturer._id}
                            apiEndpoint="/manufacturers"
                            successMessage="Manufacturer deleted successfully!"
                            errorMessage="An error occurred while deleting the manufacturer"
                            onSuccess={() => router.refresh()}
                            trigger={
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    Delete manufacturer
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
] 
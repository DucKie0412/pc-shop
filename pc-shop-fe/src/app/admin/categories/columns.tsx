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
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export const columns = (refreshTable: () => void): ColumnDef<ICategory>[] => [
    {
        header: "ID",
        accessorKey: "_id",
        enableSorting: false,
        size: 50,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Tên danh mục" />,
        accessorKey: "name",
        enableResizing: true,
        size: 100,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Mô tả" />,
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

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(category._id)}
                        >
                            Sao chép ID danh mục
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            router.push(`/admin/categories/${category._id}/edit`)
                        }}>Sửa danh mục</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteConfirmationModal
                            title="Bạn có chắc chắn?"
                            description="Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn danh mục:"
                            itemName={category.name}
                            itemId={category._id}
                            apiEndpoint="/categories"
                            successMessage="Danh mục đã được xóa thành công!"
                            errorMessage="Đã xảy ra lỗi khi xóa danh mục"
                            onSuccess={refreshTable}
                            trigger={
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    Xóa danh mục
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
] 
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/types/product";
import { formatCurrency } from "@/utils/format-currency";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { SortableHeader } from "@/components/ui/sortable-header";

export const columns = (refreshProducts?: () => void): ColumnDef<IProduct>[] => [
    {
        header: "ID",
        accessorKey: "_id",
        enableSorting: false,
        size: 50,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Tên sản phẩm" />,
        accessorKey: "name",
        enableResizing: true,
        size: 100,
        minSize: 50,
        maxSize: 200,
    },
    {
        accessorKey: "categoryId",
        header: "Danh mục",
        cell: ({ row }) => {
            const category = row.original.categoryId;
            return category && typeof category === 'object' ? category.name : 'N/A';
        },
    },
    {
        accessorKey: "manufacturerId",
        header: "Nhà sản xuất",
        cell: ({ row }) => {
            const manufacturer = row.original.manufacturerId;
            return manufacturer && typeof manufacturer === 'object' ? manufacturer.name : 'N/A';
        },
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Tồn kho" />,
        accessorKey: "stock",
        size: 80,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Đã bán" />,
        accessorKey: "soldCount",
        size: 80,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Giá gốc" />,
        accessorKey: "originalPrice",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const price = row.original.originalPrice;
            return formatCurrency(price);
        },
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Chiết khấu" />,
        accessorKey: "discount",
        size: 100,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const discount = row.original.discount;
            return `${discount}%`;
        },
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Giá cuối" />,
        accessorKey: "finalPrice",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const price = row.original.finalPrice;
            return formatCurrency(price);
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            const router = useRouter();

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
                            onClick={() => navigator.clipboard.writeText(product._id)}
                        >
                            Sao chép ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push(`/admin/products/${product.slug}/edit`)}
                        >
                            Sửa sản phẩm
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteConfirmationModal
                            title="Xác nhận xóa"
                            description="Hành động này không thể được khôi phục. Bạn chắc chắn muốn xóa sản phẩm"
                            itemName={product.name}
                            itemId={product.slug}
                            apiEndpoint="/products"
                            successMessage="Xóa thành công!"
                            errorMessage="Có lỗi xảy ra khi xóa"
                            onSuccess={refreshProducts}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Xóa sản phẩm
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

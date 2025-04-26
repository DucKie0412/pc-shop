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
import { toast } from "react-toastify";
import { sendRequest } from "@/utils/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSession } from "next-auth/react";
import { SortableHeader } from "@/components/ui/sortable-header";

export const columns: ColumnDef<IProduct>[] = [
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
        accessorKey: "categoryId",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.categoryId;
            return category && typeof category === 'object' ? category.name : 'N/A';
        },
    },
    {
        accessorKey: "manufacturerId",
        header: "Manufacturer",
        cell: ({ row }) => {
            const manufacturer = row.original.manufacturerId;
            return manufacturer && typeof manufacturer === 'object' ? manufacturer.name : 'N/A';
        },
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Stock" />,
        accessorKey: "stock",
        size: 80,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: ({ column }) => <SortableHeader column={column} title="Original Price" />,
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
        header: ({ column }) => <SortableHeader column={column} title="Discount" />,
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
        header: ({ column }) => <SortableHeader column={column} title="Final Price" />,
        accessorKey: "price",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const price = row.original.price;
            return formatCurrency(price);
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            const router = useRouter();
            const session = useSession();

            const handleDelete = async () => {
                try {
                    const res = await sendRequest<IBackendRes<any>>({
                        method: "DELETE",
                        url: `${process.env.NEXT_PUBLIC_API_URL}/products/${product.slug}`,
                        headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
                    });
                    if (res?.statusCode === 200) {
                        toast.success("Product deleted successfully!", { autoClose: 2300 });
                        router.refresh();
                    }

                    if (res?.statusCode === 400) {
                        toast.warning("Server error!", { autoClose: 2000 });
                    }
                } catch (error) {
                    toast.error("Failed to delete product");
                }
            };

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
                            onClick={() => navigator.clipboard.writeText(product._id)}
                        >
                            Copy product ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push(`/admin/products/${product.slug}/edit`)}
                        >
                            Edit product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleDelete}
                        >
                            Delete product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

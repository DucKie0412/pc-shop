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
import { sendRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

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
                Tên
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
        header: "Số điện thoại",
        accessorKey: "phone",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Địa chỉ",
        accessorKey: "address",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Điểm",
        accessorKey: "points",
        size: 120,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
    },
    {
        header: "Vai trò",
        accessorKey: "role",
        size: 100,
        enableResizing: true,
        minSize: 50,
        maxSize: 200,
        cell: ({ row }) => {
            const role = row.original.role;
            return <Badge className={role === 'ADMIN' ? "border-transparent bg-red-500 text-primary-foreground shadow hover:bg-red-500/80"
                : role === 'STAFF' ? "border-transparent bg-blue-500 text-primary-foreground shadow hover:bg-blue-500/80"
                : "border-transparent bg-gray-500 text-primary-foreground shadow hover:bg-gray-500/80"}>
                {role === 'ADMIN' ? 'Quản trị viên' : role === 'STAFF' ? 'Nhân viên' : 'Người dùng'}
            </Badge>
        },
    },
    {
        header: ({ column }) => (
            <div
                onClick={column.getToggleSortingHandler()}
                className="cursor-pointer flex items-center gap-1"
            >
                Trạng thái kích hoạt
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
                {isActive ? "Đã kích hoạt" : "Chưa kích hoạt"}
            </Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            const router = useRouter()
            const { data: session } = useSession();

            const handleToggleRole = async () => {
                try {
                    const res = await sendRequest<any>({
                        method: "PATCH",
                        url: `${process.env.NEXT_PUBLIC_API_URL}/users/toggle-role/${user._id}`,
                        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
                    });
                    
                    if (res?.statusCode === 200) {
                        toast.success(res.message);
                        // Refresh the page to update the data
                        window.location.reload();
                    } else {
                        toast.error(res?.error || "Có lỗi xảy ra khi thay đổi vai trò");
                    }
                } catch (error) {
                    toast.error("Có lỗi xảy ra khi thay đổi vai trò");
                }
            };

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
                            onClick={() => navigator.clipboard.writeText(user._id)}
                        >
                            Sao chép ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            router.push(`/admin/users/edit/${user._id}`)
                        }}>Sửa người dùng</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.role !== 'ADMIN' && (
                            <>
                                <DropdownMenuItem onClick={handleToggleRole}>
                                    {user.role === 'STAFF' ? 'Chuyển về người dùng' : 'Chọn làm nhân viên'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DeleteConfirmationModal
                            title="Xác nhận xóa"
                            description="Hành động này không thể được khôi phục. Bạn muốn xóa bỏ người dùng"
                            itemName={`${user.name} (${user.email})`}
                            itemId={user._id}
                            apiEndpoint="/users"
                            successMessage="Xóa người dùng thành công!"
                            errorMessage="Có lỗi xảy ra khi xóa"
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Xóa người dùng
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
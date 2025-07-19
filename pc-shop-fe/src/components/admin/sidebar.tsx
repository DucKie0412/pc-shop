"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    Home,
    Users,
    ShoppingBag,
    Settings,
    ArrowLeftCircle,
    Package,
    Building2,
    Tag,
    SquareArrowLeft
} from "lucide-react";

const adminMenuItems = [
    {
        title: "Tổng quan",
        href: "/admin/dashboard",
        icon: Home,
        roles: ["ADMIN", "STAFF"]
    },
    {
        title: "Người dùng",
        href: "/admin/users",
        icon: Users,
        roles: ["ADMIN"] // Chỉ ADMIN mới có thể quản lý người dùng
    },
    {
        title: "Sản phẩm",
        href: "/admin/products",
        icon: ShoppingBag,
        roles: ["ADMIN", "STAFF"]
    },
    {
        title: "Danh mục",
        href: "/admin/categories",
        icon: Tag,
        roles: ["ADMIN", "STAFF"]
    },
    {
        title: "Nhà sản xuất",
        href: "/admin/manufacturers",
        icon: Building2,
        roles: ["ADMIN", "STAFF"]
    },
    {
        title: "Đơn hàng",
        href: "/admin/orders",
        icon: Package,
        roles: ["ADMIN", "STAFF"]
    },
    {
        title: "Hoàn tiền",
        href: "/admin/refund",
        icon: SquareArrowLeft,
        roles: ["ADMIN"] // Chỉ ADMIN mới có thể quản lý hoàn tiền
    },
    {
        title: "Banners",
        href: "/admin/banners",
        icon: Settings,
        roles: ["ADMIN", "STAFF"]
    },
    {   
        title: "Quay về trang chính",
        href: "/",
        icon: ArrowLeftCircle,
        roles: ["ADMIN", "STAFF"]
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = session?.user?.role || "USER";

    // Lọc menu items dựa trên role của user
    const filteredMenuItems = adminMenuItems.filter(item => 
        item.roles.includes(userRole)
    );

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
            <div className="flex h-16 items-center border-b px-4">
                <h1 className="text-xl font-semibold">
                    {userRole === "ADMIN" ? "Admin Panel" : "Staff Panel"}
                </h1>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {filteredMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 
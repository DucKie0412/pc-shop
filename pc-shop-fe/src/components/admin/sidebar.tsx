"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const menuItems = [
    {
        title: "Tổng quan",
        href: "/admin/dashboard",
        icon: Home,
    },
    {
        title: "Người dùng",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Sản phẩm",
        href: "/admin/products",
        icon: ShoppingBag,
    },
    {
        title: "Danh mục",
        href: "/admin/categories",
        icon: Tag,
    },
    {
        title: "Nhà sản xuất",
        href: "/admin/manufacturers",
        icon: Building2,
    },
    {
        title: "Đơn hàng",
        href: "/admin/orders",
        icon: Package,
    },
    {
        title: "Hoàn tiền",
        href: "/admin/refund",
        icon: SquareArrowLeft
    },
    {
        title: "Banners",
        href: "/admin/banners",
        icon: Settings,
    },
    {   
        title: "Quay về trang chính",
        href: "/",
        icon: ArrowLeftCircle,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
            <div className="flex h-16 items-center border-b px-4">
                <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
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
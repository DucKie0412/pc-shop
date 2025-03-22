"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Home, User, ShoppingBag, Search, Settings } from "lucide-react"


const items = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
    },
    {
        title: "User",
        url: "/admin/users",
        icon: User,
    },
    {
        title: "Product",
        url: "/admin/products",
        icon: ShoppingBag,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" side="left">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Welcome
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

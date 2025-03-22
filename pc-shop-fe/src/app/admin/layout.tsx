import { cookies } from "next/headers"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AdminSidebar />
            <main className="flex-1 mx-10">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}

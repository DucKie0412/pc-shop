import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import AdminHeader from "@/components/header/admin-header";
import AdminFooter from "@/components/footer/admin-footer";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1">{children}</main>
            </div>
            <AdminFooter />
        </div>
    );
}

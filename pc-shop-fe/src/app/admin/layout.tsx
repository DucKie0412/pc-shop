import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";

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
        <div className="flex">
            <Sidebar />
            <main className="flex-1">{children}</main>
        </div>
    );
}

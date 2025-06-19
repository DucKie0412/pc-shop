"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ManufacturerForm } from "../../manufacturer-form";
import { sendRequest } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

export default function EditManufacturerPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [manufacturer, setManufacturer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchManufacturer() {
            try {
                setLoading(true);
                const res = await sendRequest<IBackendRes<any>>({
                    method: "GET",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/manufacturers/${id}`,
                    headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
                    nextOption: { cache: "no-store" }
                });
                if (res?.data) {
                    setManufacturer(res.data);
                } else {
                    toast.error("Manufacturer not found");
                    router.push("/admin/manufacturers");
                }
            } catch (error) {
                toast.error("Error fetching manufacturer");
                router.push("/admin/manufacturers");
            } finally {
                setLoading(false);
            }
        }
        if (id && session?.user?.accessToken) fetchManufacturer();
    }, [id, session, router]);

    if (loading) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (!manufacturer) {
        return null;
    }

    return (
        <div className="container mx-auto py-10">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/manufacturers")}
                className="h-8 w-8"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold mb-6">Edit Manufacturer</h1>
            <ManufacturerForm initialData={manufacturer} />
        </div>
    );
} 
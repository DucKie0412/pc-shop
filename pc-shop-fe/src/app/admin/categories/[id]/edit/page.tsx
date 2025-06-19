"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryForm } from "../../category-form";
import { sendRequest } from "@/utils/api";
import { ICategory } from "@/types/category";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditCategoryPage() {
    const { id } = useParams();
    const router = useRouter();
    const session = useSession();
    const [category, setCategory] = useState<ICategory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategory() {
            try {
                setLoading(true);
                const res = await sendRequest<IBackendRes<ICategory>>({
                    method: "GET",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
                    headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
                    nextOption: { cache: "no-store" }
                });
                if (res?.data) {
                    setCategory(res.data);
                } else {
                    toast.error("Category not found");
                    router.push("/admin/categories");
                }
            } catch (error) {
                toast.error("Error fetching category");
                router.push("/admin/categories");
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchCategory();
    }, [id, router]);

    if (loading) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (!category) {
        return null;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-2 mb-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/admin/categories")}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="font-bold">Edit Category</h1>
            </div>
            <CategoryForm initialData={category} />
        </div>
    );
} 
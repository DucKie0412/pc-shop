"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IProduct } from "@/types/product";
import { ProductForm } from "@/app/admin/products/product-form"
import { toast } from "react-toastify";

export default function EditProductPage() {
    const { slug } = useParams();
    const session = useSession();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (session.status !== "authenticated") return;
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const result = await sendRequest<IBackendRes<IProduct>>({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session.data?.user.accessToken}`
                    },
                });

                if (result?.data) {
                    setProduct(result.data);
                } else {
                    toast.error("Product not found");
                    router.push("/admin/products");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product");
                router.push("/admin/products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [slug, session.status, session.data, router]);

    if (session.status === "loading" || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (!session.data) {
        return <div className="container mx-auto py-10">Please sign in to edit products.</div>;
    }

    if (!product) {
        return null;
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm initialData={product} />
                </CardContent>
            </Card>
        </div>
    );
} 
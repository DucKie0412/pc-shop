"use client";

import { columns } from "./columns";
import { IProduct } from "@/types/product";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { sendRequest } from "@/utils/api";

interface IBackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchProducts() {
            try {
                setIsLoading(true);
                const result = await sendRequest<IBackendResponse<IProduct[]>>({
                    url: '/api/products',
                    method: 'GET',
                });
                
                console.log('API Response:', result);
                
                if (result?.data) {
                    setProducts(result.data);
                }

                console.log('Products state:', products);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false);
            }
        }
        if (session) {
            fetchProducts();
        }
    }, [session]);

    if (!session) {
        return <div className="container mx-auto py-10">Please sign in to view products.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Products</h1>
                    <Button asChild>
                        <Link href="/admin/products/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search products by name..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        <DataTable columns={columns} data={products} />
                    )}
                </div>
            </div>
        </div>
    );
}
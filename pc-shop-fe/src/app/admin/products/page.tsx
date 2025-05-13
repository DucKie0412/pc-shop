"use client";

import { columns } from "./columns";
import { IProduct } from "@/types/product";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { sendRequest } from "@/utils/api";
import { ICategory } from "@/types/category";

interface IBackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await sendRequest<IBackendResponse<IProduct[]>>({
                url: '/api/products',
                method: 'GET',
            });
            if (result?.data) {
                setProducts(result.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) {
            fetchProducts();
        }
    }, [session, fetchProducts]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await sendRequest<IBackendResponse<ICategory[]>>({
                    url: '/api/categories',
                    method: 'GET',
                });
                setCategories(res?.data || []);
            } catch (err) {
                setCategories([]);
            }
        }
        fetchCategories();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.categoryId?._id === selectedCategory;
        const matchesSearch = product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
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
                <div className="flex gap-2 mb-4">
                    <button
                        className={`px-3 py-1 rounded ${selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => setSelectedCategory("all")}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            className={`px-3 py-1 rounded ${selectedCategory === cat._id ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                            onClick={() => setSelectedCategory(cat._id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        <DataTable columns={columns(fetchProducts)} data={filteredProducts} />
                    )}
                </div>
            </div>
        </div>
    );
}
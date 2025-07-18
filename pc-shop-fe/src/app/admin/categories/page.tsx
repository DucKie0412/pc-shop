"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();

            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            setCategories(data.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {          
        if (session) {
            fetchCategories();
        }
    }, [session]);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!session) {
        return <div className="container mx-auto py-10">Vui lòng đăng nhập để xem danh mục.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Danh mục</h1>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        <Link href="/admin/categories/create">Thêm danh mục</Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Tìm kiếm danh mục theo tên..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-4 text-center">Đang tải...</div>
                    ) : (
                        <DataTable columns={columns(fetchCategories)} data={filteredCategories} />
                    )}
                </div>
            </div>
        </div>
    );
} 
"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

interface Manufacturer {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
}

export default function ManufacturersPage() {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchManufacturers() {
            try {
                const response = await fetch('/api/manufacturers');
                const data = await response.json();

                if (data.error) {
                    console.error("Error:", data.error);
                    return;
                }

                setManufacturers(data.data || []);
            } catch (error) {
                console.error("Error fetching manufacturers:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (session) {
            fetchManufacturers();
        }
    }, [session]);

    const filteredManufacturers = manufacturers.filter(manufacturer =>
        manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!session) {
        return <div className="container mx-auto py-10">Please sign in to view manufacturers.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Manufacturers</h1>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        <Link href="/admin/manufacturers/create">Add Manufacturer</Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search manufacturers by name..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        <DataTable columns={columns} data={filteredManufacturers} />
                    )}
                </div>
            </div>
        </div>
    );
} 
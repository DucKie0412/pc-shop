"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { IProduct } from "@/types/product";
import * as z from "zod";
import { ICategory } from "@/types/category";
import { IManufacturer } from "@/types/manufacturer";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    manufacturerId: z.string().min(1, "Manufacturer is required"),
    stock: z.coerce.number().min(0, "Stock must be 0 or greater"),
    originalPrice: z.coerce.number().min(0, "Price must be 0 or greater"),
    discount: z.coerce.number().min(0).max(100, "Discount must be between 0 and 100"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProductPage() {
    const { slug } = useParams();
    const session = useSession();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [manufacturers, setManufacturers] = useState<IManufacturer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            manufacturerId: "",
            stock: 0,
            originalPrice: 0,
            discount: 0,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [productRes, categoriesRes, manufacturersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`),
                ]);

                if (!productRes.ok) {
                    throw new Error("Failed to fetch product");
                }

                const product = await productRes.json();
                const categories = await categoriesRes.json();
                const manufacturers = await manufacturersRes.json();

                setCategories(categories);
                setManufacturers(manufacturers);

                // Reset form with product data
                form.reset({
                    name: product.name,
                    description: product.description,
                    categoryId: product.categoryId._id,
                    manufacturerId: product.manufacturerId._id,
                    stock: product.stock,
                    originalPrice: product.originalPrice,
                    discount: product.discount,
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load product data");
                router.push("/admin/products");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [slug, router, form]);

    const handleUpdate = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to update product");
            }

            toast.success("Product updated successfully");
            router.push("/admin/products");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Name</Label>
                                        <FormControl>
                                            <Input placeholder="Product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Description</Label>
                                        <FormControl>
                                            <Textarea placeholder="Product description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Category</Label>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category._id}
                                                            value={category._id}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="manufacturerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Manufacturer</Label>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a manufacturer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {manufacturers.map((manufacturer) => (
                                                        <SelectItem
                                                            key={manufacturer._id}
                                                            value={manufacturer._id}
                                                        >
                                                            {manufacturer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Stock</Label>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Stock quantity"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="originalPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Original Price</Label>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    placeholder="Original price"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Discount (%)</Label>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    placeholder="Discount percentage"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/admin/products")}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Updating..." : "Update Product"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 
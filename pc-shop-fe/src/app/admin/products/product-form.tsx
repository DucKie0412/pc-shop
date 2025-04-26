"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IProduct } from "@/types/product";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { sendRequest } from "@/utils/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ICategory } from "@/types/category";
import { IManufacturer } from "@/types/manufacturer";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    manufacturerId: z.string().min(1, "Manufacturer is required"),
    stock: z.coerce.number().min(0, "Stock must be at least 0"),
    originalPrice: z.coerce.number().min(0, "Price must be at least 0"),
    discount: z.coerce.number().min(0, "Discount must be at least 0"),
    images: z.array(z.string()).optional(),
    imagePublicIds: z.array(z.string()).optional(),
});

interface ProductFormProps {
    initialData?: IProduct;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [manufacturers, setManufacturers] = useState<IManufacturer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [categoriesRes, manufacturersRes] = await Promise.all([
                    sendRequest<{ statusCode: number; message: string; data: ICategory[] }>({
                        url: `${process.env.NEXT_PUBLIC_API_URL}/categories`,
                        method: "GET",
                    }),
                    sendRequest<{ statusCode: number; message: string; data: IManufacturer[] }>({
                        url: `${process.env.NEXT_PUBLIC_API_URL}/manufacturers`,
                        method: "GET",
                    }),
                ]);

                console.log('Categories response:', categoriesRes);
                console.log('Manufacturers response:', manufacturersRes);

                if (categoriesRes?.data) {
                    setCategories(categoriesRes.data);
                }
                if (manufacturersRes?.data) {
                    setManufacturers(manufacturersRes.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load categories and manufacturers");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            categoryId: initialData?.categoryId?._id || "",
            manufacturerId: initialData?.manufacturerId?._id || "",
            stock: initialData?.stock || 0,
            originalPrice: initialData?.originalPrice || 0,
            discount: initialData?.discount || 0,
            images: initialData?.images || [],
            imagePublicIds: initialData?.imagePublicIds || [],
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            if (initialData) {
                // Update product
                await sendRequest({
                    method: "PATCH",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products/${initialData.slug}`,
                    body: values,
                });
                toast.success("Product updated successfully");
            } else {
                // Create product
                await sendRequest({
                    method: "POST",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products`,
                    body: values,
                });
                toast.success("Product created successfully");
            }
            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Product description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
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
                            <FormLabel>Manufacturer</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a manufacturer" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {manufacturers.map((manufacturer) => (
                                        <SelectItem key={manufacturer._id} value={manufacturer._id}>
                                            {manufacturer.name}
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
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Stock quantity" {...field} />
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
                            <FormLabel>Original Price</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Original price" {...field} />
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
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Discount percentage" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : (initialData ? "Save changes" : "Create product")}
                </Button>
            </form>
        </Form>
    );
} 
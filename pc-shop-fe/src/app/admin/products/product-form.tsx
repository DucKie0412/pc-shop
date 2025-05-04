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
import { useSession } from "next-auth/react";
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

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
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [manufacturers, setManufacturers] = useState<IManufacturer[]>([]);
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [imagePublicIds, setImagePublicIds] = useState<string[]>(initialData?.imagePublicIds || []);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesRes = await sendRequest<IBackendRes<ICategory[]>>({
                    url: '/api/categories',
                    method: 'GET',
                });

                if (categoriesRes?.data) {
                    setCategories(categoriesRes.data);
                }

                // Fetch manufacturers
                const manufacturersRes = await sendRequest<IBackendRes<IManufacturer[]>>({
                    url: '/api/manufacturers',
                    method: 'GET',
                });

                if (manufacturersRes?.data) {
                    setManufacturers(manufacturersRes.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load categories and manufacturers");
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
            const formData = {
                ...values,
                images,
                imagePublicIds,
            };

            if (initialData) {
                // Update product
                const response: IBackendRes<any> = await sendRequest({
                    method: "PATCH",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products/${initialData._id}`,
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${session?.user?.accessToken}`
                    }
                });
                if (response?.statusCode === 200) {
                    toast.success("Product updated successfully");
                } else {
                    toast.error(response?.message || "Failed to update product");
                    return;
                }
            } else {
                // Create product
                const response: IBackendRes<any> = await sendRequest({
                    method: "POST",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products`,
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${session?.user?.accessToken}`
                    }
                });
                if (response?.statusCode === 200) {
                    toast.success("Product created successfully");
                } else {
                    toast.error(response?.message || "Failed to create product");
                    return;
                }
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 overflow-y-auto max-h-[80vh]">
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
                <div className="space-y-4">
                    <FormLabel>Product Images</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group">
                                <Image
                                    src={image}
                                    alt={`Product image ${index + 1}`}
                                    width={200}
                                    height={200}
                                    className={`rounded-lg object-cover ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}
                                />
                                {index === 0 && (
                                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                        Main
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Move this image to the first position
                                        setImages([image, ...images.filter((_, i) => i !== index)]);
                                        setImagePublicIds([imagePublicIds[index], ...imagePublicIds.filter((_, i) => i !== index)]);
                                    }}
                                    className="absolute bottom-2 left-2 bg-white text-blue-600 border border-blue-500 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={index === 0}
                                >
                                    Set as Main
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImages(images.filter((_, i) => i !== index));
                                        setImagePublicIds(imagePublicIds.filter((_, i) => i !== index));
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <CldUploadWidget
                            uploadPreset="pc_shop_products"
                            options={{ multiple: true }}
                            onSuccess={(result: any) => {
                                if (Array.isArray(result)) {
                                    setImages(prev => [
                                        ...prev,
                                        ...result.map((r) => r.info.secure_url)
                                    ]);
                                    setImagePublicIds(prev => [
                                        ...prev,
                                        ...result.map((r) => r.info.public_id)
                                    ]);
                                } else if (result?.info?.secure_url) {
                                    setImages(prev => [...prev, result.info.secure_url]);
                                    setImagePublicIds(prev => [...prev, result.info.public_id]);
                                }
                            }}
                        >
                            {({ open }) => (
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                                </button>
                            )}
                        </CldUploadWidget>
                    </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : (initialData ? "Save changes" : "Create product")}
                </Button>
            </form>
        </Form>
    );
} 
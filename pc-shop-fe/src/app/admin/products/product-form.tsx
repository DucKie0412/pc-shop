"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { PRODUCT_TYPE_SPECS, PRODUCT_TYPES } from "@/constants/productSpecs";
import { Switch } from "@/components/ui/switch";

const baseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(PRODUCT_TYPES as [string, ...string[]]),
    categoryId: z.string().min(1, "Category is required"),
    manufacturerId: z.string().min(1, "Manufacturer is required"),
    stock: z.coerce.number().min(0, "Stock must be at least 0"),
    originalPrice: z.coerce.number().min(0, "Price must be at least 0"),
    discount: z.coerce.number().min(0, "Discount must be at least 0").max(100, "Discount must be at most 100"),
    images: z.array(z.string()).optional(),
    imagePublicIds: z.array(z.string()).optional(),
    specs: z.record(z.any()),
    isRedeemable: z.boolean().optional(),
    requirePoint: z.coerce.number().min(0, "Điểm cần để đổi thưởng phải >= 0").optional(),
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
    const [selectedType, setSelectedType] = useState(initialData?.type || PRODUCT_TYPES[0]);
    const [customSpecValues, setCustomSpecValues] = useState<{ [specName: string]: string }>({});

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

    const form = useForm<z.infer<typeof baseSchema>>({
        resolver: zodResolver(baseSchema),
        defaultValues: {
            name: initialData?.name || "",
            type: initialData?.type || PRODUCT_TYPES[0],
            categoryId: initialData?.categoryId?._id || "",
            manufacturerId: initialData?.manufacturerId?._id || "",
            stock: initialData?.stock || 0,
            originalPrice: initialData?.originalPrice || 0,
            discount: initialData?.discount || 0,
            images: initialData?.images || [],
            imagePublicIds: initialData?.imagePublicIds || [],
            specs: initialData?.specs || {},
            isRedeemable: initialData?.isRedeemable ?? false,
            requirePoint: initialData?.requirePoint ?? 0,
        },
    });


    // Filter manufacturers by selectedType
    const filteredManufacturers = manufacturers.filter(
        (m) => m.type === selectedType
    );

    const onSubmit = async (values: z.infer<typeof baseSchema>) => {
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
                    if (response?.message) {
                        console.error('Backend error message:', response.message);
                    }
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
                    if (response?.message) {
                        console.error('Backend error message:', response.message);
                    }
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xxl space-y-8 overflow-y-auto max-h-[80vh]">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên sản phẩm</FormLabel>
                            <FormControl>
                                <Input placeholder="Tên sản phẩm" {...field} />
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
                            <FormLabel>Danh mục</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={true}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
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
                            <FormLabel>Nhà sản xuất</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhà sản xuất" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filteredManufacturers.map((manufacturer) => (
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
                            <FormLabel>Tồn kho</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Tồn kho" {...field} />
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
                            <FormLabel>Giá gốc</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Giá gốc" {...field} />
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
                            <FormLabel>Chiết khấu (%)</FormLabel>
                            <FormControl>
                                <Input type="number" min={0} max={100} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Controller
                    control={form.control}
                    name="isRedeemable"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mr-4">Cho phép đổi thưởng</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="requirePoint"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Điểm cần để đổi thưởng</FormLabel>
                            <FormControl>
                                <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-4">
                    <FormLabel>Hình ảnh sản phẩm</FormLabel>
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
                                        Chính
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
                                    Đặt làm ảnh chính
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
                                    <span className="mt-2 text-sm text-gray-500">Tải lên hình ảnh</span>
                                </button>
                            )}
                        </CldUploadWidget>
                    </div>
                </div>
                <div>
                    <FormLabel>Thông số kỹ thuật</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(PRODUCT_TYPE_SPECS[selectedType as keyof typeof PRODUCT_TYPE_SPECS]) &&
                            (PRODUCT_TYPE_SPECS[selectedType as keyof typeof PRODUCT_TYPE_SPECS] as Array<{ name: string; label: string; type: string; options?: string[] }>).map((spec) => {
                                const watchedValue = form.watch(`specs.${spec.name}`);
                                return (
                                    <div key={spec.name}>
                                        <FormLabel>{spec.label}</FormLabel>
                                        <FormControl>
                                            {spec.options ? (
                                                <>
                                                    <Select
                                                        value={
                                                            watchedValue === undefined || watchedValue === "" ? "" :
                                                                (spec.options && spec.options.includes(watchedValue)) ? watchedValue :
                                                                    "Custom"
                                                        }
                                                        onValueChange={val => {
                                                            if (val === "Custom") {
                                                                form.setValue(`specs.${spec.name}`, customSpecValues[spec.name] || "");
                                                            } else {
                                                                form.setValue(`specs.${spec.name}`, val);
                                                                setCustomSpecValues(prev => ({
                                                                    ...prev,
                                                                    [spec.name]: ""
                                                                }));
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={`Select ${spec.label}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {spec.options.map((option: string) => (
                                                                <SelectItem key={option} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                            {!spec.options.includes("Custom") && (
                                                                <SelectItem key="Custom" value="Custom">
                                                                    Custom
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {/* Show custom input if 'Custom' is selected */}
                                                    {(
                                                        watchedValue !== undefined &&
                                                        watchedValue !== "" &&
                                                        (!spec.options.includes(watchedValue))
                                                    ) && (
                                                            <Input
                                                                className="mt-2"
                                                                type={spec.type}
                                                                placeholder={`Enter custom ${spec.label.toLowerCase()}`}
                                                                value={watchedValue}
                                                                onChange={e => {
                                                                    const value = e.target.value;
                                                                    setCustomSpecValues(prev => ({
                                                                        ...prev,
                                                                        [spec.name]: value
                                                                    }));
                                                                    form.setValue(`specs.${spec.name}`, value);
                                                                }}
                                                            />
                                                        )}
                                                </>
                                            ) : (
                                                <Input
                                                    type={spec.type}
                                                    placeholder={spec.label}
                                                    {...form.register(`specs.${spec.name}`)}
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang tải..." : (initialData ? "Lưu thay đổi" : "Tạo sản phẩm")}
                </Button>
            </form>
        </Form>
    );
} 
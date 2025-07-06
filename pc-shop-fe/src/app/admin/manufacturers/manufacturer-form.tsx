"use client";

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
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ICategory } from "@/types/category";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    type: z.string().min(1, "Type is required"),
});

interface ManufacturerFormProps {
    initialData?: {
        _id: string;
        name: string;
        logo?: string;
        website?: string;
        type: string;
    };
}

export function ManufacturerForm({ initialData }: ManufacturerFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [categories, setCategories] = useState<ICategory[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            logo: "",
            website: "",
            type: "",
        },
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await sendRequest<{ data: ICategory[] }>({
                    url: '/api/categories',
                    method: 'GET',
                    headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
                });
                if (res?.data) {
                    setCategories(res.data);
                }
            } catch (error) {
                toast.error('Không thể tải danh mục');
            }
        };
        if (session?.user?.accessToken) fetchCategories();
    }, [session]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (initialData) {
                // Update manufacturer
                await sendRequest({
                    method: "PATCH",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/manufacturers/${initialData._id}`,
                    body: values,
                    headers: { Authorization: `Bearer ${session?.user.accessToken}` },
                });
                toast.success("Manufacturer updated successfully");
            } else {
                // Create manufacturer
                await sendRequest({
                    method: "POST",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/manufacturers`,
                    body: values,
                    headers: { Authorization: `Bearer ${session?.user.accessToken}` },
                });
                toast.success("Manufacturer created successfully");
            }
            router.push("/admin/manufacturers");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
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
                            <FormLabel>Tên</FormLabel>
                            <FormControl>
                                <Input placeholder="Tên nhà sản xuất" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                                <Input placeholder="Manufacturer logo URL" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                                <Input placeholder="Manufacturer website URL" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loại</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat.name.trim().toLowerCase()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{initialData ? "Lưu thay đổi" : "Tạo nhà sản xuất"}</Button>
            </form>
        </Form>
    );
} 
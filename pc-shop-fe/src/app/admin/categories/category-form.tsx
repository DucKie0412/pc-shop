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

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

interface CategoryFormProps {
    initialData?: {
        _id: string;
        name: string;
        description?: string;
    };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Transform the data before sending to backend
            const transformedValues = {
                ...values,
                name: values.name.toUpperCase().trim(),
                description: values.description?.trim() || "",
            };

            if (initialData) {
                // Update category
                await sendRequest({
                    method: "PATCH",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/categories/${initialData._id}`,
                    body: transformedValues,
                    headers: { Authorization: `Bearer ${session?.user.accessToken}` },
                });
                toast.success("Category updated successfully");
            } else {
                // Create category
                await sendRequest({
                    method: "POST",
                    url: `${process.env.NEXT_PUBLIC_API_URL}/categories`,
                    body: transformedValues,
                    headers: { Authorization: `Bearer ${session?.user.accessToken}` },
                });
                toast.success("Category created successfully");
            }
            router.push("/admin/categories");
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
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Category name" {...field} />
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
                                <Textarea placeholder="Category description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{initialData ? "Save changes" : "Create category"}</Button>
            </form>
        </Form>
    );
} 
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
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
});

interface ManufacturerFormProps {
    initialData?: {
        _id: string;
        name: string;
        description?: string;
        logo?: string;
        website?: string;
    };
}

export function ManufacturerForm({ initialData }: ManufacturerFormProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            logo: "",
            website: "",
        },
    });

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
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Manufacturer name" {...field} />
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
                                <Textarea placeholder="Manufacturer description" {...field} />
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
                <Button type="submit">{initialData ? "Save changes" : "Create manufacturer"}</Button>
            </form>
        </Form>
    );
} 
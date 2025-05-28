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

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    type: z.string().min(1, "Type is required"),
});

interface ManufacturerFormProps {
    initialData?: {
        _id: string;
        name: string;
        description?: string;
        logo?: string;
        website?: string;
        type: string;
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
            type: "",
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
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="cpu">CPU</SelectItem>
                                    <SelectItem value="mainboard">Mainboard</SelectItem>
                                    <SelectItem value="ram">RAM</SelectItem>
                                    <SelectItem value="vga">VGA</SelectItem>
                                    <SelectItem value="ssd">SSD</SelectItem>
                                    <SelectItem value="hdd">HDD</SelectItem>
                                    <SelectItem value="psu">PSU</SelectItem>
                                    <SelectItem value="case">Case</SelectItem>
                                    <SelectItem value="monitor">Monitor</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{initialData ? "Save changes" : "Create manufacturer"}</Button>
            </form>
        </Form>
    );
} 
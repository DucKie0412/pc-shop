"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { IUser } from "@/types/next-auth";
import * as z from "zod";

const formSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserPage() {
    const { id } = useParams();
    const session = useSession();
    const [user, setUser] = useState<IUser | null>(null);
    const router = useRouter();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            name: "",
            phone: "",
            address: "",
        },
    });

    useEffect(() => {
        async function fetchUser() {
            const res = await sendRequest<IBackendRes<IUser>>({
                method: "GET",
                url: `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
                headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
            });
            if (res?.data) {
                setUser(res.data);
                form.reset({
                    email: res.data.email || "",
                    name: res.data.name || "",
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                });
            }
        }
        if (id && session?.data?.user.accessToken) {
            fetchUser();
        }
    }, [id, session, form]);

    async function handleUpdate(values: FormValues) {
        try {
            const res = await sendRequest<IBackendRes<any>>({
                method: "PATCH",
                url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
                headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
                body: {
                    _id: id,
                    ...values,
                },
            });
            
            if (res?.statusCode === 200) {
                toast.success("User updated successfully!");
                router.push("/admin/users");
            } else {
                toast.error("Failed to update user");
            }
        } catch (error) {
            toast.error("An error occurred while updating user");
        }
    }

    return (
        <div className="flex justify-center mt-10">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <CardTitle>Edit User</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Email</Label>
                                        <FormControl>
                                            <Input type="email" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Name</Label>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Phone Number</Label>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Address</Label>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

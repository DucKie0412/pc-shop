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
import { toast } from "react-toastify";
import { IUser } from "@/types/next-auth";

export default function EditUserPage() {
    const { id } = useParams();
    const session = useSession();
    const [user, setUser] = useState(null as IUser | null);
    const form = useForm();
    const router = useRouter();
    useEffect(() => {
        async function fetchUser() {
            const res = await sendRequest<IBackendRes<any>>({
                method: "GET",
                url: `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
                headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
            });
            setUser(res?.data);
            console.log("User fetched:", res);
        }
        if (id) fetchUser();
    }, [id, session]);

    // Reset form when user fetched
    useEffect(() => {
        if (user) {
            form.reset({
                email: user.email || "",
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || ""
            });
        }
    }, [user]); 

    async function handleUpdate(values: any) {
        const {name, phone, address} = values;
        const res = await sendRequest<IBackendRes<any>>({
            method: "PATCH",
            url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
            headers: { Authorization: `Bearer ${session?.data?.user.accessToken}` },
            body: {
                _id: id,
                ...values,
            },
        });
        console.log("User updated:", res);
        if (res?.statusCode === 200) {
            toast.success("User updated successfully!", { autoClose: 3000 });
            setTimeout(() => {
                router.push(`/admin/users`);
            }, 2500);
        }

        if(res?.statusCode === 400){
            toast.warning("Invalid data or server error!", { autoClose: 2000 });
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
                                            <Input type="email" {...field} disabled/>
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
                            <Button type="submit" className="w-full">Change Information</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

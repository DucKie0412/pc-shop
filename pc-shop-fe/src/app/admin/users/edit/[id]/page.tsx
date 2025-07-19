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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { IUser } from "@/types/next-auth";
import { ArrowLeft } from "lucide-react";
import * as z from "zod";
import { RoleGuard } from "@/components/auth/role-guard";

const formSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1, "Tên không được để trống"),
    phone: z.string().optional(),
    address: z.string().optional(),
    point: z.number().optional(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

function EditUserPageContent() {
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
            point: 0,
            isActive: false,
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
                    point: res.data.points || 0,
                    isActive: res.data.isActive || false,
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
                toast.success("Cập nhật thành công!");
                router.push("/admin/users");
            } else {
                toast.error("Cập nhật thất bại");
            }
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    }

    return (
        <div className="flex justify-center mt-10">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/admin/users")}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle>Sửa tài khoản</CardTitle>
                    </div>
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
                                        <Label>Tên</Label>
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
                                        <Label>Số điện thoại</Label>
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
                                        <Label>Địa chỉ</Label>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="point"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Điểm</Label>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label>Trạng thái</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Kích hoạt hoặc vô hiệu hóa tài khoản này
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Cập nhật
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditUserPage() {
    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <EditUserPageContent />
        </RoleGuard>
    );
}

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { sendRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
    const router = useRouter();
    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
            name: "",
            phone: "",
            address: ""
        },
    });

    const onSubmit = async (values:any) => {
        const {email, password, name, phone, address} = values
        const res = await sendRequest<IBackendRes<any>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
            body: {
                email,
                password,
                name,
                phone,
                address
            }
        })


        if(res?.statusCode === 400){
            toast.warning("Email đã được đăng ký!", {autoClose: 4000})
        }
        else if(res?.statusCode === 201){
            toast.success("Đăng ký tài khoản thành công!", {autoClose: 4000})
            setTimeout(() => {
                router.push(`/auth/active/${res?.data?._id}`);
            }, 2800);
        }
        else{
            toast.error("Lỗi hệ thống! Vui lòng thử lại sau!")
        }
    };


    return (
        <div className="flex justify-center mt-10">
            <Card className="w-full max-w-md p-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center">Đăng ký</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                rules={{ required: "Vui lòng nhập email!" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Email</Label>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                rules={{ required: "Vui lòng nhập mật khẩu!" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Mật khẩu</Label>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                rules={{ required: "Vui lòng nhập tên!" }}
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
                                rules={{ required: "Vui lòng nhập số điện thoại!" }}
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
                                rules={{ required: "Vui lòng nhập địa chỉ!" }}
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
                            <Button type="submit" className="w-full">Đăng ký</Button>
                        </form>
                    </Form>
                    <div className="mt-6 text-center text-sm">
                        Đã có tài khoản?
                        <Link href="/auth/login" className="text-blue-500 pl-2">Đăng nhập</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterForm;

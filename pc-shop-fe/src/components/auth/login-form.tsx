'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import { authenticate } from "@/utils/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ReactiveModal from "./reactive-modal";
import { useState } from "react";
import ForgotPasswordModal from "./forgot-password-modal";
import * as z from "zod";
import { FcGoogle } from "react-icons/fc";
import styles from "@/ui/css/login-form.module.css";
import { cn } from "@/lib/utils";

const LoginForm = () => {
    const router = useRouter();

    // Define the Zod schema
    const LoginSchema = z.object({
        username: z.string().email("Invalid email address"), // Add custom error message
        password: z.string().min(6, "Password must be at least 6 characters long"), // Add custom error message
    });

    // Initialize react-hook-form with zodResolver
    const form = useForm({
        resolver: zodResolver(LoginSchema), // Use zodResolver here
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
    const [isUserEmail, setIsUserEmail] = useState("");

    const onSubmit = async (values: any) => {
        const { username, password } = values;
        const res = await authenticate(username, password);
        setIsUserEmail("");

        if (res?.error) {
            if (res?.code === 1) {
                toast.error("Incorrect email or password!");
            }
            else if (res?.code === 2) {
                setIsModalOpen(true);
                setIsUserEmail(username);
            }
            else {
                toast.error("Internal server error. Please try again!");
            }
        } else {
            toast.success("Login success!");
            // Chuyển hướng sau khi đăng nhập
            setTimeout(() => {
                router.replace("/");
                window.location.href = "/";
            }, 2500);
        }
    };

    return (
        <>
            <div className="flex justify-center mt-10">
                <Card className="w-full max-w-md p-6 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-center">Đăng nhập</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
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
                                <Button type="submit" className={cn([styles["button"], "w-full"])}>Đăng nhập</Button>
                                <Button
                                    onClick={() => {}}
                                    variant="outline"
                                    className={cn([styles["button"], "w-full flex items-center gap-2 mt-2"])}
                                >
                                    <FcGoogle size={20} /> Đăng nhập với Google
                                </Button>
                            </form>
                        </Form>
                        <div className="flex items-center justify-center ">
                            <button type="button" className="text-sm mt-4 text-center text-blue-500" onClick={() => setForgotPasswordModalOpen(true)}>
                                <span className={styles.text_link}>Quên mật khẩu?</span>
                            </button>
                        </div>
                        <div className="mt-2 text-center text-sm">
                            Chưa có tài khoản?
                            <Link href="/auth/register" className={cn(styles["text_link"], "text-blue-500 pl-2")}>Đăng ký ngay</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ReactiveModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} userEmail={isUserEmail} />
            <ForgotPasswordModal isOpen={forgotPasswordModalOpen} setIsOpen={setForgotPasswordModalOpen} userEmail={isUserEmail} />
        </>
    );
};

export default LoginForm;

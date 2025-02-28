'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authenticate } from "@/utils/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ReactiveModal from "./reactive-modal";
import { useState } from "react";

const LoginForm = () => {
    const router = useRouter();
    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                        <CardTitle className="text-center">Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    rules={{ required: "Please input your email!" }}
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
                                    rules={{ required: "Please input your password!" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Password</Label>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Login</Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center">
                            <Link href="/" className="text-blue-500 flex items-center justify-center gap-1">
                                <ArrowLeft size={16} /> Back to homepage
                            </Link>
                        </div>
                        <div className="mt-2 text-center text-sm">
                            Haven't account yet?
                            <Link href="/auth/register" className="text-blue-500 pl-2">Register now</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ReactiveModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} userEmail={isUserEmail}/>
        </>
    );
};

export default LoginForm;

"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { sendRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const ChangePassword = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const router = useRouter();
    const form = useForm({
        defaultValues: {
            email: decodeURIComponent(email),
            codeId: "",
            newPassword: "",
            confirmPassword: ""
        },
    });

    const onSubmit = async (values: any) => {
        const { email, codeId, newPassword, confirmPassword } = values;
        const res = await sendRequest<IBackendRes<any>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
            body: {
                email,
                codeId,
                newPassword,
                confirmPassword
            }
        })

        if (res?.statusCode === 400) {
            toast.warning("Invalid code or wrong code!", { autoClose: 4000 })
        }
        else if (res?.statusCode === 201) {
            toast.success("Change password successfully!", { autoClose: 4000 })
            setTimeout(() => {
                router.push(`/auth/login`);
            }, 2800);
        }
        else {
            toast.error("Failed to change password! Internal server error")
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <Card className="w-full max-w-md p-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Email</Label>
                                        <FormControl>
                                            <Input type="text" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="codeId"
                                rules={{ required: "Please input your code!" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Code</Label>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="newPassword"
                                rules={{ required: "Please input your new password!" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>New password</Label>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                rules={{ required: "Please input your confirm password!" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Confirm password</Label>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Apply</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChangePassword;

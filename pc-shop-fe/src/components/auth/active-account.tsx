'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { sendRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ActiveAccount = (props: any) => {
    const { id } = props;
    const router = useRouter();
    const form = useForm({
        defaultValues: {
            activeCode: "",
            _id: id
        },
    });


    const onSubmit = async (values: any) => {
        const { _id, activeCode } = values
        const res = await sendRequest<IBackendRes<any>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/active`,
            body: {
                _id,
                activeCode
            }
        })
        
        if(res?.statusCode === 400){
            toast.warning("Mã code không hợp lệ hoặc đã hết hạn!", {autoClose: 3000})
        }
        else if(res?.statusCode === 201){
            toast.success("Kích hoạt tài khoản thành công!", {autoClose: 4000})
            setTimeout(() => {
                router.push(`/auth/login`);
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
                    <CardTitle className="text-center">Kích hoạt tài khoản</CardTitle>
                    <p>Chỉ còn một bước nữa</p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="_id"
                                render={({ field }) => (
                                    <FormItem hidden>
                                        <Label>ID</Label>
                                        <FormControl>
                                            <Input {...field} disabled value={id}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="activeCode"
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
                            <Button type="submit" className="w-full"><CheckCircle />Xác nhận</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActiveAccount;

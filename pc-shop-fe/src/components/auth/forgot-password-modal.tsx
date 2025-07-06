"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";

import { Button } from "../ui/button";
import { useHasMounted } from "@/utils/customHook";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { useState } from "react";
import { sendRequest } from "@/utils/api";
import { toast } from "react-toastify";

const ForgotPasswordModal = ({ isOpen, setIsOpen, userEmail }: { isOpen: boolean; setIsOpen: (open: boolean) => void; userEmail: string }) => {
    const router = useRouter();
    const hasMounted = useHasMounted();
    const [email, setEmail] = useState(userEmail);
    if (!hasMounted) return <></>;

    const sendCode = async (email: string) => {
        const res = await sendRequest<IBackendRes<any>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/send-code`,
            body: {
                email
            }
        })

        if (res?.statusCode === 400) {
            toast.warning("Không tìm thấy tài khoản!", { autoClose: 3000 })
        }
        else if (res?.statusCode === 201) {
            toast.success("Mã code đổi mật khẩu đã được gửi đến email của bạn, vui lòng kiểm tra hộp thư đến!", { autoClose: 4000 })
            setTimeout(() => {
                router.push(`/auth/change-password?email=${encodeURIComponent(email)}`);
            }, 2500);
        }
        else {
            toast.error("Lỗi hệ thống! Vui lòng thử lại sau!")
        }

    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Quên mật khẩu?</DialogTitle>
                    <DialogDescription>
                        Nhập email của bạn và nhấn nút bên dưới, hệ thống sẽ gửi mã code để đổi mật khẩu đến email của bạn
                    </DialogDescription>
                    <Input
                        type="text"
                        placeholder="Ví dụ: example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => sendCode(email)}
                        className="w-full">
                        Lấy mã code
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default ForgotPasswordModal;
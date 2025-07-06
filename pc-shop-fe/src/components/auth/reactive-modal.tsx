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
import { sendRequest } from "@/utils/api";
import { toast } from "react-toastify";

const ReactiveModal = ({ isOpen, setIsOpen, userEmail }: { isOpen: boolean; setIsOpen: (open: boolean) => void; userEmail: string }) => {
    const router = useRouter();
    const hasMounted = useHasMounted();
    if (!hasMounted) return <></>;


    const reActive = async (email: string) => {
        if (!email) {
            toast.warning("Email không hợp lệ. Vui lòng thử lại!");
            return;
        }

        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/auth/reactive`,
                method: "POST",
                body: { email },
            });


            if (res?.statusCode === 400) {
                toast.warning("Email đã được kích hoạt!", { autoClose: 4000 });
            } else if (res?.statusCode === 201) {
                router.push(`/auth/active/${res?.data?._id}`);
            } else {
                toast.error("Lỗi hệ thống! Vui lòng thử lại sau!");
            }
        } catch (error) {
            console.error("Error in reActive:", error);
            toast.error("Lỗi hệ thống! Vui lòng thử lại sau!");
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tài khoản của bạn chưa được kích hoạt!</DialogTitle>
                    <DialogDescription>
                        Nhấn nút bên dưới để nhận được email với mã code để kích hoạt tài khoản
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => reActive(userEmail)} className="w-full">Lấy mã code</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default ReactiveModal;
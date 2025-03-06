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
            toast.warning("No user found!", { autoClose: 3000 })
        }
        else if (res?.statusCode === 201) {
            toast.success("A change password code is sent, please check your mail inbox!", { autoClose: 4000 })
            setTimeout(() => {
                router.push(`/auth/change-password?email=${encodeURIComponent(email)}`);
            }, 2500);
        }
        else {
            toast.error("Failed to send code! Internal server error")
        }

    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Forgot password?</DialogTitle>
                    <DialogDescription>
                        Enter your email and click the button below to get an email with a code to reset your password
                    </DialogDescription>
                    <Input
                        type="text"
                        placeholder="e.g: example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => sendCode(email)}
                        className="w-full">
                        Get code
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default ForgotPasswordModal;
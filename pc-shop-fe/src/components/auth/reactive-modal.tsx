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
            toast.warning("Invalid email. Please try again!");
            return;
        }

        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/auth/reactive`,
                method: "POST",
                body: { email },
            });


            if (res?.statusCode === 400) {
                toast.warning("Your email has already been activated!", { autoClose: 4000 });
            } else if (res?.statusCode === 201) {
                router.push(`/auth/active/${res?.data?._id}`);
            } else {
                toast.error("Failed to resend code! Internal server error");
            }
        } catch (error) {
            console.error("Error in reActive:", error);
            toast.error("Something went wrong. Please try again later.");
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Seem your account hasn't active yet :(( </DialogTitle>
                    <DialogDescription>
                        Click the button below to get an email with a code to active your account
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => reActive(userEmail)} className="w-full">Get code</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default ReactiveModal;
"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DeleteConfirmationModalProps {
    title: string;
    description: string;
    itemName: string;
    itemId: string;
    apiEndpoint: string;
    trigger: React.ReactNode;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
}

export function DeleteConfirmationModal({
    title,
    description,
    itemName,
    itemId,
    apiEndpoint,
    trigger,
    onSuccess,
    onError,
    successMessage = "Item deleted successfully!",
    errorMessage = "An error occurred while deleting the item",
}: DeleteConfirmationModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const session = useSession();
    const router = useRouter();

    async function handleDelete() {
        setIsDeleting(true);
        try {
            const headers = { Authorization: `Bearer ${session?.data?.user.accessToken}` };
            console.log("[DeleteConfirmationModal] handleDelete headers:", headers);
            const res = await sendRequest<IBackendRes<any>>({
                method: "DELETE",
                url: `${process.env.NEXT_PUBLIC_API_URL}${apiEndpoint}/${itemId}`,
                headers,
            });
            console.log("[DeleteConfirmationModal] handleDelete response:", res);

            if (res?.statusCode === 200) {
                toast.success(successMessage, { autoClose: 2300 });
                setTimeout(() => {
                    
                    router.refresh();
                    onSuccess?.();
                }, 2000);
            } else if (res?.statusCode === 400) {
                toast.warning("Server error!", { autoClose: 2000 });
                onError?.(res);
            } else {
                toast.error(errorMessage, { autoClose: 2000 });
                onError?.(res);
            }
        } catch (error) {
            toast.error(errorMessage, { autoClose: 2000 });
            onError?.(error);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}{" "}
                        <span className="font-semibold">{itemName}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 
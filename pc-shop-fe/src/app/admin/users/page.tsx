import { auth } from "@/auth";
import { Columns } from "./columns";
import { IUser } from "@/types/next-auth";
import { DataTable } from "@/components/ui/data-table";
import { sendRequest } from "@/utils/api";


async function getUsers(): Promise<IUser[]> {
    const session = await auth();
    try {
        const res = await sendRequest<IBackendRes<any>>({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
            headers: { Authorization: `Bearer ${session?.user.accessToken}` },
            nextOption: { cache: "no-store" }
        });

        return res.data || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}



export default async function UserPage() {
    const users = await getUsers();

    return (
        <div className="">
            <DataTable columns={Columns} data={users} />
        </div>
    );
}

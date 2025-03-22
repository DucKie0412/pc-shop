import { NextResponse } from "next/server";
import { sendRequest } from "@/utils/api";
export async function GET() {
    try {

        // Gọi API bằng sendRequest thay vì fetch
        const res = await sendRequest<IBackendRes<any>>({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
            nextOption: { cache: "no-store" } // Đảm bảo không cache
        });
        console.log("Backend res:", res);
        

        return NextResponse.json(res);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

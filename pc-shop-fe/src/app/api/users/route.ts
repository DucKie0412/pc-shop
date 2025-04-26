import { NextResponse } from "next/server";
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.accessToken}`,
            },
        });

        const data = await res.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

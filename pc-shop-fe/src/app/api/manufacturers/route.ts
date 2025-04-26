import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching manufacturers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 
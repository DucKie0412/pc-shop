import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Backend response:', result);

        // Return the response directly without wrapping it again
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { 
                statusCode: 500,
                message: "Internal Server Error",
                data: []
            }, 
            { status: 500 }
        );
    }
} 
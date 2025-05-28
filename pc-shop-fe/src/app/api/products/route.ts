import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Backend response:', result);

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

export async function POST(request: Request) {
    try {
        // Get the token from the incoming request headers
        const authHeader = request.headers.get('authorization');

        // Parse the body as usual
        const { name, type, categoryId, manufacturerId, stock, originalPrice, discount, images, imagePublicIds, specs, details } = await request.json();

        // Forward the request to your real backend, including the Authorization header
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader || "", // Forward the token
            },
            body: JSON.stringify({ name, type, categoryId, manufacturerId, stock, originalPrice, discount, images, imagePublicIds, specs, details }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating product:", error);
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

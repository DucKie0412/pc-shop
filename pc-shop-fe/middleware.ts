import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {    
    const { nextUrl } = req;
    const isAdminRoute = nextUrl.pathname.startsWith("/admin"); // Kiểm tra nếu vào trang admin

    if (isAdminRoute && !req.auth) {
        // Nếu chưa đăng nhập và truy cập admin -> Chuyển hướng về trang login
        return NextResponse.redirect(new URL("/auth/login", nextUrl.origin));
    }
    return NextResponse.next(); // Tiếp tục xử lý request nếu đã đăng nhập hoặc không vào admin
});

// Chỉ áp dụng middleware cho các route trong /admin
export const config = {
    matcher: ["/admin/:path*"],

};

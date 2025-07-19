import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {

    const { nextUrl } = req;
    const isAdminRoute = nextUrl.pathname.startsWith("/admin"); // Kiểm tra nếu vào trang admin

    if (isAdminRoute) {
        if (!req.auth) {
            // Chưa đăng nhập -> Chuyển hướng về trang login
            return NextResponse.redirect(new URL("/auth/login", nextUrl.origin));
        }

        // Chỉ cho phép ADMIN và STAFF truy cập admin pages
        if (req.auth.user.role !== "ADMIN" && req.auth.user.role !== "STAFF") {
            // Đã đăng nhập nhưng không phải admin hoặc staff -> Chặn truy cập
            return NextResponse.redirect(new URL("/", nextUrl.origin));
        }
    }

    // Nếu là admin/staff hoặc không vào admin route, cho phép tiếp tục
    return NextResponse.next();
});

// Chỉ áp dụng middleware cho các route trong /admin
export const config = {
    matcher: ["/admin/:path*"],

};

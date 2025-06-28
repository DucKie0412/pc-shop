"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";

const RedeemHistoryPage = () => {
    const { data: session, status } = useSession();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (status === "authenticated" && session?.user?._id) {
            setLoading(true);
            sendRequest<any>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/products/redeem/history/${session.user._id}?page=${page}&limit=10`,
                method: "GET",
                headers: { Authorization: `Bearer ${session.user.accessToken}` },
            })
                .then((res) => {
                    setHistory(Array.isArray(res.data?.data) ? res.data.data : []);
                    setTotalPages(res.data?.totalPages || 1);
                })
                .finally(() => setLoading(false));
        }
    }, [session, status, page]);

    if (status === "loading" || loading) {
        return <div className="text-center py-10">Đang tải lịch sử đổi thưởng...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="text-2xl font-bold mb-6">Lịch sử đổi thưởng</div>
            {history.length === 0 ? (
                <div className="text-gray-500">Bạn chưa đổi thưởng sản phẩm nào.</div>
            ) : (
                <>
                <table className="w-full border rounded shadow bg-white">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4">Sản phẩm</th>
                            <th className="py-2 px-4">Điểm đã dùng</th>
                            <th className="py-2 px-4">Ngày đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, idx) => (
                            <tr key={idx} className="border-t">
                                <td className="py-2 px-4">{item.productName}</td>
                                <td className="py-2 px-4">{item.requirePoint}</td>
                                <td className="py-2 px-4">{new Date(item.redeemedAt).toLocaleString("vi-VN")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center mt-4 gap-2">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded bg-gray-200">Trước</button>
                    <span>Trang {page} / {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded bg-gray-200">Sau</button>
                </div>
                </>
            )}
        </div>
    );
};

export default RedeemHistoryPage; 
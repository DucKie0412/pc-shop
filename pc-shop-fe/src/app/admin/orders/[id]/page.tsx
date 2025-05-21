"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { sendRequestClient } from "@/utils/api.client";

const OrderStatus = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
};

const OrderDetailPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        sendRequestClient<any>({ url: `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, method: 'GET' })
            .then((data) => {
                setOrder(data.data || data);
                setForm({
                    fullName: data.data?.fullName || data.fullName || "",
                    email: data.data?.email || data.email || "",
                    phone: data.data?.phone || data.phone || "",
                    address: data.data?.address || data.address || "",
                    note: data.data?.note || data.note || "",
                    status: data.data?.status || data.status || "pending",
                });
                setLoading(false);
            })
            .catch((err) => {
                setError("Không thể tải đơn hàng");
                setLoading(false);
            });
    }, [orderId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            console.log("PATCH body:", form);
            const response = await sendRequestClient<any>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
                method: 'PATCH',
                body: form,
            });
            console.log("PATCH response:", response);
            router.push("/admin/orders");
        } catch (err: any) {
            console.error("PATCH error:", err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Chi tiết đơn hàng</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Thông tin khách hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Tên khách hàng</label>
                        <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition" />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Email</label>
                        <input name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition" />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Số điện thoại</label>
                        <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition" />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-700">Địa chỉ</label>
                        <input name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block font-semibold mb-1 text-gray-700">Ghi chú</label>
                    <textarea name="note" value={form.note} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition" />
                </div>
                <div className="mt-4">
                    <label className="block font-semibold mb-1 text-gray-700">Trạng thái</label>
                    <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition">
                        {Object.entries(OrderStatus).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Order items table */}
            {order?.items && order.items.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">Sản phẩm trong đơn hàng</h2>
                    <table className="w-full text-sm mb-2 border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Tên sản phẩm</th>
                                <th className="border p-2">Đơn giá</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="border p-2">{item.name}</td>
                                    <td className="border p-2">{item.price?.toLocaleString('vi-VN')} đ</td>
                                    <td className="border p-2">{item.quantity}</td>
                                    <td className="border p-2">{(item.price * item.quantity)?.toLocaleString('vi-VN')} đ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="text-right font-bold text-red-600">
                        Tổng tiền: {order.total?.toLocaleString('vi-VN')} đ
                    </div>
                </div>
            )}
            <div className="sticky bottom-0 bg-white py-4 z-10">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold text-lg shadow transition disabled:opacity-50"
                    disabled={saving}
                >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
        </div>
    );
};

export default OrderDetailPage; 
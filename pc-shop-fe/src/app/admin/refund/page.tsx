'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';
import { toast } from 'react-toastify';
import { RoleGuard } from "@/components/auth/role-guard";

interface RefundRequest {
    _id: string;
    order: string;
    products: { product: { _id: string; name: string }; quantity: number }[];
    reason: string;
    status: string;
    createdAt: string;
}
interface IUserResponse {
    _id: string;
    email: string;
    name?: string;
}
interface IBackendResponse<T> {
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    'refund-rejected': 'bg-red-100 text-red-800',
    done: 'bg-gray-100 text-gray-800',
};

const AdminRefundsPageContent = () => {
    const { data: session } = useSession();
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const handleApproveReject = async (refundId: string, action: 'approve' | 'reject') => {
        try {
            setLoading(true);
            await sendRequest({
                url: `${process.env.NEXT_PUBLIC_API_URL}/refunds/${refundId}/${action}`,
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${session?.user.accessToken}`,
                    'Content-Type': 'application/json'
                },
            });
            toast.success(`Refund request ${action}d successfully!`);
            setRefundRequests(prevRequests =>
                prevRequests.map(req =>
                    req._id === refundId ? { ...req, status: action } : req
                )
            );
        } catch (err: any) {
            console.error(`Error ${action}ing refund request:`, err);
            toast.error(err.message || err.error || `Failed to ${action} refund request.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.accessToken) {
            setLoading(true);
            sendRequest<IBackendResponse<RefundRequest[]>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/refunds`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session?.user.accessToken}`,
                },
            })
                .then(data => {
                    if (data && data.data) {
                        setRefundRequests(data.data);
                    } else {
                        setRefundRequests([]);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching refund requests:', err);
                    setError(err.message || err.error || 'Đã xảy ra lỗi khi tải yêu cầu hoàn tiền.');
                    toast.error(err.message || err.error || 'Đã xảy ra lỗi khi tải yêu cầu hoàn tiền.');
                    setLoading(false);
                });
        }
    }, [session]);

    const filteredRefunds = refundRequests.filter(req =>
        req._id.toLowerCase().includes(search.toLowerCase()) ||
        req.order.toLowerCase().includes(search.toLowerCase()) ||
        req.reason.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="container mx-auto py-8">Loading refund requests...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Yêu cầu hoàn tiền</h1>
                <div className="flex items-center gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Tìm theo mã yêu cầu hoặc mã đơn"
                        className="border rounded p-2 flex-grow"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {!filteredRefunds || filteredRefunds.length === 0 ? (
                    <div>Không có yêu cầu hoàn tiền nào.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b text-left">Mã yêu cầu</th>
                                    <th className="py-2 px-4 border-b text-left">Mã đơn hàng</th>
                                    <th className="py-2 px-4 border-b text-left">Lý do</th>
                                    <th className="py-2 px-4 border-b text-left">Trạng thái</th>
                                    <th className="py-2 px-4 border-b text-left">Ngày gửi</th>
                                    <th className="py-2 px-4 border-b text-left">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRefunds.map(request => (
                                    <tr key={request._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b text-left text-sm">{request._id}</td>
                                        <td className="py-2 px-4 border-b text-left text-sm">{request.order}</td>
                                        <td className="py-2 px-4 border-b text-left text-sm">{request.reason}</td>
                                        <td className="py-2 px-4 border-b text-left text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 border-b text-left text-sm">{new Date(request.createdAt).toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b text-left text-sm">
                                            {request.status === 'pending' ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                                                        onClick={() => handleApproveReject(request._id, 'approve')}
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                                                        onClick={() => handleApproveReject(request._id, 'reject')}
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Done</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminRefundsPage = () => {
    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <AdminRefundsPageContent />
        </RoleGuard>
    );
};

export default AdminRefundsPage;

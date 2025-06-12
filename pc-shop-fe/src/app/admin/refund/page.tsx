'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';
import { toast } from 'react-toastify';
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
    data?: T; // The actual data payload
    message?: string; // Optional message
    error?: string; // Optional error message
    statusCode?: number; // Optional status code
}

const AdminRefundsPage = () => {
    const { data: session } = useSession();
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to fetch user name by ID
    const fetchUserName = async (userId: string) => {
        if (!session?.user?.accessToken) return; // Ensure session and token exist

        try {
            const userData = await sendRequest<IBackendResponse<IUserResponse>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session?.user.accessToken}`,
                },
            });
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
        }
    };

    const handleApproveReject = async (refundId: string, action: 'approve' | 'reject') => {
        try {
            setLoading(true); // Optional: show loading state during action
            await sendRequest({
                url: `${process.env.NEXT_PUBLIC_API_URL}/refunds/${refundId}/${action}`,
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${session?.user.accessToken}`,
                    'Content-Type': 'application/json'
                },
            });
            toast.success(`Refund request ${action}d successfully!`);
            // Update the status in the local state
            setRefundRequests(prevRequests =>
                prevRequests.map(req =>
                    req._id === refundId ? { ...req, status: action } : req
                )
            );
        } catch (err: any) {
            console.error(`Error ${action}ing refund request:`, err);
            toast.error(err.message || err.error || `Failed to ${action} refund request.`);
        } finally {
            setLoading(false); // Optional: hide loading state
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

    if (loading) {
        return <div className="container mx-auto py-8">Loading refund requests...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Quản lý yêu cầu hoàn tiền</h1>
            {!refundRequests || refundRequests.length === 0 ? (
                <div>Không có yêu cầu hoàn tiền nào.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Mã yêu cầu</th>
                                <th className="py-2 px-4 border-b text-left">Mã đơn hàng</th>
                                <th className="py-2 px-4 border-b text-left">Lý do</th>
                                <th className="py-2 px-4 border-b text-left">Trạng thái</th>
                                <th className="py-2 px-4 border-b text-left">Ngày gửi</th>
                                <th className="py-2 px-4 border-b text-left">Hành động</th> {/* e.g., Approve/Reject */}
                            </tr>
                        </thead>
                        <tbody>
                            {refundRequests.map(request => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-left text-sm">{request._id}</td>
                                    <td className="py-2 px-4 border-b text-left text-sm">{request.order}</td>
                                    <td className="py-2 px-4 border-b text-left text-sm">{request.reason}</td>
                                    <td className="py-2 px-4 border-b text-left text-sm">{request.status}</td>
                                    <td className="py-2 px-4 border-b text-left text-sm">{new Date(request.createdAt).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b text-left text-sm">
                                        {request.status === 'pending' ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                                                    onClick={() => handleApproveReject(request._id, 'approve')}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                                                    onClick={() => handleApproveReject(request._id, 'reject')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span>Done</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminRefundsPage;

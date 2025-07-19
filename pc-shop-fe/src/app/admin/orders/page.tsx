'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Trash } from 'lucide-react';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Order {
    _id: string;
    createdAt: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    customerInfo?: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    user?: {
        name: string;
        email: string;
    };
    fullName?: string;
    userId?: string;
    email?: string;
    phone?: string;
    payment?: string;
}

const OrderStatus = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    approved: 'Đã hoàn tiền',
    rejected: 'Từ chối hoàn tiền'
};

const OrderManagementPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.accessToken) {
            fetchOrders();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, session]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            search === '' ||
            order._id.toLowerCase().includes(search) ||
            (order.fullName && order.fullName.toLowerCase().includes(search)) ||
            (order.email && order.email.toLowerCase().includes(search)) ||
            (order.phone && order.phone.includes(search)) ||
            (order.customerInfo?.name && order.customerInfo.name.toLowerCase().includes(search)) ||
            (order.customerInfo?.email && order.customerInfo.email.toLowerCase().includes(search)) ||
            (order.customerInfo?.phone && order.customerInfo.phone.includes(search));
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Đơn hàng</h1>
            
            {/* Filters */}
            <div className="mb-6 flex gap-4 flex-wrap">
                <select
                    className="border rounded p-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(OrderStatus).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                
                <input
                    type="text"
                    placeholder="Tìm theo mã đơn, tên, email hoặc số điện thoại..."
                    className="border rounded p-2 flex-grow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Mã đơn</th>
                            <th className="border p-2">Ngày đặt</th>
                            <th className="border p-2">Khách hàng</th>
                            <th className="border p-2">Tổng tiền</th>
                            <th className="border p-2">Trạng thái</th>
                            <th className="border p-2">Phương thức thanh toán</th>
                            <th className="border p-2">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td className="border p-2">{order._id}</td>
                                <td className="border p-2">
                                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="border p-2">
                                    <div>
                                        <div>
                                            {order.fullName || 'N/A'}
                                            {order.userId ? (
                                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Người dùng</span>
                                            ) : (
                                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Khách</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">{order.email || 'N/A'}</div>
                                        <div className="text-sm text-gray-600">{order.phone || 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="border p-2">
                                    {order.total.toLocaleString('vi-VN')} đ
                                </td>
                                <td className="border p-2">
                                    <span className={
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    + ' px-2 py-1 rounded text-xs font-semibold'}>
                                        {OrderStatus[order.status] || order.status}
                                    </span>
                                </td>
                                <td className="border p-2">
                                    {order.payment === 'cod' && <span title="COD">💵 Thanh toán khi nhận hàng</span>}
                                    {order.payment === 'banking' && <span title="Banking">🏦 Chuyển khoản ngân hàng</span>}
                                    {!order.payment && 'N/A'}
                                </td>
                                <td className="border p-2 flex gap-2">
                                    <button
                                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Chi tiết
                                    </button>
                                    <DeleteConfirmationModal
                                        title="Are you sure?"
                                        description="This action cannot be undone. This will permanently delete the order:"
                                        itemName={`Order #${order._id} of user ${order.fullName}`}
                                        itemId={order._id}
                                        apiEndpoint="/orders"
                                        successMessage="Order deleted successfully!"
                                        errorMessage="An error occurred while deleting the order"
                                        onSuccess={() => router.refresh()}
                                        trigger={
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                <Trash className='w-4 h-4'/>
                                            </button>
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                    Không tìm thấy đơn hàng nào
                </div>
            )}
        </div>
    );
};

export default OrderManagementPage;

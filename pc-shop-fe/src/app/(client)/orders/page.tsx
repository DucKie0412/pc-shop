'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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
    status?: string;
}

const OrderStatus = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
}

const OrdersPage = () => {
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.accessToken) {
            setLoading(true);
            console.log('Session user:', session?.user);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            })
                .then(res => res.json())
                .then(data => {
                    console.log('Fetched orders:', data);
                    if (Array.isArray(data.data)) {
                        setOrders(data.data);
                    } else if (Array.isArray(data)) {
                        setOrders(data);
                    } else {
                        setOrders([]);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status, session]);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrders([]);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/lookup?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
            if (!res.ok) throw new Error('Không tìm thấy đơn hàng với thông tin đã nhập.');
            const data = await res.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
            {status !== 'authenticated' && (
                <form className="mb-6 bg-white p-4 rounded shadow w-full max-w-md" onSubmit={handleLookup}>
                    <h2 className="font-bold mb-2">Tra cứu đơn hàng cho khách</h2>
                    <input
                        className="mb-2 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="mb-2 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-bold">Tra cứu</button>
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                </form>
            )}
            {loading ? (
                <div>Đang tải...</div>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
                <div>Không có đơn hàng nào.</div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="border rounded p-4 bg-white shadow">
                            <div className="flex justify-between items-center mb-2">
                                <div><span className="font-bold">Mã đơn:</span> {order._id}</div>
                                <div><span className="font-bold">Ngày đặt:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                                {order.status && <div><span className="font-bold">Trạng thái:</span> {OrderStatus[order.status as keyof typeof OrderStatus]}</div>}
                            </div>
                            <div>
                                <table className="w-full text-sm mb-2">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th></th>
                                            <th className='w-1/3'>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th>Số lượng</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map(item => (
                                            <tr key={item.productId}>
                                                <td>{item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover" />}</td>
                                                <td>{item.name}</td>
                                                <td>{item.price.toLocaleString('vi-VN')} đ</td>
                                                <td>{item.quantity}</td>
                                                <td>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="text-right font-bold text-red-600">Tổng tiền: {order.total.toLocaleString('vi-VN')} đ</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage; 
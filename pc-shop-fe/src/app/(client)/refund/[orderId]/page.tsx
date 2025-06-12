'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { sendRequest } from '@/utils/api';

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

// Define the structure of the backend response
interface IBackendResponse<T> {
    data?: T; // The actual data payload
    message?: string; // Optional message
    error?: string; // Optional error message
    statusCode?: number; // Optional status code
}

const RefundRequestPage = () => {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const { data: session } = useSession();

    const [order, setOrder] = useState<Order | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');    

    useEffect(() => {
        if (orderId && session?.user?.accessToken) {
            setLoadingOrder(true);
            sendRequest<IBackendResponse<Order>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            })
                .then(data => {
                    if (data && data.data) {
                        setOrder(data.data);
                        setSelectedProducts(data.data.items.map((item: OrderItem) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        })));
                    } else {
                        setOrder(null);
                    }
                    setLoadingOrder(false);
                })
                .catch(err => {
                    console.error('Error fetching order:', err);
                    setOrder(null);
                    setLoadingOrder(false);
                    toast.error(err.message || 'Đã xảy ra lỗi khi fetch thông tin đơn hàng.');
                });
        }
    }, [orderId, session]);

    const handleProductSelect = (productId: string, quantity: number, isSelected: boolean) => {
        if (isSelected) {
            setSelectedProducts(prev => [...prev, { productId, quantity }]);
        } else {
            setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
        }
    };

    const handleSelectAll = (isSelected: boolean) => {
        if (order) {
            if (isSelected) {
                setSelectedProducts(order.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })));
            } else {
                setSelectedProducts([]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!reason.trim()) {
            setError('Please provide a reason for the refund.');
            setIsSubmitting(false);
            return;
        }

        if (selectedProducts.length === 0) {
            setError('Please select at least one product to refund.');
            setIsSubmitting(false);
            return;
        }

        const refundRequestData = {
            orderId: order?._id,
            products: selectedProducts.map(p => ({ product: p.productId, quantity: p.quantity })),
            reason,
        };

        console.log('Submitting refund request:', refundRequestData);

        try {
            const res = await sendRequest<IBackendResponse<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/refunds`,
                method: 'POST',
                body: refundRequestData,
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            });

            console.log('Refund request submitted successfully', res);
            toast.success('Yêu cầu hoàn tiền của bạn đã được gửi đi!'); 
            setTimeout(() => { router.push("/"); }, 2000);

        } catch (err: any) {
            console.error('Refund submission error:', err);
            setError(err.message || err.error || 'An error occurred while submitting your request.');
            toast.error(err.message || err.error || 'Đã xảy ra lỗi khi gửi yêu cầu hoàn tiền.'); 
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingOrder) {
        return <div className="container mx-auto py-8">Loading order details...</div>;
    }

    if (!order) {
        return <div className="container mx-auto py-8 text-red-500">Order not found or could not be loaded.</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Yêu cầu hoàn tiền cho đơn hàng #{order._id}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="reason" className="block text-gray-700 font-bold mb-2">Lý do hoàn tiền:</label>
                    <textarea
                        id="reason"
                        rows={4}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Chọn sản phẩm muốn hoàn tiền:</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === order.items.length && order.items.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="form-checkbox"
                                        />
                                    </th>
                                    <th className="py-2 px-4 border-b text-left">Sản phẩm</th>
                                    <th className="py-2 px-4 border-b text-left">Số lượng đặt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.productId}>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.some(p => p.productId === item.productId)}
                                                onChange={(e) => handleProductSelect(item.productId, item.quantity, e.target.checked)}
                                                className="form-checkbox"
                                            />
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <div className="flex items-center">
                                                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover mr-2" />}
                                                <span>{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 border-b">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hoàn tiền'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RefundRequestPage; 
"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const RedeemPage = () => {
    const { data: session, status } = useSession();
    const [products, setProducts] = useState<any[]>([]);
    const [userPoints, setUserPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?._id) {
            setLoading(true);
            Promise.all([
                sendRequest<IBackendRes<any[]>>({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products/redeemable`,
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`
                    }
                }),
                sendRequest<IBackendRes<{ points: number }>>({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/users/points/${session.user._id}`,
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`
                    }
                })
            ]).then(([productsData, pointsData]) => {
                setProducts(productsData.data || []);
                setUserPoints(pointsData.data?.points ?? 0);
            }).finally(() => setLoading(false));
        }
    }, [session, status]);

    const handleRedeem = async (productId: string) => {
        if (!session?.user?.accessToken) return;
        setRedeemingId(productId);
        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/redeem`,
                method: 'POST',
                headers: { Authorization: `Bearer ${session.user.accessToken}` }
            });
            if (res.statusCode === 201 || res.message === 'Redeem successful') {
                toast.success('Đổi thưởng thành công!');
                setUserPoints(res.data?.points);
            } else {
                toast.error(res.message || 'Đổi thưởng thất bại!');
            }
            
        } catch (err: any) {
            toast.error('Đổi thưởng thất bại!');
        } finally {
            setRedeemingId(null);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="text-center py-10">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-10">
            <button
                className="mb-6 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => router.push("/redeem/history")}
            >
                Xem lịch sử đổi thưởng
            </button>
            <div className="text-2xl font-bold mb-6">Đổi thưởng sản phẩm</div>
            <div className="mb-4 text-blue-600 font-semibold">Điểm của bạn: {userPoints}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.filter((p: any) => p.isRedeemable).map((product: any) => (
                    <div key={product._id} className="bg-white rounded shadow p-4 flex flex-col items-center">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-32 h-32 object-cover rounded mb-3" />
                        <div className="font-semibold mb-1">{product.name}</div>
                        <div className="mb-2 text-gray-500">{product.requirePoint ?? 0} điểm</div>
                        <button
                            className={`px-4 py-2 rounded text-white ${userPoints >= (product.requirePoint ?? 0) && !redeemingId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={userPoints < (product.requirePoint ?? 0) || !!redeemingId}
                            onClick={() => handleRedeem(product._id)}
                        >
                            {redeemingId === product._id ? 'Đang xử lý...' : 'Đổi thưởng'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RedeemPage;


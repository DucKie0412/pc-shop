"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { useCart } from '@/lib/hooks/useCart';
import { sendRequest } from '@/utils/api';

const VnpayPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCartItems } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [inputCode, setInputCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    const bankAccount = {
        accountNo: "1016852345",
        bankCode: "VCB",
        accountName: "DINH TRAN DUC"
    };

    // List of supported banks
    const banks = [
        { name: 'VietcomBank', bankCode: 'VCB', accountNo: '1016852345', logo: '/banks/Vietcombank.webp' },
        { name: 'VIB Bank', bankCode: 'VIB', accountNo: '1234567890', logo: '/banks/vib.webp' },
        { name: 'MBBank', bankCode: 'MB', accountNo: '2345678901', logo: '/banks/mb.webp' },
        { name: 'VietinBank', accountNo: '101872836959', bankCode: 'VietinBank', logo: '/banks/Viettinbank.png' },
        { name: 'TPBank', bankCode: 'TPB', accountNo: '3456789012', logo: '/banks/tpbank.webp' },
        { name: 'HDBank', bankCode: 'HDB', accountNo: '4567890123', logo: '/banks/hdbank.webp' },
        { name: 'Navibank', bankCode: 'NCB', accountNo: '5678901234', logo: '/banks/navibank.png' },
        { name: 'Maritime Bank', bankCode: 'MSB', accountNo: '6789012345', logo: '/banks/maritimebank.png' },
        { name: 'GPBank', bankCode: 'GPB', accountNo: '7890123456', logo: '/banks/gpbank.png' },
        { name: 'VietABank', bankCode: 'VAB', accountNo: '8901234567', logo: '/banks/vietabank.png' },
        { name: 'OceanBank', bankCode: 'OCB', accountNo: '9012345678', logo: '/banks/oceanbank.png' },
        { name: 'BacA Bank', bankCode: 'BAB', accountNo: '1122334455', logo: '/banks/bacabank.png' },
        { name: 'ABBank', bankCode: 'ABB', accountNo: '2233445566', logo: '/banks/abbank.png' },
        { name: 'BIDV', bankCode: 'BIDV', accountNo: '3344556677', logo: '/banks/bidv.png' },
        { name: 'SHB', bankCode: 'SHB', accountNo: '4455667788', logo: '/banks/shb.png' },
        { name: 'BaoVietBank', bankCode: 'BVB', accountNo: '5566778899', logo: '/banks/baovietbank.png' },
    ];
    const [selectedBank, setSelectedBank] = useState<null | typeof banks[0]>(null);

    useEffect(() => {
        if (!orderId) {
            toast.error("Không tìm thấy thông tin đơn hàng.");
            router.push("/");
            return;
        }
        // Fetch order details
        sendRequest({
            url: `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
            method: 'GET',
        })
            .then((data: any) => {
                setOrder(data.data || data.order || data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Không thể tải thông tin đơn hàng.");
                router.push("/");
            });
    }, [orderId, router]);

    useEffect(() => {
        if (!order) return;
        setTimeLeft(300); // reset timer on new order
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [order]);

    useEffect(() => {
        if (timeLeft === 0) {
            toast.error('Thanh toán đã hết hạn. Vui lòng đặt lại đơn hàng.');
            router.push('/');
        }
    }, [timeLeft, router]);

    const handleConfirm = async () => {
        if (!orderId) return;
        try {
            const data: any = await sendRequest({
                url: `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/payment-status`,
                method: 'PATCH',
                body: { paymentStatus: true },
            });
            if (data && (data?.success || data?.statusCode === 200)) {
                toast.success("Thanh toán thành công! Đơn hàng đã được xác nhận.");
                await clearCartItems();
                setTimeout(() => {
                    window.location.href = '/orders';
                }, 300);
            } else {
                toast.error(data?.message || "Có lỗi xảy ra khi xác nhận thanh toán.");
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi kết nối máy chủ.");
        }
    };

    if (loading || !order) return <div className="text-center py-8">Đang tải thông tin đơn hàng...</div>;

    return (
        <div className="container mx-auto py-8 flex flex-col items-center">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Order Info */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between min-h-[480px]">
                    <div>
                        <h2 className="font-bold text-lg mb-4 text-gray-700">Thông tin đơn hàng</h2>
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/logo.svg" alt="Logo" className="w-12 h-12 rounded object-contain border" />
                            <span className="font-semibold text-base">Nhà cung cấp - Duckie PC Shop </span>
                        </div>
                        <div className="mb-2 text-sm"><span className="font-medium">Mã đơn hàng:</span> <span className="break-all">{order._id}</span></div>
                        <div className="mb-2 text-sm"><span className="font-medium">Mô tả:</span> Thanh toán đơn hàng {order._id}</div>
                        <div className="mb-2 text-sm"><span className="font-medium">Số tiền:</span> <span className="text-lg font-bold text-red-600">{typeof order.total === 'number' ? order.total.toLocaleString('vi-VN') + 'đ' : 'N/A'}</span></div>
                    </div>
                    <div className="mt-6">
                        <div className="bg-pink-50 rounded-lg p-4 text-center mb-3">
                            <div className="text-gray-700 text-sm mb-1">Đơn hàng sẽ hết hạn sau:</div>
                            <div className="flex justify-center gap-2 text-pink-600 font-bold text-xl">
                                <div className="bg-white rounded px-3 py-1 border border-pink-200">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}<span className="text-xs font-normal ml-1">Phút</span></div>
                                <div className="bg-white rounded px-3 py-1 border border-pink-200">{String(timeLeft % 60).padStart(2, '0')}<span className="text-xs font-normal ml-1">Giây</span></div>
                            </div>
                        </div>
                        <button
                            className="w-full mt-2 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border border-gray-200 transition"
                            onClick={() => router.back()}
                        >Quay về</button>
                    </div>
                </div>
                {/* Right: QR Code & Payment */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-h-[480px]">
                    <h2 className="text-xl font-bold text-pink-600 mb-4">Quét mã QR để thanh toán</h2>
                    {/* Bank selection grid */}
                    <div className="mb-4">
                        <div className="font-semibold mb-2">Ngân hàng chấp nhận thanh toán</div>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {banks.map(bank => (
                                <button
                                    key={bank.bankCode}
                                    onClick={() => setSelectedBank(bank)}
                                    className={`flex flex-col items-center p-2 rounded border transition ${selectedBank && selectedBank.bankCode === bank.bankCode ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}
                                >
                                    <img src={bank.logo} alt={bank.name} className="w-8 h-8 mb-1" />
                                    <span className="text-xs whitespace-nowrap">{bank.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* QR code and payment info only after bank is selected */}
                    {!selectedBank ? (
                        <div className="text-center text-gray-500 my-6">Vui lòng chọn ngân hàng để lấy mã QR</div>
                    ) : (
                        <>
                            <Image
                                src={`https://img.vietqr.io/image/${selectedBank.bankCode}-${selectedBank.accountNo}-compact2.png?amount=${order.total}&addInfo=Thanh+toan+don+hang+${order._id}&accountName=${encodeURIComponent(bankAccount.accountName)}`}
                                alt="VietQR"
                                width={240}
                                height={240}
                                className="mb-4 border-4 border-pink-200 rounded-lg"
                            />
                            <div className="text-xs text-gray-500 mt-2 text-center mb-4">
                                {bankAccount.accountName} - {selectedBank.accountNo} ({selectedBank.bankCode})<br />
                                Số tiền: {typeof order.total === 'number' ? order.total.toLocaleString('vi-VN') + ' đ' : 'N/A'}<br />
                                Nội dung: Thanh toan don hang {order._id}
                            </div>
                        </>
                    )}
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 font-bold mt-2"
                        disabled={timeLeft === 0}
                    >
                        Xác nhận đã thanh toán
                    </button>
                    {timeLeft === 0 && (
                        <div className="text-red-500 text-center mt-2 font-semibold">
                            Thời gian thanh toán đã hết. Vui lòng đặt lại đơn hàng.
                        </div>
                    )}
                    <div className="text-gray-500 text-xs mt-4">Sử dụng App ngân hàng hoặc ứng dụng camera hỗ trợ QR code để quét mã</div>
                </div>
            </div>
        </div>
    );
};

export default VnpayPage; 
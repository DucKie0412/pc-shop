"use client"

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import * as timeago from 'timeago.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function useDashboardStats() {
    const [monthChange, setMonthChange] = useState<number | null>(null);
    const [ordersToday, setOrdersToday] = useState<number | null>(null);
    const [revenueToday, setRevenueToday] = useState<number | null>(null);

    useEffect(() => {
        // Fetch monthly revenue for this year
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/revenue?mode=month`)
            .then(res => res.json())
            .then(res => {
                const labelsArr = res.data?.labels || [];
                const dataArr = res.data?.data || [];
                const now = new Date();
                const thisMonth = now.getMonth(); // 0-based
                const lastMonth = thisMonth - 1;
                const thisMonthLabel = `${(thisMonth + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                const lastMonthLabel = `${(lastMonth + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                const thisMonthIdx = labelsArr.indexOf(thisMonthLabel);
                const lastMonthIdx = labelsArr.indexOf(lastMonthLabel);
                const thisMonthRevenue = thisMonthIdx !== -1 ? dataArr[thisMonthIdx] : 0;
                const lastMonthRevenue = lastMonthIdx !== -1 ? dataArr[lastMonthIdx] : 0;
                if (lastMonthRevenue === 0) {
                    setMonthChange(null);
                } else {
                    setMonthChange(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
                }
            });

        // Fetch all orders and calculate today's revenue and order count
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            .then(res => res.json())
            .then(res => {
                const orders = res.orders || res.data || [];
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = (today.getMonth() + 1).toString().padStart(2, '0');
                const dd = today.getDate().toString().padStart(2, '0');
                const todayStr = `${yyyy}-${mm}-${dd}`;
                let count = 0;
                let revenue = 0;
                orders.forEach((order: any) => {
                    const orderDate = new Date(order.createdAt);
                    const orderStr = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')}`;
                    if (orderStr === todayStr) {
                        count++;
                        revenue += order.total || 0;
                    }
                });
                setOrdersToday(count);
                setRevenueToday(revenue);
            });
    }, []);

    return { monthChange, ordersToday, revenueToday };
}

const DashboardPage = () => {
    const { monthChange, ordersToday, revenueToday } = useDashboardStats();

    const summaryCards = [
        {
            title: 'Doanh thu hôm nay',
            value: revenueToday !== null ? revenueToday.toLocaleString('vi-VN') + 'đ' : 'Đang tải...',
            color: 'border-blue-500',
            icon: '💰'
        },
        { title: 'So với tháng trước', value: monthChange !== null ? `${monthChange.toFixed(2)}%` : '100%', color: 'border-green-500', icon: '📈' },
        { title: 'Số đơn hàng hôm nay', value: ordersToday !== null ? String(ordersToday) : 'Đang tải...', color: 'border-yellow-500', icon: '🔄' },
    ];

    function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
        return (
            <div className={`p-4 rounded shadow bg-white flex items-center gap-4 border-l-4 ${color}`}>
                <span className="text-2xl">{icon}</span>
                <div>
                    <div className="text-gray-500 text-xs">{title}</div>
                    <div className="text-xl font-bold">{value}</div>
                </div>
            </div>
        );
    }

    function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function SalesChart() {
        const [mode, setMode] = useState<'day' | 'month'>('day');
        const [labels, setLabels] = useState<string[]>([]);
        const [data, setData] = useState<number[]>([]);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/revenue?mode=${mode}`)
                .then(res => res.json())
                .then(res => {
                    console.log('Revenue API response:', res);
                    const now = new Date();
                    const labelsArr = res.data?.labels || [];
                    const dataArr = res.data?.data || [];
                    if (mode === 'day') {
                        const days = getDaysInMonth(now.getFullYear(), now.getMonth());
                        const fullLabels = Array.from({ length: days }, (_, i) =>
                            `${(i + 1).toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
                        );
                        setLabels(fullLabels);
                        const dataMap: Record<string, number> = {};
                        if (Array.isArray(labelsArr) && Array.isArray(dataArr)) {
                            labelsArr.forEach((label: string, i: number) => { dataMap[label] = dataArr[i]; });
                        }
                        const chartData = fullLabels.map(label => dataMap[label] || 0);
                        setData(chartData);
                    } else {
                        // mode === 'month'
                        const fullLabels = Array.from({ length: 12 }, (_, i) =>
                            `${(i + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
                        );
                        setLabels(fullLabels);
                        const dataMap: Record<string, number> = {};
                        if (Array.isArray(labelsArr) && Array.isArray(dataArr)) {
                            labelsArr.forEach((label: string, i: number) => { dataMap[label] = dataArr[i]; });
                        }
                        const chartData = fullLabels.map(label => dataMap[label] || 0);
                        setData(chartData);
                    }
                })
                .finally(() => setLoading(false));
        }, [mode]);

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Doanh thu (triệu đồng)',
                    data,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            return `Doanh thu: ${context.parsed.y} triệu đồng`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (this: any, value: string | number) {
                            return `${value}tr`;
                        }
                    },
                },
            },
        };

        return (
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">Doanh thu thuần {mode === 'day' ? 'theo ngày' : 'theo tháng'}</div>
                    <div className="flex gap-2">
                        <button
                            className={`px-3 py-1 rounded ${mode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setMode('day')}
                        >Theo ngày</button>
                        <button
                            className={`px-3 py-1 rounded ${mode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setMode('month')}
                        >Theo tháng</button>
                    </div>
                </div>
                {loading ? <div>Đang tải dữ liệu...</div> : <Bar data={chartData} options={options} height={220} />}
            </div>
        );
    }

    function RecentActivity() {
        const [orders, setOrders] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?limit=5`)
                .then(res => res.json())
                .then(res => {
                    setOrders(res.orders || res.data || []);
                })
                .finally(() => setLoading(false));
        }, []);

        return (
            <div>
                <div className="font-semibold mb-2">Các hoạt động gần đây</div>
                {loading ? <div>Đang tải dữ liệu...</div> : (
                    <ul className="divide-y">
                        {orders.map((order, i) => (
                            <li key={i} className="py-2 flex items-center gap-2 text-sm">
                                <div>
                                    <div>
                                        <span className="text-blue-600">Khách hàng </span>
                                        <span className='font-bold text-rose-500'>{order.fullName || order.email || 'Khách'}</span>
                                        <span> vừa mua đơn hàng với trị giá </span>
                                        <span className="font-semibold text-green-600">{order.total?.toLocaleString('vi-VN')}đ </span>
                                    </div>
                                    <span className="text-gray-400 ml-auto">{timeago.format(order.createdAt)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    function BestSaleProduct() {
        const [products, setProducts] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=5&sortBy=soldCount&order=desc`)
                .then(res => res.json())
                .then(res => {
                    setProducts(res.products || res.data || []);
                })
                .finally(() => setLoading(false));
        }, []);

        return (
            <div className="bg-white rounded shadow p-6 mb-8">
                <div className="font-semibold mb-2">Sản phẩm bán chạy nhất</div>
                {loading ? <div>Đang tải dữ liệu...</div> : (
                    <div>
                        {products.map((product, i) => (
                            <div key={i} className="py-2 text-sm font-medium text-gray-700 border-b last:border-b-0">{product.name}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <main className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {summaryCards.map((card, i) => (
                        <SummaryCard key={i} {...card} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-white rounded shadow p-6 mb-8">
                        <SalesChart />
                    </div>
                    <div>
                        <div className="bg-white rounded shadow p-6 mb-8">
                            <RecentActivity />
                        </div>
                        <BestSaleProduct />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
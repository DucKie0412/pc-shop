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
import vi from 'timeago.js/lib/lang/vi';
timeago.register('vi', vi);
import * as XLSX from 'xlsx';
// If using TypeScript and @types/file-saver is not installed, add a module declaration
// @ts-ignore
import { saveAs } from 'file-saver';

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
        const [startDate, setStartDate] = useState<string>("");
        const [endDate, setEndDate] = useState<string>("");
        const [startMonth, setStartMonth] = useState<string>("");
        const [endMonth, setEndMonth] = useState<string>("");

        // Helper to format date to yyyy-mm-dd
        const formatDate = (date: Date) => date.toISOString().slice(0, 10);
        // Helper to format month to yyyy-mm
        const formatMonth = (date: Date) => date.toISOString().slice(0, 7);

        useEffect(() => {
            setLoading(true);
            let url = `${process.env.NEXT_PUBLIC_API_URL}/orders/revenue?mode=${mode}`;
            if (mode === 'day' && startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            if (mode === 'month' && startMonth && endMonth) {
                url += `&startMonth=${startMonth}&endMonth=${endMonth}`;
            }
            fetch(url)
                .then(res => res.json())
                .then(res => {
                    const now = new Date();
                    const labelsArr = res.data?.labels || [];
                    const dataArr = res.data?.data || [];
                    if (mode === 'day') {
                        let fullLabels: string[] = [];
                        if (startDate && endDate) {
                            const start = new Date(startDate);
                            const end = new Date(endDate);
                            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                fullLabels.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);
                            }
                        } else {
                            const days = getDaysInMonth(now.getFullYear(), now.getMonth());
                            fullLabels = Array.from({ length: days }, (_, i) =>
                                `${(i + 1).toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
                            );
                        }
                        setLabels(fullLabels);
                        const dataMap: Record<string, number> = {};
                        if (Array.isArray(labelsArr) && Array.isArray(dataArr)) {
                            labelsArr.forEach((label: string, i: number) => { dataMap[label] = dataArr[i]; });
                        }
                        const chartData = fullLabels.map(label => dataMap[label] || 0);
                        setData(chartData);
                    } else {
                        // mode === 'month'
                        let fullLabels: string[] = [];
                        if (startMonth && endMonth) {
                            const [startY, startM] = startMonth.split('-').map(Number);
                            const [endY, endM] = endMonth.split('-').map(Number);
                            let y = startY, m = startM;
                            while (y < endY || (y === endY && m <= endM)) {
                                fullLabels.push(`${m.toString().padStart(2, '0')}/${y}`);
                                m++;
                                if (m > 12) { m = 1; y++; }
                            }
                        } else {
                            fullLabels = Array.from({ length: 12 }, (_, i) =>
                                `${(i + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
                            );
                        }
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
        }, [mode, startDate, endDate, startMonth, endMonth]);

        const handleExport = () => {
            const wsData = [
                [mode === 'day' ? 'Ngày' : 'Tháng', 'Doanh thu (triệu đồng)'],
                ...labels.map((label, i) => [label, data[i]])
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Revenue');
            const filename = `revenue_${mode}_${new Date().toISOString().slice(0,10)}.xlsx`;
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);
        };

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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                    <div className="font-semibold">Doanh thu thuần {mode === 'day' ? 'theo ngày' : 'theo tháng'}</div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <button
                            className={`px-3 py-1 rounded ${mode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setMode('day')}
                        >Theo ngày</button>
                        <button
                            className={`px-3 py-1 rounded ${mode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setMode('month')}
                        >Theo tháng</button>
                        {mode === 'day' && (
                            <>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
                                <span>-</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
                            </>
                        )}
                        {mode === 'month' && (
                            <>
                                <input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} className="border rounded px-2 py-1" />
                                <span>-</span>
                                <input type="month" value={endMonth} onChange={e => setEndMonth(e.target.value)} className="border rounded px-2 py-1" />
                            </>
                        )}
                        <button
                            className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                            onClick={handleExport}
                            type="button"
                        >Xuất ra Excel</button>
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
                                    <span className="text-gray-400 ml-auto">{timeago.format(order.createdAt, 'vi')}</span>
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
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=30&sortBy=soldCount&order=desc`)
                .then(res => res.json())
                .then(res => {
                    setProducts(res.products || res.data || []);
                })
                .finally(() => setLoading(false));
        }, []);

        if (loading) {
            return (
                <div className="bg-white rounded shadow p-6 mb-8">
                    <div className="font-semibold mb-2">Sản phẩm bán chạy nhất</div>
                    <div>Đang tải dữ liệu...</div>
                </div>
            );
        }

        // Duplicate the list for seamless looping
        const scrollingProducts = [...products, ...products];
        const itemHeight = 40; // px, adjust if needed
        const visibleCount = 3; // number of visible items
        const scrollDuration = products.length * 2; // seconds, adjust speed

        return (
            <div className="bg-white rounded shadow p-6 mb-8">
                <div className="font-semibold mb-2">Sản phẩm bán chạy nhất</div>
                <div
                    style={{
                        height: `${itemHeight * visibleCount}px`,
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            animation: `scrollUp ${scrollDuration}s linear infinite`
                        }}
                    >
                        {scrollingProducts.map((product, i) => (
                            <div key={i} style={{ height: `${itemHeight}px` }} className="flex items-center text-sm font-medium text-gray-700 border-b last:border-b-0">
                                {product.name}
                            </div>
                        ))}
                    </div>
                </div>
                <style jsx>{`
                    @keyframes scrollUp {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(-${products.length * itemHeight}px); }
                    }
                `}</style>
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
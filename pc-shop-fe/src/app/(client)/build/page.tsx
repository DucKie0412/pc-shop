"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download, X } from "lucide-react";
import { sendRequest } from '@/utils/api';
import { useSession } from 'next-auth/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { setProduct, removeProduct, setQuantity, clearBuild, setBuildState, setAllProducts } from '@/lib/features/buildPCSlice';
import { useCart } from '@/lib/hooks/useCart';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const CATEGORIES = [
    { key: "cpu", label: "CPU", match: ["CPU"] },
    { key: "mainboard", label: "MAINBOARD", match: ["MAINBOARD"] },
    { key: "ram", label: "RAM", match: ["RAM"] },
    { key: "gpu", label: "CARD ĐỒ HỌA", match: ["CARD ĐỒ HỌA", "VGA"] },
    { key: "storage", label: "Ổ CỨNG", match: ["Ổ CỨNG", "SSD", "HDD"] },
    { key: "psu", label: "NGUỒN (PSU)", match: ["NGUỒN", "PSU"] },
    { key: "cooler", label: "TẢN NHIỆT", match: ["TẢN NHIỆT", "COOLER"] },
    { key: "case", label: "VỎ CASE", match: ["VỎ CASE", "CASE"] },
    { key: "monitor", label: "MÀN HÌNH", match: ["MÀN HÌNH", "MONITOR"] },
];

export default function BuildPCPage() {
    const { data: session } = useSession();
    const allProducts = useSelector((state: RootState) => state.buildPC.allProducts) || [];
    const selected = useSelector((state: RootState) => state.buildPC.selected);
    const quantities = useSelector((state: RootState) => state.buildPC.quantities);
    const dispatch = useDispatch();
    const [modalCat, setModalCat] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const { addToCart, addMultipleToCart } = useCart();

    // LocalStorage sync
    useEffect(() => {
        const saved = localStorage.getItem('buildPC');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                dispatch(setBuildState(parsed));
            } catch { }
        }
    }, [dispatch]);
    useEffect(() => {
        localStorage.setItem('buildPC', JSON.stringify({ selected, quantities }));
    }, [selected, quantities]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await sendRequest<any>({
                    url: '/api/products',
                    method: 'GET',
                    headers: session?.user?.accessToken ? { 'Authorization': `Bearer ${session.user.accessToken}` } : {},
                });
                dispatch(setAllProducts(res?.data || []));
            } catch (err) {
                dispatch(setAllProducts([]));
            }
        };
        fetchProducts();
    }, [session, dispatch]);

    // Group products by build category
    const productsByCat = useMemo(() => {
        const map: Record<string, any[]> = {};
        for (const cat of CATEGORIES) {
            map[cat.key] = allProducts.filter(p => cat.match.some(m => p.categoryId?.name?.toUpperCase().includes(m)));
        }
        return map;
    }, [allProducts]);

    const handleSelect = (cat: string, product: any) => {
        dispatch(setProduct({ cat, product }));
        setModalCat(null);
        setSearch("");
    };
    const handleRemove = (cat: string) => {
        dispatch(removeProduct(cat));
    };
    const handleQuantity = (cat: string, val: number) => {
        dispatch(setQuantity({ cat, quantity: val }));
    };
    const handleAddAllToCart = async () => {
        const items = Object.keys(selected).map(cat => {
            const product = selected[cat];
            const quantity = quantities[cat] || 1;
            return {
                productId: product._id,
                name: product.name,
                price: product.finalPrice,
                quantity,
                image: product.images?.[0] || '',
            };
        });
        if (items.length > 0) {
            await addMultipleToCart(items);
            toast.success("Đã thêm tất cả vào giỏ hàng!");
        } else {
            toast.info("Không có sản phẩm nào để thêm vào giỏ hàng.");
        }
    };
    const handleExportXLSX = async () => {
        const response = await fetch('/bao_gia_template.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const ws = workbook.Sheets["Trang tính1"];

        // Write date to A1
        const today = new Date();
        ws['A1'] = { t: 's', v: today.toLocaleDateString('vi-VN') + ' ' + today.toLocaleTimeString('vi-VN') };

        // Write column headers to A5:D5
        ws['A5'] = { t: 's', v: 'Tên sản phẩm' };
        ws['B5'] = { t: 's', v: 'Số lượng' };
        ws['C5'] = { t: 's', v: 'Giá (VND)' };
        ws['D5'] = { t: 's', v: 'Tổng cộng (VND)' };

        // Write product data starting at row 6
        const startRow = 5;
        const rows = Object.keys(selected).map((cat, idx) => {
            const product = selected[cat];
            const quantity = quantities[cat] || 1;
            return [
                product.name,
                quantity,
                product.finalPrice.toLocaleString(),   
                (product.finalPrice * quantity).toLocaleString(),
            ];
        });

        rows.forEach((row, i) => {
            row.forEach((cell, j) => {
                const cellRef = XLSX.utils.encode_cell({ r: startRow + 1 + i, c: j }); // +1 for header
                ws[cellRef] = { t: 's', v: cell };
            });
        });

        // Write total label and value
        const totalRow = startRow + 2 + rows.length;
        ws[XLSX.utils.encode_cell({ r: totalRow, c: 2 })] = { t: 's', v: 'Tổng tiền' };
        const total = rows.reduce((sum, row) => sum + Number(row[3].replace(/[^0-9]/g, '')), 0);
        ws[XLSX.utils.encode_cell({ r: totalRow, c: 3 })] = { t: 's', v: total.toLocaleString() + ' VND' };

        // Update worksheet range
        ws['!ref'] = `A1:D${totalRow + 1}`;

        XLSX.writeFile(workbook, 'bao_gia.xlsx');
    };
    const handleClearAll = () => {
        dispatch(clearBuild());
    };

    // Modal product list for current category
    const modalProducts = modalCat ? (productsByCat[modalCat] || []).filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    ) : [];

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-center mb-6">Tự Build Cấu Hình</h2>
            <div className="space-y-4">
                {CATEGORIES.map(cat => (
                    <div key={cat.key} className="bg-white rounded shadow p-4 flex items-center gap-4">
                        <div className="w-20 h-20 flex items-center justify-center rounded">
                            {selected[cat.key] && (
                                <img src={selected[cat.key].images?.[0] || "/no-image.png"} alt={cat.label} className="w-full h-full object-contain" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">{cat.label}</div>
                            {selected[cat.key] && <div>{selected[cat.key].name}</div>}
                        </div>
                        {selected[cat.key] ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span>Số lượng:</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={quantities[cat.key] || 1}
                                        onChange={e => handleQuantity(cat.key, Number(e.target.value))}
                                        className="w-16 border rounded px-2 py-1"
                                    />
                                    <button onClick={() => handleRemove(cat.key)} className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1"><Trash2 size={16} /> Xóa</button>
                                </div>
                            </>
                        ) : (
                            <button
                                className="bg-gray-700 text-white px-4 py-2 rounded"
                                onClick={() => setModalCat(cat.key)}
                                disabled={!(productsByCat[cat.key]?.length)}
                            >
                                Chọn {cat.label}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {/* Modal for product selection */}
            {modalCat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
                        <button className="absolute top-4 right-4 text-red-500 font-bold" onClick={() => setModalCat(null)}><X size={28} /></button>
                        <h3 className="text-xl font-bold mb-2">Chọn {CATEGORIES.find(c => c.key === modalCat)?.label}</h3>
                        <div className="mb-2 text-sm text-gray-500">Tổng số sản phẩm: {productsByCat[modalCat]?.length || 0}</div>
                        <input
                            className="border rounded px-3 py-2 mb-4 w-full"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="overflow-y-auto flex-1" style={{ maxHeight: 400 }}>
                            {modalProducts.length === 0 && <div className="text-center text-gray-400 py-8">Không có sản phẩm phù hợp.</div>}
                            {modalProducts.map((p: any) => (
                                <div key={p._id} className="flex items-center border-b py-2 gap-4">
                                    <img src={p.images?.[0] || "/no-image.png"} alt={p.name} className="w-14 h-14 object-contain rounded" />
                                    <div className="flex-1">
                                        <div className="font-semibold">{p.name}</div>
                                    </div>
                                    <div className="w-32 text-right font-bold">{p.finalPrice?.toLocaleString()} đ</div>
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded ml-4"
                                        onClick={() => handleSelect(modalCat, p)}
                                    >
                                        Chọn
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white rounded shadow p-4 mt-8">
                <h3 className="font-semibold mb-2">Tóm tắt cấu hình</h3>
                <table className="w-full text-sm mb-4 border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Hình ảnh</th>
                            <th className="p-2 border">Tên sản phẩm</th>
                            <th className="p-2 border">Số lượng</th>
                            <th className="p-2 border">Đơn giá (VND)</th>
                            <th className="p-2 border">Tổng cộng (VND)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(selected).map(cat => (
                            <tr key={cat}>
                                <td className="p-2 border"><img src={selected[cat].images?.[0] || "/no-image.png"} alt={selected[cat].name} className="w-12 h-12 object-contain" /></td>
                                <td className="p-2 border">{selected[cat].name}</td>
                                <td className="p-2 border text-center">{quantities[cat]}</td>
                                <td className="p-2 border text-right">{selected[cat].finalPrice?.toLocaleString()} đ</td>
                                <td className="p-2 border text-right">{(selected[cat].finalPrice * quantities[cat]).toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center">
                    <button onClick={handleClearAll} className="bg-red-500 text-white px-4 py-2 rounded">Xóa tất cả</button>
                    <div className="font-bold text-rose-600 text-lg">Tổng: {Object.keys(selected).reduce((sum, cat) => sum + (selected[cat].finalPrice || 0) * quantities[cat], 0).toLocaleString()}đ</div>
                </div>
                <div className="flex gap-4 mt-4">
                    <button onClick={handleAddAllToCart} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={18} /> Thêm tất cả vào giỏ</button>
                    <button onClick={handleExportXLSX} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><Download size={18} /> In báo giá</button>
                </div>
            </div>
        </div>
    );
} 
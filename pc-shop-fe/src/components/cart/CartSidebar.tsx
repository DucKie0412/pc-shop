'use client';

import React, { useRef, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/hooks/useCart';
import { formatCurrency } from '@/utils/format-currency';
import { toast } from 'react-toastify';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const { items, removeFromCart, updateQuantity, status } = useCart();
    const cartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            // If quantity would be less than 1, remove the item instead
            await handleRemoveItem(productId);
            return;
        }
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            toast.error('Lỗi hệ thống! Vui lòng thử lại sau!');
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            await removeFromCart(productId);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            toast.error('Lỗi hệ thống! Vui lòng thử lại sau!');
        }
    };

    if (!isOpen) return null;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div ref={cartRef} className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Giỏ hàng</h2>
                <button 
                    onClick={onClose} 
                    className="text-gray-500 hover:text-gray-700"
                    disabled={status === 'loading'}
                >
                    <X size={24} />
                </button>
            </div>
            {items.length === 0 ? (
                <p className="text-gray-500">Giỏ hàng trống</p>
            ) : (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.productId} className="flex items-center gap-4 border-b pb-4">
                            {item.image && (
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-16 h-16 object-cover rounded"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-medium line-clamp-2">{item.name}</h3>
                                <p className="text-gray-600">{formatCurrency(item.price)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        disabled={status === 'loading'}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="min-w-[2rem] text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        disabled={status === 'loading'}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                disabled={status === 'loading'}
                            >
                                <X size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <Link href="/checkout">
                    <button 
                        className="w-full bg-[#0088D1] text-white py-2 rounded-md mt-4 hover:bg-[#0077B8] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={items.length === 0 || status === 'loading'}
                    >
                        {status === 'loading' ? 'Đang xử lý...' : 'Thanh toán'}
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default CartSidebar; 
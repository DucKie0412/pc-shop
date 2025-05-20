import React, { useRef, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const { items, removeItem, updateItemQuantity } = useCart();
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

    if (!isOpen) return null;

    return (
        <div ref={cartRef} className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Giỏ hàng</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
            </div>
            {items.length === 0 ? (
                <p className="text-gray-500">Giỏ hàng trống</p>
            ) : (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.id} className="flex items-center gap-4 border-b pb-4">
                            {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />}
                            <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-gray-600">{item.price.toLocaleString('vi-VN')}đ</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-gray-700">
                                        <Minus size={16} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-gray-700">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                                <X size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span>{items.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <Link href="/checkout">
                    <button className="w-full bg-[#0088D1] text-white py-2 rounded-md mt-4 hover:bg-[#0077B8]">
                        Thanh toán
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default CartSidebar; 
'use client'
import React, { useEffect, useState } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { items, updateItemQuantity, removeItem, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [note, setNote] = useState('');

  const isValidPhone = (phone: string) => /^0[0-9]{9}$/.test(phone.replace(/-/g, ''));

  // Prefill for logged-in user
  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || '');
      setEmail(session.user.email || '');
      // Optionally fetch more user info (address, phone) if available
    }
  }, [session]);

  const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (!isValidPhone(value)) {
      setPhoneError('Số điện thoại không hợp lệ');
    } else {
      setPhoneError('');
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      fullName,
      email,
      address,
      phone,
      note,
      items: items.map(i => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      total,
      userId: session?.user?._id || undefined,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      toast.success('Đặt hàng thành công!');
      setFullName('');
      setEmail('');
      setAddress('');
      setPhone('');
      setNote('');
      clearCart();
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      const data = await res.json();
      toast.error(data.message || 'Có lỗi xảy ra khi đặt hàng.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cart Table */}
        <div>
          <h2 className="font-bold mb-2">Thông tin giỏ hàng</h2>
          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className='w-1/2'>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className='flex items-center gap-2'>
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    {item.name}
                  </td>
                  <td>{item.price.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </td>
                  <td>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                  <td>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeItem(item.id)}
                      title="Xóa sản phẩm"
                    >
                      <Trash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold text-red-600 text-xl">
            Tổng tiền: {total.toLocaleString('vi-VN')} đ
          </div>
        </div>

        {/* User Info Form */}
        <div>
          <h2 className="font-bold mb-2">Thông tin người mua</h2>
          <form className="bg-white p-4 rounded shadow space-y-4" onSubmit={handleOrder}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ tên</label>
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={!!session?.user?.name}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!!session?.user?.email}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
              {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-bold">
              ĐẶT HÀNG
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 
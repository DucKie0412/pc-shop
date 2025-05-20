import React, { useState } from 'react';

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

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/lookup?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
        setError('Không tìm thấy đơn hàng hoặc dữ liệu trả về không hợp lệ.');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Tra cứu đơn hàng</h2>
        <form className="mb-6" onSubmit={handleLookup}>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
              placeholder="Số điện thoại"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">Tra cứu</button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </form>
        {loading ? (
          <div>Đang tải...</div>
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <div>Không có đơn hàng nào.</div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {orders.map(order => (
              <div key={order._id} className="border rounded p-4 bg-white shadow">
                <div className="flex justify-between items-center mb-2">
                  <div><span className="font-bold">Mã đơn:</span> {order._id}</div>
                  <div><span className="font-bold">Ngày đặt:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                  {order.status && <div><span className="font-bold">Trạng thái:</span> {order.status}</div>}
                </div>
                <div>
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th></th>
                        <th>Sản phẩm</th>
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
    </div>
  );
};

export default OrderLookupModal; 
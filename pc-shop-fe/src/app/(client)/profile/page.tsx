"use client"

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';

const ProfilePage = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?._id) {
            setLoading(true);
            sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/users/${session.user._id}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            }).then(userData => {
                setUser(userData.data);
            }).finally(() => setLoading(false));
        }
    }, [session, status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Đổi mật khẩu thành công! (Chức năng mẫu)');
        setForm({ current: '', new: '', confirm: '' });
    };

    if (status === 'loading' || loading) {
        return <div className="text-center py-10">Đang tải thông tin...</div>;
    }
    if (!user) {
        return <div className="text-center py-10 text-red-500">Không tìm thấy thông tin người dùng.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <div className="flex items-center gap-4">
                <img src={user.avatar || 'https://i.pravatar.cc/150?img=3'} alt="avatar" className="w-20 h-20 rounded-full border" />
                <div>
                    <div className="text-xl font-bold">{user.name}</div>
                    <div className="text-gray-500">{user.email}</div>
                    <div className="mt-2 text-blue-600 font-semibold">Điểm tích lũy: {user.points ?? 0}</div>
                </div>
            </div>
            <div className="bg-white rounded shadow p-6">
                <div className="font-semibold mb-4">Đổi mật khẩu</div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu hiện tại</label>
                        <input type="password" name="current" value={form.current} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu mới</label>
                        <input type="password" name="new" value={form.new} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Xác nhận mật khẩu mới</label>
                        <input type="password" name="confirm" value={form.confirm} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Đổi mật khẩu
                    </button>
                    {message && <div className="text-green-600 mt-2">{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;


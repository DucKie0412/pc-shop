"use client"

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [message, setMessage] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', address: '', phone: '' });
    const [editMessage, setEditMessage] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

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

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                address: user.address || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!form.current || !form.new || !form.confirm) {
            setMessage('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (form.new !== form.confirm) {
            setMessage('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (form.new.length < 6) {
            setMessage('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        setPasswordLoading(true);
        setMessage('');

        try {
            // Send verification code to email
            const res = await sendRequest<IBackendRes<any>>({
                method: "POST",
                url: `${process.env.NEXT_PUBLIC_API_URL}/auth/send-code`,
                body: {
                    email: user.email
                }
            });

            if (res?.statusCode === 400) {
                setMessage('Không tìm thấy tài khoản!');
            } else if (res?.statusCode === 201) {
                toast.success("Mã code đổi mật khẩu đã được gửi đến email của bạn!", { autoClose: 4000 });
                // Redirect to change password page with email as query param
                window.location.href = `/auth/change-password?email=${encodeURIComponent(user.email)}`;
            } else {
                setMessage('Lỗi hệ thống! Vui lòng thử lại sau!');
            }
        } catch (error) {
            setMessage('Lỗi hệ thống! Vui lòng thử lại sau!');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        setEditMessage('');
        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/users`,
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                },
                body: {
                    _id: user._id,
                    name: editForm.name,
                    address: editForm.address,
                    phone: editForm.phone,
                },
            });
            if (res?.statusCode === 200) {
                setEditMessage('Cập nhật thông tin thành công!');
                setUser({ ...user, ...editForm });
                setEditMode(false);
            } else {
                setEditMessage(res?.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            setEditMessage('Cập nhật thất bại');
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        setEditForm({
            name: user.name || '',
            address: user.address || '',
            phone: user.phone || '',
        });
        setEditMode(false);
        setEditMessage('');
    };

    if (status === 'loading' || loading) {
        return <div className="text-center py-10">Đang tải thông tin...</div>;
    }
    if (!user) {
        return <div className="text-center py-10 text-red-500">Không tìm thấy thông tin người dùng.</div>;
    }

    return (
        <div className="flex justify-between max-w-2xl mx-auto py-10 space-y-8">
            <div className="flex flex-col items-start gap-6 w-1/2">
                <div className="flex items-center gap-4">
                    <img src={user.avatar || 'https://i.pravatar.cc/150?img=3'} alt="avatar" className="w-20 h-20 rounded-full border" />
                    <div>
                        <div className="text-xl font-bold">{user.name}</div>
                        <div className="text-gray-500">{user.email}</div>
                        <div className="mt-2 text-blue-600 font-semibold">Điểm tích lũy: {user.points ?? 0}</div>
                    </div>
                </div>
                <div className="bg-white rounded shadow p-6 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">Thông tin cá nhân</div>
                        {!editMode && (
                            <button className="text-blue-600 hover:underline" onClick={() => setEditMode(true)}>
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">Tên</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    required
                                    disabled={editLoading}
                                />
                            ) : (
                                <div className="mt-1">{user.name}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Địa chỉ</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={editForm.address}
                                    onChange={handleEditChange}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    required
                                    disabled={editLoading}
                                />
                            ) : (
                                <div className="mt-1">{user.address || <span className="text-gray-400">Chưa cập nhật</span>}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Số điện thoại</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    required
                                    disabled={editLoading}
                                />
                            ) : (
                                <div className="mt-1">{user.phone || <span className="text-gray-400">Chưa cập nhật</span>}</div>
                            )}
                        </div>
                        {editMode && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                    onClick={handleEditSave}
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                    onClick={handleEditCancel}
                                    disabled={editLoading}
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                        {editMessage && <div className={`mt-2 ${editMessage.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{editMessage}</div>}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded shadow p-6 w-1/2 ml-6">
                <div className="font-semibold mb-4">Đổi mật khẩu</div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            name="current"
                            value={form.current}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                            required
                            disabled={passwordLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu mới</label>
                        <input
                            type="password"
                            name="new"
                            value={form.new}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                            required
                            disabled={passwordLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                            required
                            disabled={passwordLoading}
                        />
                    </div>
                    <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={passwordLoading}
                        onClick={async () => {
                            // Validate form
                            if (!form.current || !form.new || !form.confirm) {
                                setMessage('Vui lòng điền đầy đủ thông tin!');
                                return;
                            }
                            if (form.new !== form.confirm) {
                                setMessage('Mật khẩu xác nhận không khớp!');
                                return;
                            }
                            if (form.new.length < 6) {
                                setMessage('Mật khẩu mới phải có ít nhất 6 ký tự!');
                                return;
                            }
                            setPasswordLoading(true);
                            setMessage('');
                            try {
                                const res = await sendRequest<IBackendRes<any>>({
                                    method: "POST",
                                    url: `${process.env.NEXT_PUBLIC_API_URL}/auth/send-code`,
                                    body: { email: user.email }
                                });
                                if (res?.statusCode === 400) {
                                    setMessage('Không tìm thấy tài khoản!');
                                } else if (res?.statusCode === 201) {
                                    toast.success("Mã code đổi mật khẩu đã được gửi đến email của bạn!", { autoClose: 4000 });
                                    // Redirect to change password page with email as query param
                                    window.location.href = `/auth/change-password?email=${encodeURIComponent(user.email)}`;
                                } else {
                                    setMessage('Lỗi hệ thống! Vui lòng thử lại sau!');
                                }
                            } catch (error) {
                                setMessage('Lỗi hệ thống! Vui lòng thử lại sau!');
                            } finally {
                                setPasswordLoading(false);
                            }
                        }}
                    >
                        {passwordLoading ? 'Đang gửi mã code...' : 'Đổi mật khẩu'}
                    </button>
                    {message && <div className={`mt-2 ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;


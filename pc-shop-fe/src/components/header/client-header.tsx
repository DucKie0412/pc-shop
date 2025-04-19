"use client";
import { useEffect, useState, useRef } from "react";
import { Menu, Search, ShoppingCart, User, LogOut, UserCircle, Settings, History } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

function Header() {
    const [open, setOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { data: session, status } = useSession();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    console.log(session?.user?.name);
    return (
        <header className="relative">
            <div className="bg-[#0088D1] text-white shadow-md">
                {/* --- Top Header --- */}
                <div className="container mx-auto">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="basis-1/5 flex items-center">
                            <Link href="/">
                                <img src="/logo.svg" alt="Logo" className="h-12" />
                            </Link>
                        </div>

                        <div className="hidden md:flex gap-4 flex-[2]">
                            <div className="flex-[2] flex items-center bg-white px-4 py-2 rounded-full shadow-sm border text-black">
                                <select className="outline-none border-r pr-2 text-gray-600">
                                    <option>Tất cả danh mục</option>
                                    <option>PC GAMING</option>
                                    <option>PC WORKSTATION</option>
                                    <option>PC AMD GAMING</option>
                                    <option>PC VĂN PHÒNG</option>
                                    <option>PC GIẢ LẬP ẢO HÓA</option>
                                    <option>LINH KIỆN MÁY TÍNH</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full outline-none text-gray-600 placeholder-gray-400 px-2"
                                />
                                <button className="bg-[#0088D1] text-white p-2 rounded-md ml-2 hover:bg-[#0077B8]">
                                    <Search size={15} />
                                </button>
                            </div>
                            <div className="flex flex-1 justify-end gap-6 items-center">
                                {status === "authenticated" ? (
                                    <div className="relative group" ref={userMenuRef}>
                                        <div 
                                            className="flex items-center gap-2 cursor-pointer hover:text-yellow-200"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                        >
                                            <div className="rounded-full bg-white p-2">
                                                <User size={20} className="text-[#0088D1]" />
                                            </div>
                                            <div className="flex flex-col text-sm gap-1">
                                                <span className="font-bold">{session?.user?.name}</span>
                                            </div>
                                        </div>

                                        {/* User Dropdown Menu */}
                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                                <div className="py-1">
                                                    <Link 
                                                        href="/profile" 
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0088D1]"
                                                    >
                                                        <UserCircle className="w-4 h-4 mr-2" />
                                                        Thông tin cá nhân
                                                    </Link>
                                                    <Link 
                                                        href="/orders" 
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0088D1]"
                                                    >
                                                        <History className="w-4 h-4 mr-2" />
                                                        Đơn hàng của tôi
                                                    </Link>
                                                    <Link 
                                                        href="/settings" 
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0088D1]"
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        Cài đặt
                                                    </Link>
                                                    <button
                                                        onClick={() => signOut()}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0088D1]"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Đăng xuất
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 ">
                                        <div className="rounded-full bg-white p-2">
                                            <User size={20} className="text-[#0088D1]" />
                                        </div>
                                        <div className="flex flex-row text-sm gap-2">
                                            <Link href="/auth/login"><span className="font-bold cursor-pointer hover:text-yellow-200">Đăng nhập</span></Link>
                                            <span> | </span>
                                            <Link href="/auth/register"><span className="font-bold cursor-pointer hover:text-yellow-200">Đăng ký</span></Link>
                                        </div>
                                    </div>
                                )}
                                <div className="relative">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <div className="rounded-full bg-white p-2 relative">
                                            <ShoppingCart size={20} className="text-[#0088D1]" />
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">0</span>
                                        </div>
                                        <span>Giỏ hàng</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
                            <Menu size={28} />
                        </button>
                    </div>

                    {/* --- Navigation --- */}
                    <nav className="hidden md:block bg-[#0088D1] border-t border-[#0077B8]">
                        <div className="container mx-auto">
                            <div className="flex px-6 py-2 gap-6 items-center text-sm font-medium">
                                <div className="relative group">
                                    <button
                                        className="bg-[#FFB800] text-[#0088D1] px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#f0af00] transition-colors"
                                    >
                                        <Menu size={20} />
                                        DANH MỤC SẢN PHẨM
                                    </button>

                                    {/* Mega Menu */}
                                    <div className="absolute mt-5 left-0 w-[800px] bg-white shadow-lg z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                                        <div className="p-6">
                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">PC GAMING</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Gaming giá rẻ</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Gaming tầm trung</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Gaming cao cấp</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Gaming siêu cao cấp</li>
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">PC WORKSTATION</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Render & Design</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Đồ họa chuyên nghiệp</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Machine Learning</li>
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">LINH KIỆN MÁY TÍNH</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">CPU - Bộ vi xử lý</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">Mainboard - Bo mạch chủ</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">VGA - Card màn hình</li>
                                                        <li className="hover:text-[#0088D1] cursor-pointer transition-colors">RAM - Bộ nhớ trong</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link href="#" className="hover:text-gray-200 transition-colors">PC GAMING, STREAMING</Link>
                                <Link href="#" className="hover:text-gray-200 transition-colors">PC WORKSTATION</Link>
                                <Link href="#" className="hover:text-gray-200 transition-colors">PC AMD GAMING</Link>
                                <Link href="#" className="hover:text-gray-200 transition-colors">PC VĂN PHÒNG</Link>
                                <Link href="#" className="hover:text-gray-200 transition-colors">PC GIẢ LẬP ẢO HÓA</Link>
                                <Link href="#" className="hover:text-gray-200 transition-colors">LINH KIỆN MÁY TÍNH</Link>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* --- Mobile dropdown --- */}
            {open && (
                <div className="md:hidden bg-white text-black">
                    <div className="p-4 border-b">
                        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full border">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full outline-none"
                            />
                            <button className="bg-[#0088D1] text-white p-2 rounded-md ml-2">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="divide-y">
                        {status === "authenticated" ? (
                            <div className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User size={20} className="text-[#0088D1]" />
                                        <div>
                                            <div className="font-bold">{session?.user?.name}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 pl-8 space-y-2">
                                    <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-[#0088D1]">
                                        <UserCircle size={16} />
                                        Thông tin cá nhân
                                    </Link>
                                    <Link href="/orders" className="flex items-center gap-2 text-gray-700 hover:text-[#0088D1]">
                                        <History size={16} />
                                        Đơn hàng của tôi
                                    </Link>
                                    <Link href="/settings" className="flex items-center gap-2 text-gray-700 hover:text-[#0088D1]">
                                        <Settings size={16} />
                                        Cài đặt
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="flex items-center gap-2 text-gray-700 hover:text-[#0088D1]"
                                    >
                                        <LogOut size={16} />
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 hover:bg-gray-50">
                                <Link href="/auth/login" className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User size={20} className="text-[#0088D1]" />
                                        <div>
                                            <div className="font-bold">Đăng nhập</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}
                        <div className="p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={20} className="text-[#0088D1]" />
                                <div>
                                    <div className="font-bold">Giỏ hàng</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="font-bold mb-2">DANH MỤC SẢN PHẨM</div>
                            <ul className="space-y-2 pl-2">
                                <li className="hover:text-[#0088D1] cursor-pointer">PC GAMING, STREAMING</li>
                                <li className="hover:text-[#0088D1] cursor-pointer">PC WORKSTATION</li>
                                <li className="hover:text-[#0088D1] cursor-pointer">PC AMD GAMING</li>
                                <li className="hover:text-[#0088D1] cursor-pointer">PC VĂN PHÒNG</li>
                                <li className="hover:text-[#0088D1] cursor-pointer">PC GIẢ LẬP ẢO HÓA</li>
                                <li className="hover:text-[#0088D1] cursor-pointer">LINH KIỆN MÁY TÍNH</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;

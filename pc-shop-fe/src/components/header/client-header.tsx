"use client";
import { useEffect, useState, useRef } from "react";
import { Menu, Search, ShoppingCart, User, LogOut, UserCircle, Settings, History } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from '@/lib/hooks/useCart';

import CartSidebar from '@/components/cart/CartSidebar';
import OrderLookupModal from './OrderLookupModal';

function Header() {
    const [open, setOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { data: session, status } = useSession();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");
    const { items } = useCart();
    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);

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
                            <form
                                className="flex-[2] flex items-center bg-white px-4 py-2 rounded-full shadow-sm border text-black"
                                onSubmit={e => {
                                    e.preventDefault();
                                    if (!searchInput.trim()) return;
                                    if (searchCategory === "all") {
                                        router.push(`/search?query=${encodeURIComponent(searchInput)}`);
                                    } else {
                                        router.push(`/search?query=${encodeURIComponent(searchInput)}&type=${searchCategory}`);
                                    }
                                }}
                            >
                                <select
                                    className="outline-none border-r pr-2 text-gray-600"
                                    value={searchCategory}
                                    onChange={e => setSearchCategory(e.target.value)}
                                >
                                    <option value="all">Tất cả danh mục</option>
                                    <option value="cpu">CPU</option>
                                    <option value="mainboard">MAINBOARD</option>
                                    <option value="vga">VGA</option>
                                    <option value="ram">RAM</option>
                                    <option value="hdd">HDD</option>
                                    <option value="ssd">SSD</option>
                                    <option value="psu">PSU</option>
                                    <option value="case">CASE</option>
                                    <option value="fan">FAN</option>
                                    <option value="other">PHU KIEN MÁY TÍNH</option>
                                </select>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full outline-none text-gray-600 placeholder-gray-400 px-2"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#0088D1] text-white p-2 rounded-md ml-2 hover:bg-[#0077B8]"
                                >
                                    <Search size={15} />
                                </button>
                            </form>
                            <div className="flex flex-2 justify-end gap-6 items-center">
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
                                                        href="/admin/dashboard" 
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
                                        <div>
                                        <button
                                            className="ml-2 text-sm underline text-white hover:text-yellow-200"
                                            onClick={() => setIsOrderLookupOpen(true)}
                                        >
                                            Tra cứu đơn hàng
                                        </button>
                                    </div>
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
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCartOpen(true)}>
                                        <div className="rounded-full bg-white p-2 relative">
                                            <ShoppingCart size={20} className="text-[#0088D1]" />
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cartCount}</span>
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
                                    <div className="absolute mt-5 left-0 w-[1200px] bg-white shadow-lg z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                                        <div className="p-6">
                                            <div className="grid grid-cols-6 gap-6">
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">CPU</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Intel Core",
                                                            "AMD Ryzen",
                                                            "Intel Xeon",
                                                            "AMD Threadripper",
                                                            "Celeron"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">MAINBOARD</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "ASROCK",
                                                            "GIGABYTE",
                                                            "MSI",
                                                            "ASUS"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">RAM</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Corsair",
                                                            "G.SKILL",
                                                            "Kingston",
                                                            "Crucial"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">VGA</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "NVIDIA",
                                                            "ZOTAC",
                                                            "ASUS",
                                                            "GIGABYTE"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">HDD</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Seagate",
                                                            "WD",
                                                            "Samsung"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">SSD</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Samsung",
                                                            "WD",
                                                            "Kingston"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">PSU</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "MSI",
                                                            "Cooler Master",
                                                            "Corsair"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">CASE</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Edra",
                                                            "Fractal Design",
                                                            "Phanteks",
                                                            "NZXT"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">FAN</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Leopard",
                                                            "Phanteks",
                                                            "NZXT"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-[#0088D1] border-b pb-2">PHU KIEN MÁY TÍNH</h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        {[
                                                            "Headphone",
                                                            "Mouse",
                                                            "Keyboard",
                                                            "Mousepad",
                                                            "Webcam",
                                                            "Microphone"
                                                        ].map(item => (
                                                            <li
                                                                key={item}
                                                                className="hover:text-[#0088D1] cursor-pointer transition-colors"
                                                                onClick={() => router.push(`/search?query=${encodeURIComponent(item)}`)}
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/category/cpu" className="hover:text-gray-200 transition-colors">CPU</Link>
                                <Link href="/category/mainboard" className="hover:text-gray-200 transition-colors">MAINBOARD</Link>
                                <Link href="/category/vga" className="hover:text-gray-200 transition-colors">VGA GAMING</Link>
                                <Link href="/category/ram" className="hover:text-gray-200 transition-colors">RAM</Link>
                                <Link href="/category/hdd" className="hover:text-gray-200 transition-colors">HDD</Link>
                                <Link href="/category/ssd" className="hover:text-gray-200 transition-colors">SSD</Link>
                                <Link href="/category/psu" className="hover:text-gray-200 transition-colors">PSU</Link>
                                <Link href="/category/case" className="hover:text-gray-200 transition-colors">CASE</Link>
                                <Link href="/category/fan" className="hover:text-gray-200 transition-colors">FAN</Link>
                                <Link href="/category/other" className="hover:text-gray-200 transition-colors">PHU KIEN MÁY TÍNH</Link>
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
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <OrderLookupModal isOpen={isOrderLookupOpen} onClose={() => setIsOrderLookupOpen(false)} />
        </header>
    );
}

export default Header;

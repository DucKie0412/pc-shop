import React from "react";

function ClientFooter() {
  return (
    <footer className="bg-[#f7f7f7] border-t mt-10 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold mb-2 text-[#0088D1]">GIỚI THIỆU</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Giới thiệu công ty</a></li>
              <li><a href="#" className="hover:underline">Thông tin liên hệ</a></li>
              <li><a href="#" className="hover:underline">Tin tức</a></li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h3 className="font-bold mb-2 text-[#0088D1]">HỖ TRỢ KHÁCH HÀNG</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Hướng dẫn mua hàng trực tuyến</a></li>
              <li><a href="#" className="hover:underline">Hướng dẫn thanh toán</a></li>
              <li><a href="#" className="hover:underline">Góp ý, Khiếu Nại</a></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h3 className="font-bold mb-2 text-[#0088D1]">CHÍNH SÁCH CHUNG</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Chính sách vận chuyển</a></li>
              <li><a href="#" className="hover:underline">Chính sách thanh toán</a></li>
              <li><a href="#" className="hover:underline">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:underline">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:underline">Bảo mật thông tin khách hàng</a></li>
            </ul>
          </div>
        </div>

        {/* Social and payment row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t pt-4">
          {/* Social icons */}
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/images/facebook.svg" alt="Facebook" className="h-8 w-8" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/images/instagram.svg" alt="Instagram" className="h-8 w-8" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <img src="/images/youtube.svg" alt="YouTube" className="h-8 w-8" />
            </a>
          </div>
          {/* Payment icons */}
          <div className="flex flex-wrap items-center gap-3">
            <img src="/images/zalopay.png" alt="ZaloPay" className="h-7" />
            <img src="/images/alepay.png" alt="AlePay" className="h-7" />
            <img src="/images/mastercard.png" alt="Mastercard" className="h-7" />
            <img src="/images/momo.png" alt="Momo" className="h-7" />
            <img src="/images/visa.png" alt="Visa" className="h-7" />
            <img src="/images/vnpay.png" alt="VNPAY" className="h-7" />
            <img src="/images/atm.png" alt="ATM" className="h-7" />
          </div>
        </div>

        {/* Company info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <div>
            Duckie Store<br />
            Trụ sở: Quận Đống Đa, Thành phố Hà Nội, Việt Nam<br />
            Email: duckie.store@gmail.com &nbsp;|&nbsp; Tel: 012 345 2351
          </div>
          <div className="mt-2">
            Copyright ©2025 Duckie Store
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ClientFooter;
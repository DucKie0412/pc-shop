'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sendRequest } from '@/utils/api';
import { useCart } from '@/lib/hooks/useCart';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface IProduct {
    _id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    images: string[];
    finalPrice: number;
    categoryId: { name: string };
    specs: Record<string, string>;
    details: Array<{ title: string; content: string; image?: string }>;
}

// Add spec mapping object
const specLabels: Record<string, string> = {
    // CPU specs
    'cpuSocket': 'Socket',
    'cpuCores': 'Số nhân',
    'cpuThreads': 'Số luồng',
    'cpuBaseSpeed': 'Tốc độ cơ bản (GHz)',
    'cpuBoostSpeed': 'Tốc độ tối đa (GHz)',
    'cpuCache': 'Bộ nhớ đệm (MB)',
    'cpuTdp': 'TDP (W)',

    // Monitor specs
    'monitorSize': 'Kích thước màn hình (inch)',
    'monitorResolution': 'Độ phân giải',
    'monitorRefreshRate': 'Tần số quét (Hz)',
    'monitorPanelType': 'Loại tấm nền',
    'monitorResponseTime': 'Thời gian phản hồi (ms)',

    // RAM specs
    'ramCapacity': 'Dung lượng (GB)',
    'ramType': 'Loại RAM',
    'ramSpeed': 'Tốc độ (MHz)',
    'ramLatency': 'Độ trễ (ns)',
    'ramKit': 'Loại kit RAM',

    // SSD specs
    'ssdCapacity': 'Dung lượng (GB)',
    'ssdType': 'Loại SSD',
    'ssdInterface': 'Chuẩn kết nối',
    'ssdFormFactor': 'Kích thước (mm)',
    'ssdReadSpeed': 'Tốc độ đọc (MB/s)',
    'ssdWriteSpeed': 'Tốc độ ghi (MB/s)',

    // HDD specs
    'hddCapacity': 'Dung lượng (GB)',
    'hddFormFactor': 'Kích thước (mm)',
    'hddInterface': 'Chuẩn kết nối',
    'hddRpm': 'Tốc độ quay (RPM)',
    'hddCache': 'Bộ nhớ đệm (MB)',

    // VGA specs
    'vgaVram': 'Bộ nhớ (GB)',
    'vgaVramType': 'Loại bộ nhớ',
    'vgaBoostSpeed': 'Tốc độ xung nhịp tối đa (MHz)',
    'vgaPCIExpress': 'Chuẩn PCI Express',
    'vgaDisplayPorts': 'Số cổng DisplayPort',
    'vgaHdmiPorts': 'Số cổng HDMI',
    'vgaVgaPorts': 'Số cổng VGA',
    'vgaDviPorts': 'Số cổng DVI',
    'vga6PinConnectors': 'Số cổng 6-pin',
    'vga6Plus2PinConnectors': 'Số cổng 6+2-pin',
    'vga8PinConnectors': 'Số cổng 8-pin',
    'vga12PinConnectors': 'Số cổng 12-pin',
    'vgaMaxTDP': 'TDP tối đa (W)',
    'vgaSize': 'Kích thước (mm)',

    // PSU specs
    'psuWattage': 'Công suất (W)',
    'psuEfficiency': 'Hiệu suất',
    'psuModular': 'Loại dây cáp',

    // Case specs
    'caseFormFactor': 'Kích thước',
    'caseMaterial': 'Chất liệu',
    'caseColor': 'Màu sắc',
    'caseDimensions': 'Kích thước (mm)',
    'caseFans': 'Quạt tản nhiệt',

    // Mainboard specs
    'mainboardBrand': 'CPU hỗ trợ',
    'mainboardChipset': 'Chipset',
    'mainboardSocket': 'Socket',
    'mainboardFormFactor': 'Kích thước',
    'mainboardMemoryType': 'Loại RAM',
    'mainboardMaxRamSlots': 'Số lượng khe RAM tối đa',
    'mainboardMaxMemory': 'Bộ nhớ RAM tối đa hỗ trợ (GB)',
    'mainboardSupportXMP': 'Có hỗ trợ XMP 2.0',
    'mainboardSupportEXPO': 'Có hỗ trợ EXPO',

    //shareSpecs
    'warranty': 'Bảo hành',

};

function ProductPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [mainImageIdx, setMainImageIdx] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const { addToCart, status } = useCart();
    const [modalImageIdx, setModalImageIdx] = useState<number | null>(null);
    const router = useRouter();

    const openModal = (idx: number) => {
        setModalImageIdx(idx);
    };
    const closeModal = () => {
        setModalImageIdx(null);
    };
    const showPrev = () => {
        if (product && modalImageIdx !== null) {
            setModalImageIdx((modalImageIdx - 1 + product.images.length) % product.images.length);
        }
    };
    const showNext = () => {
        if (product && modalImageIdx !== null) {
            setModalImageIdx((modalImageIdx + 1) % product.images.length);
        }
    };
    // For main image gallery
    const mainPrev = () => {
        if (product) {
            const newIdx = (mainImageIdx - 1 + product.images.length) % product.images.length;
            setMainImageIdx(newIdx);
            setMainImage(product.images[newIdx]);
        }
    };
    const mainNext = () => {
        if (product) {
            const newIdx = (mainImageIdx + 1) % product.images.length;
            setMainImageIdx(newIdx);
            setMainImage(product.images[newIdx]);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await sendRequest<IBackendRes<IProduct>>({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
                    method: 'GET',
                });

                if (res?.data) {
                    setProduct(res.data);
                    console.log(res.data);
                    console.log(product);
                    
                    setMainImage(res.data.images[0] || null);
                    setMainImageIdx(0);
                }
            } catch (err) {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (modalImageIdx !== null) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [modalImageIdx]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                productId: product._id,
                name: product.name,
                price: product.finalPrice,
                quantity: 1,
                image: product.images[0],
            });
            console.log('adding to cart', product._id, product.name);
            
            toast.success('Đã thêm sản phẩm vào giỏ hàng', { autoClose: 1200 });
        }
    };

    const handleBuyNow = () => {
        if (product) {
            addToCart({
                productId: product._id,
                name: product.name,
                price: product.finalPrice,
                quantity: 1,
                image: product.images[0],
            });
            toast.success('Chuyển hướng đến trang thanh toán...', { autoClose: 2000 });
            setTimeout(() => {
                router.push('/checkout');
            }, 2000);
        }
    };

    if (loading) return <div className="container mx-auto py-10">Loading...</div>;
    if (!product) return <div className="container mx-auto py-10">Product not found.</div>;

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: product.categoryId.name, href: `/category/${product.categoryId.name}` },
        { label: product.name }
    ];

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} />
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Image Gallery */}
                <div className="flex flex-col items-center md:w-1/2 relative group">
                    {/* Prev Button */}
                    {product && product.images.length > 1 && (
                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow rounded-full w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-opacity opacity-80 group-hover:opacity-100"
                            onClick={mainPrev}
                            style={{ outline: 'none' }}
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                    )}
                    {/* Main Image */}
                    {mainImage && (
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full max-w-md rounded-lg border mb-4 object-contain cursor-pointer"
                            style={{ height: 400 }}
                            onClick={() => openModal(mainImageIdx)}
                        />
                    )}
                    {/* Next Button */}
                    {product && product.images.length > 1 && (
                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow rounded-full w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-opacity opacity-80 group-hover:opacity-100"
                            onClick={mainNext}
                            style={{ outline: 'none' }}
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    )}
                    {/* Image Counter */}
                    {product && product.images.length > 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 mb-2 bg-gray-700 text-white text-xs px-3 py-1 rounded-full opacity-80">
                            {mainImageIdx + 1}/{product.images.length}
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        {product && product.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Product image ${idx + 1}`}
                                className={`w-20 h-20 object-cover rounded cursor-pointer border transition-transform duration-200 hover:scale-110 ${mainImage === img ? 'border-blue-500' : 'border-gray-200'}`}
                                onClick={() => {
                                    setMainImage(img);
                                    setMainImageIdx(idx);
                                }}
                            />
                        ))}
                    </div>
                </div>
                {/* Product Details */}
                <div className="md:w-1/2">
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <div className="flex items-center gap-4 mb-2">
                        {(() => {
                            return (
                                <>
                                    <span className="text-2xl font-bold text-red-600">{typeof product.finalPrice === 'number' ? product.finalPrice.toLocaleString() : 'N/A'}₫</span>
                                    {product.originalPrice > product.finalPrice && (
                                        <span className="text-lg line-through text-gray-400">{product.originalPrice.toLocaleString()}₫</span>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Thông số sản phẩm:</h2>
                        <div className="bg-gray-100 p-4 rounded">
                            {product.specs && Object.entries(product.specs).map(([key, value]) => {
                                // Skip display ports and power connectors with value 0
                                if (
                                    (key === 'vgaDisplayPorts' ||
                                        key === 'vgaHdmiPorts' ||
                                        key === 'vgaVgaPorts' ||
                                        key === 'vgaDviPorts' ||
                                        key === 'vga6PinConnectors' ||
                                        key === 'vga6Plus2PinConnectors' ||
                                        key === 'vga8PinConnectors' ||
                                        key === 'vga12PinConnectors') &&
                                    Number(value) === 0
                                ) {
                                    return null;
                                }
                                // Only show XMP/EXPO if true
                                if ((key === 'mainboardSupportXMP' || key === 'mainboardSupportEXPO') && String(value) !== 'true') {
                                    return null;
                                }
                                return (
                                    <div key={key} className="flex gap-2">
                                        <span className="font-semibold">{specLabels[key] || key}{key !== 'mainboardSupportXMP' && key !== 'mainboardSupportEXPO' ? ':' : ''}</span>
                                        <span>{value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleAddToCart} className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Thêm vào giỏ hàng</button>
                        <button onClick={handleBuyNow} className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Mua ngay</button>
                    </div>
                </div>
            </div>
            {/* Product Details Sections */}
            {product.details && product.details.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-2">Mô tả sản phẩm</h2>
                    <div>
                        {product.details.map((section, idx) => (
                            <div key={idx} className="mb-10">
                                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                                <div className="text-gray-700 whitespace-pre-line mb-4">{section.content}</div>
                                {section.image && (
                                    <img
                                        src={section.image}
                                        alt={section.title}
                                        className="w-[700px] h-[500px] object-cover mx-auto mb-6 rounded cursor-pointer"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                        onClick={() => {
                                            if (product && section.image) {
                                                const idx = product.images.findIndex(img => img === section.image);
                                                if (idx !== -1) openModal(idx);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                        <p className='text-gray-700 whitespace-pre-line'>Có thể thấy, đây là một sản phẩm hỗ trợ trải nghiệm giải trí cực đỉnh dành cho bạn.
                            Hiện sản phẩm đang được bán trên cửa hàng toàn quốc nhưng bạn có thể sở hữu được với
                            mức giá cực kỳ ưu đãi tại Duckie Store.</p>
                        <br />
                        <p className='text-gray-700 whitespace-pre-line mb-4'>Sản phẩm cũng được hưởng chính sách bảo hành tại cửa hàng và nhiều chương trình khuyến mãi
                            hấp dẫn khác khi mua sắm tại cửa hàng của chúng tôi. Duckie Store cam kết mang lại cho bạn sản
                            phẩm tốt nhất, chính hãng 100% với mức giá cực kỳ tiết kiệm và dịch vụ chăm sóc khách hàng tận tình.
                            Liên hệ ngay với chúng tôi để được đội ngũ hỗ trợ tư vấn chi tiết hơn về sản phẩm và đặt mua hàng nhanh chóng!</p>
                    </div>
                </section>
            )}
            {/* Modal navigation */}
            {modalImageIdx !== null && product && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={closeModal}
                >
                    <div
                        className="relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-white text-2xl bg-black bg-opacity-50 rounded-full px-2"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        {/* Prev Button */}
                        <button
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl rounded-full px-3 py-1"
                            onClick={showPrev}
                            style={{ zIndex: 10 }}
                        >
                            &#8592;
                        </button>
                        {/* Next Button */}
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl rounded-full px-3 py-1"
                            onClick={showNext}
                            style={{ zIndex: 10 }}
                        >
                            &#8594;
                        </button>
                        <div
                            className="flex items-center justify-center"
                            style={{ width: '90vw', height: '80vh', maxWidth: 900, maxHeight: 700 }}
                        >
                            <div
                                className="overflow-hidden rounded shadow-lg"
                                style={{ width: '100%', height: '100%', position: 'relative', background: '#222' }}
                            >
                                <img
                                    src={product.images[modalImageIdx]}
                                    alt="Zoomed"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductPage;
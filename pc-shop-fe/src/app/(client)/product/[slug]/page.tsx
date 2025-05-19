'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sendRequest } from '@/utils/api';

interface IProduct {
    _id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    images: string[];
    description: string;
    finalPrice: number;
    // add other fields as needed
}

function ProductPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                    setMainImage(res.data.images[0] || null);
                }
            } catch (err) {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    if (loading) return <div className="container mx-auto py-10">Loading...</div>;
    if (!product) return <div className="container mx-auto py-10">Product not found.</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Image Gallery */}
                <div className="flex flex-col items-center md:w-1/2">
                    {mainImage && (
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full max-w-md rounded-lg border mb-4 object-contain"
                            style={{ maxHeight: 400 }}
                        />
                    )}
                    <div className="flex gap-2 mt-2">
                        {product.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Product image ${idx + 1}`}
                                className={`w-20 h-20 object-cover rounded cursor-pointer border ${mainImage === img ? 'border-blue-500' : 'border-gray-200'}`}
                                onClick={() => setMainImage(img)}
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
                        <h2 className="text-lg font-semibold mb-1">Chi tiết sản phẩm:</h2>
                        <div className="bg-gray-100 p-4 rounded whitespace-pre-line">
                            {product.description}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Thêm vào giỏ hàng</button>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Mua ngay</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
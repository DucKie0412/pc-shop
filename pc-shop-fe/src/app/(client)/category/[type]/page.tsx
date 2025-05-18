"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IProduct } from "@/types/product";
import { sendRequest } from "@/utils/api";

export default function CategoryPage() {
    const params = useParams();
    const type = (params?.type as string).toLowerCase().replace('?', '');
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const sanitizedType = type.replace('?', '');
            const url = `${process.env.NEXT_PUBLIC_API_URL}/products?type=${sanitizedType}`;
            console.log('Fetching URL:', url);
            const res = await sendRequest<{ data: IProduct[] }>({
                url,
                method: "GET",
            });
            console.log("res: ", res);
            setProducts(res?.data || []);
            setLoading(false);
        };
        if (type) fetchProducts();
    }, [type]);

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-4 uppercase">{type}</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                            <img
                                src={product.images?.[0] || "/images/placeholder.png"}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded mb-2"
                            />
                            <h2 className="font-semibold text-base mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h2>
                            <div className="text-[#E31837] font-bold text-lg mb-1">
                                {product.finalPrice?.toLocaleString('vi-VN')} ₫
                            </div>
                            {product.discount > 0 && (
                                <div className="text-gray-500 line-through text-sm mb-1">
                                    {product.originalPrice?.toLocaleString('vi-VN')} ₫
                                </div>
                            )}
                            <a
                                href={`/product/${product.slug}`}
                                className="mt-auto inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-center"
                            >
                                Xem chi tiết
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 
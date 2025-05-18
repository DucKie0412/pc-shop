"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { IProduct } from "@/types/product";
import { sendRequest } from "@/utils/api";
import { PRODUCT_TYPE_SPECS } from "@/constants/productSpecs";

type ProductType = keyof typeof PRODUCT_TYPE_SPECS;
type SpecConfig = { name: string; label: string; type: string; options?: string[] };

export default function CategoryPage() {
    const params = useParams();
    const type = (params?.type as string).toLowerCase().replace('?', '') as ProductType;
    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [sortOption, setSortOption] = useState<string>("newest");

    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            const url = `${process.env.NEXT_PUBLIC_API_URL}/products`;
            const res = await sendRequest<{ data: IProduct[] }>({
                url,
                method: "GET",
            });
            setAllProducts(res?.data || []);
            setLoading(false);
        };
        fetchAllProducts();
    }, []);

    // Get the spec config for the current type
    const typeSpecs: SpecConfig[] = PRODUCT_TYPE_SPECS[type] || [];

    // Extract all unique filter options for each spec from all products
    const specOptions = useMemo(() => {
        const options: Record<string, string[]> = {};
        typeSpecs.forEach((spec: SpecConfig) => {
            if (spec.options && spec.options.length > 0) {
                options[spec.name] = spec.options;
            } else {
                options[spec.name] = Array.from(
                    new Set(
                        allProducts
                            .filter(p => p.type === type)
                            .map(p => p.specs?.[spec.name])
                            .filter(Boolean)
                    )
                ).map(String);
            }
        });
        return options;
    }, [allProducts, type, typeSpecs]);

    // Filter products for the current category/type
    const productsOfType = useMemo(
        () => allProducts.filter(p => p.type === type),
        [allProducts, type]
    );

    // Filter products by selected filters
    const filteredProducts = productsOfType.filter(product => {
        return typeSpecs.every((spec: SpecConfig) => {
            const selected = filters[spec.name] || [];
            if (selected.length === 0) return true;
            const value = product.specs?.[spec.name];
            return selected.includes(String(value));
        });
    });

    // Sorting logic
    const sortedProducts = useMemo(() => {
        let sorted = [...filteredProducts];
        switch (sortOption) {
            case "price-asc":
                sorted.sort((a, b) => a.finalPrice - b.finalPrice);
                break;
            case "price-desc":
                sorted.sort((a, b) => b.finalPrice - a.finalPrice);
                break;
            case "name-az":
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-za":
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }
        return sorted;
    }, [filteredProducts, sortOption]);

    // Handler for filter changes
    const handleFilterChange = (specName: string, value: string) => {
        setFilters(prev => {
            const prevArr = prev[specName] || [];
            return {
                ...prev,
                [specName]: prevArr.includes(value)
                    ? prevArr.filter(v => v !== value)
                    : [...prevArr, value],
            };
        });
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <aside className="w-64 p-4 border-r">
                {typeSpecs.map((spec: SpecConfig) => (
                    <div key={spec.name} className="mb-4">
                        <h3 className="font-bold mb-2">{spec.label}</h3>
                        {specOptions[spec.name]?.length === 0 && (
                            <div className="text-gray-400 text-sm mb-2">No {spec.label} data</div>
                        )}
                        {specOptions[spec.name]?.map(option => (
                            <label key={option} className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    checked={filters[spec.name]?.includes(option) || false}
                                    onChange={() => handleFilterChange(spec.name, option)}
                                    className="mr-2"
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                ))}
            </aside>
            {/* Product Grid */}
            <main className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-base">Tìm thấy {sortedProducts.length} sản phẩm</span>
                    <div className="flex items-center gap-2">
                        <span>Sắp xếp theo:</span>
                        <select
                            className="border rounded px-2 py-1"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value)}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                            <option value="name-az">Tên A-Z</option>
                            <option value="name-za">Tên Z-A</option>
                        </select>
                    </div>
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sortedProducts.map((product) => (
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
            </main>
        </div>
    );
} 
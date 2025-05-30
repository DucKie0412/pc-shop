"use client";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { IProduct } from "@/types/product";
import { sendRequest } from "@/utils/api";
import { PRODUCT_TYPE_SPECS } from "@/constants/productSpecs";
import Link from "next/link";

type ProductType = keyof typeof PRODUCT_TYPE_SPECS;
type SpecConfig = { name: string; label: string; type: string; options?: string[] };

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type");
    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [searchResults, setSearchResults] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [sortOption, setSortOption] = useState<string>("newest");

    // Fetch all products for filter options
    useEffect(() => {
        const fetchAllProducts = async () => {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/products`;
            const res = await sendRequest<{ data: IProduct[] }>({
                url,
                method: "GET",
            });
            setAllProducts(res?.data || []);
        };
        fetchAllProducts();
    }, []);

    // Fetch search results
    useEffect(() => {
        if (!query) return;
        setLoading(true);
        const fetchProducts = async () => {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/products?name=${encodeURIComponent(query)}`;
            const res = await sendRequest<{ data: IProduct[] }>({
                url,
                method: "GET",
            });
            setSearchResults(res?.data || []);
            setLoading(false);
        };
        fetchProducts();
    }, [query]);

    // Determine which product types are present in the search results
    const presentTypes = useMemo(() => Array.from(new Set(searchResults.map(p => p.type))), [searchResults]);
    // Collect all relevant specs for the present types
    const typeSpecs: SpecConfig[] = useMemo(() => {
        const specs: SpecConfig[] = [];
        presentTypes.forEach(type => {
            const typeSpecsArr = PRODUCT_TYPE_SPECS[type as ProductType] || [];
            typeSpecsArr.forEach(spec => {
                if (!specs.find(s => s.name === spec.name)) {
                    specs.push(spec);
                }
            });
        });
        return specs;
    }, [presentTypes]);

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
                            .map(p => p.specs?.[spec.name])
                            .filter(Boolean)
                    )
                ).map(String);
            }
        });
        return options;
    }, [allProducts, typeSpecs]);

    // Filter search results by selected filters and type
    const filteredProducts = searchResults.filter(product => {
        const matchType = !type || type === "all" || product.type === type;
        if (!matchType) return false;
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
                <div className="mb-4 font-semibold">
                    Bộ lọc
                </div>
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
                    <div>
                        <p>Tìm thấy <span className="text-rose-600">{sortedProducts.length}</span> sản phẩm</p>
                        <h1 className="text-2xl font-bold mb-4">Kết quả tìm kiếm cho: <span className="text-blue-600">{query}</span></h1>
                    </div>
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
                    <div>Đang tìm kiếm...</div>
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
                                <Link
                                    href={`/product/${product.slug}`}
                                    className="mt-auto inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-center"
                                >
                                    Xem chi tiết
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
} 
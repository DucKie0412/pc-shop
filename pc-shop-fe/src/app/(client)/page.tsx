"use client";

import React, { useEffect, useState } from "react";
import HomepageCarousel from "@/components/client/homepage-carousel";
import HomepageSubBanner from "@/components/client/homepage-sub-banner";
import ProductCardSlider from "@/components/client/product-card-slider";
import { IProduct } from "@/types/product";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";

const images = [
    {
        id: '1',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        link: '/1'
    },
    {
        id: '2',
        url: 'https://res.cloudinary.com/demo/image/upload/another.jpg',
        link: '/2'
    },
    {
        id: '3',
        url: 'https://res.cloudinary.com/demo/image/upload/more.jpg',
        link: '/3'
    },
];

const subBannerImages = [
    {
        id: '1',
        url: 'https://pcmarket.vn/media/banner/banner3-new.jpg',
        link: '/11'
    },
    {
        id: '2',
        url: 'https://pcmarket.vn/media/banner/Banner4-new.jpg',
        link: '/22'
    },
    {
        id: '3',
        url: 'https://pcmarket.vn/media/banner/banner5.jpg',
        link: '/33'
    }
]


function Homepage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await sendRequest<{ statusCode: number, message: string, data: IProduct[] }>({
                    url: '/api/products',
                    method: 'GET',
                });
                setProducts(res?.data || []);
            } catch (err) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchProducts();
    }, [session]);

    return (
        <div>
            <div className="container mx-auto mt-4">
                <HomepageCarousel images={images} height="400px" />
                <HomepageSubBanner subBannerImages={subBannerImages} height="auto" />
                {loading ? (
                    <div>Loading products...</div>
                ) : (
                    <>
                        <ProductCardSlider
                            title="BEST SELLER"
                            products={products}
                            viewAllLink="/category/pc-amd-gaming"
                        />
                        {/* Repeat for other sliders as needed */}
                    </>
                )}
            </div>
        </div>
    );
}

export default Homepage;

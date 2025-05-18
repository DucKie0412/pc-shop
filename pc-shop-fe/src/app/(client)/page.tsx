"use client";

import React, { useEffect, useState } from "react";
import HomepageCarousel from "@/components/client/homepage-carousel";
import HomepageSubBanner from "@/components/client/homepage-sub-banner";
import ProductCardSlider from "@/components/client/product-card-slider";
import { IProduct } from "@/types/product";
import { IBanner, BannerType } from "@/types/banner";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";

function Homepage() {
    const { data: session, status } = useSession();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [carouselBanners, setCarouselBanners] = useState<IBanner[]>([]);
    const [subBanners, setSubBanners] = useState<IBanner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== "authenticated") return; // Wait for authentication

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch products
                const productsRes = await sendRequest<IBackendRes<IProduct[]>>({
                    url: '/api/products',
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.accessToken}`
                    }
                });
                setProducts(productsRes?.data || []);

                // Fetch carousel banners
                const carouselRes = await sendRequest<IBackendRes<IBanner[]>>({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/banners?type=${BannerType.CAROUSEL}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.accessToken}`
                    }
                });
                setCarouselBanners(carouselRes?.data || []);
                
                // Fetch sub banners
                const subBannerRes = await sendRequest<IBackendRes<IBanner[]>>({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/banners?type=${BannerType.SUB_BANNER}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.accessToken}`
                    }
                });
                setSubBanners(subBannerRes?.data || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setProducts([]);
                setCarouselBanners([]);
                setSubBanners([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session, status]);

    return (
        <div>
            <div className="container mx-auto mt-4">
                <HomepageCarousel 
                    images={carouselBanners.map(banner => ({
                        id: banner._id,
                        url: banner.url,
                        link: banner.link
                    }))} 
                    height="400px" 
                />
                <HomepageSubBanner 
                    subBannerImages={subBanners.map(banner => ({
                        id: banner._id,
                        url: banner.url,
                        link: banner.link
                    }))} 
                    height="230px" 
                />
                {loading ? (
                    <div>Loading products...</div>
                ) : (
                    <>
                        <ProductCardSlider
                            title="BEST SELLER"
                            products={products}
                        />
                        <ProductCardSlider
                            title="CPU"
                            products={products.filter(p => p.type === "cpu")}
                            viewAllLink="/category/cpu"
                        />
                        <ProductCardSlider
                            title="MAINBOARD"
                            products={products.filter(p => p.type === "mainboard")}
                            viewAllLink="/category/mainboard"
                        />
                        <ProductCardSlider
                            title="VGA"
                            products={products.filter(p => p.type === "vga")}
                            viewAllLink="/category/vga"
                        />
                        <ProductCardSlider
                            title="RAM"
                            products={products.filter(p => p.type === "ram")}
                            viewAllLink="/category/ram"
                        />
                        <ProductCardSlider
                            title="HDD"
                            products={products.filter(p => p.type === "hdd")}
                            viewAllLink="/category/hdd"
                        />
                        <ProductCardSlider
                            title="SSD"
                            products={products.filter(p => p.type === "ssd")}
                            viewAllLink="/category/ssd"
                        />
                        <ProductCardSlider
                            title="PSU"
                            products={products.filter(p => p.type === "psu")}
                            viewAllLink="/category/psu"
                        />
                        <ProductCardSlider
                            title="CASE"
                            products={products.filter(p => p.type === "case")}
                            viewAllLink="/category/case"
                        />  
                        <ProductCardSlider
                            title="FAN"
                            products={products.filter(p => p.type === "fan")}
                            viewAllLink="/category/fan"
                        />  
                        <ProductCardSlider
                            title="PHU KIEN MÁY TÍNH"
                            products={products.filter(p => p.type === "other")}
                            viewAllLink="/category/phukien"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default Homepage;

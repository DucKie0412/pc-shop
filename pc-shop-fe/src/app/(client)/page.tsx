"use client";

import React from "react";
import HomepageCarousel from "@/components/client/homepage-carousel";
import HomepageSubBanner from "@/components/client/homepage-sub-banner";
import ProductCardSlider from "@/components/client/product-card-slider";

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


const sampleProducts = [
    {
        id: "1",
        title: "PC AMD GAMING PRO Ryzen 7 5700X3D - RTX 3060 8GB",
        description: "PC AMD GAMING PRO Ryzen 7 5700X3D - RTX 3060 8GB",
        categoryId: "1",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 17980000,
        originalPrice: 19990000,
        discount: 10,
        image: "/sample/pc1.jpg",
        slug: "pc-amd-gaming-pro-ryzen-7-5700x3d"
    },
    {
        id: "2",
        title: "PC SUPER LUXURY ROG STRIX RYZEN 7 9800X3D- RTX 4090 24GB",
        description: "PC SUPER LUXURY ROG STRIX RYZEN 7 9800X3D- RTX 4090 24GB",
        categoryId: "2",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 145626000,
        originalPrice: 170000000,
        discount: 14,
        image: "/sample/pc2.jpg",
        slug: "pc-super-luxury-rog-strix-ryzen-7-9800x3d"
    },
    {
        id: "3",
        title: "PC AMD GAMING Ryzen 7 9800X3D - RTX 3060 12GB",
        description: "PC AMD GAMING Ryzen 7 9800X3D - RTX 3060 12GB",
        categoryId: "3",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 31980000,
        originalPrice: 35990000,
        discount: 11,
        image: "/sample/pc3.jpg",
        slug: "pc-amd-gaming-ryzen-7-9800x3d"
    },
    {
        id: "4",
        title: "PC AMD GAMING Ryzen 7 5700X - RTX 3060 8GB DUAL",
        description: "PC AMD GAMING Ryzen 7 5700X - RTX 3060 8GB DUAL",
        categoryId: "4",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 13990000,
        originalPrice: 15980000,
        discount: 12,
        image: "/sample/pc4.jpg",
        slug: "pc-amd-gaming-ryzen-7-5700x"
    },
    {
        id: "5",
        title: "PC MINI GAMING RYZEN 7 7800X3D - RTX 5070 TI 16GB OC ULTRA",
        description: "PC MINI GAMING RYZEN 7 7800X3D - RTX 5070 TI 16GB OC ULTRA",
        categoryId: "5",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 51980000,
        originalPrice: 55990000,
        discount: 7,
        image: "/sample/pc5.jpg",
        slug: "pc-mini-gaming-ryzen-7-7800x3d"
    },
    {
        id: "6",
        title: "PC AMD GAMING PRO Ryzen 5 7500F- RTX 4060 8GB DUAL OC",
        description: "PC AMD GAMING PRO Ryzen 5 7500F- RTX 4060 8GB DUAL OC",
        categoryId: "6",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 17980000,
        originalPrice: 23680000,
        discount: 24,
        image: "/sample/pc6.jpg",
        slug: "pc-amd-gaming-pro-ryzen-5-7500f"
    },
    {
        id: "7",
        title: "PC AMD GAMING PRO Ryzen 7 5700X3D - RTX 3060 8GB",
        description: "PC AMD GAMING PRO Ryzen 7 5700X3D - RTX 3060 8GB",
        categoryId: "7",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 17980000,
        originalPrice: 19990000,
        discount: 10,
        image: "/sample/pc1.jpg",
        slug: "pc-amd-gaming-pro-ryzen-7-5700x3d"
    },
    {
        id: "8",
        title: "PC SUPER LUXURY ROG STRIX RYZEN 7 9800X3D- RTX 4090 24GB",
        description: "PC SUPER LUXURY ROG STRIX RYZEN 7 9800X3D- RTX 4090 24GB",
        categoryId: "8",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 145626000,
        originalPrice: 170000000,
        discount: 14,
        image: "/sample/pc2.jpg",
        slug: "pc-super-luxury-rog-strix-ryzen-7-9800x3d"
    },
    {
        id: "9",
        title: "PC AMD GAMING Ryzen 7 9800X3D - RTX 3060 12GB",
        description: "PC AMD GAMING Ryzen 7 9800X3D - RTX 3060 12GB",
        categoryId: "9",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 31980000,
        originalPrice: 35990000,
        discount: 11,
        image: "/sample/pc3.jpg",
        slug: "pc-amd-gaming-ryzen-7-9800x3d"
    },
    {
        id: "10",
        title: "PC AMD GAMING Ryzen 7 5700X - RTX 3060 8GB DUAL",
        description: "PC AMD GAMING Ryzen 7 5700X - RTX 3060 8GB DUAL",
        categoryId: "10",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 13990000,
        originalPrice: 15980000,
        discount: 12,
        image: "/sample/pc4.jpg",
        slug: "pc-amd-gaming-ryzen-7-5700x"
    },
    {
        id: "11",
        title: "PC MINI GAMING RYZEN 7 7800X3D - RTX 5070 TI 16GB OC ULTRA",
        description: "PC MINI GAMING RYZEN 7 7800X3D - RTX 5070 TI 16GB OC ULTRA",
        categoryId: "11",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 51980000,
        originalPrice: 55990000,
        discount: 7,
        image: "/sample/pc5.jpg",
        slug: "pc-mini-gaming-ryzen-7-7800x3d"
    },
    {
        id: "12",
        title: "PC AMD GAMING PRO Ryzen 5 7500F- RTX 4060 8GB DUAL OC",
        description: "PC AMD GAMING PRO Ryzen 5 7500F- RTX 4060 8GB DUAL OC",
        categoryId: "12",
        stock: 100,
        createdAt: "2021-01-01",
        updatedAt: "2021-01-01",
        price: 17980000,
        originalPrice: 23680000,
        discount: 24,
        image: "/sample/pc6.jpg",
        slug: "pc-amd-gaming-pro-ryzen-5-7500f"
    }
];

function Homepage() {
    return (
        <div>
            <div className="container mx-auto mt-4">
                <HomepageCarousel images={images} height="400px" />
                <HomepageSubBanner subBannerImages={subBannerImages} height="auto" />

                <ProductCardSlider
                    title="BEST SELLER"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />
                <ProductCardSlider
                    title="PC AMD GAMING"
                    products={sampleProducts}
                    viewAllLink="/category/pc-amd-gaming"
                />

            </div>
        </div>
    );
}

export default Homepage;

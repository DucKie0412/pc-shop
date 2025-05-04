"use client";

import { IProduct } from "@/types/product";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';



type ProductCardSliderProps = {
    title: string;
    products: IProduct[];
    viewAllLink?: string;
    autoPlayInterval?: number;
};

export default function ProductCardSlider({
    title,
    products,
    viewAllLink,
    autoPlayInterval = 3000,
}: ProductCardSliderProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="relative w-full bg-gradient-to-r from-yellow-200 via-cyan-400 to-yellow-200 rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#0088D1]">{title}</h2>
                {viewAllLink && (
                    <Link 
                        href={viewAllLink}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                        XEM TẤT CẢ
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </Link>
                )}
            </div>

            <div className="relative group">
                <Swiper
                    slidesPerView={6}
                    spaceBetween={16}
                    navigation={{
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next',
                    }}
                    modules={[Navigation, Autoplay]}
                    className="mySwiper"
                    autoplay={{
                        delay: autoPlayInterval,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 10,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 16,
                        },
                        1280: {
                            slidesPerView: 5,
                            spaceBetween: 16,
                        },
                        1536: {
                            slidesPerView: 6,
                            spaceBetween: 16,
                        },
                    }}
                >
                    {products.map((product) => (
                        <SwiperSlide key={product._id}>
                            <Link href={`/product/${product.slug}`}>
                                <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    {/* Discount Badge */}
                                    {product.discount > 0 && (
                                        <div className="absolute top-2 left-2 bg-[#E31837] text-white px-2 py-1 rounded-md text-sm font-bold z-10">
                                            -{product.discount}%
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    <div className="relative aspect-square">
                                        <img
                                            src={product?.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                                            {product.name}
                                        </h3>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-lg font-bold text-[#E31837]">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.discount > 0 && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <div className="swiper-button-prev !w-10 !h-10 !bg-white/80 !backdrop-blur-sm !rounded-full !shadow-md hover:!bg-white !transition-all !duration-300 after:!text-gray-800 after:!text-lg !opacity-0 group-hover:!opacity-100"></div>
                <div className="swiper-button-next !w-10 !h-10 !bg-white/80 !backdrop-blur-sm !rounded-full !shadow-md hover:!bg-white !transition-all !duration-300 after:!text-gray-800 after:!text-lg !opacity-0 group-hover:!opacity-100"></div>
            </div>
        </div >
    );
} 
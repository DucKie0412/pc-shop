'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Link from 'next/link';

type CarouselProps = {
    images: {
        id: string;
        url: string;
        link: string;
    }[]; // list ảnh từ cloudinary hoặc backend trả về
    height?: string; // cho phép set chiều cao custom
};

export default function HomepageCarousel({ images, height }: CarouselProps) {
    return (
        <div className="relative w-full" style={{ height }}>
            <Swiper
                modules={[Navigation, Autoplay]}
                navigation
                autoplay={{ delay: 3000, pauseOnMouseEnter: true }}

                loop
                className="w-full h-full rounded-xl"
            >
                {images?.map((image) => (
                    <SwiperSlide key={image.id}>
                        <Link href={image.link}>
                            <img
                                src={image.url}
                                alt={`Slide ${image.id}`}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

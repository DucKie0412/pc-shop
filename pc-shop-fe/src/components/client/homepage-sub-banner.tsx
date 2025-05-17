"use client"

import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "@/ui/css/subBanner.module.css"
import Image from "next/image";

interface SubBannerImage {
    id: string;
    url: string;
    link: string;
}

interface Props {
    subBannerImages: SubBannerImage[];
    height?: string;
}

export default function HomepageSubBanner({ subBannerImages, height = "192px" }: Props) {
    return (
        <div className="w-full my-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subBannerImages.map((banner) => (
                    <a
                        key={banner.id}
                        href={banner.link}
                        className="block w-full rounded-lg overflow-hidden relative"
                        style={{ height }}
                    >
                        <div style={{ width: "100%", height: "100%", position: "relative" }}>
                            <Image
                                src={banner.url}
                                alt=""
                                fill
                                style={{ objectFit: "cover" }}
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority
                            />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

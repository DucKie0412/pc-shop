"use client"

import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "@/ui/css/subBanner.module.css"

type SubBannerProps = {
    subBannerImages: {
        id: string;
        url: string;
        link: string;
    }[];
    height?: string;
}

export default function HomepageSubBanner({ subBannerImages, height }: SubBannerProps) {
    return (
        <div className="flex gap-4" style={{ height }}>
            {subBannerImages?.map((image) => (
                <Link key={image.id} className="flex-1 h-full" href={image.link}>
                    <div className={styles.imageContainer}>
                        <img
                            src={image.url}
                            alt={`Sub-banner ${image.id}`}
                            className={styles.image}
                        />
                    </div>
                </Link>
            ))}
        </div>
    )
}

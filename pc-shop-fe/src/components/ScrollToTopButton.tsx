"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const SCROLL_OFFSET = 200;

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > SCROLL_OFFSET);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center relative"
            aria-label="Scroll to top"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {showTooltip && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-gray-800 text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap z-50">
                    Lên đầu trang
                </div>
            )}
            <ChevronUp className="w-6 h-6" />
        </button>
    );
} 
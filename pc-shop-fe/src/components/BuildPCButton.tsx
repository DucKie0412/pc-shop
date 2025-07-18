"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Wrench } from 'lucide-react';

export default function BuildPCButton() {
    const router = useRouter();
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <button
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 relative"
            aria-label="Tự Build Cấu Hình"
            onClick={() => router.push('/build')}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {showTooltip && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-gray-800 text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap z-50">
                    Tự Build Cấu Hình
                </div>
            )}
            <Wrench className="w-6 h-6" />
        </button>
    );
} 
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

export const MessengerIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Add event listener when the popup is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up event listener when the popup is closed or component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]); // Re-run effect when isOpen changes

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div
                    ref={popupRef}
                    className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg p-4 text-gray-800"
                >
                    <div className="flex items-center mb-3">
                        {/* You can add an avatar here if desired */}
                        <div className="ml-2">
                            <p className="font-semibold">Chăm sóc khách hàng</p>
                        </div>
                    </div>
                    <p className="mb-4">Xin chào, bạn cần giúp đỡ gì không?</p>
                    <a
                        href="https://m.me/61576956118909"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                    >
                        Bắt đầu đoạn chat trong Messenger
                    </a>
                </div>
            )}
            <button
                onClick={toggleOpen}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Open Messenger Chat"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        </div>
    );
}; 
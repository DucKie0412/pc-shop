'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the CartItem type
export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

// Define the CartContext type
interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateItemQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

// Create the CartContext
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (item: CartItem) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
            } else {
                return [...prevItems, item];
            }
        });
    };

    const removeItem = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateItemQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateItemQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Create a custom hook to use the CartContext
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 
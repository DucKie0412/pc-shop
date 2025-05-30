import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { RootState, AppDispatch } from '../store';
import {
    fetchCart,
    updateCart,
    clearCart,
    updateGuestCart,
    addItem,
    removeItem,
    updateItemQuantity,
    setGuestStatus,
    CartItem,
} from '../features/cart/cartSlice';

export const useCart = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: session, status } = useSession();
    const cart = useSelector((state: RootState) => state.cart);

    // Sync guest status with auth state
    useEffect(() => {
        dispatch(setGuestStatus(status !== 'authenticated'));
    }, [status, dispatch]);

    // Fetch cart when user logs in
    useEffect(() => {
        if (status === 'authenticated') {
            dispatch(fetchCart());
        }
    }, [status, dispatch]);

    const addToCart = useCallback(
        async (item: CartItem) => {
            const existingItem = cart.items.find(i => i.productId === item.productId);
            if (existingItem) {
                // Increase quantity
                dispatch(updateItemQuantity({ productId: item.productId, quantity: existingItem.quantity + item.quantity }));
                if (status === 'authenticated') {
                    const updatedItems = cart.items.map(i =>
                        i.productId === item.productId ? { ...i, quantity: existingItem.quantity + item.quantity } : i
                    );
                    dispatch(updateCart(updatedItems));
                } else {
                    const updatedItems = cart.items.map(i =>
                        i.productId === item.productId ? { ...i, quantity: existingItem.quantity + item.quantity } : i
                    );
                    dispatch(updateGuestCart(updatedItems));
                }
            } else {
                dispatch(addItem(item));
                if (status === 'authenticated') {
                    const updatedItems = [...cart.items, item];
                    dispatch(updateCart(updatedItems));
                } else {
                    const updatedItems = [...cart.items, item];
                    dispatch(updateGuestCart(updatedItems));
                }
            }
        },
        [dispatch, cart.items, status]
    );

    const removeFromCart = useCallback(
        async (productId: string) => {
            // Optimistic update
            dispatch(removeItem(productId));

            if (status === 'authenticated') {
                // Update backend
                const updatedItems = cart.items.filter(item => item.productId !== productId);
                dispatch(updateCart(updatedItems));
            } else {
                // Update guest cart
                const updatedItems = cart.items.filter(item => item.productId !== productId);
                dispatch(updateGuestCart(updatedItems));
            }
        },
        [dispatch, cart.items, status]
    );

    const updateQuantity = useCallback(
        async (productId: string, quantity: number) => {
            // Optimistic update
            dispatch(updateItemQuantity({ productId, quantity }));

            if (status === 'authenticated') {
                // Update backend
                const updatedItems = cart.items.map(item =>
                    item.productId === productId ? { ...item, quantity } : item
                );
                dispatch(updateCart(updatedItems));
            } else {
                // Update guest cart
                const updatedItems = cart.items.map(item =>
                    item.productId === productId ? { ...item, quantity } : item
                );
                dispatch(updateGuestCart(updatedItems));
            }
        },
        [dispatch, cart.items, status]
    );

    const clearCartItems = useCallback(async () => {
        if (status === 'authenticated') {
            dispatch(clearCart());
        } else {
            dispatch(updateGuestCart([]));
        }
    }, [dispatch, status]);

    return {
        items: cart.items,
        status: cart.status,
        error: cart.error,
        isGuest: cart.isGuest,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCartItems,
    };
}; 
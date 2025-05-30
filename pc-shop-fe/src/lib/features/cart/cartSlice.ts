import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sendRequest } from '@/utils/api';
import { useSession } from 'next-auth/react';

// Types
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartState {
    items: CartItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    isGuest: boolean;
}

const initialState: CartState = {
    items: [],
    status: 'idle',
    error: null,
    isGuest: true,
};

// Async thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const { data: session } = useSession();
            const response = await sendRequest<{ items: CartItem[] }>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/cart`,
                method: 'GET',
                useCredentials: true,
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            return response.items;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch cart');
        }
    }
);

export const updateCart = createAsyncThunk(
    'cart/updateCart',
    async (items: CartItem[], { rejectWithValue }) => {
        try {
            const { data: session } = useSession();
            const response = await sendRequest<{ items: CartItem[] }>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/cart`,
                method: 'POST',
                body: { items },
                useCredentials: true,
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            return response.items;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update cart');
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const { data: session } = useSession();
            await sendRequest({
                url: `${process.env.NEXT_PUBLIC_API_URL}/cart`,
                method: 'DELETE',
                useCredentials: true,
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            return [];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to clear cart');
        }
    }
);

// Guest cart actions
export const updateGuestCart = createAsyncThunk(
    'cart/updateGuestCart',
    async (items: CartItem[]) => {
        // For guest cart, we just return the items directly
        return items;
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setGuestStatus: (state, action: PayloadAction<boolean>) => {
            state.isGuest = action.payload;
        },
        // Add item to cart (optimistic update)
        addItem: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(
                item => item.productId === action.payload.productId
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        // Remove item from cart (optimistic update)
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.productId !== action.payload);
        },
        // Update item quantity (optimistic update)
        updateItemQuantity: (
            state,
            action: PayloadAction<{ productId: string; quantity: number }>
        ) => {
            const item = state.items.find(item => item.productId === action.payload.productId);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Update cart
            .addCase(updateCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.error = null;
            })
            .addCase(updateCart.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Clear cart
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.error = null;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Guest cart
            .addCase(updateGuestCart.fulfilled, (state, action) => {
                state.items = action.payload;
            });
    },
});

export const { setGuestStatus, addItem, removeItem, updateItemQuantity } = cartSlice.actions;
export default cartSlice.reducer;

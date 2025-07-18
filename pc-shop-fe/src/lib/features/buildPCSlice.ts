import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BuildPCState {
    selected: Record<string, any>; // category key -> product
    quantities: Record<string, number>;
    allProducts: any[];
}

const initialState: BuildPCState = {
    selected: {},
    quantities: {},
    allProducts: [],
};

const buildPCSlice = createSlice({
    name: 'buildPC',
    initialState,
    reducers: {
        setProduct: (state, action: PayloadAction<{ cat: string; product: any }>) => {
            state.selected[action.payload.cat] = action.payload.product;
            if (!state.quantities[action.payload.cat]) {
                state.quantities[action.payload.cat] = 1;
            }
        },
        removeProduct: (state, action: PayloadAction<string>) => {
            delete state.selected[action.payload];
            delete state.quantities[action.payload];
        },
        setQuantity: (state, action: PayloadAction<{ cat: string; quantity: number }>) => {
            state.quantities[action.payload.cat] = action.payload.quantity;
        },
        clearBuild: (state) => {
            state.selected = {};
            state.quantities = {};
        },
        setBuildState: (state, action: PayloadAction<Partial<BuildPCState>>) => {
            if (action.payload.selected) state.selected = action.payload.selected;
            if (action.payload.quantities) state.quantities = action.payload.quantities;
            if (action.payload.allProducts) state.allProducts = action.payload.allProducts;
        },
        setAllProducts: (state, action: PayloadAction<any[]>) => {
            state.allProducts = action.payload;
        },
    },
});

export const { setProduct, removeProduct, setQuantity, clearBuild, setBuildState, setAllProducts } = buildPCSlice.actions;
export default buildPCSlice.reducer; 
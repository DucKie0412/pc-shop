import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import chatbotReducer from './features/chatbotSlice';
import buildPCReducer from './features/buildPCSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    chatbot: chatbotReducer,
    buildPC: buildPCReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

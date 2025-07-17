import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import chatbotReducer from './features/chatbotSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    chatbot: chatbotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

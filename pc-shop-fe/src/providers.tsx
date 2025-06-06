'use client';

import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>{children}</SessionProvider>
    </Provider>
  );
} 
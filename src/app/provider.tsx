'use client';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// จะใช้ named หรือ default ก็ได้ แต่อย่าให้สลับกับตอน import
export function CustomProviders({ children }: { children: React.ReactNode }) {
  // สร้าง QueryClient แค่ครั้งเดียว
  const [qc] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}

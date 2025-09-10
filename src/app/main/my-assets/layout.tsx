'use client';

import { Alexandria } from 'next/font/google';
import NavbarContainer from '@/features/wallet/containers/NavbarContainer';
import { CoinProvider } from '@/features/trading/contexts/CoinContext';
import Sidebar from '@/components/Sidebar';
import { useEffect } from 'react';

const alexandria = Alexandria({
  subsets: ['latin'],
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // Debug: ตรวจสอบว่า layout load หรือไม่
  useEffect(() => {
    console.log('🟢 Main Layout mounted with CoinProvider');
  }, []);

  return (
    <div className={`min-h-screen overflow-x-hidden ${alexandria.className}`}>
      {/* CoinProvider ครอบทุกหน้าใน /main */}
      <CoinProvider>
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <NavbarContainer />
        </div>

        <div className="pt-14 flex">
          <Sidebar />

          {/* Main Content */}
          <div className="ml-[84px] flex-1 overflow-x-hidden">{children}</div>
        </div>
      </CoinProvider>
    </div>
  );
}

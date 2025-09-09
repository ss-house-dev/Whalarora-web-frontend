import { Alexandria } from "next/font/google";
import type { Metadata } from "next";
import NavbarContainer from "@/features/wallet/containers/NavbarContainer";
import { CoinProvider } from "@/features/trading/contexts/CoinContext";
import Sidebar from "@/components/Sidebar";  // Import Sidebar component

const alexandria = Alexandria({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Whalalora | Trading',
  description: 'Trading page',
};

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen overflow-x-hidden ${alexandria.className}`}>
      <CoinProvider>
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <NavbarContainer />
        </div>

        <div className="pt-14 flex">
          <Sidebar /> 

          {/* Main Content */}
          <div className="ml-[84px] flex-1 overflow-x-hidden">
            {children}
          </div>
        </div>
      </CoinProvider>
    </div>
  );
}

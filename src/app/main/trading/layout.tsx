import { Alexandria } from "next/font/google";
import type { Metadata } from "next";
import NavbarContainer from "@/features/wallet/containers/NavbarContainer";

const alexandria = Alexandria({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whalalora | Trading",
  description: "Trading page",
};

export default function TradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen ${alexandria.className}`}>
      <NavbarContainer />
      <div>{children}</div>
    </div>
  );
}

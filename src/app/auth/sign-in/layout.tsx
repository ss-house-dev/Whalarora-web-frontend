import { Alexandria } from "next/font/google";
import type { Metadata } from "next";
import { CustomProviders } from "@/lib/react-query/QueryClientProvider";

const alexandria = Alexandria({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whalalora | Login",
  description: "Login page",
};

export default function TradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomProviders>
      <div className={`min-h-screen ${alexandria.className}`}>
        <div>{children}</div>
      </div>
    </CustomProviders>
  );
}

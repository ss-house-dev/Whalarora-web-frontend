
// PortfolioPage.tsx
import HoldingAssetsSection from '@/features/trading/containers/HoldingAssetsSection';
import rows from "@/app/_mocks/holdings.json";

export default async function PortfolioPage() {
  // 1) ดึงข้อมูลจาก backend ของคุณ
  //const rows = await fetch(/* your API */).then(r => r.json());
  // rows ต้อง map ให้อยู่ในสเกลเดียวกับ HoldingAssetsSection (id, symbol, name, amount, currentPrice, averageCost, value, pnlAbs, pnlPct)

  // 2) ส่ง rows ไปที่ HoldingAssetsSection
  return <HoldingAssetsSection rows={rows} pageSize={10} />;
}




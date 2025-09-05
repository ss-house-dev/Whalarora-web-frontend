import MarketOrderContainer from "@/features/trading/containers/OrderContainer";
import AdvancedChart from "@/features/trading/components/Chart";
import { CombinedCombobox } from "@/components/ui/combobox";

export default function MarketOrderPage() {
  return (
    <div className="mx-[36px] mt-[24px] space-y-[24px] min-h-screen">
      {/* Combined Combobox with Price Info */}
      <div className="flex gap-10">
        <div className="flex-1">
          <CombinedCombobox />
        </div>
      </div>

      {/* Chart and Order Container side by side */}
      <div className="flex gap-[17px]">
        <AdvancedChart />
        <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[507px]">
          <MarketOrderContainer />
        </div>
      </div>
    </div>
  );
}

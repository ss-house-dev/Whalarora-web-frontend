import MarketOrderContainer from "@/features/trading/containers/OrderContainer";
import AdvancedChart from "@/features/trading/components/Chart";
import { CombinedCombobox } from "@/components/ui/combobox";

export default function MarketOrderPage() {
  return (
    <div className="mx-[23px] mt-[20px] space-y-[20px]">
      {/* Combined Combobox with Price Info */}
      <div className="flex-1">
        <CombinedCombobox />
      </div>

      {/* Chart and Order Container side by side */}
      <div className="flex gap-[17px]">
        <div className="w-[900px] min-h-[508px]">
          <AdvancedChart />
        </div>
        <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[508px]">
          <MarketOrderContainer />
        </div>
      </div>
    </div>
  );
}

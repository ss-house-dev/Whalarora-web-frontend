import MarketOrderContainer from "@/features/trading/containers/OrderContainer";
import AdvancedChart from "@/features/trading/components/Chart";
import { CombinedCombobox } from "@/components/ui/combobox"; 

export default function MarketOrderPage() {
  return (
    <div className="mx-[120px] mt-[20px] space-y-[20px] min-h-screen">
      {/* Combined Combobox with Price Info */}
      <div className="flex gap-10">
        <div className="flex-1">
          <CombinedCombobox />
        </div>
      </div>

      {/* Chart and Order Container side by side */}
      <div className="flex gap-[17px]">
        <div className="flex-1 h-[507px]">
          <AdvancedChart />
        </div>

        <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[507px]">
          <MarketOrderContainer />
        </div>
      </div>
    </div>
  );
}

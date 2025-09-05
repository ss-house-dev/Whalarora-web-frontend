import MarketOrderContainer from "@/features/trading/containers/OrderContainer";
import AdvancedChart from "@/features/trading/components/Chart";
import OrderTableContainer from "@/features/trading/containers/OrderTableContainer";
import DevOrderCardPreview from "@/features/trading/containers/DevOrderCardPreview";

export default function MarketOrderPage() {
  return (
    <div className="flex flex-col mx-[120px] mt-10 gap-10">
      {/* Chart + Order Form */}
      <div className="flex gap-10">
        <div className="flex-1">
          <AdvancedChart />
        </div>
        <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[504px]">
          <MarketOrderContainer />
        </div>
      </div>

      {/* Order Table at bottom */}
      <div className="flex-1">
        <OrderTableContainer />
      </div>

      {/* Dev Order Card Preview */}
      <div className="flex justify-center">
        <DevOrderCardPreview />
      </div>
    </div>
  );
}

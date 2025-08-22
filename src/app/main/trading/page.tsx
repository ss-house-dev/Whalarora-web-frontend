import MarketOrderContainer from "@/features/trading/containers/MarketOrderContainer";
import AdvancedChart from "@/features/trading/components/Chart"

export default function MarketOrderPage() {
  return (
    <div className="flex justify-center items-center mx-[120px] gap-10 mt-10">
      {/* <div className="flex-1 "></div> */}
      <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[504px]">
        <MarketOrderContainer />
      </div>
    </div>
  );
}

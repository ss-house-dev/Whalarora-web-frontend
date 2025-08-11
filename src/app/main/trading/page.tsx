"use client";
import AdvancedChart from "@/features/trading/components/Chart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { CircleQuestionMark, PencilLine } from "lucide-react";
import React, { useRef, useState } from "react";

export default function MarketOrder() {
  const [activeTab, setActiveTab] = useState("BUY");
  const inputRef = useRef<HTMLInputElement>(null);
  const [priceLabel, setPriceLabel] = React.useState("Price");

  // ฟังก์ชันที่จะเปลี่ยน label เมื่อคลิกที่ input
  const handleFocus = () => {
    setPriceLabel("Limit price");
    inputRef.current?.focus();
  };

  // ฟังก์ชันที่จะเปลี่ยนกลับเป็น "Price" เมื่อกดปุ่ม Market
  const handleMarketClick = () => {
    setPriceLabel("Price");
  };

  return (
    <div className="flex mx-[120px] gap-10 mt-10">
      {/* Left Side - Chart */}
      <div className="flex-1 ">
        <AdvancedChart />
      </div>
      {/* Right Side - Buy/Sell Box */}

      <div className="w-[384px] h-[504px] bg-[#081125] rounded-lg shadow-md p-5">
        {/* Tab buttons */}
        <div className="flex mb-7 bg-[#2D2D2D] rounded-lg">
          <button
            onClick={() => setActiveTab("BUY")}
            className={`flex-1 py-1 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all ${
              activeTab === "BUY"
                ? "bg-[linear-gradient(185deg,#309C7D_23.13%,#26F6BA_157.05%)] text-white"
                : "bg-[#2D2D2D] text-gray-300"
            }`}
          >
            BUY
          </button>

          <button
            onClick={() => setActiveTab("SELL")}
            className={`flex-1 py-1 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all ${
              activeTab === "SELL"
                ? "bg-[linear-gradient(357deg,#D84C4C_2.29%,#722828_186.28%)] text-white"
                : "bg-[#2D2D2D] text-gray-300"
            }`}
          >
            SELL
          </button>
        </div>

        {/* Price input */}
        <div className="h-[44px] w-[344px] ">
          <div className="flex w-[344px] items-center rounded-xl bg-[#102047] px-3 py-2 justify-between border border-transparent focus-within:border-[#3A8AF7]">
            {/* Left Side - Price Label */}
            <span className="text-xs font-bold text-[#5775B7]">
              {priceLabel}
            </span>

            {/* Right Side - Input + Icon + Button */}
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="number"
                className="w-[90px] rounded-lg bg-[#102047] p-1 text-white text-right text-sm"
                onFocus={handleFocus}
              />
              <span className="text-sm font-normal">USD</span>
              <PencilLine
                className="h-5 w-5 shrink-0 cursor-pointer text-[#3A8AF7]"
                onClick={handleFocus}
              />
              <Button
                onClick={handleMarketClick}
                className="border border-[#3A8AF7] bg-[#1F4293] hover:bg-[#1F4293] cursor-pointer"
              >
                <span>Market</span>
                <CircleQuestionMark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="flex justify-between mt-7">
          <div className="text-xs text-[#9AAACE]">Available Balance</div>
          <div className="flex flex-row gap-1 text-xs text-[#9AAACE]">
            <div>10,000</div>
            <div>USD</div>
          </div>
        </div>

        {/* Amount */}
        <div className="h-[44px] w-[344px] mt-1">
          <div className="flex w-[344px] items-center rounded-xl bg-[#102047] px-3 py-2 justify-between border border-transparent focus-within:border-[#3A8AF7]">
            {/* Left Side - Price Label */}
            <span className="text-xs font-bold text-[#5775B7]">Amount</span>

            {/* Right Side - Input + Icon + Button */}
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="number"
                className="w-[90px] rounded-lg bg-[#102047] p-1 text-white text-right text-sm"
                onFocus={handleFocus}
              />
              <span className="text-sm font-normal">USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

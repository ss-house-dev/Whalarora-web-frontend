"use client";
import AdvancedChart from "@/features/trading/components/Chart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { CircleQuestionMark, PencilLine } from "lucide-react";
import React, { useRef, useState } from "react";
import DiscreteSlider from "@/features/trading/components/DiscreteSlider";
import Image from "next/image";

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
        <div className="h-[44px] w-[344px]">
          <div className="flex w-[344px] items-center rounded-xl bg-[#102047] px-3 py-2 justify-between border border-transparent focus-within:border-[#3A8AF7]">
            {/* Left Side - Price Label */}
            <span className="text-xs font-bold text-[#5775B7]">
              {priceLabel}
            </span>

            {/* Right Side - Input + Icon + Button */}
            <div className="flex items-center gap-2">
              {/* Input Market Price or Limit */}
              <Input
                ref={inputRef}
                type="number"
                className="w-[80px] rounded-lg bg-[#102047] p-1 text-white text-right"
                onFocus={handleFocus}
              />
              <span className="text-sm font-normal">USD</span>
              {/* Edit Price */}
              <PencilLine
                className="h-5 w-5 shrink-0 cursor-pointer text-[#3A8AF7]"
                onClick={() => {
                  inputRef.current?.focus();
                  handleFocus();
                }}
              />
              {/* Button Matket Price */}
              <Button
                onClick={handleMarketClick}
                className="bg-[#1F4293] hover:bg-[#1F4293] cursor-pointer"
              >
                <span className="text-xs">Market</span>
                <CircleQuestionMark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Available Balance */}
        <div className="flex justify-between mt-7">
          <div className="text-xs text-[#9AAACE]">Available Balance</div>
          <div className="flex flex-row gap-1 text-xs text-[#9AAACE]">
            <div>10,000.00</div>
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
              {/* Input Market Price or Limit */}
              <Input
                type="number"
                className="w-[220px] rounded-lg bg-[#102047] p-1 text-white text-right"
              />
              <span className="text-sm font-normal text-[#5775B7]">USD</span>
            </div>
          </div>
        </div>
        {/* Slider */}
        <div className="mt-11 mx-3">
          <DiscreteSlider />
        </div>
        {/* Amount Cal */}
        <div className="relative flex items-center mt-7">
          {/* SVG Icon */}
          <div className="absolute z-10">
            <Image
              src="/currency-icons/dollar-icon.svg"
              alt="Dollar Icon"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>

          {/* สี่เหลี่ยมด้านหลัง */}
          <div className="bg-[#212121] rounded-lg flex items-center justify-between pl-[90px] pr-4 py-3 w-[344px] h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
            <span className="text-[#92CAFE] text-xs font-bold">Amount</span>
            <div className="flex gap-2">
              <span className="text-sm font-bold text-[#92CAFE]">
                2,500.00
              </span>
              <span className="text-sm font-bold text-[#92CAFE]">USD</span>
            </div>
          </div>
        </div>
        {/* arrow */}
        <div className="flex justify-center mt-3">
          <Image
            src="/currency-icons/currency-switch-icon.svg"
            alt="Currency Switch Icon"
            width={20}
            height={20}
            className="rounded-full object-cover"
          />
        </div>
        {/* Receive */}
        <div className="relative flex items-center mt-3">
          {/* SVG Icon */}
          <div className="absolute left-0 z-10">
            <Image
              src="/currency-icons/bitcoin-icon.svg"
              alt="Bitcoin Icon"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>

          {/* สี่เหลี่ยมด้านหลัง */}
          <div className="bg-[#17306B] rounded-lg flex items-center justify-between pl-[90px] pr-4 py-3 w-[344px] h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
            <span className="text-[#92CAFE] text-xs font-bold">Receive</span>
            <div className="flex gap-2">
              <span className="text-sm font-bold text-[#92CAFE]">
                0.021701000
              </span>
              <span className="text-sm font-bold text-[#92CAFE]">BTC</span>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8 w-full">
          <Button className="w-full bg-[#309C7D] hover:bg-[#28886C] cursor-pointer text-base font-semibold">
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}

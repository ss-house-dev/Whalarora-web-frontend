"use client";
import AdvancedChart from "@/features/trading/components/Chart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { CircleQuestionMark, PencilLine } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import DiscreteSlider from "@/features/trading/components/DiscreteSlider";
import Image from "next/image";
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";

export default function MarketOrder() {
  const [activeTab, setActiveTab] = useState("BUY");
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [priceLabel, setPriceLabel] = React.useState("Price");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState(true);
  const AVAILABLE_BALANCE = 10000;

  // เพิ่ม state สำหรับเก็บค่า slider percentage
  const [sliderValue, setSliderValue] = useState<number>(0);

  // ดึงราคาจาก custom hook
  const marketPrice = useMarketPrice();

  // State สำหรับเก็บ Limit Price ที่ผู้ใช้กรอก
  const [limitPrice, setLimitPrice] = useState<string>("");

  // ใช้ useState เพื่อเก็บค่า Market Price และ Limit Price
  const [price, setPrice] = useState<string>(marketPrice);

  // ฟังก์ชันคำนวณเปอร์เซ็นต์จาก Amount
  const calculateSliderPercentage = (amountValue: string): number => {
    if (!amountValue) return 0;
    const numAmount = parseFloat(amountValue.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    const percentage = (numAmount / AVAILABLE_BALANCE) * 100;
    return Math.min(percentage, 100); // ไม่ให้เกิน 100%
  };

  // ฟังก์ชันคำนวณ Amount จากเปอร์เซ็นต์
  const calculateAmountFromPercentage = (percentage: number): string => {
    const amount = (percentage / 100) * AVAILABLE_BALANCE;
    return amount.toFixed(2);
  };

  // ฟังก์ชันที่จะเปลี่ยน label เมื่อคลิกที่ input
  const handleFocus = () => {
    setPriceLabel("Limit price");
    setIsInputFocused(true);
    setPrice("");
    setLimitPrice("");
  };

  // ฟังก์ชันที่จะเปลี่ยนกลับเป็น "Price" เมื่อกดปุ่ม Market
  const handleMarketClick = () => {
    setPriceLabel("Price");
    const formattedMarketPrice = formatToTwoDecimals(marketPrice);
    setPrice(formattedMarketPrice);
    setLimitPrice(formattedMarketPrice);
    setIsInputFocused(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.replace(/,/g, ""); 
  const regex = /^\d*\.?\d{0,2}$/;
  if (value === "" || regex.test(value)) {
    setAmount(value);

    const num = parseFloat(value);
    const isValid = value === "" || (!isNaN(num) && num <= AVAILABLE_BALANCE);
    
    // ถ้าเงินไม่พอให้เซ็ต slider เป็น 0%
    if (!isValid && value !== "") {
      setSliderValue(0);
    } else {
      // คำนวณและอัพเดต slider value เมื่อเงินพอ
      const sliderPercentage = calculateSliderPercentage(value);
      setSliderValue(sliderPercentage);
    }
    
    setIsAmountValid(isValid);
  }
};

  // ฟังก์ชันจัดการเมื่อ slider เปลี่ยนค่า
  const handleSliderChange = (percentage: number) => {
    setSliderValue(percentage);
    const newAmount = calculateAmountFromPercentage(percentage);

    if (!isAmountFocused) {
      const formattedAmount = formatToTwoDecimalsWithComma(newAmount);
      setAmount(formattedAmount);
    } else {
      setAmount(newAmount);
    }

    // ตรวจสอบความถูกต้องของจำนวน
    const num = parseFloat(newAmount);
    setIsAmountValid(!isNaN(num) && num <= AVAILABLE_BALANCE);
  };

  const handleAmountFocus = () => {
    setIsAmountFocused(true);
    // ถ้ามี comma ให้เอาออก
    if (amount.includes(",")) {
      setAmount(amount.replace(/,/g, ""));
    }
  };

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    if (amount) {
      const formattedAmount = formatToTwoDecimalsWithComma(amount);
      setAmount(formattedAmount);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === "" || regex.test(value)) {
      setLimitPrice(value);
      setPrice(value);
    }
  };

  useEffect(() => {
    // เมื่อ marketPrice เปลี่ยน ให้กลับไปแสดงราคา Market Price
    if (priceLabel === "Price") {
      setPrice(marketPrice);
    }
  }, [marketPrice, priceLabel]);

  const formatToTwoDecimals = (value: string): string => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toFixed(2);
  };

  const formatToTwoDecimalsWithComma = (value: string): string => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleBlur = () => {
    if (price) {
      const formattedPrice = formatToTwoDecimals(price);
      setPrice(formattedPrice);
      setLimitPrice(formattedPrice);
    } else if (priceLabel === "Price" && marketPrice) {
      const formattedMarketPrice = formatToTwoDecimals(marketPrice);
      setPrice(formattedMarketPrice);
      setLimitPrice(formattedMarketPrice);
    }
    setIsInputFocused(false);
  };

  useEffect(() => {
    if (priceLabel === "Price" && !isInputFocused && marketPrice) {
      const formattedMarketPrice = formatToTwoDecimals(marketPrice);
      setPrice(formattedMarketPrice);
      setLimitPrice(formattedMarketPrice);
    }
  }, [marketPrice, priceLabel]);
  

  return (
    <div className="flex mx-[120px] gap-10 mt-10">
      {/* Left Side - Chart */}
      <div className="flex-1 ">
        <AdvancedChart />
      </div>

      {/* Right Side - Buy/Sell Box */}
      <div className="w-[384px] h-[502px] bg-[#081125] rounded-lg shadow-md p-5">
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
          <div className="flex w-[344px] items-center rounded-xl bg-[#102047] px-3 py-2 justify-between min-h-[53px] border border-transparent focus-within:border-[#3A8AF7]">
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
                step="0.01"
                className="w-[80px] rounded-lg bg-[#102047] p-1 text-white text-right"
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={price}
                onChange={handleChange}
              />
              <span className="text-sm font-normal">USD</span>
              {/* Edit Price */}
              {!isInputFocused && (
                <PencilLine
                  className="h-5 w-5 shrink-0 cursor-pointer text-[#3A8AF7]"
                  onClick={() => {
                    inputRef.current?.focus();
                    handleFocus();
                  }}
                />
              )}
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
          <div
            className={`flex w-[344px] items-center rounded-xl px-3 py-3 justify-between border min-h-[53px] ${
              !isAmountValid
                ? "bg-[#102047] border-[#D84C4C]"
                : "bg-[#102047] border-transparent focus-within:border-[#3A8AF7]"
            }`}
          >
            <span className="text-xs font-bold text-[#5775B7]">Amount</span>
            <div className="flex items-center gap-2 text-sm">
              <input
                ref={amountInputRef}
                type="text"
                className="w-[220px] rounded-lg bg-transparent p-1 text-white text-right border-none outline-none focus:outline-none"
                value={amount}
                onChange={handleAmountChange}
                onFocus={handleAmountFocus}
                onBlur={handleAmountBlur}
              />
              <span className="text-sm font-normal text-[#5775B7]">USD</span>
            </div>
          </div>
          {!isAmountValid && (
            <span className="text-xs text-[#D84C4C] mt-1">
              Insufficient balance
            </span>
          )}
        </div>
        {/* Slider - ส่งค่า value และ onChange callback */}
        <div className="mt-11 mx-3">
          <DiscreteSlider value={sliderValue} onChange={handleSliderChange} />
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
              <span className="text-sm font-bold text-[#92CAFE]">2,500.00</span>
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

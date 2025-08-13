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

  // เพิ่ม state สำหรับเก็บจำนวน BTC ที่จะได้รับ
  const [receiveBTC, setReceiveBTC] = useState<string>("");

  // ฟังก์ชัน helper สำหรับ format ตัวเลขด้วย comma
  const formatNumberWithComma = (value: string): string => {
    if (!value) return "";

    // เอาส่วนที่เป็นตัวเลขออกมา (ไม่รวม comma)
    const numericValue = value.replace(/,/g, "");

    // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;

    // แยกส่วนจุดทศนิยม
    const parts = numericValue.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // เพิ่ม comma ในส่วนจำนวนเต็ม
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // รวมกลับเป็น string เดียว
    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  // ฟังก์ชันคำนวณ BTC ที่จะได้รับ
  const calculateReceiveBTC = (
    amountValue: string,
    priceValue: string
  ): string => {
    if (!amountValue || !priceValue) return "";

    const numAmount = parseFloat(amountValue.replace(/,/g, ""));
    const numPrice = parseFloat(priceValue.replace(/,/g, ""));

    if (isNaN(numAmount) || isNaN(numPrice) || numPrice <= 0) return "";

    const btcAmount = numAmount / numPrice;
    return btcAmount.toFixed(9); // Bitcoin มักแสดง 8 ตำแหน่งทศนิยม
  };

  // ฟังก์ชัน helper สำหรับตรวจสอบ format ที่ยอมให้
  const isValidNumberFormat = (value: string): boolean => {
    // ยอมให้มี comma, จุด, และตัวเลข
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,2}$/.test(numericValue);
  };

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
    return formatNumberWithComma(amount.toFixed(2));
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
    const formattedMarketPrice = formatToTwoDecimalsWithComma(marketPrice);
    setPrice(formattedMarketPrice);
    setLimitPrice(formattedMarketPrice);
    setIsInputFocused(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // ตรวจสอบ format
    if (inputValue === "" || isValidNumberFormat(inputValue)) {
      // Format ด้วย comma ทันที
      const formattedValue = formatNumberWithComma(inputValue);
      setAmount(formattedValue);

      // ตรวจสอบความถูกต้องของจำนวน
      const numericValue = inputValue.replace(/,/g, "");
      const num = parseFloat(numericValue);
      const isValid =
        inputValue === "" || (!isNaN(num) && num <= AVAILABLE_BALANCE);

      // ถ้าเงินไม่พอให้เซ็ต slider เป็น 0%
      if (!isValid && inputValue !== "") {
        setSliderValue(0);
      } else {
        // คำนวณและอัพเดต slider value เมื่อเงินพอ
        const sliderPercentage = calculateSliderPercentage(inputValue);
        setSliderValue(sliderPercentage);
      }

      setIsAmountValid(isValid);
    }
  };

  // ฟังก์ชันจัดการเมื่อ slider เปลี่ยนค่า
  const handleSliderChange = (percentage: number) => {
    setSliderValue(percentage);
    const newAmount = calculateAmountFromPercentage(percentage);
    setAmount(newAmount);

    // ตรวจสอบความถูกต้องของจำนวน
    const numericValue = newAmount.replace(/,/g, "");
    const num = parseFloat(numericValue);
    setIsAmountValid(!isNaN(num) && num <= AVAILABLE_BALANCE);
  };

  const handleAmountFocus = () => {
    setIsAmountFocused(true);
  };

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    if (amount) {
      // ตรวจสอบว่ามีทศนิยมครบ 2 ตำแหน่งหรือไม่
      const numericValue = amount.replace(/,/g, "");
      const num = parseFloat(numericValue);
      if (!isNaN(num)) {
        const formattedAmount = formatNumberWithComma(num.toFixed(2));
        setAmount(formattedAmount);
      }
    }
  };

  // แก้ไขฟังก์ชัน handleChange สำหรับ Price input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "" || isValidNumberFormat(inputValue)) {
      // Format ด้วย comma ทันที
      const formattedValue = formatNumberWithComma(inputValue);
      setLimitPrice(formattedValue);
      setPrice(formattedValue);
    }
  };

  useEffect(() => {
    // เมื่อ marketPrice เปลี่ยน ให้กลับไปแสดงราคา Market Price
    if (priceLabel === "Price") {
      const formattedPrice = formatNumberWithComma(marketPrice);
      setPrice(formattedPrice);
    }
  }, [marketPrice, priceLabel]);

  // useEffect สำหรับคำนวณ BTC ที่จะได้รับ
  useEffect(() => {
    const currentPrice = priceLabel === "Price" ? marketPrice : limitPrice;
    const btcAmount = calculateReceiveBTC(amount, currentPrice);
    setReceiveBTC(btcAmount);
  }, [amount, price, limitPrice, marketPrice, priceLabel]);

  const formatToTwoDecimalsWithComma = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/,/g, "");
    const num = parseFloat(numericValue);
    if (isNaN(num)) return "";
    return formatNumberWithComma(num.toFixed(2));
  };

  const handleBlur = () => {
    if (price) {
      const formattedPrice = formatToTwoDecimalsWithComma(price);
      setPrice(formattedPrice);
      setLimitPrice(formattedPrice);
    } else if (priceLabel === "Price" && marketPrice) {
      const formattedMarketPrice = formatToTwoDecimalsWithComma(marketPrice);
      setPrice(formattedMarketPrice);
      setLimitPrice(formattedMarketPrice);
    }
    setIsInputFocused(false);
  };

  useEffect(() => {
    if (priceLabel === "Price" && !isInputFocused && marketPrice) {
      const formattedMarketPrice = formatToTwoDecimalsWithComma(marketPrice);
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
              <input
                ref={inputRef}
                type="text"
                className="w-[90px] text-sm rounded-lg bg-[#102047] p-1 text-white text-right border-none outline-none"
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
              <span
                className={`text-sm font-normal ${
                  amount || isAmountFocused ? "text-white" : "text-[#5775B7]"
                }`}
              >
                USD
              </span>
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
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="w-[90px] text-sm rounded-lg bg-[#212121] p-1 text-white text-right border-none outline-none"
                value={amount}
                readOnly
              />
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
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="w-[100px] text-sm rounded-lg bg-[#17306B] p-1 text-white text-right border-none outline-none"
                value={receiveBTC}
                readOnly
              />
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

"use client";
import AdvancedChart from "@/features/trading/components/Chart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { CircleQuestionMark, PencilLine } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import DiscreteSlider from "@/features/trading/components/DiscreteSlider";
import Image from "next/image";
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // sell
  // เพิ่ม constants และ states ใหม่สำหรับ Sell
  const AVAILABLE_BTC_BALANCE = 0.0217; // BTC balance สำหรับ Sell

  // เพิ่ม states สำหรับ Sell tab
  const [sellAmount, setSellAmount] = useState<string>("");
  const [isSellAmountValid, setIsSellAmountValid] = useState(true);
  const [sellSliderValue, setSellSliderValue] = useState<number>(0);
  const [receiveUSD, setReceiveUSD] = useState<string>("");
  const [isSellAmountFocused, setIsSellAmountFocused] = useState(false);

  // ฟังก์ชัน helper สำหรับ format BTC (9 ตำแหน่งทศนิยม)
  const formatBTCNumber = (value: string): string => {
    if (!value) return "";

    const numericValue = value.replace(/,/g, "");

    // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่ (อนุญาตทศนิยมสูงสุด 9 ตำแหน่ง)
    if (!/^\d*\.?\d{0,9}$/.test(numericValue)) return value;

    return numericValue;
  };

  // ฟังก์ชันตรวจสอบ format สำหรับ BTC
  const isValidBTCFormat = (value: string): boolean => {
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,9}$/.test(numericValue);
  };

  // ฟังก์ชันคำนวณ USD ที่จะได้รับจากการขาย BTC
  const calculateReceiveUSD = (
    btcAmount: string,
    priceValue: string
  ): string => {
    if (!btcAmount || !priceValue) return "";

    const numBTC = parseFloat(btcAmount);
    const numPrice = parseFloat(priceValue.replace(/,/g, ""));

    if (isNaN(numBTC) || isNaN(numPrice) || numPrice <= 0) return "";

    const usdAmount = numBTC * numPrice;
    return formatNumberWithComma(usdAmount.toFixed(2));
  };

  // ฟังก์ชันคำนวณเปอร์เซ็นต์จาก BTC Amount
  const calculateSellSliderPercentage = (btcAmount: string): number => {
    if (!btcAmount) return 0;
    const numAmount = parseFloat(btcAmount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    const percentage = (numAmount / AVAILABLE_BTC_BALANCE) * 100;
    return Math.min(percentage, 100);
  };

  // ฟังก์ชันคำนวณ BTC Amount จากเปอร์เซ็นต์
  const calculateBTCFromPercentage = (percentage: number): string => {
    const btcAmount = (percentage / 100) * AVAILABLE_BTC_BALANCE;
    return btcAmount.toFixed(9);
  };

  // Handler สำหรับ Sell Amount
  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "" || isValidBTCFormat(inputValue)) {
      const formattedValue = formatBTCNumber(inputValue);
      setSellAmount(formattedValue);

      const num = parseFloat(inputValue);
      const isValid =
        inputValue === "" || (!isNaN(num) && num <= AVAILABLE_BTC_BALANCE);

      if (!isValid && inputValue !== "") {
        setSellSliderValue(0);
      } else {
        const sliderPercentage = calculateSellSliderPercentage(inputValue);
        setSellSliderValue(sliderPercentage);
      }

      setIsSellAmountValid(isValid);
    }
  };

  // Handler สำหรับ Sell Slider
  const handleSellSliderChange = (percentage: number) => {
    setSellSliderValue(percentage);
    const newBTCAmount = calculateBTCFromPercentage(percentage);
    setSellAmount(newBTCAmount);

    const num = parseFloat(newBTCAmount);
    setIsSellAmountValid(!isNaN(num) && num <= AVAILABLE_BTC_BALANCE);
  };

  const handleSellAmountFocus = () => {
    setIsSellAmountFocused(true);
  };

  const handleSellAmountBlur = () => {
    setIsSellAmountFocused(false);
    if (sellAmount) {
      const num = parseFloat(sellAmount);
      if (!isNaN(num)) {
        setSellAmount(num.toFixed(9));
      }
    }
  };

  // useEffect สำหรับคำนวณ USD ที่จะได้รับ
  useEffect(() => {
    const currentPrice = priceLabel === "Price" ? marketPrice : limitPrice;
    const usdAmount = calculateReceiveUSD(sellAmount, currentPrice);
    setReceiveUSD(usdAmount);
  }, [sellAmount, price, limitPrice, marketPrice, priceLabel]);

  return (
    <div className="flex mx-[120px] gap-10 mt-10">
      {/* Left Side - Chart */}
      <div className="flex-1 ">{/* <AdvancedChart /> */}</div>

      {/* Right Side - Buy/Sell Box */}
      <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[504px]">
        <Tabs defaultValue="buy">
          <TabsList className="w-full bg-[#2D2D2D]">
            <TabsTrigger
              value="buy"
              className={`font-bold data-[state=active]:bg-[linear-gradient(185deg,_#309C7D_23.13%,_#26F6BA_157.05%)] h-[28px] cursor-pointer`}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className={`font-bold data-[state=active]:bg-[linear-gradient(357deg,_#D84C4C_2.29%,_#722828_186.28%)] h-[28px] cursor-pointer`}
            >
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-7">
            <div className="space-y-7">
              {/* Price input */}
              <div className="flex items-center rounded-lg bg-[#17306B] px-3 py-2 justify-between h-[44px] border border-transparent focus-within:border-[#3A8AF7]">
                {/* Left Side - Price Label */}
                <span className="text-[12px] font-normal text-[#5775B7]">
                  {priceLabel}
                </span>

                {/* Right Side - Input + Icon + Button */}
                <div className="flex items-center gap-2">
                  {/* Input Market Price or Limit */}
                  <Input
                    ref={inputRef}
                    type="text"
                    className="w-[100px] text-[14px] font-normal rounded-lg bg-[#17306B] p-1 text-white text-right border-none outline-none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={price}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-normal">USD</span>
                  {/* Edit Price */}
                  {!isInputFocused && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="16"
                      viewBox="0 0 14 16"
                      fill="none"
                      className="h-4 w-4 shrink-0 cursor-pointer text-[#3A8AF7]"
                      onClick={() => {
                        inputRef.current?.focus();
                        handleFocus();
                      }}
                    >
                      <path
                        d="M3.43225 12.4891H0.25V9.30683L8.82625 0.730576C8.9669 0.589973 9.15763 0.510986 9.3565 0.510986C9.55537 0.510986 9.7461 0.589973 9.88675 0.730576L12.0085 2.85158C12.0782 2.92123 12.1336 3.00395 12.1713 3.095C12.209 3.18604 12.2285 3.28364 12.2285 3.3822C12.2285 3.48076 12.209 3.57836 12.1713 3.66941C12.1336 3.76046 12.0782 3.84317 12.0085 3.91283L3.43225 12.4891ZM0.25 13.9891H13.75V15.4891H0.25V13.9891Z"
                        fill="#3A8AF7"
                      />
                    </svg>
                  )}
                  {/* Button Matket Price */}
                  <Button
                    onClick={handleMarketClick}
                    className={`cursor-pointer h-[28px] w-[68px] rounded-[6px] transition-colors ${
                      priceLabel === "Price"
                        ? "bg-[#17306B] border border-[#92CAFE] hover:bg-[#17306B]"
                        : "bg-[#1F4293] hover:bg-[#1F4293]"
                    }`}
                  >
                    <span className="text-[10px] font-normal">Market</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M5.99998 11.4167C3.00835 11.4167 0.583313 8.99167 0.583313 6.00004C0.583313 3.00842 3.00835 0.583374 5.99998 0.583374C8.9916 0.583374 11.4166 3.00842 11.4166 6.00004C11.4166 8.99167 8.9916 11.4167 5.99998 11.4167ZM5.45831 7.62504V8.70837H6.54165V7.62504H5.45831ZM6.54165 6.734C6.97697 6.60279 7.35068 6.3196 7.59473 5.93598C7.83878 5.55237 7.93693 5.09386 7.87129 4.64396C7.80566 4.19406 7.58062 3.7827 7.23715 3.48479C6.89369 3.18688 6.45464 3.02225 5.99998 3.02087C5.56166 3.02074 5.13684 3.17248 4.79781 3.45029C4.45877 3.72809 4.22647 4.11479 4.14044 4.54458L5.20319 4.75746C5.23335 4.60657 5.30574 4.46734 5.41193 4.35598C5.51812 4.24462 5.65375 4.16571 5.80304 4.12842C5.95233 4.09114 6.10914 4.09701 6.25522 4.14536C6.40131 4.19371 6.53066 4.28254 6.62822 4.40153C6.72579 4.52052 6.78756 4.66477 6.80635 4.8175C6.82514 4.97022 6.80017 5.12514 6.73436 5.26423C6.66854 5.40332 6.56458 5.52086 6.43457 5.60318C6.30457 5.68549 6.15386 5.7292 5.99998 5.72921C5.85632 5.72921 5.71855 5.78628 5.61696 5.88786C5.51538 5.98944 5.45831 6.12722 5.45831 6.27087V7.08337H6.54165V6.734Z"
                        fill="white"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
              {/* Available Balance */}
              <div className="space-y-1">
                <div className="flex justify-between mt-7">
                  <div className="text-[10px] text-[#9AAACE]">
                    Available Balance
                  </div>
                  <div className="flex flex-row gap-1 text-[10px] text-[#9AAACE]">
                    <div>10,000.00</div>
                    <div>USD</div>
                  </div>
                </div>

                {/* Amount */}
                <div className="relative">
                  <div
                    className={`flex items-center rounded-lg px-3 py-3 justify-between border h-[44px] ${
                      !isAmountValid
                        ? "bg-[#17306B] border-[#D84C4C]"
                        : "bg-[#17306B] border-transparent focus-within:border-[#3A8AF7]"
                    }`}
                  >
                    <span className="text-[12px] font-normal text-[#5775B7]">
                      Amount
                    </span>
                    <div className="flex items-center gap-2 text-[16px]">
                      <Input
                        ref={amountInputRef}
                        type="text"
                        className="bg-transparent p-1 text-white text-right border-none outline-none focus:outline-none"
                        value={amount}
                        onChange={handleAmountChange}
                        onFocus={handleAmountFocus}
                        onBlur={handleAmountBlur}
                      />
                      <span
                        className={`text-[14px] font-normal ${
                          amount || isAmountFocused
                            ? "text-white"
                            : "text-[#5775B7]"
                        }`}
                      >
                        USD
                      </span>
                    </div>
                  </div>
                  {!isAmountValid && (
                    <span className="absolute top-full mt-1 text-[12px] text-[#D84C4C] z-10">
                      Insufficient balance
                    </span>
                  )}
                </div>
              </div>
              {/* Slider - ส่งค่า value และ onChange callback */}
              <div className="mx-3">
                <DiscreteSlider
                  value={sliderValue}
                  onChange={handleSliderChange}
                />
              </div>
              <div className="space-y-4">
                {/* Amount Cal */}
                <div className="relative flex items-center">
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
                  <div className="bg-[#212121] w-full rounded-lg flex items-center justify-between pl-[90px] pr-4 py-3 h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
                    <span className="text-[#92CAFE] text-[12px] font-normal">
                      Amount
                    </span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="w-[90px] text-[16px] font-normal rounded-lg bg-[#212121] p-1 text-[#92CAFE] text-right border-none outline-none cursor-context-menu"
                        value={amount}
                        readOnly
                      />
                      <span className="text-[16px] font-normal text-[#92CAFE]">
                        USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* arrow */}
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                  >
                    <path
                      d="M7.00003 13.6355L13.207 7.4285L11.793 6.0145L7.00003 10.8075L2.20703 6.0145L0.79303 7.4285L7.00003 13.6355ZM7.00003 7.9855L13.207 1.7785L11.793 0.364502L7.00003 5.1575L2.20703 0.364502L0.79303 1.7785L7.00003 7.9855Z"
                      fill="#49B6AE"
                    />
                  </svg>
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
                  <div className="bg-[#17306B] w-full rounded-lg flex items-center justify-between pl-[90px] pr-4 py-3 h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
                    <span className="text-[#92CAFE] text-[12px] font-normal">
                      Receive
                    </span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="w-full text-[16px] font-normal rounded-lg bg-[#17306B] p-1 text-[#92CAFE] text-right border-none outline-none cursor-context-menu"
                        value={receiveBTC}
                        readOnly
                      />
                      <span className="text-[16px] font-normal text-[#92CAFE]">
                        BTC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Button */}
              <div className="mt-8 w-full">
                <Button className="w-full rounded-lg bg-[#309C7D] hover:bg-[#28886C] cursor-pointer text-[16px] font-normal">
                  Buy
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="mt-7">
            <div className="space-y-7">
              {/* Price input - เหมือน Buy tab */}
              <div className="flex items-center rounded-lg bg-[#17306B] px-3 py-2 justify-between h-[44px] border border-transparent focus-within:border-[#3A8AF7]">
                <span className="text-[12px] font-normal text-[#5775B7]">
                  {priceLabel}
                </span>

                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    className="w-[100px] text-[14px] font-normal rounded-lg bg-[#17306B] p-1 text-white text-right border-none outline-none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={price}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-normal">USD</span>
                  {!isInputFocused && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="16"
                      viewBox="0 0 14 16"
                      fill="none"
                      className="h-4 w-4 shrink-0 cursor-pointer text-[#3A8AF7]"
                      onClick={() => {
                        inputRef.current?.focus();
                        handleFocus();
                      }}
                    >
                      <path
                        d="M3.43225 12.4891H0.25V9.30683L8.82625 0.730576C8.9669 0.589973 9.15763 0.510986 9.3565 0.510986C9.55537 0.510986 9.7461 0.589973 9.88675 0.730576L12.0085 2.85158C12.0782 2.92123 12.1336 3.00395 12.1713 3.095C12.209 3.18604 12.2285 3.28364 12.2285 3.3822C12.2285 3.48076 12.209 3.57836 12.1713 3.66941C12.1336 3.76046 12.0782 3.84317 12.0085 3.91283L3.43225 12.4891ZM0.25 13.9891H13.75V15.4891H0.25V13.9891Z"
                        fill="#3A8AF7"
                      />
                    </svg>
                  )}
                  <Button
                    onClick={handleMarketClick}
                    className={`cursor-pointer h-[28px] w-[68px] rounded-[6px] transition-colors ${
                      priceLabel === "Price"
                        ? "bg-[#17306B] border border-[#92CAFE] hover:bg-[#17306B]"
                        : "bg-[#1F4293] hover:bg-[#1F4293]"
                    }`}
                  >
                    <span className="text-[10px] font-normal">Market</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M5.99998 11.4167C3.00835 11.4167 0.583313 8.99167 0.583313 6.00004C0.583313 3.00842 3.00835 0.583374 5.99998 0.583374C8.9916 0.583374 11.4166 3.00842 11.4166 6.00004C11.4166 8.99167 8.9916 11.4167 5.99998 11.4167ZM5.45831 7.62504V8.70837H6.54165V7.62504H5.45831ZM6.54165 6.734C6.97697 6.60279 7.35068 6.3196 7.59473 5.93598C7.83878 5.55237 7.93693 5.09386 7.87129 4.64396C7.80566 4.19406 7.58062 3.7827 7.23715 3.48479C6.89369 3.18688 6.45464 3.02225 5.99998 3.02087C5.56166 3.02074 5.13684 3.17248 4.79781 3.45029C4.45877 3.72809 4.22647 4.11479 4.14044 4.54458L5.20319 4.75746C5.23335 4.60657 5.30574 4.46734 5.41193 4.35598C5.51812 4.24462 5.65375 4.16571 5.80304 4.12842C5.95233 4.09114 6.10914 4.09701 6.25522 4.14536C6.40131 4.19371 6.53066 4.28254 6.62822 4.40153C6.72579 4.52052 6.78756 4.66477 6.80635 4.8175C6.82514 4.97022 6.80017 5.12514 6.73436 5.26423C6.66854 5.40332 6.56458 5.52086 6.43457 5.60318C6.30457 5.68549 6.15386 5.7292 5.99998 5.72921C5.85632 5.72921 5.71855 5.78628 5.61696 5.88786C5.51538 5.98944 5.45831 6.12722 5.45831 6.27087V7.08337H6.54165V6.734Z"
                        fill="white"
                      />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Available Balance - เปลี่ยนเป็น BTC */}
              <div className="space-y-1">
                <div className="flex justify-between mt-7">
                  <div className="text-[10px] text-[#9AAACE]">
                    Available Balance
                  </div>
                  <div className="flex flex-row gap-1 text-[10px] text-[#9AAACE]">
                    <div>0.021700000</div>
                    <div>BTC</div>
                  </div>
                </div>

                {/* Amount - เปลี่ยนเป็นรับ BTC */}
                <div className="relative">
                  <div
                    className={`flex items-center rounded-lg px-3 py-3 justify-between border h-[44px] ${
                      !isSellAmountValid
                        ? "bg-[#17306B] border-[#D84C4C]"
                        : "bg-[#17306B] border-transparent focus-within:border-[#3A8AF7]"
                    }`}
                  >
                    <span className="text-[12px] font-normal text-[#5775B7]">
                      Amount
                    </span>
                    <div className="flex items-center gap-2 text-[16px]">
                      <Input
                        type="text"
                        className="bg-transparent p-1 text-white text-right border-none outline-none focus:outline-none"
                        value={sellAmount}
                        onChange={handleSellAmountChange}
                        onFocus={handleSellAmountFocus}
                        onBlur={handleSellAmountBlur}
                      />
                      <span
                        className={`text-[14px] font-normal ${
                          sellAmount || isSellAmountFocused
                            ? "text-white"
                            : "text-[#5775B7]"
                        }`}
                      >
                        BTC
                      </span>
                    </div>
                  </div>
                  {!isSellAmountValid && (
                    <span className="absolute top-full mt-1 text-[12px] text-[#D84C4C] z-10">
                      Insufficient balance
                    </span>
                  )}
                </div>
              </div>

              {/* Slider */}
              <div className="mx-3">
                <DiscreteSlider
                  value={sellSliderValue}
                  onChange={handleSellSliderChange}
                />
              </div>

              <div className="space-y-4">
                {/* Amount Cal - แสดง BTC */}
                <div className="relative flex items-center">
                  <div className="absolute z-10">
                    <Image
                      src="/currency-icons/bitcoin-icon.svg"
                      alt="Bitcoin Icon"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div className="bg-[#212121] w-full rounded-lg flex items-center justify-between pl-[90px] pr-4 py-3 h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
                    <span className="text-[#92CAFE] text-[12px] font-normal">
                      Amount
                    </span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="w-full text-[16px] font-normal rounded-lg bg-[#212121] p-1 text-[#92CAFE] text-right border-none outline-none cursor-context-menu"
                        value={sellAmount}
                        readOnly
                      />
                      <span className="text-[16px] font-normal text-[#92CAFE]">
                        BTC
                      </span>
                    </div>
                  </div>
                </div>

                {/* arrow */}
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                  >
                    <path
                      d="M7.00003 13.6355L13.207 7.4285L11.793 6.0145L7.00003 10.8075L2.20703 6.0145L0.79303 7.4285L7.00003 13.6355ZM7.00003 7.9855L13.207 1.7785L11.793 0.364502L7.00003 5.1575L2.20703 0.364502L0.79303 1.7785L7.00003 7.9855Z"
                      fill="#49B6AE"
                    />
                  </svg>
                </div>

                {/* Receive - แสดง USD ที่จะได้รับ */}
                <div className="relative flex items-center mt-3">
                  <div className="absolute left-0 z-10">
                    <Image
                      src="/currency-icons/dollar-icon.svg"
                      alt="Dollar Icon"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div className="bg-[#17306B] w-full rounded-lg flex items-center justify-between pl-[90px] pr-4 py-3 h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
                    <span className="text-[#92CAFE] text-[12px] font-normal">
                      Receive
                    </span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="w-full text-[16px] font-normal rounded-lg bg-[#17306B] p-1 text-[#92CAFE] text-right border-none outline-none cursor-context-menu"
                        value={receiveUSD}
                        readOnly
                      />
                      <span className="text-[16px] font-normal text-[#92CAFE]">
                        USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="mt-8 w-full">
                <Button className="w-full rounded-lg bg-[#D84C4C] hover:bg-[#C73E3E] cursor-pointer text-[16px] font-normal">
                  Sell
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

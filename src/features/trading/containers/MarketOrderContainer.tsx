"use client";
import React, { useState, useEffect, useRef } from "react";
import OrderForm from "@/features/trading/components/OrderForm";
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MarketOrderContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const marketPrice = useMarketPrice();

  // Common states
  const [priceLabel, setPriceLabel] = useState("Price");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [price, setPrice] = useState<string>(marketPrice);

  // Buy states
  const [amount, setAmount] = useState<string>("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [receiveBTC, setReceiveBTC] = useState<string>("");
  const AVAILABLE_BALANCE = 10000;

  // Sell states
  const [sellAmount, setSellAmount] = useState<string>("");
  const [isSellAmountValid, setIsSellAmountValid] = useState(true);
  const [sellSliderValue, setSellSliderValue] = useState<number>(0);
  const [receiveUSD, setReceiveUSD] = useState<string>("");
  const [isSellAmountFocused, setIsSellAmountFocused] = useState(false);
  const AVAILABLE_BTC_BALANCE = 0.0217;

  // Helper functions
  const formatNumberWithComma = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/,/g, "");
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;
    const parts = numericValue.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const formatToTwoDecimalsWithComma = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/,/g, "");
    const num = parseFloat(numericValue);
    if (isNaN(num)) return "";
    return formatNumberWithComma(num.toFixed(2));
  };

  const formatBTCNumber = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/,/g, "");
    if (!/^\d*\.?\d{0,9}$/.test(numericValue)) return value;
    return numericValue;
  };

  const isValidNumberFormat = (value: string): boolean => {
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,2}$/.test(numericValue);
  };

  const isValidBTCFormat = (value: string): boolean => {
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,9}$/.test(numericValue);
  };

  const calculateReceiveBTC = (
    amountValue: string,
    priceValue: string
  ): string => {
    if (!amountValue || !priceValue) return "";
    const numAmount = parseFloat(amountValue.replace(/,/g, ""));
    const numPrice = parseFloat(priceValue.replace(/,/g, ""));
    if (isNaN(numAmount) || isNaN(numPrice) || numPrice <= 0) return "";
    const btcAmount = numAmount / numPrice;
    return btcAmount.toFixed(9);
  };

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

  const calculateSliderPercentage = (amountValue: string): number => {
    if (!amountValue) return 0;
    const numAmount = parseFloat(amountValue.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    const percentage = (numAmount / AVAILABLE_BALANCE) * 100;
    return Math.min(percentage, 100);
  };

  const calculateSellSliderPercentage = (btcAmount: string): number => {
    if (!btcAmount) return 0;
    const numAmount = parseFloat(btcAmount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    const percentage = (numAmount / AVAILABLE_BTC_BALANCE) * 100;
    return Math.min(percentage, 100);
  };

  const calculateAmountFromPercentage = (percentage: number): string => {
    const amount = (percentage / 100) * AVAILABLE_BALANCE;
    return formatNumberWithComma(amount.toFixed(2));
  };

  const calculateBTCFromPercentage = (percentage: number): string => {
    const btcAmount = (percentage / 100) * AVAILABLE_BTC_BALANCE;
    return btcAmount.toFixed(9);
  };

  // Price handlers
  const handleFocus = () => {
    setPriceLabel("Limit price");
    setIsInputFocused(true);
    setPrice("");
    setLimitPrice("");
  };

  const handleMarketClick = () => {
    setPriceLabel("Price");
    const formattedMarketPrice = formatToTwoDecimalsWithComma(marketPrice);
    setPrice(formattedMarketPrice);
    setLimitPrice(formattedMarketPrice);
    setIsInputFocused(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || isValidNumberFormat(inputValue)) {
      const formattedValue = formatNumberWithComma(inputValue);
      setLimitPrice(formattedValue);
      setPrice(formattedValue);
    }
  };

  const handlePriceBlur = () => {
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

  // Buy handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || isValidNumberFormat(inputValue)) {
      const formattedValue = formatNumberWithComma(inputValue);
      setAmount(formattedValue);

      const numericValue = inputValue.replace(/,/g, "");
      const num = parseFloat(numericValue);
      const isValid =
        inputValue === "" || (!isNaN(num) && num <= AVAILABLE_BALANCE);

      if (!isValid && inputValue !== "") {
        setSliderValue(0);
      } else {
        const sliderPercentage = calculateSliderPercentage(inputValue);
        setSliderValue(sliderPercentage);
      }
      setIsAmountValid(isValid);
    }
  };

  const handleSliderChange = (percentage: number) => {
    setSliderValue(percentage);
    const newAmount = calculateAmountFromPercentage(percentage);
    setAmount(newAmount);
    const numericValue = newAmount.replace(/,/g, "");
    const num = parseFloat(numericValue);
    setIsAmountValid(!isNaN(num) && num <= AVAILABLE_BALANCE);
  };

  const handleAmountFocus = () => setIsAmountFocused(true);

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    if (amount) {
      const numericValue = amount.replace(/,/g, "");
      const num = parseFloat(numericValue);
      if (!isNaN(num)) {
        const formattedAmount = formatNumberWithComma(num.toFixed(2));
        setAmount(formattedAmount);
      }
    }
  };

  // Sell handlers
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

  const handleSellSliderChange = (percentage: number) => {
    setSellSliderValue(percentage);
    const newBTCAmount = calculateBTCFromPercentage(percentage);
    setSellAmount(newBTCAmount);
    const num = parseFloat(newBTCAmount);
    setIsSellAmountValid(!isNaN(num) && num <= AVAILABLE_BTC_BALANCE);
  };

  const handleSellAmountFocus = () => setIsSellAmountFocused(true);

  const handleSellAmountBlur = () => {
    setIsSellAmountFocused(false);
    if (sellAmount) {
      const num = parseFloat(sellAmount);
      if (!isNaN(num)) setSellAmount(num.toFixed(9));
    }
  };

  // Effects
  useEffect(() => {
    if (priceLabel === "Price") {
      const formattedPrice = formatNumberWithComma(marketPrice);
      setPrice(formattedPrice);
    }
  }, [marketPrice, priceLabel]);

  useEffect(() => {
    const currentPrice = priceLabel === "Price" ? marketPrice : limitPrice;
    const btcAmount = calculateReceiveBTC(amount, currentPrice);
    setReceiveBTC(btcAmount);
  }, [amount, price, limitPrice, marketPrice, priceLabel]);

  useEffect(() => {
    const currentPrice = priceLabel === "Price" ? marketPrice : limitPrice;
    const usdAmount = calculateReceiveUSD(sellAmount, currentPrice);
    setReceiveUSD(usdAmount);
  }, [sellAmount, price, limitPrice, marketPrice, priceLabel]);

  useEffect(() => {
    if (priceLabel === "Price" && !isInputFocused && marketPrice) {
      const formattedMarketPrice = formatToTwoDecimalsWithComma(marketPrice);
      setPrice(formattedMarketPrice);
      setLimitPrice(formattedMarketPrice);
    }
  }, [marketPrice, priceLabel, isInputFocused]);

const handleSubmit = (type: "buy" | "sell") => {
  const action = type === "buy" ? "Buy" : "Sell";
  const amountToSubmit = type === "buy" ? amount : sellAmount; // USD หรือ BTC
  const receiveAmountToSubmit = type === "buy" ? receiveBTC : receiveUSD;

  // format ฝั่ง buy (USD) -> 2 ตำแหน่ง พร้อม comma
  // format ฝั่ง sell (BTC) -> 9 ตำแหน่ง
  const formattedAmount =
    type === "buy"
      ? formatToTwoDecimalsWithComma(amountToSubmit) // USD
      : parseFloat(amountToSubmit).toFixed(9); // BTC

  // format receiveAmount
  const formattedReceiveAmount =
    type === "buy"
      ? parseFloat(receiveAmountToSubmit).toFixed(9) // BTC
      : formatToTwoDecimalsWithComma(receiveAmountToSubmit); // USD

  const message = `${action} BTC/USDT (${formattedAmount} ${
    type === "buy" ? "USD" : "BTC"
  }) submitted successfully. You will receive ${formattedReceiveAmount} ${
    type === "buy" ? "BTC" : "USD"
  }.`;

  alert(message);
};


  return (
    <div>
      <Tabs defaultValue="buy">
        <TabsList className="w-full bg-[#2D2D2D]">
          <TabsTrigger
            value="buy"
            className="font-bold data-[state=active]:bg-[linear-gradient(185deg,_#309C7D_23.13%,_#26F6BA_157.05%)] h-[28px] cursor-pointer"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="font-bold data-[state=active]:bg-[linear-gradient(357deg,_#D84C4C_2.29%,_#722828_186.28%)] h-[28px] cursor-pointer"
          >
            Sell
          </TabsTrigger>
        </TabsList>

        {/* Buy Tab */}
        <TabsContent value="buy" className="mt-7">
          <OrderForm
            type="buy"
            inputRef={inputRef}
            amountInputRef={amountInputRef}
            priceLabel={priceLabel}
            price={price}
            amount={amount}
            receiveAmount={receiveBTC}
            sliderValue={sliderValue}
            isAmountValid={isAmountValid}
            isInputFocused={isInputFocused}
            isAmountFocused={isAmountFocused}
            availableBalance="10,000.00"
            balanceCurrency="USD"
            onPriceFocus={handleFocus}
            onPriceChange={handlePriceChange}
            onPriceBlur={handlePriceBlur}
            onAmountChange={handleAmountChange}
            onAmountFocus={handleAmountFocus}
            onAmountBlur={handleAmountBlur}
            onSliderChange={handleSliderChange}
            onMarketClick={handleMarketClick}
            onSubmit={() => handleSubmit("buy")}
          />
        </TabsContent>

        {/* Sell Tab */}
        <TabsContent value="sell" className="mt-7">
          <OrderForm
            type="sell"
            inputRef={inputRef}
            amountInputRef={amountInputRef}
            priceLabel={priceLabel}
            price={price}
            amount={sellAmount}
            receiveAmount={receiveUSD}
            sliderValue={sellSliderValue}
            isAmountValid={isSellAmountValid}
            isInputFocused={isInputFocused}
            isAmountFocused={isSellAmountFocused}
            availableBalance="0.021700000"
            balanceCurrency="BTC"
            onPriceFocus={handleFocus}
            onPriceChange={handlePriceChange}
            onPriceBlur={handlePriceBlur}
            onAmountChange={handleSellAmountChange}
            onAmountFocus={handleSellAmountFocus}
            onAmountBlur={handleSellAmountBlur}
            onSliderChange={handleSellSliderChange}
            onMarketClick={handleMarketClick}
            onSubmit={() => handleSubmit("sell")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

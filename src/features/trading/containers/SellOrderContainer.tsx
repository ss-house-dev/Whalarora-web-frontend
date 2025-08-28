"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import OrderForm from "@/features/trading/components/OrderForm";
import AlertBox from "@/components/ui/alert-box-sell"; // Import AlertBox component
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetCashBalance } from "@/features/wallet/hooks/useGetCash";
import { useCreateSellOrder } from "@/features/trading/hooks/useCreateSellOrder";
import { useQueryClient } from "@tanstack/react-query";
import { TradeQueryKeys } from "@/features/trading/constants";
import { useGetCoin } from "@/features/trading/hooks/useGetCoin";

// Define a type for the user object with id property
interface UserWithId {
  id: string;
  email?: string;
}

export default function SellOrderContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const marketPrice = useMarketPrice();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Alert Box states
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"success" | "info" | "error">("success");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Fetch wallet balance
  const {
    data: cashBalance,
  } = useGetCashBalance({
    enabled: !!session,
  });

  // Fetch BTC balance
  const {
    data: btcBalance,
  } = useGetCoin({
    symbol: "BTC",
    enabled: !!session,
  });

  // Create sell order mutation
  const createSellOrderMutation = useCreateSellOrder({
    onSuccess: (data) => {
      console.log("Sell order created successfully:", data);
      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });
      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_COIN_ASSET, "BTC"],
      });

      // Show success message with updated response format using AlertBox
      if (data.filled > 0) {
        setAlertMessage(
          `Sell order completed successfully!\nProceeds: $${data.proceeds.toFixed(2)}`
        );
        setAlertType("success");
      } else {
        setAlertMessage(
          `Sell order created successfully!\nStatus: Pending`
        );
        setAlertType("info");
      }
      setShowAlert(true);
      handleSubmitSuccess();
    },
    onError: (error) => {
      console.error("Sell order error:", error);
      setAlertMessage(`Error creating sell order: ${error.message}`);
      setAlertType("error");
      setShowAlert(true);
    },
  });

  // Sell states
  const [priceLabel, setPriceLabel] = useState("Price");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [price, setPrice] = useState<string>(marketPrice);
  const [sellAmount, setSellAmount] = useState<string>("");
  const [isSellAmountValid, setIsSellAmountValid] = useState(true);
  const [sellAmountErrorMessage, setSellAmountErrorMessage] = useState("");
  const [sellSliderValue, setSellSliderValue] = useState<number>(0);
  const [receiveUSD, setReceiveUSD] = useState<string>("");
  const [isSellAmountFocused, setIsSellAmountFocused] = useState(false);

  const formatToMaxDigits = useCallback(
    (value: number, maxDigits: number = 10): string => {
      if (typeof value !== "number" || isNaN(value)) return "0";

      const valueStr = value.toString();

      // ถ้าตัวเลขทั้งหมดไม่เกิน maxDigits ให้แสดงทั้งหมด
      const totalDigits = valueStr.replace(".", "").length;
      if (totalDigits <= maxDigits) {
        return valueStr;
      }

      // หาตำแหน่งจุดทศนิยม
      const decimalIndex = valueStr.indexOf(".");

      // ถ้าไม่มีทศนิยม
      if (decimalIndex === -1) {
        // ถ้าจำนวนเต็มเกิน maxDigits ให้ตัดแสดงแค่ maxDigits ตัวแรก
        return valueStr.substring(0, maxDigits);
      }

      const integerPart = valueStr.substring(0, decimalIndex);
      const decimalPart = valueStr.substring(decimalIndex + 1);

      // คำนวณว่าสามารถแสดงทศนิยมกี่หลัก
      const availableDecimalDigits = maxDigits - integerPart.length;

      // ถ้าจำนวนเต็มเกิน maxDigits แล้ว
      if (availableDecimalDigits <= 0) {
        return integerPart.substring(0, maxDigits);
      }

      // ตัดทศนิยมให้พอดีกับที่เหลือ
      const truncatedDecimal = decimalPart.substring(0, availableDecimalDigits);
      return integerPart + "." + truncatedDecimal;
    },
    []
  );

  // Get available BTC balance
  const getAvailableBTCBalance = useCallback(() => {
    if (!session || !btcBalance) return 0;
    return btcBalance.amount || 0;
  }, [session, btcBalance]);

  const formatAvailableBTCBalance = useCallback(() => {
    const balance = getAvailableBTCBalance();
    return formatToMaxDigits(balance, 10); // แสดงตัวเลขทั้งหมด 10 ตัว
  }, [getAvailableBTCBalance, formatToMaxDigits]);

  // Helper functions
  const formatNumberWithComma = useCallback((value: string): string => {
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
  }, []);

  const formatToTwoDecimalsWithComma = useCallback(
    (value: string): string => {
      if (!value) return "";
      const numericValue = value.replace(/,/g, "");
      const num = parseFloat(numericValue);
      if (isNaN(num)) return "";
      return formatNumberWithComma(num.toFixed(2));
    },
    [formatNumberWithComma]
  );

  const formatBTCNumber = useCallback((value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/,/g, "");
    if (!/^\d*\.?\d{0,9}$/.test(numericValue)) return value;
    return numericValue;
  }, []);

  const isValidNumberFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,2}$/.test(numericValue);
  }, []);

  const isValidBTCFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,9}$/.test(numericValue);
  }, []);

  const calculateReceiveUSD = useCallback(
    (btcAmount: string, priceValue: string): string => {
      if (!btcAmount || !priceValue) return "";
      const numBTC = parseFloat(btcAmount);
      const numPrice = parseFloat(priceValue.replace(/,/g, ""));
      if (isNaN(numBTC) || isNaN(numPrice) || numPrice <= 0) return "";
      const usdAmount = numBTC * numPrice;
      return formatNumberWithComma(usdAmount.toFixed(2));
    },
    [formatNumberWithComma]
  );

  const calculateSellSliderPercentage = useCallback(
    (btcAmount: string): number => {
      if (!btcAmount) return 0;
      const numAmount = parseFloat(btcAmount);
      const availableBTC = getAvailableBTCBalance();
      if (isNaN(numAmount) || numAmount <= 0 || availableBTC <= 0) return 0;
      const percentage = (numAmount / availableBTC) * 100;
      return Math.min(percentage, 100);
    },
    [getAvailableBTCBalance]
  );

  const calculateBTCFromPercentage = useCallback(
    (percentage: number): string => {
      const availableBTC = getAvailableBTCBalance();
      const btcAmount = (percentage / 100) * availableBTC;
      return formatToMaxDigits(btcAmount, 10);
    },
    [getAvailableBTCBalance, formatToMaxDigits]
  );

  // Validation function
  const validateSellAmount = useCallback(() => {
    const num = parseFloat(sellAmount);
    const availableBTC = getAvailableBTCBalance();

    // Check if amount is empty or zero
    if (!sellAmount || sellAmount === "" || num === 0 || isNaN(num)) {
      setIsSellAmountValid(false);
      setSellAmountErrorMessage("Please enter amount");
      return false;
    }

    // Check if amount exceeds available balance
    if (num > availableBTC) {
      setIsSellAmountValid(false);
      setSellAmountErrorMessage("Insufficient balance");
      return false;
    }

    // Amount is valid
    setIsSellAmountValid(true);
    setSellAmountErrorMessage("");
    return true;
  }, [sellAmount, getAvailableBTCBalance]);

  // Price handlers
  const handlePriceFocus = () => {
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

  // Sell handlers
  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || isValidBTCFormat(inputValue)) {
      const formattedValue = formatBTCNumber(inputValue);
      setSellAmount(formattedValue);

      const num = parseFloat(inputValue);
      const availableBTC = getAvailableBTCBalance();

      // Check validation
      if (inputValue === "" || num === 0 || isNaN(num)) {
        setIsSellAmountValid(true);
        setSellAmountErrorMessage("");
        setSellSliderValue(0);
      } else if (num > availableBTC) {
        // Amount exceeds balance - show error immediately
        setIsSellAmountValid(false);
        setSellAmountErrorMessage("Insufficient balance");
        setSellSliderValue(0);
      } else {
        // Valid amount
        setIsSellAmountValid(true);
        setSellAmountErrorMessage("");
        const sliderPercentage = calculateSellSliderPercentage(inputValue);
        setSellSliderValue(sliderPercentage);
      }
    }
  };

  const handleSellSliderChange = (percentage: number) => {
    setSellSliderValue(percentage);
    const newBTCAmount = calculateBTCFromPercentage(percentage);
    setSellAmount(newBTCAmount);
    const num = parseFloat(newBTCAmount);
    const availableBTC = getAvailableBTCBalance();
    const isValid = !isNaN(num) && num <= availableBTC;
    setIsSellAmountValid(isValid);

    if (isValid) {
      setSellAmountErrorMessage("");
    }
  };

  const handleSellAmountFocus = () => setIsSellAmountFocused(true);

  const handleSellAmountBlur = () => {
    setIsSellAmountFocused(false);
    if (sellAmount) {
      const num = parseFloat(sellAmount);
      if (!isNaN(num)) {
        setSellAmount(formatToMaxDigits(num, 10));
      }
      // Validate on blur
      validateSellAmount();
    }
  };

  // Submit handler
  const handleSubmit = () => {
    if (!session) {
      setAlertMessage("Please login to continue trading");
      setAlertType("error");
      setShowAlert(true);
      router.push("/auth/sign-in");
      return;
    }

    // Validate amount before proceeding
    if (!validateSellAmount()) {
      return;
    }

    const numericAmount = parseFloat(sellAmount.replace(/,/g, "") || "0");

    // Handle sell order submission with updated payload
    const numericPrice = parseFloat(price.replace(/,/g, "") || "0");
    const btcAmountToSell = parseFloat(sellAmount || "0");
    const userId =
      cashBalance?.userId || 
      (session.user as UserWithId)?.id || 
      session.user?.email || 
      "";

    // Calculate lotPrice (total value of the trade)
    const lotPrice = numericPrice * btcAmountToSell;

    const sellOrderPayload = {
      userId: userId,
      symbol: "BTC",
      price: numericPrice,
      amount: btcAmountToSell,
      lotPrice: lotPrice, // เพิ่ม lotPrice ตาม API spec
    };

    console.log("Sell order payload:", sellOrderPayload);
    console.log("BTC amount to sell:", btcAmountToSell);
    console.log("Price per BTC:", numericPrice);
    console.log("Lot Price (total value):", lotPrice);
    console.log("USD to receive:", receiveUSD);

    createSellOrderMutation.mutate(sellOrderPayload);
  };

  const handleSubmitSuccess = () => {
    setSellAmount("");
    setSellSliderValue(0);
    setReceiveUSD("");
    setIsSellAmountValid(true);
    setSellAmountErrorMessage("");
  };

  // Handle alert close
  const handleAlertClose = () => {
    setShowAlert(false);
  };

  // Effects
  useEffect(() => {
    if (priceLabel === "Price") {
      const formattedPrice = formatNumberWithComma(marketPrice);
      setPrice(formattedPrice);
    }
  }, [marketPrice, priceLabel, formatNumberWithComma]);

  useEffect(() => {
    const currentPrice = priceLabel === "Price" ? marketPrice : limitPrice;
    const usdAmount = calculateReceiveUSD(sellAmount, currentPrice);
    setReceiveUSD(usdAmount);
  }, [
    sellAmount,
    price,
    limitPrice,
    marketPrice,
    priceLabel,
    calculateReceiveUSD,
  ]);

  useEffect(() => {
    if (priceLabel === "Price" && !isInputFocused && marketPrice) {
      const formattedMarketPrice = formatToTwoDecimalsWithComma(marketPrice);
      setPrice(formattedMarketPrice);
      setLimitPrice(formattedMarketPrice);
    }
  }, [marketPrice, priceLabel, isInputFocused, formatToTwoDecimalsWithComma]);

  return (
    <div className="relative">
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
        availableBalance={formatAvailableBTCBalance()}
        balanceCurrency="BTC"
        symbol="BTC"
        buttonColor="bg-[#D84C4C] hover:bg-[#C73E3E]"
        amountIcon="/currency-icons/bitcoin-icon.svg"
        receiveIcon="/currency-icons/dollar-icon.svg"
        isSubmitting={createSellOrderMutation.isPending}
        amountErrorMessage={sellAmountErrorMessage}
        onPriceFocus={handlePriceFocus}
        onPriceChange={handlePriceChange}
        onPriceBlur={handlePriceBlur}
        onAmountChange={handleSellAmountChange}
        onAmountFocus={handleSellAmountFocus}
        onAmountBlur={handleSellAmountBlur}
        onSliderChange={handleSellSliderChange}
        onMarketClick={handleMarketClick}
        onSubmit={handleSubmit}
      />

      {/* AlertBox positioned at bottom-right */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <AlertBox
            message={alertMessage}
            type={alertType}
            onClose={handleAlertClose}
            duration={5000} // Show for 5 seconds
          />
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import OrderForm from "@/features/trading/components/OrderForm";
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetCashBalance } from "@/features/wallet/hooks/useGetCash";
import { useCreateSellOrder } from "@/features/trading/hooks/useCreateSellOrder";
import { useQueryClient } from "@tanstack/react-query";
import { TradeQueryKeys } from "@/features/trading/constants";
import { useGetCoin } from "@/features/trading/hooks/useGetCoin";

export default function SellOrderContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const marketPrice = useMarketPrice();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch wallet balance
  const {
    data: cashBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useGetCashBalance({
    enabled: !!session,
  });

  // Fetch BTC balance
  const {
    data: btcBalance,
    isLoading: isBtcBalanceLoading,
    error: btcBalanceError,
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

      // Show success message with updated response format
      if (data.filled > 0) {
        alert(
          `✅ Sell order completed successfully!\n` +
            `Order ID: ${data.orderRef}\n` +
            `BTC Sold: ${data.filled.toFixed(8)}\n` +
            `Proceeds: $${data.proceeds.toFixed(2)}`
        );
      } else {
        alert(
          `📝 Sell order created successfully!\n` +
            `Order ID: ${data.orderRef}\n` +
            `Status: Pending`
        );
      }
      handleSubmitSuccess();
    },
    onError: (error) => {
      console.error("Sell order error:", error);
      alert(`Error creating sell order: ${error.message}`);
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

  // Get available BTC balance dynamically
  const getAvailableBTCBalance = useCallback(() => {
    if (!session || !btcBalance) return 0;
    return btcBalance.amount || 0;
  }, [session, btcBalance]);

  // Format available BTC balance for display
  const formatAvailableBTCBalance = useCallback(() => {
    const balance = getAvailableBTCBalance();
    return balance.toFixed(9); // แสดงทศนิยม 9 ตำแหน่งสำหรับ BTC
  }, [getAvailableBTCBalance]);

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
      return btcAmount.toFixed(9);
    },
    [getAvailableBTCBalance]
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

      // Check validation immediately
      if (inputValue === "" || num === 0 || isNaN(num)) {
        // Empty or zero - reset to valid state but don't show error yet
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
      if (!isNaN(num)) setSellAmount(num.toFixed(9));
      // Validate on blur
      validateSellAmount();
    }
  };

  // Submit handler
  const handleSubmit = () => {
    if (!session) {
      alert("Please login to continue trading");
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
      cashBalance?.userId || (session.user as any)?.id || session.user?.email;

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
    <div>
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
    </div>
  );
}

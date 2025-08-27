"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import OrderForm from "@/features/trading/components/OrderForm";
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetCashBalance } from "@/features/wallet/hooks/useGetCash";
import { useCreateBuyOrder } from "@/features/trading/hooks/useCreateBuyOrder";
import { useQueryClient } from "@tanstack/react-query";
import { TradeQueryKeys } from "@/features/wallet/constants/TradeQueryKeys";

export default function MarketOrderContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const marketPrice = useMarketPrice();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for confirmation dialog
  const [pendingOrder, setPendingOrder] = useState<{
    orderRef: string;
    message: string;
    options: ("CANCEL" | "KEEP_OPEN")[];
    originalPayload: any;
  } | null>(null);

  // Fetch wallet balance
  const {
    data: cashBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useGetCashBalance({
    enabled: !!session,
  });

  // Create buy order mutation
  const createBuyOrderMutation = useCreateBuyOrder({
    onSuccess: (data) => {
      console.log("Buy order response:", data);

      // Check if requires confirmation
      if (data.requiresConfirmation) {
        setPendingOrder({
          orderRef: data.orderRef,
          message: data.message || "สภาพคล่องไม่พอ จะให้ทำอย่างไรต่อ?",
          options: data.options || ["CANCEL", "KEEP_OPEN"],
          originalPayload: {
            userId:
              cashBalance?.userId ||
              (session?.user as any)?.id ||
              session?.user?.email,
            symbol: "BTC",
            price: parseFloat(price.replace(/,/g, "")),
            amount: parseFloat(receiveBTC.replace(/,/g, "")),
            lotPrice: parseFloat(amount.replace(/,/g, "")),
          },
        });
        return;
      }

      // Handle successful order execution
      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });

      if (data.filled && data.filled > 0) {
        const filledUSD =
          data.spent || data.filled * parseFloat(price.replace(/,/g, ""));
        alert(
          `✅ Buy BTC/USDT Amount ${filledUSD.toFixed(
            2
          )} USD submitted successfully`
        );
      } else if (
        data.remaining &&
        data.remaining > 0 &&
        (!data.filled || data.filled === 0)
      ) {
        alert(
          `📝 Order created successfully!\n` +
            `Order ID: ${data.orderRef}\n` +
            `Amount remaining: ${data.remaining.toFixed(8)} BTC\n` +
            `Status: Pending`
        );
      } else {
        let message = `✅ Order executed successfully!\nOrder ID: ${data.orderRef}`;
        if (data.refund && data.refund > 0) {
          const actualSpent =
            parseFloat(amount.replace(/,/g, "")) - data.refund;
          message += `\nActual spent: ${actualSpent.toFixed(2)} USD`;
          message += `\nRefund: ${data.refund.toFixed(2)} USD`;
        }
        if (data.message) {
          message += `\nMessage: ${data.message}`;
        }
        alert(message);
      }
      handleSubmitSuccess("buy");
    },
    onError: (error) => {
      console.error("Buy order error:", error);
      alert(`❌ Error: ${error.message}`);
    },
  });

  // Handle confirmation decision
  const handleConfirmationDecision = (decision: "CANCEL" | "KEEP_OPEN") => {
    if (!pendingOrder) return;

    if (decision === "CANCEL") {
      alert("❌ Order cancelled");
      setPendingOrder(null);
      return;
    }

    // Continue with KEEP_OPEN
    const confirmPayload = {
      ...pendingOrder.originalPayload,
      confirm: true,
      onInsufficient: "KEEP_OPEN",
      keepOpen: true,
    };

    createBuyOrderMutation.mutate(confirmPayload);
    setPendingOrder(null);
  };

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

  // Sell states
  const [sellAmount, setSellAmount] = useState<string>("");
  const [isSellAmountValid, setIsSellAmountValid] = useState(true);
  const [sellSliderValue, setSellSliderValue] = useState<number>(0);
  const [receiveUSD, setReceiveUSD] = useState<string>("");
  const [isSellAmountFocused, setIsSellAmountFocused] = useState(false);
  const AVAILABLE_BTC_BALANCE = 0.0217;

  // Get available balance dynamically
  const getAvailableBalance = useCallback(() => {
    if (!session || !cashBalance) return 0;
    return cashBalance.amount || 0;
  }, [session, cashBalance]);

  // Format available balance for display
  const formatAvailableBalance = useCallback(() => {
    const balance = getAvailableBalance();
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  }, [getAvailableBalance]);

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

  const calculateReceiveBTC = useCallback(
    (amountValue: string, priceValue: string): string => {
      if (!amountValue || !priceValue) return "";
      const numAmount = parseFloat(amountValue.replace(/,/g, ""));
      const numPrice = parseFloat(priceValue.replace(/,/g, ""));
      if (isNaN(numAmount) || isNaN(numPrice) || numPrice <= 0) return "";
      const btcAmount = numAmount / numPrice;
      return btcAmount.toFixed(9);
    },
    []
  );

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

  const calculateSliderPercentage = useCallback(
    (amountValue: string): number => {
      if (!amountValue) return 0;
      const numAmount = parseFloat(amountValue.replace(/,/g, ""));
      const availableBalance = getAvailableBalance();
      if (isNaN(numAmount) || numAmount <= 0 || availableBalance <= 0) return 0;
      const percentage = (numAmount / availableBalance) * 100;
      return Math.min(percentage, 100);
    },
    [getAvailableBalance]
  );

  const calculateSellSliderPercentage = useCallback(
    (btcAmount: string): number => {
      if (!btcAmount) return 0;
      const numAmount = parseFloat(btcAmount);
      if (isNaN(numAmount) || numAmount <= 0) return 0;
      const percentage = (numAmount / AVAILABLE_BTC_BALANCE) * 100;
      return Math.min(percentage, 100);
    },
    []
  );

  const calculateAmountFromPercentage = useCallback(
    (percentage: number): string => {
      const availableBalance = getAvailableBalance();
      const amount = (percentage / 100) * availableBalance;
      return formatNumberWithComma(amount.toFixed(2));
    },
    [getAvailableBalance, formatNumberWithComma]
  );

  const calculateBTCFromPercentage = useCallback(
    (percentage: number): string => {
      const btcAmount = (percentage / 100) * AVAILABLE_BTC_BALANCE;
      return btcAmount.toFixed(9);
    },
    []
  );

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

  // Buy handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || isValidNumberFormat(inputValue)) {
      const formattedValue = formatNumberWithComma(inputValue);
      setAmount(formattedValue);

      const numericValue = inputValue.replace(/,/g, "");
      const num = parseFloat(numericValue);
      const availableBalance = getAvailableBalance();
      const isValid =
        inputValue === "" || (!isNaN(num) && num <= availableBalance);

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
    const availableBalance = getAvailableBalance();
    setIsAmountValid(!isNaN(num) && num <= availableBalance);
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

  // Submit handler
  const handleSubmit = (type: "buy" | "sell") => {
    if (!session) {
      alert("Please login to continue trading");
      router.push("/auth/sign-in");
      return;
    }

    const amountToSubmit = type === "buy" ? amount : sellAmount;
    const numericAmount = parseFloat(amountToSubmit.replace(/,/g, "") || "0");

    if (!numericAmount || numericAmount === 0) {
      return;
    }

    if (type === "buy") {
      const numericPrice = parseFloat(price.replace(/,/g, "") || "0");
      const btcAmount = parseFloat(receiveBTC.replace(/,/g, "") || "0");
      const userId =
        cashBalance?.userId || (session.user as any)?.id || session.user?.email;

      const orderPayload = {
        userId: userId,
        symbol: "BTC",
        price: numericPrice,
        amount: btcAmount,
        lotPrice: numericAmount, // จำนวนเงิน USD ที่จะใช้ซื้อ
      };

      console.log("Order payload:", orderPayload);
      console.log("USD to spend:", numericAmount);
      console.log("Price per BTC:", numericPrice);
      console.log("BTC amount to buy:", btcAmount);

      createBuyOrderMutation.mutate(orderPayload);
    } else {
      // Handle sell order submission (implement if needed)
      alert("Sell order submitted (logic to be implemented)");
    }
  };

  const handleSubmitSuccess = (type: "buy" | "sell") => {
    if (type === "buy") {
      setAmount("");
      setSliderValue(0);
      setReceiveBTC("");
    } else {
      setSellAmount("");
      setSellSliderValue(0);
      setReceiveUSD("");
    }
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
    const btcAmount = calculateReceiveBTC(amount, currentPrice);
    setReceiveBTC(btcAmount);
  }, [amount, price, limitPrice, marketPrice, priceLabel, calculateReceiveBTC]);

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

  useEffect(() => {
    if (amount && !isAmountFocused) {
      const numericValue = amount.replace(/,/g, "");
      const num = parseFloat(numericValue);
      const availableBalance = getAvailableBalance();
      const isValid = !isNaN(num) && num <= availableBalance;
      setIsAmountValid(isValid);

      if (isValid) {
        const sliderPercentage = calculateSliderPercentage(numericValue);
        setSliderValue(sliderPercentage);
      }
    }
  }, [amount, isAmountFocused, getAvailableBalance, calculateSliderPercentage]);

  // Derive UI-specific props
  const getButtonColor = (type: "buy" | "sell") =>
    type === "buy"
      ? "bg-[#309C7D] hover:bg-[#28886C]"
      : "bg-[#D84C4C] hover:bg-[#C73E3E]";

  const getAmountIcon = (type: "buy" | "sell") =>
    type === "buy"
      ? "/currency-icons/dollar-icon.svg"
      : "/currency-icons/bitcoin-icon.svg";

  const getReceiveIcon = (type: "buy" | "sell") =>
    type === "buy"
      ? "/currency-icons/bitcoin-icon.svg"
      : "/currency-icons/dollar-icon.svg";

  return (
    <div>
      {/* Confirmation Dialog */}
      {pendingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              ยืนยันคำสั่งซื้อ
            </h3>
            <p className="text-gray-600 mb-6">{pendingOrder.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirmationDecision("CANCEL")}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                ยกเลิก (CANCEL)
              </button>
              <button
                onClick={() => handleConfirmationDecision("KEEP_OPEN")}
                className="flex-1 px-4 py-2 bg-[#309C7D] text-white rounded hover:bg-[#28886C] transition-colors"
              >
                สร้างออเดอร์ (KEEP_OPEN)
              </button>
            </div>
          </div>
        </div>
      )}

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
            availableBalance={formatAvailableBalance()}
            balanceCurrency="USD"
            symbol="BTC"
            buttonColor={getButtonColor("buy")}
            amountIcon={getAmountIcon("buy")}
            receiveIcon={getReceiveIcon("buy")}
            isSubmitting={createBuyOrderMutation.isPending}
            onPriceFocus={handlePriceFocus}
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
            symbol="BTC"
            buttonColor={getButtonColor("sell")}
            amountIcon={getAmountIcon("sell")}
            receiveIcon={getReceiveIcon("sell")}
            isSubmitting={false}
            onPriceFocus={handlePriceFocus}
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

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import OrderForm from "@/features/trading/components/OrderForm";
import AlertBox from "@/components/ui/alert-box";
import { useMarketPrice } from "@/features/trading/hooks/useMarketPrice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetCashBalance } from "@/features/wallet/hooks/useGetCash";
import { useCreateBuyOrder } from "@/features/trading/hooks/useCreateBuyOrder";
import { useQueryClient } from "@tanstack/react-query";
import { TradeQueryKeys } from "@/features/wallet/constants";

interface AlertState {
  message: string;
  type: "success" | "info" | "error";
}

export default function BuyOrderContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const marketPrice = useMarketPrice();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for alert box
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  // State for confirmation dialog
  const [pendingOrder, setPendingOrder] = useState<{
    orderRef: string;
    message: string;
    options: ("CANCEL" | "KEEP_OPEN")[];
    originalPayload: any;
  } | null>(null);

  // Function to show alert
  const showAlert = (
    message: string,
    type: "success" | "info" | "error" = "info"
  ) => {
    setAlertState({ message, type });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlertState(null);
  };

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
        showAlert(
          `Buy BTC/USDT Amount ${filledUSD.toFixed(
            2
          )} USD submitted successfully`,
          "success"
        );
      } else if (
        data.remaining &&
        data.remaining > 0 &&
        (!data.filled || data.filled === 0)
      ) {
        showAlert(
          `Order created successfully! Order ID: ${
            data.orderRef
          }. Amount remaining: ${data.remaining.toFixed(
            8
          )} BTC. Status: Pending`,
          "info"
        );
      } else {
        let message = `Order executed successfully! Order ID: ${data.orderRef}`;
        if (data.refund && data.refund > 0) {
          const actualSpent =
            parseFloat(amount.replace(/,/g, "")) - data.refund;
          message += `. Actual spent: ${actualSpent.toFixed(
            2
          )} USD. Refund: ${data.refund.toFixed(2)} USD`;
        }
        if (data.message) {
          message += `. Message: ${data.message}`;
        }
        showAlert(message, "success");
      }
      handleSubmitSuccess();
    },
    onError: (error) => {
      console.error("Buy order error:", error);
      showAlert(`Error: ${error.message}`, "error");
    },
  });

  // Handle confirmation decision
  const handleConfirmationDecision = (decision: "CANCEL" | "KEEP_OPEN") => {
    if (!pendingOrder) return;

    if (decision === "CANCEL") {
      showAlert("Order cancelled", "info");
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

  // Buy states
  const [priceLabel, setPriceLabel] = useState("Price");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [price, setPrice] = useState<string>(marketPrice);
  const [amount, setAmount] = useState<string>("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [receiveBTC, setReceiveBTC] = useState<string>("");

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

  const isValidNumberFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, "");
    return /^\d*\.?\d{0,2}$/.test(numericValue);
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

  const calculateAmountFromPercentage = useCallback(
    (percentage: number): string => {
      const availableBalance = getAvailableBalance();
      const amount = (percentage / 100) * availableBalance;
      return formatNumberWithComma(amount.toFixed(2));
    },
    [getAvailableBalance, formatNumberWithComma]
  );

  // Validation function
  const validateAmount = useCallback(() => {
    const numericValue = amount.replace(/,/g, "");
    const num = parseFloat(numericValue);
    const availableBalance = getAvailableBalance();

    // Check if amount is empty or zero
    if (!amount || amount === "" || num === 0 || isNaN(num)) {
      setIsAmountValid(false);
      setAmountErrorMessage("Please enter amount");
      return false;
    }

    // Check if amount exceeds available balance
    if (num > availableBalance) {
      setIsAmountValid(false);
      setAmountErrorMessage("Insufficient balance");
      return false;
    }

    // Amount is valid
    setIsAmountValid(true);
    setAmountErrorMessage("");
    return true;
  }, [amount, getAvailableBalance]);

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

      // Check validation immediately
      if (inputValue === "" || num === 0 || isNaN(num)) {
        // Empty or zero - reset to valid state but don't show error yet
        setIsAmountValid(true);
        setAmountErrorMessage("");
        setSliderValue(0);
      } else if (num > availableBalance) {
        // Amount exceeds balance - show error immediately
        setIsAmountValid(false);
        setAmountErrorMessage("Insufficient balance");
        setSliderValue(0);
      } else {
        // Valid amount
        setIsAmountValid(true);
        setAmountErrorMessage("");
        const sliderPercentage = calculateSliderPercentage(inputValue);
        setSliderValue(sliderPercentage);
      }
    }
  };

  const handleSliderChange = (percentage: number) => {
    setSliderValue(percentage);
    const newAmount = calculateAmountFromPercentage(percentage);
    setAmount(newAmount);
    const numericValue = newAmount.replace(/,/g, "");
    const num = parseFloat(numericValue);
    const availableBalance = getAvailableBalance();
    const isValid = !isNaN(num) && num <= availableBalance;
    setIsAmountValid(isValid);

    if (isValid) {
      setAmountErrorMessage("");
    }
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
      // Validate on blur
      validateAmount();
    }
  };

  // Submit handler
  const handleSubmit = () => {
    if (!session) {
      showAlert("Please login to continue trading", "error");
      router.push("/auth/sign-in");
      return;
    }

    // Validate amount before proceeding
    if (!validateAmount()) {
      return;
    }

    const numericAmount = parseFloat(amount.replace(/,/g, "") || "0");
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
  };

  const handleSubmitSuccess = () => {
    setAmount("");
    setSliderValue(0);
    setReceiveBTC("");
    setIsAmountValid(true);
    setAmountErrorMessage("");
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

      if (isValid) {
        const sliderPercentage = calculateSliderPercentage(numericValue);
        setSliderValue(sliderPercentage);
      }
    }
  }, [amount, isAmountFocused, getAvailableBalance, calculateSliderPercentage]);

  return (
    <div>
      {/* Alert Box positioned at bottom right */}
      {alertState && (
        <div className="fixed bottom-4 right-4 z-50">
          <AlertBox
            onClose={closeAlert}
            duration={5000} // 5 seconds
          />
        </div>
      )}

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
        buttonColor="bg-[#309C7D] hover:bg-[#28886C]"
        amountIcon="/currency-icons/dollar-icon.svg"
        receiveIcon="/currency-icons/bitcoin-icon.svg"
        isSubmitting={createBuyOrderMutation.isPending}
        amountErrorMessage={amountErrorMessage}
        onPriceFocus={handlePriceFocus}
        onPriceChange={handlePriceChange}
        onPriceBlur={handlePriceBlur}
        onAmountChange={handleAmountChange}
        onAmountFocus={handleAmountFocus}
        onAmountBlur={handleAmountBlur}
        onSliderChange={handleSliderChange}
        onMarketClick={handleMarketClick}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

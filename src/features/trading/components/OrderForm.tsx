"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DiscreteSlider from "@/features/trading/components/DiscreteSlider";
import { useGetCashBalance } from "@/features/wallet/hooks/useGetCash";
import { useCreateBuyOrder } from "@/features/trading/hooks/useCreateBuyOrder";

interface OrderFormProps {  
  type: "buy" | "sell";
  inputRef: React.RefObject<HTMLInputElement | null>;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  priceLabel: string;
  price: string;
  amount: string;
  receiveAmount: string;
  isAmountValid: boolean;
  isInputFocused: boolean;
  isAmountFocused: boolean;
  sliderValue: number;
  availableBalance: string;
  balanceCurrency: string;
  symbol?: string; // เพิ่ม symbol prop
  onPriceFocus: () => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriceBlur: () => void;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountFocus: () => void;
  onAmountBlur: () => void;
  onSliderChange: (percentage: number) => void;
  onMarketClick: () => void;
  onSubmit: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  type,
  inputRef,
  amountInputRef,
  priceLabel,
  price,
  amount,
  receiveAmount,
  isAmountValid,
  isInputFocused,
  isAmountFocused,
  sliderValue,
  availableBalance,
  balanceCurrency,
  symbol = "BTC", // default symbol
  onPriceFocus,
  onPriceChange,
  onPriceBlur,
  onAmountChange,
  onAmountFocus,
  onAmountBlur,
  onSliderChange,
  onMarketClick,
  onSubmit,
}) => {
  const { data: session } = useSession();
  const router = useRouter();

  // ใช้ hook เพื่อดึงยอดเงินจริงจาก wallet
  const {
    data: cashBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useGetCashBalance({
    enabled: !!session, // เรียก API เฉพาะเมื่อมี session
  });

  // ใช้ hook สำหรับสร้าง buy order
  const createBuyOrderMutation = useCreateBuyOrder({
    onSuccess: (data) => {
      console.log("Buy order created successfully:", data);

      // ตรวจสอบสถานะของ order
      if (data.filled > 0) {
        // กรณีซื้อสำเร็จ (บางส่วนหรือทั้งหมด)
        const filledUSD =
          data.spent || data.filled * parseFloat(price.replace(/,/g, ""));
        alert(
          `✅ ซื้อสำเร็จ!\n` +
            `ได้ Bitcoin: ${data.filled} เหรียญ\n` +
            `ใช้เงิน: ${filledUSD.toFixed(2)} ดอลลาร์`
        );
      } else if (data.remaining > 0 && data.filled === 0) {
        // กรณี order ถูกสร้างแต่ยังไม่ได้ execute
        alert(
          `📝 สร้าง Order สำเร็จ!\n` +
            `Order ID: ${data.orderRef}\n` +
            `จำนวนที่รอ: ${data.remaining.toFixed(8)} BTC\n` +
            `สถานะ: รอการจับคู่`
        );
      } else {
        // กรณีอื่นๆ
        let message = `Order ID: ${data.orderRef}`;

        if (data.refund > 0) {
          // มี refund (อาจเป็น partial fill หรือ error)
          const actualSpent =
            parseFloat(amount.replace(/,/g, "")) - data.refund;
          message += `\nเงินที่ใช้จริง: ${actualSpent.toFixed(2)} ดอลลาร์`;
          message += `\nเงินคืน: ${data.refund.toFixed(2)} ดอลลาร์`;

          if (data.message) {
            message += `\nข้อความ: ${data.message}`;
          }
        }

        alert(message);
      }

      // เรียก onSubmit ต้นฉบับหากต้องการทำอย่างอื่นเพิ่มเติม
      onSubmit();
    },
    onError: (error) => {
      console.error("Error creating buy order:", error);

      // จัดการ error message ให้เหมาะสม
      let errorMessage = error.message;
      if (errorMessage.includes("Insufficient funds")) {
        errorMessage =
          `❌ ยอดเงินไม่เพียงพอ\n` +
          `ยอดเงินที่มี: ${getDisplayBalance()} ${getDisplayCurrency()}\n` +
          `จำนวนที่ต้องการ: ${(
            parseFloat(price || "0") * parseFloat(amount || "0")
          ).toFixed(2)} ดอลลาร์`;
      }

      alert(`❌ ไม่สามารถสร้างคำสั่งซื้อได้\n${errorMessage}`);
    },
  });

  const isBuy = type === "buy";
  const amountCurrency = isBuy ? "USD" : "BTC";
  const receiveCurrency = isBuy ? "BTC" : "USD";
  const buttonColor = isBuy
    ? "bg-[#309C7D] hover:bg-[#28886C]"
    : "bg-[#D84C4C] hover:bg-[#C73E3E]";
  const amountIcon = isBuy
    ? "/currency-icons/dollar-icon.svg"
    : "/currency-icons/bitcoin-icon.svg";
  const receiveIcon = isBuy
    ? "/currency-icons/bitcoin-icon.svg"
    : "/currency-icons/dollar-icon.svg";

  // Format จำนวนเงิน
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // กำหนดยอดเงินที่จะแสดงตาม type ของการซื้อขาย
  const getDisplayBalance = () => {
    if (!session) return "0.00";

    if (balanceError) return "Error";

    if (isBuy) {
      // สำหรับการซื้อ แสดงยอด USD จาก wallet
      return formatCurrency(cashBalance?.amount);
    } else {
      // สำหรับการขาย แสดงยอด BTC ที่ถือ (ยังใช้ availableBalance เหมือนเดิมสำหรับ BTC)
      return availableBalance;
    }
  };

  const getDisplayCurrency = () => {
    if (isBuy) {
      return "USD";
    } else {
      return balanceCurrency;
    }
  };

  const handleSubmit = () => {
    if (!session) {
      alert("Please login to continue trading");
      router.push("/auth/sign-in");
      return;
    }

    if (isBuy) {
      if (!amount || !price) {
        alert("กรุณากรอกจำนวนและราคา");
        return;
      }

      // ลบ comma ออกก่อน parse เป็น number
      const numericAmount = parseFloat(amount.replace(/,/g, "") || "0"); // USD amount
      const numericPrice = parseFloat(price.replace(/,/g, "") || "0"); // Price per BTC

      console.log("Raw amount (USD):", amount, "Parsed:", numericAmount);
      console.log("Raw price:", price, "Parsed:", numericPrice);

      if (
        isNaN(numericAmount) ||
        isNaN(numericPrice) ||
        numericAmount <= 0 ||
        numericPrice <= 0
      ) {
        alert("กรุณากรอกจำนวนและราคาที่ถูกต้อง");
        return;
      }

      // ตรวจสอบยอดเงิน
      const totalCost = numericAmount; // USD amount to spend
      const currentBalance = cashBalance?.amount || 0;

      if (totalCost > currentBalance) {
        alert(
          `ยอดเงินไม่เพียงพอ\nยอดเงินที่มี: ${formatCurrency(
            currentBalance
          )}\nยอดเงินที่ต้องการ: ${formatCurrency(totalCost)}`
        );
        return;
      }

      if (!isAmountValid) {
        alert("ยอดเงินไม่เพียงพอ");
        return;
      }

      const userId =
        cashBalance?.userId || (session.user as any)?.id || session.user?.email;

      if (!userId) {
        alert("ไม่สามารถระบุตัวตน กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      // ส่ง USD amount ตรงๆ (ไม่ต้องแปลงเป็น BTC)
      // API คาดหวัง amount เป็นจำนวนเงิน USD ที่ต้องการใช้

      const orderPayload = {
        userId: userId,
        symbol: symbol,
        price: numericPrice, // Price per BTC
        amount: numericAmount, // USD amount to spend (ส่งเป็น USD amount)
      };

      console.log("Order payload:", orderPayload);
      console.log("USD to spend:", numericAmount);
      console.log("Price per BTC:", numericPrice);
      console.log(
        "Expected BTC to receive:",
        (numericAmount / numericPrice).toFixed(8)
      );

      createBuyOrderMutation.mutate(orderPayload);
    } else {
      onSubmit();
    }
  };
  return (
    <div className="space-y-7">
      {/* Price input */}
      <div className="flex items-center rounded-lg bg-[#17306B] px-3 py-2 justify-between h-[44px] border border-transparent focus-within:border-[#3A8AF7]">
        <span className="text-[12px] font-normal text-[#5775B7]">
          {priceLabel}
        </span>

        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            className="w-[100px] text-[14px] font-normal rounded-lg bg-[#17306B] p-1 text-white text-right border-none outline-none"
            onFocus={onPriceFocus}
            onBlur={onPriceBlur}
            value={price}
            onChange={onPriceChange}
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
                onPriceFocus();
              }}
            >
              <path
                d="M3.43225 12.4891H0.25V9.30683L8.82625 0.730576C8.9669 0.589973 9.15763 0.510986 9.3565 0.510986C9.55537 0.510986 9.7461 0.589973 9.88675 0.730576L12.0085 2.85158C12.0782 2.92123 12.1336 3.00395 12.1713 3.095C12.209 3.18604 12.2285 3.28364 12.2285 3.3822C12.2285 3.48076 12.209 3.57836 12.1713 3.66941C12.1336 3.76046 12.0782 3.84317 12.0085 3.91283L3.43225 12.4891ZM0.25 13.9891H13.75V15.4891H0.25V13.9891Z"
                fill="#3A8AF7"
              />
            </svg>
          )}

          <Button
            onClick={onMarketClick}
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

      {/* Available Balance - Updated to show real wallet balance */}
      <div className="space-y-1">
        <div className="flex justify-between mt-7">
          <div className="text-[10px] text-[#9AAACE]">Available Balance</div>
          <div className="flex flex-row gap-1 text-[10px] text-[#9AAACE]">
            <div>{getDisplayBalance()}</div>
            <div>{getDisplayCurrency()}</div>
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
                onChange={onAmountChange}
                onFocus={onAmountFocus}
                onBlur={onAmountBlur}
              />
              <span
                className={`text-[14px] font-normal ${
                  amount || isAmountFocused ? "text-white" : "text-[#5775B7]"
                }`}
              >
                {amountCurrency}
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

      {/* Slider */}
      <div className="mx-3">
        <DiscreteSlider value={sliderValue} onChange={onSliderChange} />
      </div>

      <div className="space-y-4">
        {/* Amount Cal */}
        <div className="relative flex items-center">
          <div className="absolute z-10">
            <Image
              src={amountIcon}
              alt={`${amountCurrency} Icon`}
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
                value={amount}
                readOnly
              />
              <span className="text-[16px] font-normal text-[#92CAFE]">
                {amountCurrency}
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
          <div className="absolute left-0 z-10">
            <Image
              src={receiveIcon}
              alt={`${receiveCurrency} Icon`}
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
                value={receiveAmount}
                readOnly
              />
              <span className="text-[16px] font-normal text-[#92CAFE]">
                {receiveCurrency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 w-full">
        <Button
          className={`w-full rounded-lg ${buttonColor} cursor-pointer text-[16px] font-normal ${
            createBuyOrderMutation.isPending
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={handleSubmit}
          disabled={createBuyOrderMutation.isPending}
        >
          {createBuyOrderMutation.isPending
            ? isBuy
              ? "Creating Buy Order..."
              : "Processing..."
            : isBuy
            ? "Buy"
            : "Sell"}
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;

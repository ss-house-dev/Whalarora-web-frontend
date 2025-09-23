'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import React from 'react';
import Image from 'next/image';

interface OrderFormProps {
  type: 'buy' | 'sell';
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
  symbol?: string;
  buttonColor: string;
  amountIcon: string;
  receiveIcon: string;
  receiveCurrency?: string;
  isSubmitting: boolean;
  isAuthenticated?: boolean;
  amountErrorMessage?: string;
  onPriceFocus: () => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriceBlur: () => void;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountFocus: () => void;
  onAmountBlur: () => void;
  onSliderChange: (percentage: number) => void;
  onMarketClick: () => void;
  onSubmit: () => void;
  onLoginClick?: () => void;
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
  isAmountFocused,
  sliderValue,
  availableBalance,
  balanceCurrency,
  buttonColor,
  amountIcon,
  receiveIcon,
  receiveCurrency,
  isSubmitting,
  isAuthenticated = false,
  amountErrorMessage = 'Insufficient balance',
  onPriceFocus,
  onPriceChange,
  onPriceBlur,
  onAmountChange,
  onAmountFocus,
  onAmountBlur,
  onMarketClick,
  onSubmit,
  onLoginClick,
}) => {
  // Track if user has manually entered a price
  const [hasUserPrice, setHasUserPrice] = React.useState(false);

  const handleButtonClick = () => {
    if (!isAuthenticated && onLoginClick) {
      onLoginClick();
    } else {
      onSubmit();
    }
  };

  const getButtonText = () => {
    if (!isAuthenticated) {
      return 'Login';
    }
    return type === 'buy' ? 'Buy' : 'Sell';
  };

  // Handle price changes - track if user is entering custom price
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasUserPrice(e.target.value.trim() !== ''); // Mark as user price if not empty
    onPriceChange(e);
  };

  // Handle price input blur - only switch to market if user hasn't entered a custom price
  const handlePriceBlur = () => {
    onPriceBlur(); // Call the original blur handler

    // Only auto-switch to market price if user hasn't entered a custom price
    if (!hasUserPrice) {
      onMarketClick();
    }
  };

  // Handle market button click - reset the user price flag
  const handleMarketClick = () => {
    setHasUserPrice(false); // Reset flag when explicitly clicking market
    onMarketClick();
  };

  // Handle click on price container or USD label - focus the input
  const handlePriceContainerClick = () => {
    inputRef.current?.focus();
    onPriceFocus();
  };

  // Handle click on amount container - focus the amount input
  const handleAmountContainerClick = () => {
    amountInputRef.current?.focus();
    onAmountFocus();
  };

  // Reset user price flag when switching between limit and market modes
  React.useEffect(() => {
    if (priceLabel === 'Price') {
      // When switching to limit mode, don't reset the flag
      // User should be able to keep their custom price
    } else {
      // When switching to market mode, reset the flag
      setHasUserPrice(false);
    }
  }, [priceLabel]);

  return (
    <div className="space-y-3">
      {/* Price input */}
      <div
        className="flex items-center rounded-lg bg-[#1F2029] px-3 py-2 justify-between h-[52px] mb-0 border border-transparent focus-within:border-[#225FED] cursor-text"
        onClick={handlePriceContainerClick}
      >
        <span className="text-sm w-[100px] font-normal text-[#A4A4A4]">{priceLabel}</span>

        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            className="text-[14px] font-normal rounded-lg bg-[#1F2029] p-1 text-white text-right border-none outline-none"
            onFocus={onPriceFocus}
            onBlur={handlePriceBlur}
            value={price}
            onChange={handlePriceChange} // Updated to use our new handler
            onClick={(e) => e.stopPropagation()} // Prevent double handling
          />
          <span
            className="text-sm font-normal cursor-text text-[#A4A4A4]"
            onClick={handlePriceContainerClick}
          >
            USDT
          </span>
        </div>
      </div>

      {/* Available Balance */}

      <div className="flex justify-between mt-4 mb-[6px] px-3">
        <div className="text-xs text-[#A4A4A4]">Available Balance</div>
        <div className="flex flex-row gap-1 text-xs text-[#A4A4A4]">
          <div>{availableBalance}</div>
          <div>{balanceCurrency}</div>
        </div>
      </div>

      {/* Spend */}
      <div className="relative">
        <div
          className={`rounded-lg px-3 py-2 h-[88px] border cursor-text ${
            !isAmountValid
              ? 'bg-[#1F2029] border-[#D84C4C]'
              : 'bg-[#1F2029] border-transparent focus-within:border-[#3A8AF7]'
          }`}
          onClick={handleAmountContainerClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/usdt.svg"
                alt="USDT"
                width={27}
                height={27}
                className="rounded-full"
              />
              <span className="text-sm font-normal text-[#A4A4A4] cursor-text">Spend</span>
            </div>

            <div className="flex items-center gap-2 text-[16px]">
              <Input
                ref={amountInputRef}
                type="text"
                className="bg-transparent p-1 text-white text-right border-none outline-none focus:outline-none"
                value={amount}
                onChange={onAmountChange}
                onFocus={onAmountFocus}
                onBlur={onAmountBlur}
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className="text-[14px] font-normal cursor-text text-[#A4A4A4]"
                onClick={handleAmountContainerClick}
              >
                {balanceCurrency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-[74px] h-[24px] text-xs text-[#A4A4A4] bg-transparent border border-[#474747] rounded-[8px] cursor-pointer hover:border-white/60 hover:text-white/70"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              +500
            </button>
            <button
              className="w-[74px] h-[24px] text-xs text-[#A4A4A4] bg-transparent border border-[#474747] rounded-[8px] cursor-pointer hover:border-white/60 hover:text-white/70"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              +1,000
            </button>
            <button
              className="w-[74px] h-[24px] text-xs text-[#A4A4A4] bg-transparent border border-[#474747] rounded-[8px] cursor-pointer hover:border-white/60 hover:text-white/70"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              +10,000
            </button>
            <button
              className="w-[74px] h-[24px] text-xs text-[#A4A4A4] bg-transparent border border-[#474747] rounded-[8px] cursor-pointer hover:border-white/60 hover:text-white/70"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Max
            </button>
          </div>
        </div>

        {!isAmountValid && (
          <span className="absolute top-full mt-1 text-[12px] text-[#D84C4C] z-10">
            {amountErrorMessage}
          </span>
        )}
      </div>

      {/* Slider */}
      {/* <div className="mx-3">
        <DiscreteSlider value={sliderValue} onChange={onSliderChange} />
      </div> */}

      <div className="space-y-3">
        {/* arrow */}
        <div className="flex justify-center">
          <Image
            src="/assets/exchange.svg"
            alt="Exchange Button"
            width={28}
            height={28}
            className="cursor-pointer"
          />
        </div>

        {/* Receive */}
        <div className="relative flex items-center mt-3">
          <div className="absolute z-10">
            <Image
              src={receiveIcon}
              alt={`${receiveCurrency || (type === 'buy' ? 'Coin' : 'USD')} Icon`}
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>
          <div className="bg-[#17306B] w-full rounded-lg flex items-center justify-between ml-5 pl-[70px] pr-4 py-3 h-[32px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
            <span className="text-[#92CAFE] text-[12px] font-normal">Receive</span>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                className="w-full text-[16px] font-normal rounded-lg bg-[#17306B] p-1 text-[#92CAFE] text-right border-none outline-none cursor-context-menu"
                value={receiveAmount}
                readOnly
              />
              <span className="text-[16px] font-normal text-[#92CAFE]">
                {type === 'buy' ? receiveCurrency || 'Coin' : 'USD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 w-full">
        <Button
          className={`w-full rounded-lg ${buttonColor} cursor-pointer text-[16px] font-normal ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleButtonClick}
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;

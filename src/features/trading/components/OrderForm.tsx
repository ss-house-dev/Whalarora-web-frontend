'use client';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  onReceiveChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  symbol,
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
  onReceiveChange,
}) => {
  const [priceTab, setPriceTab] = React.useState<'current' | 'set'>(
    priceLabel === 'Price' ? 'current' : 'set'
  );

  // Truncate long symbols/currencies to 4 characters for display
  const displaySymbol = symbol && symbol.length > 4 ? symbol.slice(0, 4) : symbol;
  const displayBalanceCurrency =
    balanceCurrency && balanceCurrency.length > 4 ? balanceCurrency.slice(0, 4) : balanceCurrency;
  const displayReceiveCurrency =
    type === 'buy'
      ? receiveCurrency
        ? receiveCurrency.length > 4
          ? receiveCurrency.slice(0, 4)
          : receiveCurrency
        : 'Coin'
      : 'USDT';

  const getButtonText = () => {
    if (!isAuthenticated) {
      return 'Login';
    }
    const action = type === 'buy' ? 'Buy' : 'Sell';
    return displaySymbol ? `${action} ${displaySymbol}` : action;
  };

  const handleButtonClick = () => {
    if (!isAuthenticated && onLoginClick) {
      onLoginClick();
    } else {
      onSubmit();
    }
  };

  // Handle price changes
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPriceChange(e);
  };

  // Handle price input blur - do not auto-switch or change price
  const handlePriceBlur = () => {
    onPriceBlur();
  };

  // Handle market button click
  const handleMarketClick = () => {
    onMarketClick();
  };

  // Handle click on price container or USD label - focus the input
  const handlePriceContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end of input
      setTimeout(() => {
        if (inputRef.current) {
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }

    // Only trigger onPriceFocus when switching from current -> set
    if (priceTab !== 'set') {
      onPriceFocus();
    }
    setPriceTab('set');
  };

  // Handle click on amount container - focus the amount input
  const handleAmountContainerClick = () => {
    amountInputRef.current?.focus();
    onAmountFocus();
  };

  // Handle click on receive container - focus the receive input inside
  const handleReceiveContainerClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const inputEl = e.currentTarget.querySelector('input') as HTMLInputElement | null;
    inputEl?.focus();
  };

  // Function to focus input with cursor at end
  const focusInputWithCursorAtEnd = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      setTimeout(() => {
        if (inputRef.current) {
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  };

  React.useEffect(() => {
    if (priceLabel === 'Price') {
      // When switching to limit mode, don't reset the flag
      // User should be able to keep their custom price
    } else {
      // Limit mode
    }
    setPriceTab(priceLabel === 'Price' ? 'current' : 'set');
  }, [priceLabel]);

  return (
    <div>
      {/* Price mode tabs */}
      <Tabs
        value={priceTab}
        onValueChange={(v) => {
          const value = v as 'current' | 'set';
          setPriceTab(value);
          if (value === 'current') {
            handleMarketClick();
          } else {
            // When switching to "set" tab, focus input and move cursor to end
            onPriceFocus();
            setTimeout(() => {
              focusInputWithCursorAtEnd();
            }, 0);
          }
        }}
        className="w-[220px] h-[32px]"
      >
        <TabsList className="w-full bg-[#121119] h-[32px] p-1">
          <TabsTrigger
            value="current"
            className="text-xs px-3 data-[state=active]:bg-[#1F2029] data-[state=active]:h-[24px] data-[state=inactive]:text-[#474747] cursor-pointer"
          >
            Current price
          </TabsTrigger>
          <TabsTrigger
            value="set"
            className="text-xs px-3 data-[state=active]:bg-[#1F2029] data-[state=active]:h-[24px] data-[state=inactive]:text-[#474747] cursor-pointer"
          >
            Set price
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Price input */}
      <div
        className="flex items-center rounded-lg bg-[#1F2029] px-3 py-2 mt-4 justify-between h-[52px] mb-0 border border-transparent focus-within:border-[#225FED] cursor-text"
        onClick={handlePriceContainerClick}
      >
        <span className="text-sm w-[100px] font-normal text-[#A4A4A4]">Price</span>

        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            className="text-[14px] font-normal rounded-lg bg-[#1F2029] p-1 text-white text-right border-none outline-none"
            onFocus={() => {
              // Only trigger onPriceFocus if not already in set tab
              if (priceTab !== 'set') {
                onPriceFocus();
              }
              setPriceTab('set');
              // Move cursor to end when focused
              setTimeout(() => {
                if (inputRef.current) {
                  const length = inputRef.current.value.length;
                  inputRef.current.setSelectionRange(length, length);
                }
              }, 0);
            }}
            onBlur={handlePriceBlur}
            value={price}
            onChange={handlePriceChange}
            onClick={(e) => {
              e.stopPropagation();
              // Move cursor to end when clicked
              setTimeout(() => {
                if (inputRef.current) {
                  const length = inputRef.current.value.length;
                  inputRef.current.setSelectionRange(length, length);
                }
              }, 0);
            }}
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
          <div>{displayBalanceCurrency}</div>
        </div>
      </div>

      {/* Spend */}
      <div className="relative">
        <div
          className={`rounded-lg px-3 py-2 mb-3 h-[88px] border cursor-text ${
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
                {displayBalanceCurrency}
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
        <div
          className="flex items-center rounded-lg bg-[#1F2029] px-3 py-2 gap-3 justify-between h-[52px] mb-0 border border-transparent focus-within:border-[#225FED] cursor-text"
          onClick={handleReceiveContainerClick}
        >
          <div className="flex items-center gap-2">
            <Image
              src={receiveIcon}
              alt={`${receiveCurrency || (type === 'buy' ? 'Coin' : 'USD')} Icon`}
              width={27}
              height={27}
            />
            <span className="text-[#A4A4A4] text-sm font-normal">Receive</span>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              className="w-full text-[16px] font-normal rounded-lg p-1 text-right border-none outline-none"
              value={receiveAmount}
              onChange={(e) => {
                e.stopPropagation();
                onReceiveChange?.(e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm font-normal text-[#A4A4A4]">{displayReceiveCurrency}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-11 w-full">
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

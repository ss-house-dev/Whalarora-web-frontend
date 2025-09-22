'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import OrderForm from '@/features/trading/components/OrderForm';
import AlertBox from '@/components/ui/alert-box-sell';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGetCashBalance } from '@/features/wallet/hooks/useGetCash';
import { useCreateSellOrder } from '@/features/trading/hooks/useCreateSellOrder';
import { useQueryClient } from '@tanstack/react-query';
import { TradeQueryKeys } from '@/features/trading/constants';
import { useGetCoin } from '@/features/trading/hooks/useGetCoin';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';

interface UserWithId {
  id: string;
  email?: string;
}

export default function SellOrderContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const { selectedCoin, marketPrice, isPriceLoading, priceDecimalPlaces } = useCoinContext();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'info' | 'error'>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const { data: cashBalance } = useGetCashBalance({
    enabled: !!session,
  });

  const { data: coinBalance } = useGetCoin({
    symbol: selectedCoin.label.split('/')[0],
    enabled: !!session,
  });

  const createSellOrderMutation = useCreateSellOrder({
    onSuccess: (data) => {
      console.log('SellOrderContainer: Sell order created successfully:', data);
      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });
      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_COIN_ASSET, selectedCoin.label.split('/')[0]],
      });

      if (data.filled > 0) {
        setAlertMessage(
          `Sell order completed successfully!\nProceeds: $${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data.proceeds)}`
        );
        setAlertType('success');
      } else {
        setAlertMessage(`Sell order created successfully!\nStatus: Pending`);
        setAlertType('info');
      }
      setShowAlert(true);
      handleSubmitSuccess();
    },
    onError: (error) => {
      console.error('SellOrderContainer: Sell order error:', error);
      setAlertMessage(`Error creating sell order: ${error.message}`);
      setAlertType('error');
      setShowAlert(true);
    },
  });

  const [priceLabel, setPriceLabel] = useState('Price');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [price, setPrice] = useState<string>('0.' + '0'.repeat(priceDecimalPlaces));
  const [sellAmount, setSellAmount] = useState<string>('');
  const [isSellAmountValid, setIsSellAmountValid] = useState(true);
  const [sellAmountErrorMessage, setSellAmountErrorMessage] = useState('');
  const [sellSliderValue, setSellSliderValue] = useState<number>(0);
  const [receiveUSD, setReceiveUSD] = useState<string>('');
  const [isSellAmountFocused, setIsSellAmountFocused] = useState(false);

  // ฟังก์ชันสำหรับการจัดรูปแบบราคาขณะพิมพ์ - อนุญาตให้พิมพ์ทศนิยมได้อย่างอิสระ
  const formatPriceWithComma = useCallback((value: string): string => {
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;

    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // เพิ่มคอมม่าให้กับจำนวนเต็ม
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // คืนค่าตามที่ผู้ใช้พิมพ์ โดยไม่เติมหรือตัดทศนิยม
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }, []);

  // ฟังก์ชันสำหรับจัดรูปแบบราคาเมื่อเสร็จสิ้นการแก้ไข (onBlur)
  const formatPriceForDisplay = useCallback((value: string): string => {
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    const num = parseFloat(numericValue);
    if (isNaN(num)) return '';

    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // เพิ่มคอมม่าให้กับจำนวนเต็ม
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // ถ้าไม่มีทศนิยมหรือเป็นจำนวนเต็ม ให้เติม .00
    if (!decimalPart) {
      return `${formattedInteger}.00`;
    }

    // ถ้ามีทศนิยมแล้ว ให้คงไว้ตามที่ผู้ใช้ป้อน (ไม่เติม 0 ข้างหลัง)
    return `${formattedInteger}.${decimalPart}`;
  }, []);

  const formatToMaxDigits = useCallback((value: number, maxDigits: number = 10): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    let valueStr = value.toFixed(9);
    valueStr = valueStr.replace(/\.?0+$/, '');
    if (valueStr === '' || valueStr === '.') return '0';
    const totalDigits = valueStr.replace('.', '').length;
    if (totalDigits <= maxDigits) return valueStr;
    const decimalIndex = valueStr.indexOf('.');
    if (decimalIndex === -1) return valueStr.substring(0, maxDigits);
    const integerPart = valueStr.substring(0, decimalIndex);
    const decimalPart = valueStr.substring(decimalIndex + 1);
    const availableDecimalDigits = maxDigits - integerPart.length;
    if (availableDecimalDigits <= 0) return integerPart.substring(0, maxDigits);
    const truncatedDecimal = decimalPart.substring(0, availableDecimalDigits);
    return integerPart + '.' + truncatedDecimal;
  }, []);

  const getAvailableCoinBalance = useCallback(() => {
    if (!session || !coinBalance) return 0;
    return coinBalance.amount || 0;
  }, [session, coinBalance]);

  const formatAvailableCoinBalance = useCallback(() => {
    const balance = getAvailableCoinBalance();
    return formatToMaxDigits(balance, 10);
  }, [getAvailableCoinBalance, formatToMaxDigits]);

  const formatToTwoDecimalsWithComma = useCallback((value: string): string => {
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    const num = parseFloat(numericValue);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  const formatCoinNumber = useCallback((value: string): string => {
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;

    const parts = numericValue.split('.');
    const decimalPart = parts[1];

    if (decimalPart !== undefined && decimalPart.length > 9) {
      return value;
    }

    return numericValue;
  }, []);

  const isValidPriceFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  const isValidCoinFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d{0,9}$/.test(numericValue);
  }, []);

  const calculateReceiveUSD = useCallback(
    (coinAmount: string, priceValue: string): string => {
      if (!coinAmount || !priceValue) return '';
      const cleanPrice = priceValue.replace(/,/g, '');
      if (
        cleanPrice === '0' ||
        (cleanPrice.startsWith('0.0') && cleanPrice.replace(/[0.]/g, '') === '')
      )
        return '';

      const numCoin = parseFloat(coinAmount);
      const numPrice = parseFloat(cleanPrice);
      if (isNaN(numCoin) || isNaN(numPrice) || numPrice <= 0) return '';
      const usdAmount = numCoin * numPrice;
      return formatToTwoDecimalsWithComma(usdAmount.toString());
    },
    [formatToTwoDecimalsWithComma]
  );

  const calculateSellSliderPercentage = useCallback(
    (coinAmount: string): number => {
      if (!coinAmount) return 0;
      const numAmount = parseFloat(coinAmount);
      const availableCoin = getAvailableCoinBalance();
      if (isNaN(numAmount) || numAmount <= 0 || availableCoin <= 0) return 0;
      const percentage = (numAmount / availableCoin) * 100;
      return Math.min(percentage, 100);
    },
    [getAvailableCoinBalance]
  );

  const calculateCoinFromPercentage = useCallback(
    (percentage: number): string => {
      const availableCoin = getAvailableCoinBalance();
      if (availableCoin <= 0 || percentage <= 0) return '0';
      const multiplier = 1000000000;
      const availableSatoshis = Math.floor(availableCoin * multiplier);
      const percentageSatoshis = Math.floor((percentage / 100) * availableSatoshis);
      const coinAmount = percentageSatoshis / multiplier;
      return formatToMaxDigits(coinAmount, 10);
    },
    [getAvailableCoinBalance, formatToMaxDigits]
  );

  const validateSellAmount = useCallback(() => {
    const num = parseFloat(sellAmount);
    const availableCoin = getAvailableCoinBalance();
    if (!sellAmount || sellAmount === '' || num === 0 || isNaN(num)) {
      setIsSellAmountValid(false);
      setSellAmountErrorMessage('Please enter amount');
      return false;
    }
    if (num > availableCoin) {
      setIsSellAmountValid(false);
      setSellAmountErrorMessage('Insufficient balance');
      return false;
    }
    setIsSellAmountValid(true);
    setSellAmountErrorMessage('');
    return true;
  }, [sellAmount, getAvailableCoinBalance]);

  const handlePriceFocus = () => {
    setPriceLabel('Limit price');
    setIsInputFocused(true);
    setPrice('');
  };

  const handleMarketClick = () => {
    setPriceLabel('Price');
    setPrice(marketPrice);
    setIsInputFocused(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidPriceFormat(inputValue)) {
      const formattedValue = formatPriceWithComma(inputValue);
      setPrice(formattedValue);
    }
  };

  const handlePriceBlur = () => {
    if (price) {
      // ใช้ฟังก์ชัน formatPriceForDisplay เมื่อเสร็จสิ้นการแก้ไข
      const formattedPrice = formatPriceForDisplay(price);
      setPrice(formattedPrice);
      console.log(`SellOrderContainer: Price blur - formatted user input: "${formattedPrice}"`);
    } else {
      // ถ้าไม่มีราคาที่กรอก ให้กลับไปใช้ market price และเปลี่ยน label กลับเป็น "Price"
      if (marketPrice && !isPriceLoading) {
        setPrice(marketPrice);
        setPriceLabel('Price');
        console.log(`SellOrderContainer: Price blur - reset to market price: "${marketPrice}"`);
      }
    }
    setIsInputFocused(false);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidCoinFormat(inputValue)) {
      const formattedValue = formatCoinNumber(inputValue);
      setSellAmount(formattedValue);
      const numericValue = inputValue.replace(/,/g, '');
      const num = parseFloat(numericValue);
      const availableCoin = getAvailableCoinBalance();

      if (inputValue === '' || num === 0 || isNaN(num)) {
        setIsSellAmountValid(true);
        setSellAmountErrorMessage('');
        setSellSliderValue(0);
      } else if (num > availableCoin) {
        setIsSellAmountValid(false);
        setSellAmountErrorMessage('Insufficient balance');
        setSellSliderValue(0);
      } else {
        setIsSellAmountValid(true);
        setSellAmountErrorMessage('');
        const sliderPercentage = calculateSellSliderPercentage(numericValue);
        setSellSliderValue(sliderPercentage);
      }
    }
  };

  const handleSellSliderChange = (percentage: number) => {
    setSellSliderValue(percentage);
    const newCoinAmount = calculateCoinFromPercentage(percentage);
    setSellAmount(newCoinAmount);
    const num = parseFloat(newCoinAmount);
    const availableCoin = getAvailableCoinBalance();
    const isValid = !isNaN(num) && num <= availableCoin;
    setIsSellAmountValid(isValid);
    if (isValid) {
      setSellAmountErrorMessage('');
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
      validateSellAmount();
    }
  };

  const handleSubmit = () => {
    if (!session) {
      router.push('/auth/sign-in');
      return;
    }

    if (!validateSellAmount()) {
      return;
    }

    const numericPrice = parseFloat(price.replace(/,/g, '') || '0');
    const coinAmountToSell = parseFloat(sellAmount || '0');
    const userId =
      cashBalance?.userId || (session.user as UserWithId)?.id || session.user?.email || '';
    const lotPrice = numericPrice * coinAmountToSell;
    const coinSymbol = selectedCoin.label.split('/')[0];

    const sellOrderPayload = {
      userId: userId,
      symbol: coinSymbol,
      price: numericPrice,
      amount: coinAmountToSell,
      lotPrice: lotPrice,
    };

    console.log('SellOrderContainer: Sell order payload:', sellOrderPayload);
    console.log('SellOrderContainer: Coin amount to sell:', coinAmountToSell);
    console.log('SellOrderContainer: Price per coin:', numericPrice);
    console.log('SellOrderContainer: Lot Price (total value):', lotPrice);
    console.log('SellOrderContainer: USD to receive:', receiveUSD);

    createSellOrderMutation.mutate(sellOrderPayload);
  };

  const handleSubmitSuccess = () => {
    setSellAmount('');
    setSellSliderValue(0);
    setReceiveUSD('');
    setIsSellAmountValid(true);
    setSellAmountErrorMessage('');
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    console.log(
      `SellOrderContainer: selectedCoin.label changed to ${selectedCoin.label}, marketPrice: ${marketPrice}, isPriceLoading: ${isPriceLoading}`
    );
    if (priceLabel === 'Price' && !isInputFocused) {
      if (marketPrice && !isPriceLoading) {
        setPrice(marketPrice);
        console.log(
          `SellOrderContainer: Set market price to ${marketPrice} for ${selectedCoin.label}`
        );
      } else if (isPriceLoading) {
        setPrice('0.' + '0'.repeat(priceDecimalPlaces));
        console.log(
          `SellOrderContainer: Set price to 0.00 due to loading for ${selectedCoin.label}`
        );
      }
    }
  }, [
    marketPrice,
    priceLabel,
    isInputFocused,
    isPriceLoading,
    selectedCoin.label,
    priceDecimalPlaces,
  ]);

  useEffect(() => {
    const calculatedReceiveUSD = calculateReceiveUSD(sellAmount, price);
    setReceiveUSD(calculatedReceiveUSD);
  }, [sellAmount, price, calculateReceiveUSD]);

  const coinSymbolMap: { [key: string]: string } = {
    BTC: 'bitcoin-icon.svg',
    ETH: 'ethereum-icon.svg',
    BNB: 'bnb-coin.svg',
    SOL: 'solana-icon.svg',
    XRP: 'xrp-coin.svg',
    ADA: 'ada-coin.svg',
    DOGE: 'doge-coin.svg',
  };
  const coinSymbol = selectedCoin.label.split('/')[0];
  const amountIcon = `/currency-icons/${coinSymbolMap[coinSymbol] || 'default-coin.svg'}`;

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
        availableBalance={formatAvailableCoinBalance()}
        balanceCurrency={coinSymbol}
        symbol={coinSymbol}
        buttonColor="bg-[#D84C4C] hover:bg-[#C73E3E]"
        amountIcon={amountIcon}
        receiveIcon="/currency-icons/dollar-icon.svg"
        receiveCurrency="USD"
        isSubmitting={createSellOrderMutation.isPending}
        amountErrorMessage={sellAmountErrorMessage}
        isAuthenticated={!!session}
        onPriceFocus={handlePriceFocus}
        onPriceChange={handlePriceChange}
        onPriceBlur={handlePriceBlur}
        onAmountChange={handleSellAmountChange}
        onAmountFocus={handleSellAmountFocus}
        onAmountBlur={handleSellAmountBlur}
        onSliderChange={handleSellSliderChange}
        onMarketClick={handleMarketClick}
        onSubmit={handleSubmit}
        onLoginClick={() => router.push('/auth/sign-in')}
      />

      {showAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <AlertBox
            message={alertMessage}
            type={alertType}
            onClose={handleAlertClose}
            duration={5000}
          />
        </div>
      )}
    </div>
  );
}

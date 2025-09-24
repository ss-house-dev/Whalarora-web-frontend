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

interface SellOrderContainerProps {
  onExchangeClick?: () => void;
}

export default function SellOrderContainer({ onExchangeClick }: SellOrderContainerProps) {
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
        setAlertMessage('Sell order created successfully!\nStatus: Pending');
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
  const [isReceiveUSDEditing, setIsReceiveUSDEditing] = useState(false);
  const [lastPercentage, setLastPercentage] = useState<number | null>(null);

  // Truncate a number to specified decimal places without rounding
  const truncateToDecimals = useCallback((num: number, decimals: number): string => {
    if (isNaN(num) || !Number.isFinite(num)) return '0';
    const factor = Math.pow(10, decimals);
    const truncated = Math.floor(num * factor) / factor;
    const parts = truncated.toString().split('.');
    const integerPart = parts[0];
    let decimalPart = parts[1] || '';
    // Pad with zeros if necessary
    decimalPart = decimalPart.padEnd(decimals, '0');
    return `${integerPart}${decimals > 0 ? '.' + decimalPart : ''}`;
  }, []);

  const formatPriceWithComma = useCallback((value: string): string => {
    if (!value) return '';
    let numericValue = value.replace(/,/g, '');
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;

    if (numericValue === '.') numericValue = '0.';
    if (numericValue.length > 1 && numericValue[0] === '0') {
      if (numericValue[1] !== '.') {
        numericValue = numericValue.replace(/^0+/, '');
        if (numericValue === '' || numericValue[0] === '.') numericValue = '0' + numericValue;
      } else {
        numericValue = '0.' + numericValue.slice(2);
      }
    }

    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }, []);

  const formatPriceForDisplay = useCallback((value: string): string => {
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    const num = parseFloat(numericValue);
    if (isNaN(num)) return '';

    const parts = numericValue.split('.');
    const integerPart = parts[0];
    let decimalPart = parts[1] || '';
    decimalPart = decimalPart.padEnd(2, '0'); // Ensure at least 2 decimal places
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedInteger}.${decimalPart}`;
  }, []);

  const getAvailableCoinBalance = useCallback(() => {
    if (!session || !coinBalance) return 0;
    return coinBalance.amount || 0;
  }, [session, coinBalance]);

  const formatAvailableCoinBalance = useCallback(() => {
    const balance = getAvailableCoinBalance();
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(balance);
  }, [getAvailableCoinBalance]);

  const formatUsdAmount = useCallback(
    (value: string): string => {
      if (!value) return '';
      let numericValue = value.replace(/,/g, '');
      if (!/^\d*\.?\d*$/.test(numericValue)) return value;

      if (numericValue === '.') numericValue = '0.';
      if (numericValue.length > 1 && numericValue[0] === '0') {
        if (numericValue[1] !== '.') {
          numericValue = numericValue.replace(/^0+/, '');
          if (numericValue === '' || numericValue[0] === '.') numericValue = '0' + numericValue;
        } else {
          numericValue = '0.' + numericValue.slice(2);
        }
      }

      const num = parseFloat(numericValue);
      if (isNaN(num)) return numericValue;

      const formatted = truncateToDecimals(num, priceDecimalPlaces);
      const parts = formatted.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];

      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [priceDecimalPlaces, truncateToDecimals]
  );

  const isValidUSDFormat = useCallback(
    (value: string): boolean => {
      const numericValue = value.replace(/,/g, '');
      const regexPattern = new RegExp(`^\\d*\\.?\\d{0,${priceDecimalPlaces}}$`);
      return regexPattern.test(numericValue);
    },
    [priceDecimalPlaces]
  );

  const formatCoinNumber = useCallback(
    (value: string): string => {
      if (!value) return '';
      let numericValue = value.replace(/,/g, '');
      if (!/^\d*\.?\d*$/.test(numericValue)) return value;

      if (numericValue === '.') numericValue = '0.';
      if (numericValue.length > 1 && numericValue[0] === '0') {
        if (numericValue[1] !== '.') {
          numericValue = numericValue.replace(/^0+/, '');
          if (numericValue === '' || numericValue[0] === '.') numericValue = '0' + numericValue;
        } else {
          numericValue = '0.' + numericValue.slice(2);
        }
      }

      const num = parseFloat(numericValue);
      if (isNaN(num)) return numericValue;

      const formatted = truncateToDecimals(num, priceDecimalPlaces);
      const parts = formatted.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];

      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [priceDecimalPlaces, truncateToDecimals]
  );

  const isValidPriceFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  const isValidCoinFormat = useCallback(
    (value: string): boolean => {
      const numericValue = value.replace(/,/g, '');
      const regexPattern = new RegExp(`^\\d*\\.?\\d{0,${priceDecimalPlaces}}$`);
      return regexPattern.test(numericValue);
    },
    [priceDecimalPlaces]
  );

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
      return formatUsdAmount(usdAmount.toString());
    },
    [formatUsdAmount]
  );

  const calculateSellSliderPercentage = useCallback(
    (coinAmount: string): number => {
      if (!coinAmount) return 0;
      const numAmount = parseFloat(coinAmount.replace(/,/g, ''));
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
      const amount = (percentage / 100) * availableCoin;
      return formatCoinNumber(amount.toString());
    },
    [getAvailableCoinBalance, formatCoinNumber]
  );

  const validateSellAmount = useCallback(() => {
    const num = parseFloat(sellAmount.replace(/,/g, ''));
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
    if (marketPrice && !isPriceLoading) {
      setPrice(marketPrice);
    }
  };

  const handleMarketClick = () => {
    setPriceLabel('Price');
    setPrice(marketPrice);
    setIsInputFocused(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidPriceFormat(inputValue)) {
      const formattedValue = inputValue === '' ? '' : formatPriceWithComma(inputValue);
      setPrice(formattedValue);
    }
  };

  const handlePriceBlur = () => {
    if (price) {
      const formattedPrice = formatPriceForDisplay(price);
      setPrice(formattedPrice);
    }
    setIsInputFocused(false);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReceiveUSDEditing(false);
    setLastPercentage(null);
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
        const sliderPercentage = calculateSellSliderPercentage(inputValue);
        setSellSliderValue(sliderPercentage);
      }
    }
  };

  const handleSellSliderChange = (percentage: number) => {
    setIsReceiveUSDEditing(false);
    setLastPercentage(null);
    setSellSliderValue(percentage);
    const newCoinAmount = calculateCoinFromPercentage(percentage);
    setSellAmount(newCoinAmount);
    const num = parseFloat(newCoinAmount.replace(/,/g, ''));
    const availableCoin = getAvailableCoinBalance();
    const isValid = !isNaN(num) && num <= availableCoin;
    setIsSellAmountValid(isValid);
    if (isValid) {
      setSellAmountErrorMessage('');
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (lastPercentage === percentage) {
      return;
    }
    setIsReceiveUSDEditing(false);
    setLastPercentage(percentage);
    setSellSliderValue(percentage);
    const newCoinAmount = calculateCoinFromPercentage(percentage);
    setSellAmount(newCoinAmount);
    const num = parseFloat(newCoinAmount.replace(/,/g, ''));
    const availableCoin = getAvailableCoinBalance();
    const isValid = !isNaN(num) && num <= availableCoin;
    setIsSellAmountValid(isValid);
    setSellAmountErrorMessage(isValid ? '' : 'Insufficient balance');
  };

  const handleMaxSell = () => {
    handlePercentageClick(100);
  };

  const handleSellAmountFocus = () => setIsSellAmountFocused(true);

  const handleSellAmountBlur = () => {
    setIsReceiveUSDEditing(false);
    setIsSellAmountFocused(false);

    if (sellAmount) {
      const numericValue = sellAmount.replace(/,/g, '');
      const num = parseFloat(numericValue);
      if (!isNaN(num)) {
        const formatted = truncateToDecimals(num, priceDecimalPlaces);
        const parts = formatted.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const finalFormatted =
          decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
        setSellAmount(finalFormatted);
      }
      validateSellAmount();
    }
  };

  const handleReceiveUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidUSDFormat(inputValue)) {
      setIsReceiveUSDEditing(true);
      setLastPercentage(null);
      const formatted = formatUsdAmount(inputValue);
      setReceiveUSD(formatted);

      const priceNum = parseFloat(price.replace(/,/g, ''));
      const usdNum = parseFloat((formatted || '0').replace(/,/g, ''));

      if (!inputValue || isNaN(usdNum) || usdNum === 0 || isNaN(priceNum) || priceNum <= 0) {
        setSellAmount('');
        setIsSellAmountValid(true);
        setSellAmountErrorMessage('');
        setSellSliderValue(0);
        return;
      }

      const coinAmount = usdNum / priceNum;
      const newAmount = formatCoinNumber(coinAmount.toString());
      setSellAmount(newAmount);

      const availableCoin = getAvailableCoinBalance();
      if (coinAmount > availableCoin) {
        setIsSellAmountValid(false);
        setSellAmountErrorMessage('Insufficient balance');
        setSellSliderValue(0);
      } else {
        setIsSellAmountValid(true);
        setSellAmountErrorMessage('');
        const sliderPercentage = Math.min((coinAmount / availableCoin) * 100, 100);
        setSellSliderValue(sliderPercentage);
      }
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
    const coinAmountToSell = parseFloat(sellAmount.replace(/,/g, '') || '0');
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
    setLastPercentage(null);
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
          `SellOrderContainer: Set price to 0.${'0'.repeat(
            priceDecimalPlaces
          )} due to loading for ${selectedCoin.label}`
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
    if (isReceiveUSDEditing) return;
    const calculatedReceiveUSD = calculateReceiveUSD(sellAmount, price);
    setReceiveUSD(calculatedReceiveUSD);
  }, [sellAmount, price, calculateReceiveUSD, isReceiveUSDEditing]);

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
        receiveIcon="/assets/usdt.svg"
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
        onReceiveChange={handleReceiveUSDChange}
        onExchangeClick={onExchangeClick}
        onQuickAdd={handlePercentageClick}
        onMax={handleMaxSell}
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

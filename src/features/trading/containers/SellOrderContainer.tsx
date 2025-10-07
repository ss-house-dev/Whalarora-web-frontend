'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import OrderForm from '@/features/trading/components/OrderForm';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGetCashBalance } from '@/features/wallet/hooks/useGetCash';
import { useCreateSellOrder } from '@/features/trading/hooks/useCreateSellOrder';
import { useQueryClient } from '@tanstack/react-query';
import { TradeQueryKeys } from '@/features/trading/constants';
import { useGetCoin } from '@/features/trading/hooks/useGetCoin';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  decimalsFromSize,
  formatAmountWithStep,
} from '@/features/trading/utils/symbolPrecision';
import AlertBox from '../../../components/ui/alert-box';

interface UserWithId {
  id: string;
  email?: string;
}

interface SellOrderContainerProps {
  onExchangeClick?: () => void;
}

const DEFAULT_FIAT_PLACEHOLDER = '> 0.01';
const DEFAULT_STEP_PLACEHOLDER = '> 0.00001';

const createStepSizePlaceholder = (stepSize?: string) => {
  if (!stepSize) return DEFAULT_STEP_PLACEHOLDER;
  const decimals = decimalsFromSize(stepSize);
  const numericValue = Number(stepSize);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return DEFAULT_STEP_PLACEHOLDER;
  if (decimals === undefined) {
    return `> ${numericValue}`;
  }
  return `> ${numericValue.toFixed(decimals)}`;
};

export default function SellOrderContainer({ onExchangeClick }: SellOrderContainerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const {
    selectedCoin,
    marketPrice,
    chartPrice,
    isPriceLoading,
    priceDecimalPlaces,
    orderFormSelection,
  } = useCoinContext();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const derivedMarketPrice = useMemo(() => {
    const normalizedChart = chartPrice?.trim();
    if (normalizedChart) {
      return chartPrice;
    }
    return marketPrice;
  }, [chartPrice, marketPrice]);

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [coinSymbol, quoteSymbol] = useMemo(() => {
    const [base, quote] = selectedCoin.label.split('/');
    return [base ?? '', quote ?? 'USDT'];
  }, [selectedCoin.label]);

  const { data: precisionMap } = useSymbolPrecisions();

  const symbolPrecision = useMemo(
    () => getSymbolPrecision(precisionMap, coinSymbol, quoteSymbol),
    [precisionMap, coinSymbol, quoteSymbol]
  );

  const quoteSymbolPrecision = useMemo(() => {
    if (!quoteSymbol || quoteSymbol === coinSymbol) return symbolPrecision;
    if (quoteSymbol === 'USDT' || quoteSymbol === 'USD') return undefined;
    return getSymbolPrecision(precisionMap, quoteSymbol, 'USDT');
  }, [precisionMap, quoteSymbol, coinSymbol, symbolPrecision]);

  const parseNumeric = useCallback((value: number | string | null | undefined) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }
    const normalized = value.replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, []);

  const formatQuoteAmount = useCallback(
    (value: number | string | null | undefined) => {
      if (quoteSymbol === 'USDT' || quoteSymbol === 'USD') {
        const numeric = parseNumeric(value);
        if (numeric === undefined) return '0.00';
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numeric);
      }

      return formatAmountWithStep(value, quoteSymbolPrecision ?? symbolPrecision, {
        fallbackDecimals: 6,
      });
    },
    [parseNumeric, quoteSymbol, quoteSymbolPrecision, symbolPrecision]
  );

  const quantityPrecision = useMemo(() => {
    const decimals =
      symbolPrecision?.quantityPrecision ??
      (symbolPrecision?.stepSize ? decimalsFromSize(symbolPrecision.stepSize) : undefined);
    return decimals ?? 6;
  }, [symbolPrecision]);

  const spendPlaceholder = useMemo(() => {
    return createStepSizePlaceholder(symbolPrecision?.stepSize);
  }, [symbolPrecision?.stepSize]);

  const receivePlaceholder = DEFAULT_FIAT_PLACEHOLDER;

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

      // คำนวณจำนวนเงิน USDT ที่ได้รับจริง
      let receivedUSDT = 0;

      if (data.filled > 0) {
        // กรณีที่มี order ถูก fill (ขายได้)
        receivedUSDT = data.proceeds || 0;
      } else {
        // กรณีที่ order ยังไม่ถูก fill (pending)
        // คำนวณจากจำนวน coin ที่ขาย * ราคา
        const coinAmount = parseNumeric(sellAmount) ?? 0;
        const pricePerCoin = parseNumeric(price) ?? 0;
        receivedUSDT = coinAmount * pricePerCoin;
      }

      // แสดง alert ในรูปแบบเดียวกันทั้งหมด
      setAlertMessage(
        `Order Sell ${coinSymbol}/USDT (${new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(receivedUSDT)} USDT) submitted successfully`
      );
      // ลบ setAlertType ออก
      setShowAlert(true);
      handleSubmitSuccess();
    },
    onError: (error) => {
      console.error('SellOrderContainer: Sell order error:', error);
      setAlertMessage(`Error creating sell order: ${error.message}`);
      // ลบ setAlertType ออก
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
  const [isReceiveUSDUserInput, setIsReceiveUSDUserInput] = useState(false);
  const [lastPercentage, setLastPercentage] = useState<number | null>(null);

  const truncateToDecimals = useCallback((num: number, decimals: number): string => {
    if (isNaN(num) || !Number.isFinite(num)) return '0';
    if (decimals === 0) {
      return Math.trunc(num).toString();
    }
    const multiplier = Math.pow(10, decimals);
    const truncated = Math.trunc(num * multiplier) / multiplier;
    return truncated.toFixed(decimals);
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
    decimalPart = decimalPart.padEnd(2, '0');
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

  const formatUsdAmount = (value: string): string => {
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

    // ไม่ตัดทศนิยม เก็บไว้ตามที่ user พิมพ์
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

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

      const parts = numericValue.split('.');
      const integerPart = parts[0];
      let decimalPart = parts[1];

      if (decimalPart && decimalPart.length > quantityPrecision) {
        decimalPart = decimalPart.substring(0, quantityPrecision);
      }

      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [quantityPrecision]
  );

  const isValidPriceFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  const isValidUSDFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    // อนุญาตให้ใส่ทศนิยมได้ไม่จำกัด (ไม่ใช้ priceDecimalPlaces ในการ validate)
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  const isValidCoinFormat = useCallback(
    (value: string): boolean => {
      const numericValue = value.replace(/,/g, '');
      if (numericValue === '') return true;
      if (!/^\d*\.?\d*$/.test(numericValue)) return false;
      if (!Number.isInteger(quantityPrecision) || quantityPrecision < 0) {
        return true;
      }
      if (quantityPrecision === 0) {
        return /^\d*$/.test(numericValue);
      }
      const decimalPart = numericValue.split('.')[1];
      return !decimalPart || decimalPart.length <= quantityPrecision;
    },
    [quantityPrecision]
  );

  const calculateReceiveUSD = useCallback(
    (coinAmount: string, priceValue: string): string => {
      if (!coinAmount || !priceValue) return '';

      const cleanPrice = priceValue.replace(/,/g, '');
      const cleanCoin = coinAmount.replace(/,/g, '');

      // ตรวจสอบว่าเป็น 0 หรือไม่
      if (
        cleanPrice === '0' ||
        cleanCoin === '0' ||
        (cleanPrice.startsWith('0.0') && cleanPrice.replace(/[0.]/g, '') === '')
      ) {
        return '';
      }

      const numCoin = parseFloat(cleanCoin);
      const numPrice = parseFloat(cleanPrice);

      if (isNaN(numCoin) || isNaN(numPrice) || numPrice <= 0 || numCoin <= 0) {
        return '';
      }

      // คำนวณแล้วใช้ truncate ตาม priceDecimalPlaces (tick size)
      const usdAmount = numCoin * numPrice;

      // ใช้ truncateToDecimals ตาม priceDecimalPlaces
      const truncatedAmount = truncateToDecimals(usdAmount, priceDecimalPlaces);
      const parts = truncatedAmount.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [priceDecimalPlaces, truncateToDecimals]
  );

  const updateSellAmountFromReceive = useCallback(
    (usdValue: string, priceValue: string) => {
      const cleanPrice = priceValue.replace(/,/g, '');
      const priceNum = parseFloat(cleanPrice);
      const usdNum = parseFloat((usdValue || '').replace(/,/g, ''));
      if (!usdValue || isNaN(usdNum) || usdNum <= 0 || isNaN(priceNum) || priceNum <= 0) {
        setSellAmount('');
        setIsSellAmountValid(true);
        setSellAmountErrorMessage('');
        setSellSliderValue(0);
        return;
      }

      const decimals = symbolPrecision?.quantityPrecision ?? quantityPrecision ?? 6;
      const truncatedCoinAmount = truncateToDecimals(usdNum / priceNum, decimals);
      const parts = truncatedCoinAmount.split('.');
      const integerPart = parts[0] ?? '';
      const decimalPart = parts[1];
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const newAmount =
        decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;

      setSellAmount(newAmount);

      const availableCoin = getAvailableCoinBalance();
      const numericCoinAmount = parseFloat(truncatedCoinAmount);

      if (numericCoinAmount > availableCoin) {
        setIsSellAmountValid(false);
        setSellAmountErrorMessage('Insufficient balance');
        setSellSliderValue(0);
      } else {
        setIsSellAmountValid(true);
        setSellAmountErrorMessage('');
        const sliderPercentage =
          availableCoin > 0 ? Math.min((numericCoinAmount / availableCoin) * 100, 100) : 0;
        setSellSliderValue(sliderPercentage);
      }
    },
    [getAvailableCoinBalance, quantityPrecision, symbolPrecision, truncateToDecimals]
  );
  const recalcLinkedFields = useCallback(
    (priceValue: string, options?: { allowClearReceive?: boolean }) => {
      const allowClearReceive = options?.allowClearReceive ?? true;
      const cleanPrice = priceValue.replace(/,/g, '');
      const priceNum = parseFloat(cleanPrice);
      const hasValidPrice = priceValue !== '' && !isNaN(priceNum) && priceNum > 0;

      if (!hasValidPrice) {
        if (allowClearReceive && !isReceiveUSDUserInput && receiveUSD !== '') {
          setReceiveUSD('');
        }
        return;
      }

      if (sellAmount) {
        setIsReceiveUSDUserInput(false);
        const recalculatedReceive = calculateReceiveUSD(sellAmount, priceValue);
        if (recalculatedReceive !== receiveUSD) {
          setReceiveUSD(recalculatedReceive);
        }
        return;
      }

      if (receiveUSD) {
        updateSellAmountFromReceive(receiveUSD, priceValue);
      }
    },
    [
      calculateReceiveUSD,
      isReceiveUSDUserInput,
      receiveUSD,
      sellAmount,
      updateSellAmountFromReceive,
    ]
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

      const decimals =
        symbolPrecision?.quantityPrecision ??
        (symbolPrecision?.stepSize
          ? decimalsFromSize(symbolPrecision.stepSize)
          : quantityPrecision) ??
        6;
      const formatted = truncateToDecimals(amount, decimals);
      const parts = formatted.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [getAvailableCoinBalance, symbolPrecision, quantityPrecision, truncateToDecimals]
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
    if (derivedMarketPrice && !isPriceLoading) {
      setPrice(derivedMarketPrice);
      recalcLinkedFields(derivedMarketPrice, { allowClearReceive: false });
    }
  };

  const handleMarketClick = () => {
    setPriceLabel('Price');
    const marketValue = derivedMarketPrice || '';
    setPrice(marketValue);
    setIsInputFocused(false);
    recalcLinkedFields(marketValue);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidPriceFormat(inputValue)) {
      const formattedValue = inputValue === '' ? '' : formatPriceWithComma(inputValue);
      setPrice(formattedValue);
      const cleanPrice = formattedValue.replace(/,/g, '');
      const numericPrice = parseFloat(cleanPrice);
      const hasValidPrice = formattedValue !== '' && !isNaN(numericPrice) && numericPrice > 0;
      recalcLinkedFields(formattedValue, { allowClearReceive: !hasValidPrice });
    }
  };

  const handlePriceBlur = () => {
    if (price) {
      const formattedPrice = formatPriceForDisplay(price);
      setPrice(formattedPrice);
      recalcLinkedFields(formattedPrice, { allowClearReceive: false });
    } else {
      recalcLinkedFields('', { allowClearReceive: true });
    }
    setIsInputFocused(false);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReceiveUSDEditing(false);
    setIsReceiveUSDUserInput(false); // reset flag เมื่อ user เปลี่ยน sell amount
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
      const calculatedReceiveUSD = calculateReceiveUSD(formattedValue, price);
      setReceiveUSD(calculatedReceiveUSD);
    }
  };

  const handleSellSliderChange = (percentage: number) => {
    setIsReceiveUSDEditing(false);
    setIsReceiveUSDUserInput(false); // reset flag
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
    const calculatedReceiveUSD = calculateReceiveUSD(newCoinAmount, price);
    setReceiveUSD(calculatedReceiveUSD);
  };

  const handlePercentageClick = (percentage: number) => {
    if (lastPercentage === percentage) {
      return;
    }
    setIsReceiveUSDEditing(false);
    setIsReceiveUSDUserInput(false); // reset flag
    setLastPercentage(percentage);
    setSellSliderValue(percentage);
    const newCoinAmount = calculateCoinFromPercentage(percentage);
    setSellAmount(newCoinAmount);
    const num = parseFloat(newCoinAmount.replace(/,/g, ''));
    const availableCoin = getAvailableCoinBalance();
    const isValid = !isNaN(num) && num <= availableCoin;
    setIsSellAmountValid(isValid);
    setSellAmountErrorMessage(isValid ? '' : 'Insufficient balance');
    const calculatedReceiveUSD = calculateReceiveUSD(newCoinAmount, price);
    setReceiveUSD(calculatedReceiveUSD);
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
        const decimals =
          symbolPrecision?.quantityPrecision ??
          (symbolPrecision?.stepSize
            ? decimalsFromSize(symbolPrecision.stepSize)
            : quantityPrecision) ??
          6;
        const formatted = truncateToDecimals(num, decimals);
        const parts = formatted.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const finalFormatted =
          decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
        setSellAmount(finalFormatted);

        // คำนวณ receiveUSD ใหม่เฉพาะเมื่อไม่ใช่ค่าที่ user พิมพ์ใน receive field
        if (!isReceiveUSDUserInput) {
          const calculatedReceiveUSD = calculateReceiveUSD(finalFormatted, price);
          setReceiveUSD(calculatedReceiveUSD);
        }

        validateSellAmount();
      }
    }
  };
  const handleReceiveUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '' || isValidUSDFormat(inputValue)) {
      setIsReceiveUSDEditing(true);
      setIsReceiveUSDUserInput(true);
      setLastPercentage(null);

      const formattedInput = formatUsdAmount(inputValue);
      setReceiveUSD(formattedInput);
      updateSellAmountFromReceive(formattedInput, price);
    }
  };

  const handleReceiveBlur = () => {
    setIsReceiveUSDEditing(false);

    // เก็บค่าที่ user พิมพ์ไว้ ไม่เปลี่ยนแปลง
    if (receiveUSD && isReceiveUSDUserInput) {
      const numericValue = receiveUSD.replace(/,/g, '');
      const num = parseFloat(numericValue);

      if (!isNaN(num) && num >= 0) {
        // แค่ format comma เท่านั้น ไม่เปลี่ยนแปลงค่า
        const parts = numericValue.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const finalFormatted =
          decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
        setReceiveUSD(finalFormatted);
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
    setIsReceiveUSDUserInput(false); // reset flag
    setLastPercentage(null);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    console.log(
      `SellOrderContainer: selectedCoin.label changed to ${selectedCoin.label}, marketPrice: ${marketPrice}, chartPrice: ${chartPrice}, derivedPrice: ${derivedMarketPrice}, isPriceLoading: ${isPriceLoading}`
    );
    if (priceLabel === 'Price' && !isInputFocused) {
      if (derivedMarketPrice && !isPriceLoading) {
        setPrice(derivedMarketPrice);
        console.log(
          `SellOrderContainer: Set derived price to ${derivedMarketPrice} (chart: ${chartPrice}) for ${selectedCoin.label}`
        );
        recalcLinkedFields(derivedMarketPrice, { allowClearReceive: false });
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
    derivedMarketPrice,
    marketPrice,
    chartPrice,
    priceLabel,
    isInputFocused,
    isPriceLoading,
    selectedCoin.label,
    priceDecimalPlaces,
    recalcLinkedFields,
  ]);

  useEffect(() => {
    // ปิดการคำนวณอัตโนมัติใน useEffect เพื่อป้องกันการเปลี่ยนแปลงค่า receive ที่ user พิมพ์
    // ให้คำนวณแค่ใน onChange events เท่านั้น
    return;

    // โค้ดเดิม (comment ไว้)
    // if (isReceiveUSDEditing || isReceiveUSDUserInput) return;
    // if (!sellAmount || sellAmount === '0') {
    //   setReceiveUSD('');
    //   return;
    // }
    // if (isSellAmountFocused) {
    //   const calculatedReceiveUSD = calculateReceiveUSD(sellAmount, price);
    //   setReceiveUSD(calculatedReceiveUSD);
    // }
  }, [
    sellAmount,
    price,
    calculateReceiveUSD,
    isReceiveUSDEditing,
    isReceiveUSDUserInput,
    isSellAmountFocused,
  ]);

  useEffect(() => {
    if (!orderFormSelection) return;
    if (orderFormSelection.side !== 'sell') return;

    const isMarketMode = orderFormSelection.mode === 'market';
    setPriceLabel(isMarketMode ? 'Price' : 'Limit price');
    setPrice(orderFormSelection.price);
    recalcLinkedFields(orderFormSelection.price);
    setIsInputFocused(false);
  }, [orderFormSelection, recalcLinkedFields]);

  const coinSymbolMap: { [key: string]: string } = {
    BTC: 'bitcoin-icon.svg',
    ETH: 'ethereum-icon.svg',
    BNB: 'bnb-coin.svg',
    SOL: 'solana-icon.svg',
    XRP: 'xrp-coin.svg',
    ADA: 'ada-coin.svg',
    DOGE: 'doge-coin.svg',
  };
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
        spendPlaceholder={spendPlaceholder}
        receivePlaceholder={receivePlaceholder}
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
        onReceiveBlur={handleReceiveBlur}
        onExchangeClick={onExchangeClick}
        onQuickAdd={handlePercentageClick}
        onMax={handleMaxSell}
      />

      {showAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <AlertBox message={alertMessage} onClose={handleAlertClose} duration={3000} />
        </div>
      )}
    </div>
  );
}

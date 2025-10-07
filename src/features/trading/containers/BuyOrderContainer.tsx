'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import OrderForm from '@/features/trading/components/OrderForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGetCashBalance } from '@/features/wallet/hooks/useGetCash';
import { useCreateBuyOrder } from '@/features/trading/hooks/useCreateBuyOrder';
import { useQueryClient } from '@tanstack/react-query';
import { TradeQueryKeys } from '@/features/wallet/constants';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogSubtext,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog-coin';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  decimalsFromSize,
  formatAmountWithStep,
} from '@/features/trading/utils/symbolPrecision';
import AlertBox from '../../../components/ui/alert-box';

interface AlertState {
  message: string;
  type: 'success';
}

interface OrderPayload {
  userId: string;
  symbol: string;
  price: number;
  amount: number;
  lotPrice: number;
}

interface SessionUser {
  id?: string;
  email?: string;
  name?: string;
}

interface BuyOrderContainerProps {
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

export default function BuyOrderContainer({ onExchangeClick }: BuyOrderContainerProps) {
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

  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{
    orderRef: string;
    variant: 'CONFIRMATION' | 'INSUFFICIENT';
    title: string;
    description: string;
    subtext?: string;
    options: ('CANCEL' | 'KEEP_OPEN')[];
    originalPayload: OrderPayload;
  } | null>(null);

  const showAlert = (message: string) => {
    setAlertState({ message, type: 'success' });
  };

  const closeAlert = () => {
    setAlertState(null);
  };

  const { data: cashBalance } = useGetCashBalance({
    enabled: !!session,
  });

  const [coinSymbol, quoteSymbol] = useMemo(() => {
    const [base, quote] = selectedCoin.label.split('/');
    return [base ?? '', quote ?? 'USDT'];
  }, [selectedCoin.label]);

  const { data: precisionMap } = useSymbolPrecisions();

  const symbolPrecision = useMemo(
    () => getSymbolPrecision(precisionMap, coinSymbol, quoteSymbol),
    [precisionMap, coinSymbol, quoteSymbol]
  );

  const formatCoinAmount = useCallback(
    (value: number | string | null | undefined) =>
      formatAmountWithStep(value, symbolPrecision, { fallbackDecimals: 6 }),
    [symbolPrecision]
  );

  const quantityPrecision = useMemo(() => {
    const decimals =
      symbolPrecision?.quantityPrecision ??
      (symbolPrecision?.stepSize ? decimalsFromSize(symbolPrecision.stepSize) : undefined);
    return decimals ?? 6;
  }, [symbolPrecision]);

  // เพิ่ม placeholders
  const spendPlaceholder = DEFAULT_FIAT_PLACEHOLDER;

  const receivePlaceholder = useMemo(() => {
    return createStepSizePlaceholder(symbolPrecision?.stepSize);
  }, [symbolPrecision?.stepSize]);

  const createBuyOrderMutation = useCreateBuyOrder({
    onSuccess: (data) => {
      console.log('BuyOrderContainer: Buy order response:', data);
      if (data.requiresConfirmation) {
        const normalizedMessage = data.message?.trim() ?? '';
        const messageParts = normalizedMessage
          ? normalizedMessage
              .split(/\r?\n/)
              .map((part) => part.trim())
              .filter(Boolean)
          : [];

        const isInsufficientMessage = normalizedMessage.includes('onInsufficient');
        const defaultDescription = 'Do you want to place an order ?';
        let variant: 'CONFIRMATION' | 'INSUFFICIENT' = isInsufficientMessage
          ? 'INSUFFICIENT'
          : 'CONFIRMATION';
        let dialogTitle =
          variant === 'INSUFFICIENT' ? `Not enough ${coinSymbol}` : 'Order confirmation';
        let description = defaultDescription;
        let subtext: string | undefined =
          variant === 'INSUFFICIENT'
            ? 'The asset you want to buy is not available in market right now.'
            : "Your order is ready. Tap 'Confirm' to finalize your order.";

        if (normalizedMessage && !normalizedMessage.includes('confirm=true')) {
          if (messageParts.length === 1) {
            subtext = messageParts[0] || undefined;
          } else if (messageParts.length > 1) {
            description = messageParts[0] || defaultDescription;
            subtext = messageParts.slice(1).join(' ') || undefined;
          }
        }

        const sessionUser = session?.user as SessionUser | undefined;
        const userId = cashBalance?.userId || sessionUser?.id || sessionUser?.email || '';

        setPendingOrder({
          orderRef: data.orderRef,
          variant,
          title: dialogTitle,
          description,
          subtext,
          options: data.options || ['CANCEL', 'KEEP_OPEN'],
          originalPayload: {
            userId,
            symbol: coinSymbol,
            price: parseFloat(price.replace(/,/g, '')),
            amount: parseFloat(receiveCoin.replace(/,/g, '')),
            lotPrice: parseFloat(amount.replace(/,/g, '')),
          },
        });
        return;
      }

      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });

      const usdAmount = parseFloat(amount.replace(/,/g, ''));

      if (data.filled && data.filled > 0) {
        // กรณีที่มี order ถูก fill
        const filledUSD = data.spent || data.filled * parseFloat(price.replace(/,/g, ''));
        showAlert(
          `Order Buy ${coinSymbol}/USDT (${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(filledUSD)} USDT) submitted successfully`
        );
      } else if (data.remaining && data.remaining > 0 && (!data.filled || data.filled === 0)) {
        // กรณีที่ order ยังไม่ถูก fill เลย (pending ทั้งหมด)
        const spentUSD = usdAmount; // ใช้จำนวนเงินที่ user ป้อนเข้ามา
        showAlert(
          `Order Buy ${coinSymbol}/USDT (${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(spentUSD)} USDT) submitted successfully`
        );
      } else {
        // กรณีอื่นๆ
        let spentUSD = usdAmount;

        // ถ้ามี refund ให้หัก refund ออก
        if (data.refund && data.refund > 0) {
          spentUSD = usdAmount - data.refund;
        }

        showAlert(
          `Order Buy ${coinSymbol}/USDT (${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(spentUSD)} USDT) submitted successfully`
        );
      }

      handleSubmitSuccess();
    },
  });

  const handleConfirmationDecision = (decision: 'CANCEL' | 'KEEP_OPEN') => {
    if (!pendingOrder) return;

    if (decision === 'CANCEL') {
      setPendingOrder(null);
      return;
    }

    const confirmPayload = {
      ...pendingOrder.originalPayload,
      confirm: true,
      ...(pendingOrder.variant === 'INSUFFICIENT'
        ? { onInsufficient: 'KEEP_OPEN', keepOpen: true }
        : {}),
    };

    createBuyOrderMutation.mutate(confirmPayload);
    setPendingOrder(null);
  };

  const [priceLabel, setPriceLabel] = useState('Price');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [price, setPrice] = useState<string>('0.' + '0'.repeat(priceDecimalPlaces));
  const [amount, setAmount] = useState<string>('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [amountErrorMessage, setAmountErrorMessage] = useState('');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [receiveCoin, setReceiveCoin] = useState<string>('');
  const [isReceiveEditing, setIsReceiveEditing] = useState(false);

  const getAvailableBalance = useCallback(() => {
    if (!session || !cashBalance) return 0;
    const amount = cashBalance.amount || 0;
    return Math.floor(amount * 100) / 100;
  }, [session, cashBalance]);

  const formatAvailableBalance = useCallback(() => {
    const balance = getAvailableBalance();
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  }, [getAvailableBalance]);

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
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (!decimalPart) {
      return `${formattedInteger}.00`;
    }

    return `${formattedInteger}.${decimalPart}`;
  }, []);

  const formatReceiveCoinWithComma = useCallback((value: string): string => {
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

  const formatNumberWithComma = useCallback(
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

      if (decimalPart && decimalPart.length > priceDecimalPlaces) {
        decimalPart = decimalPart.substring(0, priceDecimalPlaces);
      }

      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [priceDecimalPlaces]
  );

  const isValidPriceFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  const isValidNumberFormat = useCallback(
    (value: string): boolean => {
      const numericValue = value.replace(/,/g, '');
      const regexPattern = new RegExp(`^\\d*\\.?\\d{0,${priceDecimalPlaces}}$`);
      return regexPattern.test(numericValue);
    },
    [priceDecimalPlaces]
  );

  const isValidCoinFormatForBuy = useCallback(
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

  const calculateReceiveCoin = useCallback(
    (amountValue: string, priceValue: string): string => {
      if (!amountValue || !priceValue) return '';
      const cleanPrice = priceValue.replace(/,/g, '');
      if (
        cleanPrice === '0' ||
        (cleanPrice.startsWith('0.0') && cleanPrice.replace(/[0.]/g, '') === '')
      )
        return '';

      const numAmount = parseFloat(amountValue.replace(/,/g, ''));
      const numPrice = parseFloat(cleanPrice);
      if (isNaN(numAmount) || isNaN(numPrice) || numPrice <= 0) return '';

      // Use a default value of 2 for priceDecimalPlaces if undefined
      const effectivePriceDecimals = priceDecimalPlaces ?? 2;

      // Truncate inputs before calculation
      const truncatedAmount = truncateToDecimals(numAmount, effectivePriceDecimals);
      const truncatedPrice = truncateToDecimals(numPrice, effectivePriceDecimals);
      const coinAmount = parseFloat(truncatedAmount) / parseFloat(truncatedPrice);
      if (!Number.isFinite(coinAmount)) return '';

      const decimals =
        symbolPrecision?.quantityPrecision ??
        (symbolPrecision?.stepSize
          ? decimalsFromSize(symbolPrecision.stepSize)
          : quantityPrecision);
      const result = truncateToDecimals(coinAmount, decimals ?? 6); // Default to 6 for coin decimals
      return formatReceiveCoinWithComma(result);
    },
    [
      symbolPrecision,
      quantityPrecision,
      truncateToDecimals,
      formatReceiveCoinWithComma,
      priceDecimalPlaces,
    ]
  );

  const calculateSliderPercentage = useCallback(
    (amountValue: string): number => {
      if (!amountValue) return 0;
      const numAmount = parseFloat(amountValue.replace(/,/g, ''));
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
      const formatted = truncateToDecimals(amount, priceDecimalPlaces);
      const [integerPart, decimalPart] = formatted.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.${decimalPart}`;
    },
    [getAvailableBalance, priceDecimalPlaces, truncateToDecimals]
  );

  const validateAmount = useCallback(() => {
    const numericValue = amount.replace(/,/g, '');
    const num = parseFloat(numericValue);
    const availableBalance = getAvailableBalance();

    if (!amount || amount === '' || num === 0 || isNaN(num)) {
      setIsAmountValid(false);
      setAmountErrorMessage('Please enter amount');
      return false;
    }

    if (num > availableBalance) {
      setIsAmountValid(false);
      setAmountErrorMessage('Insufficient balance');
      return false;
    }

    setIsAmountValid(true);
    setAmountErrorMessage('');
    return true;
  }, [amount, getAvailableBalance]);

  const handlePriceFocus = () => {
    setPriceLabel('Limit price');
    setIsInputFocused(true);
    if (derivedMarketPrice && !isPriceLoading) {
      setPrice(derivedMarketPrice);
    }
  };

  const handleMarketClick = () => {
    setPriceLabel('Price');
    setPrice(derivedMarketPrice || '');
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReceiveEditing(false);
    const inputValue = e.target.value;
    if (inputValue === '' || isValidNumberFormat(inputValue)) {
      const formattedValue = formatNumberWithComma(inputValue);
      setAmount(formattedValue);
      const numericValue = inputValue.replace(/,/g, '');
      const num = parseFloat(numericValue);
      const availableBalance = getAvailableBalance();

      if (inputValue === '' || num === 0 || isNaN(num)) {
        setIsAmountValid(true);
        setAmountErrorMessage('');
        setSliderValue(0);
      } else if (num > availableBalance) {
        setIsAmountValid(false);
        setAmountErrorMessage('Insufficient balance');
        setSliderValue(0);
      } else {
        setIsAmountValid(true);
        setAmountErrorMessage('');
        const sliderPercentage = calculateSliderPercentage(inputValue);
        setSliderValue(sliderPercentage);
      }
      const calculatedReceiveCoin = calculateReceiveCoin(formattedValue, price);
      setReceiveCoin(calculatedReceiveCoin);
    }
  };

  const handleSliderChange = (percentage: number) => {
    setIsReceiveEditing(false);
    setSliderValue(percentage);
    const newAmount = calculateAmountFromPercentage(percentage);
    setAmount(newAmount);
    const numericValue = newAmount.replace(/,/g, '');
    const num = parseFloat(numericValue);
    const availableBalance = getAvailableBalance();
    const isValid = !isNaN(num) && num <= availableBalance;
    setIsAmountValid(isValid);
    if (isValid) {
      setAmountErrorMessage('');
    }
    const calculatedReceiveCoin = calculateReceiveCoin(newAmount, price);
    setReceiveCoin(calculatedReceiveCoin);
  };

  const handleQuickAdd = (delta: number) => {
    setIsReceiveEditing(false);
    const current = parseFloat((amount || '0').replace(/,/g, '')) || 0;
    const available = getAvailableBalance();
    const next = current + delta;

    const formatted = truncateToDecimals(next, priceDecimalPlaces);
    const [integerPart, decimalPart] = formatted.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalFormatted = `${formattedInteger}.${decimalPart}`;

    setAmount(finalFormatted);

    if (next > available) {
      setSliderValue(0);
      setIsAmountValid(false);
      setAmountErrorMessage('Insufficient balance');
    } else {
      const sliderPercentage = calculateSliderPercentage(finalFormatted);
      setSliderValue(sliderPercentage);
      const isValid = next > 0;
      setIsAmountValid(isValid);
      setAmountErrorMessage(isValid ? '' : 'Please enter amount');
    }
    const calculatedReceiveCoin = calculateReceiveCoin(finalFormatted, price);
    setReceiveCoin(calculatedReceiveCoin);
  };

  const handleMax = () => {
    setIsReceiveEditing(false);
    const available = getAvailableBalance();

    const formatted = truncateToDecimals(available, priceDecimalPlaces);
    const [integerPart, decimalPart] = formatted.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalFormatted = `${formattedInteger}.${decimalPart}`;

    setAmount(finalFormatted);
    setSliderValue(100);
    setIsAmountValid(available > 0);
    setAmountErrorMessage(available > 0 ? '' : 'Insufficient balance');
    const calculatedReceiveCoin = calculateReceiveCoin(finalFormatted, price);
    setReceiveCoin(calculatedReceiveCoin);
  };

  const handleAmountFocus = () => setIsAmountFocused(true);

  const handleAmountBlur = () => {
    setIsReceiveEditing(false);
    setIsAmountFocused(false);

    if (amount) {
      const numericValue = amount.replace(/,/g, '');
      const num = parseFloat(numericValue);
      if (!isNaN(num)) {
        const formatted = truncateToDecimals(num, priceDecimalPlaces);
        const [integerPart, decimalPart] = formatted.split('.');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const finalFormatted = `${formattedInteger}.${decimalPart}`;
        setAmount(finalFormatted);
        const calculatedReceiveCoin = calculateReceiveCoin(finalFormatted, price);
        setReceiveCoin(calculatedReceiveCoin);
      }
      validateAmount();
    }
  };

  const handleReceiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidCoinFormatForBuy(inputValue)) {
      setIsReceiveEditing(true);
      const formattedValue = inputValue === '' ? '' : formatReceiveCoinWithComma(inputValue);
      setReceiveCoin(formattedValue);

      const priceNum = parseFloat(price.replace(/,/g, ''));
      const coinNum = parseFloat((inputValue || '0').replace(/,/g, ''));

      if (!inputValue || isNaN(coinNum) || coinNum === 0 || isNaN(priceNum) || priceNum <= 0) {
        setAmount('');
        setIsAmountValid(true);
        setAmountErrorMessage('');
        setSliderValue(0);
        return;
      }

      // Truncate coinNum and priceNum before calculation
      const truncatedCoin = truncateToDecimals(coinNum, quantityPrecision);
      const truncatedPrice = truncateToDecimals(priceNum, priceDecimalPlaces);
      const usd = parseFloat(truncatedCoin) * parseFloat(truncatedPrice);

      const formattedUsd = truncateToDecimals(usd, priceDecimalPlaces);
      const [integerPart, decimalPart] = formattedUsd.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const newAmount = `${formattedInteger}.${decimalPart}`;

      setAmount(newAmount);

      const availableBalance = getAvailableBalance();
      if (usd > availableBalance) {
        setIsAmountValid(false);
        setAmountErrorMessage('Insufficient balance');
        setSliderValue(0);
      } else {
        setIsAmountValid(true);
        setAmountErrorMessage('');
        const sliderPercentage = Math.min((usd / availableBalance) * 100, 100);
        setSliderValue(sliderPercentage);
      }
    }
  };

  const handleSubmit = () => {
    if (!session) {
      router.push('/auth/sign-in');
      return;
    }

    if (!validateAmount()) {
      return;
    }

    const numericAmount = parseFloat(amount.replace(/,/g, '') || '0');
    const numericPrice = parseFloat(price.replace(/,/g, '') || '0');
    const coinAmount = parseFloat(receiveCoin.replace(/,/g, '') || '0');
    const sessionUser = session.user as SessionUser | undefined;
    const userId = cashBalance?.userId || sessionUser?.id || sessionUser?.email || '';

    const orderPayload = {
      userId: userId,
      symbol: coinSymbol,
      price: numericPrice,
      amount: coinAmount,
      lotPrice: numericAmount,
    };

    console.log('BuyOrderContainer: Order payload:', orderPayload);
    console.log('BuyOrderContainer: USD to spend:', numericAmount);
    console.log('BuyOrderContainer: Price per coin:', numericPrice);
    console.log('BuyOrderContainer: Coin amount to buy:', coinAmount);

    createBuyOrderMutation.mutate(orderPayload);
  };

  const handleSubmitSuccess = () => {
    setAmount('');
    setSliderValue(0);
    setReceiveCoin('');
    setIsAmountValid(true);
    setAmountErrorMessage('');
  };

  useEffect(() => {
    console.log(
      `BuyOrderContainer: selectedCoin.label changed to ${selectedCoin.label}, marketPrice: ${marketPrice}, chartPrice: ${chartPrice}, derivedPrice: ${derivedMarketPrice}, isPriceLoading: ${isPriceLoading}`
    );
    if (priceLabel === 'Price' && !isInputFocused) {
      if (derivedMarketPrice && !isPriceLoading) {
        setPrice(derivedMarketPrice);
        console.log(
          `BuyOrderContainer: Set derived price to ${derivedMarketPrice} (chart: ${chartPrice}) for ${selectedCoin.label}`
        );
      } else if (isPriceLoading) {
        setPrice('0.' + '0'.repeat(priceDecimalPlaces));
        console.log(
          `BuyOrderContainer: Set price to 0.${'0'.repeat(
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
  ]);

  useEffect(() => {
    if (!orderFormSelection) return;
    if (orderFormSelection.side !== 'buy') return;

    const isMarketMode = orderFormSelection.mode === 'market';
    setPriceLabel(isMarketMode ? 'Price' : 'Limit price');
    setPrice(orderFormSelection.price);
    setIsInputFocused(false);
  }, [orderFormSelection]);

  useEffect(() => {
    if (isReceiveEditing) return;
    const calculatedReceiveCoin = calculateReceiveCoin(amount, price);
    setReceiveCoin(calculatedReceiveCoin);
  }, [amount, price, calculateReceiveCoin, isReceiveEditing]);

  const coinSymbolMap: { [key: string]: string } = {
    BTC: 'bitcoin-icon.svg',
    ETH: 'ethereum-icon.svg',
    BNB: 'bnb-coin.svg',
    SOL: 'solana-icon.svg',
    XRP: 'xrp-coin.svg',
    ADA: 'ada-coin.svg',
    DOGE: 'doge-coin.svg',
  };
  const receiveIcon = `/currency-icons/${coinSymbolMap[coinSymbol] || 'default-coin.svg'}`;
  const receiveCurrency = coinSymbol;

  const dialogDescription = pendingOrder?.description ?? 'Do you want to place an order ?';
  const dialogSubtext =
    pendingOrder?.subtext ??
    (pendingOrder
      ? pendingOrder.variant === 'INSUFFICIENT'
        ? 'The asset you want to buy is not available in market right now.'
        : "Your order is ready. Tap 'Confirm' to finalize your order."
      : undefined);
  const primaryActionLabel = pendingOrder?.variant === 'INSUFFICIENT' ? 'Keep order' : 'Confirm';

  return (
    <div>
      {alertState && (
        <div className="fixed bottom-4 right-4 z-50">
          <AlertBox message={alertState.message} onClose={closeAlert} duration={3000} />
        </div>
      )}
      <AlertDialog
        open={!!pendingOrder}
        onOpenChange={(open) => {
          if (!open) setPendingOrder(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFB514]">
                <span className="text-3xl font-semibold leading-none text-[#16171D]">?</span>
              </div>
              <AlertDialogTitle>{pendingOrder?.title || 'Order confirmation'}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
            {dialogSubtext && <AlertDialogSubtext>{dialogSubtext}</AlertDialogSubtext>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {pendingOrder?.options?.includes('KEEP_OPEN') && (
              <AlertDialogAction onClick={() => handleConfirmationDecision('KEEP_OPEN')}>
                {primaryActionLabel}
              </AlertDialogAction>
            )}
            {pendingOrder?.options?.includes('CANCEL') && (
              <AlertDialogCancel onClick={() => handleConfirmationDecision('CANCEL')}>
                Cancel
              </AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderForm
        type="buy"
        inputRef={inputRef}
        amountInputRef={amountInputRef}
        priceLabel={priceLabel}
        price={price}
        amount={amount}
        receiveAmount={receiveCoin}
        sliderValue={sliderValue}
        isAmountValid={isAmountValid}
        isInputFocused={isInputFocused}
        isAmountFocused={isAmountFocused}
        availableBalance={formatAvailableBalance()}
        balanceCurrency="USDT"
        symbol={coinSymbol}
        buttonColor="bg-[#309C7D] hover:bg-[#28886C]"
        amountIcon="/assets/usdt.svg"
        receiveIcon={receiveIcon}
        receiveCurrency={receiveCurrency}
        isSubmitting={createBuyOrderMutation.isPending}
        amountErrorMessage={amountErrorMessage}
        isAuthenticated={!!session}
        spendPlaceholder={spendPlaceholder}
        receivePlaceholder={receivePlaceholder}
        onPriceFocus={handlePriceFocus}
        onPriceChange={handlePriceChange}
        onPriceBlur={handlePriceBlur}
        onAmountChange={handleAmountChange}
        onAmountFocus={handleAmountFocus}
        onAmountBlur={handleAmountBlur}
        onSliderChange={handleSliderChange}
        onMarketClick={handleMarketClick}
        onSubmit={handleSubmit}
        onLoginClick={() => router.push('/auth/sign-in')}
        onReceiveChange={handleReceiveChange}
        onExchangeClick={onExchangeClick}
        onQuickAdd={handleQuickAdd}
        onMax={handleMax}
      />
    </div>
  );
}

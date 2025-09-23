'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import OrderForm from '@/features/trading/components/OrderForm';
import AlertBox from '@/components/ui/alert-box';
// Use shared CoinContext realtime price to avoid duplicate sockets
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
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog-coin';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';

interface AlertState {
  message: string;
  type: 'success' | 'info' | 'error';
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

export default function BuyOrderContainer({ onExchangeClick }: BuyOrderContainerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const { selectedCoin, marketPrice, isPriceLoading, priceDecimalPlaces } = useCoinContext();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{
    orderRef: string;
    message: string;
    title?: string;
    options: ('CANCEL' | 'KEEP_OPEN')[];
    originalPayload: OrderPayload;
  } | null>(null);

  const showAlert = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setAlertState({ message, type });
  };

  const closeAlert = () => {
    setAlertState(null);
  };

  const { data: cashBalance } = useGetCashBalance({
    enabled: !!session,
  });

  const createBuyOrderMutation = useCreateBuyOrder({
    onSuccess: (data) => {
      console.log('BuyOrderContainer: Buy order response:', data);
      const coinSymbol = selectedCoin.label.split('/')[0];

      if (data.requiresConfirmation) {
        let confirmationMessage = '';
        let dialogTitle = '';
        if (data.message === 'คาดว่าจะเติมเต็มได้ ส่ง confirm=true เพื่อยืนยันทำรายการ') {
          dialogTitle = 'Confirm Transaction';
          confirmationMessage = `The ${coinSymbol} is expected to be fulfilled.\nClick "KEEP OPEN" to confirm the transaction.`;
        } else if (
          data.message ===
          'สภาพคล่องไม่พอ จะให้ทำอย่างไรต่อ? (CANCEL หรือ KEEP_OPEN) ส่ง confirm=true พร้อม onInsufficient'
        ) {
          dialogTitle = `Not enough ${coinSymbol}`;
          confirmationMessage = `The ${coinSymbol} you want to buy is not available in market right now.\nDo you want to place an Order?`;
        } else {
          dialogTitle = 'Confirm Transaction';
          confirmationMessage =
            data.message || `Do you want to proceed with this ${coinSymbol} transaction?`;
        }

        const sessionUser = session?.user as SessionUser | undefined;
        const userId = cashBalance?.userId || sessionUser?.id || sessionUser?.email || '';

        setPendingOrder({
          orderRef: data.orderRef,
          message: confirmationMessage,
          title: dialogTitle,
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
        const filledUSD = data.spent || data.filled * parseFloat(price.replace(/,/g, ''));
        showAlert(
          `Buy ${coinSymbol}/USDT Amount ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(filledUSD)} USD submitted successfully`,
          'success'
        );
      } else if (data.remaining && data.remaining > 0 && (!data.filled || data.filled === 0)) {
        showAlert(
          `Order created successfully! Amount remaining: ${data.remaining.toFixed(8)} ${coinSymbol}.\nStatus: Pending`,
          'info'
        );
      } else {
        let message = `Buy ${coinSymbol}/USDT Amount ${new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usdAmount)} USD submitted successfully`;

        if (data.refund && data.refund > 0) {
          const actualSpent = usdAmount - data.refund;
          message = `Buy ${coinSymbol}/USDT Amount ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(
            actualSpent
          )} USD submitted successfully\nRefund: ${data.refund.toFixed(2)} USD`;
        }

        showAlert(message, 'success');
      }

      handleSubmitSuccess();
    },
    onError: (error) => {
      console.error('BuyOrderContainer: Buy order error:', error);
      showAlert(`Error: ${error.message}`, 'error');
    },
  });

  const handleConfirmationDecision = (decision: 'CANCEL' | 'KEEP_OPEN') => {
    if (!pendingOrder) return;

    if (decision === 'CANCEL') {
      showAlert('Order cancelled', 'info');
      setPendingOrder(null);
      return;
    }

    const confirmPayload = {
      ...pendingOrder.originalPayload,
      confirm: true,
      onInsufficient: 'KEEP_OPEN',
      keepOpen: true,
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

  const formatPriceWithComma = useCallback((value: string): string => {
    if (!value) return '';
    let numericValue = value.replace(/,/g, '');
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;

    // Normalize leading zeros
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

  const formatNumberWithComma = useCallback((value: string): string => {
    if (!value) return '';
    let numericValue = value.replace(/,/g, '');
    if (!/^\d*\.?\d*$/.test(numericValue)) return value;

    // Normalize leading zeros similar to price formatting
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

  const isValidPriceFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  // Updated to allow unlimited decimal places for amount (Spend in USD)
  const isValidNumberFormat = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d*$/.test(numericValue);
  }, []);

  // Allow up to 9 decimal places for coin amount (Receive on Buy)
  const isValidCoinFormatForBuy = useCallback((value: string): boolean => {
    const numericValue = value.replace(/,/g, '');
    return /^\d*\.?\d{0,9}$/.test(numericValue);
  }, []);

  const calculateReceiveCoin = useCallback((amountValue: string, priceValue: string): string => {
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
    const coinAmount = numAmount / numPrice;
    return coinAmount.toFixed(9);
  }, []);

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
      return formatNumberWithComma(amount.toString());
    },
    [getAvailableBalance, formatNumberWithComma]
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
    // Switch to Limit mode and snapshot current price
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // User is editing Spend directly; stop Receive-driven updates
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
  };

  // Quick add and max handlers for amount (USD)
  const handleQuickAdd = (delta: number) => {
    setIsReceiveEditing(false);
    const current = parseFloat((amount || '0').replace(/,/g, '')) || 0;
    const available = getAvailableBalance();
    const next = current + delta;
    const formatted = formatNumberWithComma(next.toString());
    setAmount(formatted);
    if (next > available) {
      setSliderValue(0);
      setIsAmountValid(false);
      setAmountErrorMessage('Insufficient balance');
    } else {
      const sliderPercentage = calculateSliderPercentage(formatted);
      setSliderValue(sliderPercentage);
      const isValid = next > 0;
      setIsAmountValid(isValid);
      setAmountErrorMessage(isValid ? '' : 'Please enter amount');
    }
  };

  const handleMax = () => {
    setIsReceiveEditing(false);
    const available = getAvailableBalance();
    const formatted = formatNumberWithComma(available.toString());
    setAmount(formatted);
    setSliderValue(100);
    setIsAmountValid(available > 0);
    setAmountErrorMessage(available > 0 ? '' : 'Insufficient balance');
  };

  const handleAmountFocus = () => setIsAmountFocused(true);

  const handleAmountBlur = () => {
    setIsReceiveEditing(false);
    setIsAmountFocused(false);
    // No need to force 2 decimal places anymore - keep the user's input as is
    if (amount) {
      validateAmount();
    }
  };

  // Handle Receive (coin) typing -> compute Spend (USD)
  const handleReceiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || isValidCoinFormatForBuy(inputValue)) {
      setIsReceiveEditing(true);
      setReceiveCoin(inputValue);

      const priceNum = parseFloat(price.replace(/,/g, ''));
      const coinNum = parseFloat((inputValue || '0').replace(/,/g, ''));

      if (!inputValue || isNaN(coinNum) || coinNum === 0 || isNaN(priceNum) || priceNum <= 0) {
        setAmount('');
        setIsAmountValid(true);
        setAmountErrorMessage('');
        setSliderValue(0);
        return;
      }

      const usd = coinNum * priceNum;
      const newAmount = formatNumberWithComma(usd.toString());
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
    const coinSymbol = selectedCoin.label.split('/')[0];

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
      `BuyOrderContainer: selectedCoin.label changed to ${selectedCoin.label}, marketPrice: ${marketPrice}, isPriceLoading: ${isPriceLoading}`
    );
    if (priceLabel === 'Price' && !isInputFocused) {
      if (marketPrice && !isPriceLoading) {
        setPrice(marketPrice);
        console.log(
          `BuyOrderContainer: Set market price to ${marketPrice} for ${selectedCoin.label}`
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
    marketPrice,
    priceLabel,
    isInputFocused,
    isPriceLoading,
    selectedCoin.label,
    priceDecimalPlaces,
  ]);

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
  const coinSymbol = selectedCoin.label.split('/')[0];
  const receiveIcon = `/currency-icons/${coinSymbolMap[coinSymbol] || 'default-coin.svg'}`;
  const receiveCurrency = coinSymbol;

  return (
    <div>
      {alertState && (
        <div className="fixed bottom-4 right-4 z-50">
          <AlertBox
            message={alertState.message}
            type={alertState.type}
            onClose={closeAlert}
            duration={5000}
          />
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
            <AlertDialogTitle className="text-white mb-5">
              {pendingOrder?.title || 'Confirm Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 whitespace-pre-line">
              {pendingOrder?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleConfirmationDecision('CANCEL')}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer"
            >
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmationDecision('KEEP_OPEN')}
              className="bg-[#309C7D] text-white hover:bg-[#28886C] cursor-pointer"
            >
              KEEP OPEN
            </AlertDialogAction>
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
        amountIcon="/currency-icons/dollar-icon.svg"
        receiveIcon={receiveIcon}
        receiveCurrency={receiveCurrency}
        isSubmitting={createBuyOrderMutation.isPending}
        amountErrorMessage={amountErrorMessage}
        isAuthenticated={!!session}
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

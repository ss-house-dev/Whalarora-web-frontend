'use client';

import React from 'react';
import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';
import OrderBookWidget from '@/features/open-order/components/OrderBookWidget';
import { CoinProvider, useCoinContext } from '@/features/trading/contexts/CoinContext';

const ORDER_BOOK_SCENARIOS = [
  {
    id: 'ac6',
    label: 'AC6 - Amount < 1,000',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '987.654321',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '123.456789',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac7',
    label: 'AC7 - Amount in thousands',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '12345.6789',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654.321',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac8',
    label: 'AC8 - Amount in millions',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '1234567.89',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654321.12',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac9',
    label: 'AC9 - Amount in billions',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '1234567890.12',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654321234.56',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac10',
    label: 'AC10 - Amount in trillions',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '1234567890123.45',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654321012.34',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'long',
    label: 'Long token symbol wrap',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (CATBABY)',
      price: '$ 50,000.00',
      amount: '1234.56',
      amountSymbol: 'CATBABY',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (CATBABY)',
      price: '$ 50,500.00',
      amount: '98765.43',
      amountSymbol: 'CATBABY',
    },
  },
] as const;

function OrderBookTestContent() {
  const { selectedCoin } = useCoinContext();

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-10 bg-[#0F0F0F] py-10">
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Live OrderBook (websocket)</h2>
        <p className="text-sm text-[#A4A4A4]">
          Symbol from CoinContext: <span className="font-semibold text-white">{selectedCoin.label}</span>
        </p>
        <OrderBookLiveContainer />
      </section>

      <section className="flex w-full max-w-3xl flex-col items-center gap-4">
        <h3 className="text-lg font-semibold text-white">Snapshot scenarios</h3>
        <p className="text-sm text-[#A4A4A4]">
          Reference states used during design to validate formatting across different values.
        </p>
        <div className="flex flex-col items-center gap-4">
          {ORDER_BOOK_SCENARIOS.map(({ id, label, bid, ask }) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-[#A4A4A4]">
                {label}
              </span>
              <OrderBookWidget bid={bid} ask={ask} />
            </div>
          ))}

          <OrderBookWidget bid={{ amountLabel: 'Amount (BTC)' }} ask={{ amountLabel: 'Amount (BTC)' }} disabled />
        </div>
      </section>
    </div>
  );
}

export default function TestPage() {
  return (
    <CoinProvider>
      <OrderBookTestContent />
    </CoinProvider>
  );
}

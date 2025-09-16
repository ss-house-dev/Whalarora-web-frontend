'use client';

import React, { useState } from 'react';
import { CloseOrderBox } from '@/components/ui/close-order-box';
import OrderBookWidget from '@/features/open-order/components/OrderBookWidget';
import HistoryCard from '@/features/open-order/components/HistoryCard';
import HistoryListPreview from '@/features/open-order/components/HistoryListPreview';
import TradeHistoryContainer from '@/features/open-order/components/TradeHistoryContainer';
import HistoryApiPreview from '@/features/open-order/components/HistoryApiPreview';

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

export default function TestPage() {
  const [activeSide, setActiveSide] = useState<'bid' | 'ask' | null>(null);

  return (
    <div className="flex h-auto min-h-screen flex-col items-center justify-start gap-10 bg-[#0F0F0F] py-10">
      <section className="flex w-full max-w-3xl flex-col items-center gap-4">
        <h2 className="text-lg font-semibold text-white">OrderBookWidget previews</h2>
        <p className="text-sm text-[#A4A4A4]">
          Click bid / ask on the first widget to verify the active state. The following widgets cover
          the AC6-AC10 amount ranges and include a long-symbol wrap example.
        </p>

        <div className="flex flex-col items-center gap-4">
          <OrderBookWidget
            bid={ORDER_BOOK_SCENARIOS[0].bid}
            ask={ORDER_BOOK_SCENARIOS[0].ask}
            activeSide={activeSide}
            onBidClick={() => setActiveSide((prev) => (prev === 'bid' ? null : 'bid'))}
            onAskClick={() => setActiveSide((prev) => (prev === 'ask' ? null : 'ask'))}
          />

          {ORDER_BOOK_SCENARIOS.slice(1).map(({ id, label, bid, ask }) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-[#A4A4A4]">{label}</span>
              <OrderBookWidget bid={bid} ask={ask} />
            </div>
          ))}

          <OrderBookWidget
            bid={{ amountLabel: 'Amount (BTC)' }}
            ask={{ amountLabel: 'Amount (BTC)' }}
            disabled
          />
        </div>
      </section>

      <section className="flex w-full max-w-3xl flex-col items-center gap-4">
        <h2 className="text-lg font-semibold text-white">Close order dialog samples</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <CloseOrderBox side="Buy" amount="100,000.00" token="BTC" price="115,200.00" currency="USD" />
          <CloseOrderBox side="Buy" amount="100,000" token="1MBABYDOGE" price="0.0012927" currency="USD" />
          <CloseOrderBox side="Buy" amount="999.99K" token="1MBABYDOGE" price="9,999,999.99" currency="USD" />
        </div>
      </section>

      <section className="flex w-full max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">History components</h2>
        <div className="flex flex-col gap-4">
          <HistoryCard
            status="closed"
            side="buy"
            pair="BTC/USDT"
            date="13-08-2025"
            time="14:30:30"
            orderId="88cbe33fabcd0da4e39"
            amount="0.020000000"
            baseSymbol="BTC"
            price="115,200.00"
            currency="USD"
          />
          <HistoryCard
            status="complete"
            side="buy"
            pair="BTC/USDT"
            date="13-08-2025"
            time="14:30:30"
            orderId="88cbe33fabcd0da4e39"
            amount="0.020000000"
            baseSymbol="BTC"
            price="115,200.00"
            currency="USD"
          />
        </div>

        <div className="rounded-xl border border-[#2F2F2F] p-6">
          <HistoryListPreview />
        </div>
      </section>

      <section className="flex w-full max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">History API payload (raw)</h2>
        <HistoryApiPreview />
      </section>

      <section className="flex w-full max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Trade history container (API)</h2>
        <div className="flex justify-center rounded-xl border border-[#2F2F2F] bg-[#16171D] p-6">
          <TradeHistoryContainer />
        </div>
      </section>
    </div>
  );
}

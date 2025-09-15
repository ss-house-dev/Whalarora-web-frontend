'use client';

import React from 'react';
import { CloseOrderBox } from '@/components/ui/close-order-box';
import HistoryCard from '@/features/open-order/components/HistoryCard';
import HistoryListPreview from '@/features/open-order/components/HistoryListPreview';

export default function TestPage() {
  return (
    <div className="flex h-auto min-h-screen flex-col items-center justify-start gap-6 py-8 bg-[#0F0F0F]">
      {/* Example 1 */}
      <CloseOrderBox side="Buy" amount="100,000.00" token="BTC" price="115,200.00" currency="USD" />

      {/* Example 2 */}
      <CloseOrderBox
        side="Buy"
        amount="100,000"
        token="1MBABYDOGE"
        price="0.0012927"
        currency="USD"
      />

      {/* Example 3 */}
      <CloseOrderBox
        side="Buy"
        amount="999.99K"
        token="1MBABYDOGE"
        price="9,999,999.99"
        currency="USD"
      />

      {/* HistoryCard samples */}
      <div className="mt-6 flex flex-col gap-4">
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

      {/* Trade history list (hook + mock) */}
      <div className="mt-8">
        <HistoryListPreview />
      </div>
    </div>
  );
}

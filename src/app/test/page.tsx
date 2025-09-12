'use client';

import React from 'react';
import { CloseOrderBox } from '@/components/ui/close-order-box';

export default function TestPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0F0F0F]">
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
    </div>
  );
}

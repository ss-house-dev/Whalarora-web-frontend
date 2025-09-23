'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BuyOrderContainer from '@/features/trading/containers/BuyOrderContainer';
import SellOrderContainer from '@/features/trading/containers/SellOrderContainer';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';

export default function MarketOrderContainer() {
  const { selectedCoin, ordersVersion } = useCoinContext();
  return (
    <div>
      <Tabs defaultValue="buy">
        <TabsList className="w-full bg-[#1F2029]">
          <TabsTrigger
            value="buy"
            className="font-bold data-[state=active]:bg-[#0A997F] data-[state=inactive]:text-[#A4A4A4] h-[28px] cursor-pointer"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="font-bold data-[state=active]:bg-[#D84C4C] data-[state=inactive]:text-[#A4A4A4] h-[28px] cursor-pointer"
          >
            Sell
          </TabsTrigger>
        </TabsList>

        {/* Buy Tab */}
        <TabsContent value="buy" className="mt-5">
          <BuyOrderContainer key={`${selectedCoin.value}-${ordersVersion}-buy`} />
        </TabsContent>

        {/* Sell Tab */}
        <TabsContent value="sell" className="mt-5">
          <SellOrderContainer key={`${selectedCoin.value}-${ordersVersion}-sell`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

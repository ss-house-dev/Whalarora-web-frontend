"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BuyOrderContainer from "@/features/trading/containers/BuyOrderContainer";
import SellOrderContainer from "@/features/trading/containers/SellOrderContainer";

export default function MarketOrderContainer() {
  return (
    <div>
      <Tabs defaultValue="buy">
        <TabsList className="w-full bg-[#2D2D2D]">
          <TabsTrigger
            value="buy"
            className="font-bold data-[state=active]:bg-[linear-gradient(185deg,_#309C7D_23.13%,_#26F6BA_157.05%)] h-[28px] cursor-pointer"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="font-bold data-[state=active]:bg-[linear-gradient(357deg,_#D84C4C_2.29%,_#722828_186.28%)] h-[28px] cursor-pointer"
          >
            Sell
          </TabsTrigger>
        </TabsList>

        {/* Buy Tab */}
        <TabsContent value="buy" className="mt-7">
          <BuyOrderContainer />
        </TabsContent>

        {/* Sell Tab */}
        <TabsContent value="sell" className="mt-7">
          <SellOrderContainer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
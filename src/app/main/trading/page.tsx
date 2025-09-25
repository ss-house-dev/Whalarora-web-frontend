'use client';

import React, { useCallback, useState } from 'react';
import MarketOrderContainer from '@/features/trading/containers/OrderContainer';
import AdvancedChart from '@/features/trading/components/Chart';
import { CombinedCombobox } from '@/components/combobox';
import OrderTableContainer from '@/features/open-order/components/OrderTableContainer';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import { useCancelOrder } from '@/features/open-order/hooks/useCancelOrder';
import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';

type OrderTabType = 'open' | 'history';

export default function MarketOrderPage() {
  const [activeTab, setActiveTab] = useState<OrderTabType>('open');
  const cancelMutation = useCancelOrder();
  const { mutateAsync: cancelOrderAsync } = cancelMutation;
  const { selectedCoin, ordersVersion } = useCoinContext();

  const handleCancelOrder = useCallback(
    async (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => {
      try {
        await cancelOrderAsync(payload);
      } catch (error) {
        console.error('Cancel order error:', error);
      }
    },
    [cancelOrderAsync]
  );

  return (
    <div className="mt-[20px] space-y-[20px] px-4 pb-8 lg:px-[23px]">
      {/* Symbol selector and Order Book Container (xl only) */}
      <div className="hidden xl:flex xl:flex-row xl:items-start xl:gap-[20px]">
        <div className="flex w-full justify-start xl:flex-[1.6] xl:min-w-0">
          <CombinedCombobox className="w-full" />
        </div>

        <div className="w-full xl:w-[360px] xl:flex-shrink-0">
          <OrderBookLiveContainer className="h-full w-full" showMetaInfo={false} />
        </div>
      </div>

      {/* Symbol selector only (lg and below) */}
      <div className="flex w-full justify-start xl:hidden">
        <CombinedCombobox className="w-full" />
      </div>

      {/* Chart, Order Book, and Order Container */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-[20px]">
        <div className="w-full xl:flex-[1.6] xl:min-w-0">
          <div className="space-y-4">
            <AdvancedChart />

            {/* Order Book below chart on lg and below, hidden on xl */}
            <div className="block xl:hidden">
              <OrderBookLiveContainer className="h-full w-full" showMetaInfo={false} />
            </div>
          </div>
        </div>

        <div
          key={`${selectedCoin.value}-${ordersVersion}-panel`}
          className="w-full rounded-lg bg-[#16171D] p-4 shadow-md sm:p-5 xl:h-[508px] xl:w-[360px] xl:flex-shrink-0"
        >
          <MarketOrderContainer key={`${selectedCoin.value}-${ordersVersion}-orders`} />
        </div>
      </div>

      {/* Tabbed Orders Section */}
      <div className="mb-10 flex-1">
        <OrderTableContainer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCancelOrder={handleCancelOrder}
        />
      </div>
    </div>
  );
}

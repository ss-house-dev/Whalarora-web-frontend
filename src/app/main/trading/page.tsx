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
      {/* Chart and Order sections */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-[20px]">
        {/* Chart section with CombinedCombobox above */}
        <div className="w-full lg:flex-[1.6] lg:min-w-0">
          <div className="space-y-4">
            <CombinedCombobox className="w-full" />
            <AdvancedChart />
          </div>
        </div>

        {/* Order Book and Order Container section */}
        <div className="w-full lg:w-[360px] lg:flex-shrink-0">
          <div className="space-y-4">
            <OrderBookLiveContainer className="h-full w-full" showMetaInfo={false} />

            <div
              key={`${selectedCoin.value}-${ordersVersion}-panel`}
              className="w-full rounded-lg bg-[#16171D] p-4 shadow-md sm:p-5 lg:h-[508px]"
            >
              <MarketOrderContainer key={`${selectedCoin.value}-${ordersVersion}-orders`} />
            </div>
          </div>
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

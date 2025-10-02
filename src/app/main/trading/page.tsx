'use client';

import React, { useCallback, useState } from 'react';
import MarketOrderContainer from '@/features/trading/containers/OrderContainer';
import AdvancedChart from '@/features/trading/components/Chart';
import { CombinedCombobox } from '@/components/combobox';
import OrderTableContainer from '@/features/open-order/components/OrderTableContainer';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import { useCancelOrder } from '@/features/open-order/hooks/useCancelOrder';
import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';
import MyAssetsWidgetContainer from '@/features/assets/containers/MyAssetsWidgetContainer';

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
    <div className="mt-[20px] space-y-[20px] px-4 pb-8 min-[1408px]:px-[23px]">
      <div className="flex flex-col gap-4 min-[1408px]:grid min-[1408px]:grid-cols-[minmax(0,1.6fr)_360px] min-[1408px]:items-start min-[1408px]:gap-x-[20px] min-[1408px]:gap-y-4">
        <div className="order-1 min-[1408px]:order-none min-[1408px]:col-start-1 min-[1408px]:row-start-1 min-[1408px]:min-w-0">
          <CombinedCombobox className="w-full min-w-full" />
        </div>

        <div className="order-2 min-[1408px]:order-none min-[1408px]:col-start-1 min-[1408px]:row-start-2 min-[1408px]:min-w-0">
          <AdvancedChart />
        </div>

        <div className="order-4 w-full rounded-lg bg-[#16171D] p-4 shadow-md sm:p-5 min-[1408px]:order-none min-[1408px]:col-start-2 min-[1408px]:row-start-2 min-[1408px]:h-[508px]">
          <MarketOrderContainer key={`${selectedCoin.value}-${ordersVersion}-orders`} />
        </div>

        <div className="order-5 flex w-full justify-start min-[1408px]:order-none min-[1408px]:col-start-2 min-[1408px]:row-start-3 min-[1408px]:justify-center">
          <MyAssetsWidgetContainer />
        </div>

        <div className="order-6 w-full min-[1408px]:order-none min-[1408px]:col-start-1 min-[1408px]:row-start-3 min-[1408px]:min-w-0">
          <div className="mb-10">
            <OrderTableContainer
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onCancelOrder={handleCancelOrder}
            />
          </div>
        </div>

        <div className="order-3 min-[1408px]:order-none min-[1408px]:col-start-2 min-[1408px]:row-start-1">
          <OrderBookLiveContainer className="h-full w-full" showMetaInfo={false} />
        </div>
      </div>
    </div>
  );
}

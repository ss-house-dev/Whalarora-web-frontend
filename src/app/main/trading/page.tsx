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

  const handleCancelOrder = useCallback(async (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => {
    try {
      await cancelOrderAsync(payload);
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  }, [cancelOrderAsync]);

  return (
    <div className="mx-[23px] mt-[20px] space-y-[20px]">
      {/* Symbol selector & live orderbook */}
      <div className="flex items-start gap-[17px]">
        <div className="flex-1">
          <CombinedCombobox />
        </div>
        <OrderBookLiveContainer className="w-[384px] mr-22" showMetaInfo={false} />
      </div>

      {/* Chart and Order Container side by side */}
      <div className="flex gap-[17px]">
        <div className="w-[900px] min-h-[508px]">
          <AdvancedChart />
        </div>

        <div
          key={`${selectedCoin.value}-${ordersVersion}-panel`}
          className="bg-[#16171D] rounded-lg shadow-md p-5 w-[384px] h-[508px]"
        >
          <MarketOrderContainer key={`${selectedCoin.value}-${ordersVersion}-orders`} />
        </div>
      </div>

      {/* Tabbed Orders Section */}
      <div className="flex-1 mb-10">
        <OrderTableContainer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCancelOrder={handleCancelOrder}
        />
      </div>
    </div>
  );
}


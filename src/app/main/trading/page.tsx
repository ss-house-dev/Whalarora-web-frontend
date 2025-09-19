'use client';

import React, { useState } from 'react';
import MarketOrderContainer from '@/features/trading/containers/OrderContainer';
import AdvancedChart from '@/features/trading/components/Chart';
import { CombinedCombobox } from '@/components/combobox';
import OrderTableContainer from '@/features/open-order/components/OrderTableContainer';
import { useCancelOrder } from '@/features/open-order/hooks/useCancelOrder';
import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';

type OrderTabType = 'open' | 'history';

export default function MarketOrderPage() {
  const [activeTab, setActiveTab] = useState<OrderTabType>('open');
  const cancelMutation = useCancelOrder();

  const handleCancelOrder = async (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => {
    try {
      await cancelMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  };

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
        <div className="bg-[#081125] h-[508px] w-[384px] rounded-lg p-5 shadow-md">
          <MarketOrderContainer />
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

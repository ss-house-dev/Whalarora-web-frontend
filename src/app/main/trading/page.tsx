"use client";

import React, { useState } from 'react';
import MarketOrderContainer from '@/features/trading/containers/OrderContainer';
import AdvancedChart from '@/features/trading/components/Chart';
import { CombinedCombobox } from '@/components/ui/combobox';
import OrderTableContainer from '@/features/trading/containers/OrderTableContainer';
import DevOrderCardPreview from '@/features/trading/containers/DevOrderCardPreview';
import { OpenOrdersContainer } from '@/features/open-order/containers/OpenOrdersContainer';

type OrderTabType = 'open' | 'history';

export default function MarketOrderPage() {
  const [activeTab, setActiveTab] = useState<OrderTabType>('open');

  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log('Cancelling order:', orderId);
    
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  };


  return (
    <div className="mx-[120px] mt-[20px] space-y-[20px] min-h-screen">
      {/* Combined Combobox with Price Info */}
      <div className="flex gap-10">
        <div className="flex-1">
          <CombinedCombobox />
        </div>
      </div>

      {/* Chart and Order Container side by side */}
      <div className="flex gap-[17px]">
        <div className="flex-1 h-[507px]">
          <AdvancedChart />
        </div>

        <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[507px]">
          <MarketOrderContainer />
        </div>
      </div>

      {/* Tabbed Orders Section */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {activeTab === 'open' ? (
              <OpenOrdersContainer
                className="w-full"
                showPagination={true}
                showRefreshButton={true}
                onCancelOrder={handleCancelOrder}
              />
            ) : (
              <OrderTableContainer />
            )}
          </div>
        </div>
      </div>

      {/* Dev Order Card Preview */}
      <div className="flex justify-center">
        <DevOrderCardPreview />
      </div>
    </div>
  );
}
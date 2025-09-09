'use client';

import { Dispatch, SetStateAction } from 'react';
import { OpenOrdersContainer } from '../containers/OpenOrdersContainer'; // Corrected named import
import TradeHistoryContainer from './TradeHistoryContainer';

interface OrderTableContainerProps {
  activeTab: 'open' | 'history';
  setActiveTab: Dispatch<SetStateAction<'open' | 'history'>>;
  onCancelOrder?: (orderId: string) => void;
}

export default function OrderTableContainer({
  activeTab,
  setActiveTab,
  onCancelOrder,
}: OrderTableContainerProps) {
  return (
    <div className="w-[900px] h-[540px] bg-[#081125] rounded-xl px-5 pt-3 pb-3 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b-2 pb-3 gap-3 pl-4" style={{ borderColor: '#13285A' }}>
        <button
          onClick={() => setActiveTab('open')}
          className={`px-3 h-8 min-w-[96px] rounded-lg text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'open' ? 'text-white' : 'text-slate-300 hover:text-white'
          }`}
          style={{ backgroundColor: activeTab === 'open' ? '#1F4293' : 'transparent' }}
        >
          Open order
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 h-8 min-w-[96px] rounded-lg text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'history' ? 'text-white' : 'text-slate-300 hover:text-white'
          }`}
          style={{ backgroundColor: activeTab === 'history' ? '#1F4293' : 'transparent' }}
        >
          Trade history
        </button>
      </div>

      {/* Content (fixed frame + scroll inside) */}
      <div className="flex-1 overflow-hidden mt-4">
        {activeTab === 'open' ? (
          <OpenOrdersContainer
            onCancelOrder={onCancelOrder}
            showPagination={true}
            showRefreshButton={true}
          />
        ) : (
          <TradeHistoryContainer />
        )}
      </div>
    </div>
  );
}

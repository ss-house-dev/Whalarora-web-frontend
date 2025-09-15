'use client';

import { Dispatch, SetStateAction, useEffect } from 'react';
import { OpenOrdersContainer } from '../containers/OpenOrdersContainer'; // Corrected named import
import TradeHistoryContainer from './TradeHistoryContainer';
import { useRef, useState } from 'react';

interface OrderTableContainerProps {
  activeTab: 'open' | 'history';
  setActiveTab: Dispatch<SetStateAction<'open' | 'history'>>;
  onCancelOrder?: (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => void;
}

export default function OrderTableContainer({
  activeTab,
  setActiveTab,
  onCancelOrder,
}: OrderTableContainerProps) {
  const openRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // update position on tab change
  useEffect(() => {
    const el = activeTab === 'open' ? openRef.current : historyRef.current;
    if (el) {
      setUnderlineStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activeTab]);
  return (
    <div className="w-[900px] h-[540px] bg-[#16171D] rounded-xl px-5 pt-3 pb-3 flex flex-col">
      {/* Tabs */}
      <div className="relative flex border-b pb-3 gap-3 pl-4 border-[#ffffff]/5">
        <button
          ref={openRef}
          onClick={() => setActiveTab('open')}
          className={`px-3 h-8 text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'open' ? 'text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Open order
        </button>

        <button
          ref={historyRef}
          onClick={() => setActiveTab('history')}
          className={`px-3 h-8 text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'history' ? 'text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Trade history
        </button>

        {/* underline */}
        <span
          className="absolute bottom-3 h-[2px] bg-[#225FED] transition-all duration-300 ease-in-out"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
        />
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

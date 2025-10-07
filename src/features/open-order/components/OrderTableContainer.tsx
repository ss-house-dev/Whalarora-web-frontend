'use client';

import { Dispatch, SetStateAction, memo, useEffect, useRef, useState } from 'react';
import { OpenOrdersContainer } from '../containers/OpenOrdersContainer'; // Corrected named import
import TradeHistoryContainer from './TradeHistoryContainer';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderTableContainerProps {
  activeTab: 'open' | 'history';
  setActiveTab: Dispatch<SetStateAction<'open' | 'history'>>;
  onCancelOrder?: (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => void;
}

function OrderTableContainer({ activeTab, setActiveTab, onCancelOrder }: OrderTableContainerProps) {
  const openRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateUnderline = () => {
      const el = activeTab === 'open' ? openRef.current : historyRef.current;
      if (el) {
        setUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
      }
    };

    updateUnderline();

    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [activeTab, isMobile]);

  const containerClasses = isMobile
    ? 'w-full flex flex-col gap-4 rounded-3xl bg-[#16171D] p-4 text-white shadow-lg shadow-black/20'
    : 'w-[900px] h-[548px] flex flex-col gap-0 rounded-3xl bg-[#16171D] px-5 pt-4 pb-4 text-white shadow-lg shadow-black/20';

  const tabRowClasses = isMobile
    ? 'relative flex items-center gap-3 border-b border-[#ffffff]/5 pb-3 px-1'
    : 'relative flex items-center gap-3 border-b border-[#ffffff]/5 pb-3 pl-4 pr-2';

  const inactiveTabClasses = 'text-slate-300 hover:text-white';
  const activeTabClasses = 'text-white';

  const contentMarginClass = activeTab === 'history' ? 'mt-3' : isMobile ? 'mt-3' : 'mt-4';

  return (
    <div className={containerClasses}>
      {/* Tabs */}
      <div className={tabRowClasses}>
        <button
          ref={openRef}
          onClick={() => setActiveTab('open')}
          className={`px-3 h-8 text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'open' ? activeTabClasses : inactiveTabClasses
          }`}
        >
          Open Orders
        </button>

        <button
          ref={historyRef}
          onClick={() => setActiveTab('history')}
          className={`px-3 h-8 text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'history' ? activeTabClasses : inactiveTabClasses
          }`}
        >
          Trade History
        </button>

        {/* underline */}
        <span
          className="pointer-events-none absolute bottom-3 h-[2px] rounded-full bg-[#225FED] transition-all duration-300 ease-in-out"
          style={underlineStyle}
        />
      </div>

      {/* Content (fixed frame + scroll inside) */}
      <div className={`flex-1 overflow-hidden ${contentMarginClass}`}>
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

export default memo(OrderTableContainer);

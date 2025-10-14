'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import PaginationFooter from '@/components/ui/PaginationFooter';
import HistoryCard from './HistoryCard';
import { useGetTradeHistory } from '../hooks/useGetTradeHistory';
import type { TradeHistoryRange } from '../types/history';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  formatAmountWithStep,
  formatPriceWithTick,
} from '@/features/trading/utils/symbolPrecision';
import { formatDateParts } from '@/features/trading/utils/dateFormat';
import { useIsMobile } from '@/hooks/use-mobile';

type FilterKey = TradeHistoryRange;

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'day', label: 'Today' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];
const CLOSED_STATUS_TOKENS = ['CLOSE', 'CLOSED', 'CANCEL'];

function resolveHistoryCardStatus(status: string | undefined | null): 'complete' | 'closed' {
  if (!status) {
    return 'complete';
  }

  const upper = status.trim().toUpperCase();
  if (!upper) {
    return 'complete';
  }

  if (CLOSED_STATUS_TOKENS.some((token) => upper.includes(token))) {
    return 'closed';
  }

  if (upper.includes('MATCH') || upper === 'COMPLETE' || upper === 'FILLED') {
    return 'complete';
  }

  return 'complete';
}

function isFilledHistoryStatus(status: string): boolean {
  if (!status) {
    return false;
  }

  const upper = status.trim().toUpperCase();
  return upper.includes('MATCH') || upper === 'COMPLETE' || upper === 'FILLED';
}

export default function TradeHistoryContainer() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data, isLoading, isFetching } = useGetTradeHistory({ page, limit, range: filter });
  const { data: precisionMap } = useSymbolPrecisions();
  const isMobile = useIsMobile();

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const itemsKey = useMemo(() => items.map((item) => item.id).join('|'), [items]);
  const [pageMounted, setPageMounted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPageMounted(false);
  }, [page, filter]);

  useEffect(() => {
    if (isFetching) {
      setPageMounted(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (items.length === 0) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setPageMounted(true);
      animationFrameRef.current = null;
    });
  }, [isFetching, itemsKey, items.length, page, filter]);

  const isInitialLoading = isLoading && items.length === 0;
  const isRefetching = isFetching && !isInitialLoading;

  const handleSetFilter = (key: FilterKey) => {
    setFilter(key);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="mt-0 mb-4 pl-1 pr-1 sm:pr-0">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => handleSetFilter(key)}
                className={`inline-flex h-7 items-center justify-center rounded-3xl px-3 text-xs font-normal font-[Alexandria] transition ${
                  isActive
                    ? 'border border-[#474747] bg-[#16171D] text-white'
                    : 'text-[#A4A4A4] hover:text-white'
                }`}
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order list */}
      <div className={`relative flex-1 overflow-y-auto ${isMobile ? 'pt-2 pr-0' : 'pr-2'}`}>
        {isInitialLoading || (isRefetching && items.length === 0) ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center py-6">
            No trade history
          </div>
        ) : (
          <div
            className={`transition-opacity duration-300 ${isRefetching ? 'opacity-60' : 'opacity-100'}`}
          >
            <div
              className={`flex flex-col gap-4 transition-opacity duration-300 ease-out ${
                pageMounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {items.map((it, idx) => {
                const statusValue = typeof it.status === 'string' ? it.status : '';
                const statusRaw = statusValue.trim().toUpperCase();
                const cardStatus = resolveHistoryCardStatus(statusValue);
                const fillCompleted = isFilledHistoryStatus(statusRaw);
                const sideRaw = typeof it.side === 'string' ? it.side.toUpperCase() : '';
                const timestampSource = it.createdAt ?? it.matchedAt ?? '';
                const { date, time } = formatDateParts(timestampSource, { includeSeconds: true });
                let displayOrderId = it.tradeRef;
                if (fillCompleted) {
                  if (sideRaw === 'SELL' && it.sellOrderRef) {
                    displayOrderId = it.sellOrderRef;
                  } else if (sideRaw === 'BUY' && it.buyOrderRef) {
                    displayOrderId = it.buyOrderRef;
                  }
                }
                const baseSymbol = it.baseSymbol ?? it.symbol;
                const quoteSymbol = it.quoteSymbol ?? 'USDT';
                const precision = precisionMap
                  ? getSymbolPrecision(precisionMap, baseSymbol, quoteSymbol)
                  : undefined;
                const formattedAmount = formatAmountWithStep(it.amount, precision, {
                  locale: 'en-US',
                  fallbackDecimals: 6,
                });
                const formattedPrice = formatPriceWithTick(it.price, precision, {
                  locale: 'en-US',
                  fallbackDecimals: 2,
                });

                return (
                  <div
                    key={it.id}
                    className={`transform transition-all duration-300 ease-out ${
                      pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ transitionDelay: pageMounted ? `${idx * 40}ms` : '0ms' }}
                  >
                    <HistoryCard
                      status={cardStatus}
                      side={it.side.toLowerCase() as 'buy' | 'sell'}
                      pair={`${baseSymbol}/${quoteSymbol}`}
                      date={date}
                      time={time}
                      orderId={displayOrderId}
                      amount={formattedAmount}
                      baseSymbol={baseSymbol}
                      price={formattedPrice}
                      currency={it.currency}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isRefetching && items.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
      </div>

      {/* Footer */}
      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalCount={total}
        label="Items"
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}

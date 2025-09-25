'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type HistoryStatus = 'closed' | 'complete';
type HistorySide = 'buy' | 'sell';

const HISTORY_STATUS_META: Record<HistoryStatus, { label: string; dotColor: string; textColor: string }> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

const SIDE_META: Record<HistorySide, { label: string; badgeColor: string }> = {
  buy: { label: 'Buy', badgeColor: '#217871' },
  sell: { label: 'Sell', badgeColor: '#D84C4C' },
};

export interface HistoryCardProps {
  status: HistoryStatus;
  side: HistorySide;
  pair: string; // e.g. BTC/USDT
  date: string; // e.g. 13-Aug-2025
  time: string; // e.g. 14:30:30
  orderId: string; // full id; will be shortened visually
  amount: string; // formatted amount e.g. 0.020000000
  baseSymbol: string; // e.g. BTC
  price: string; // e.g. 115,200.00
  currency: string; // e.g. USD
}

function shortenId(id: string) {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}...${id.slice(-5)}`;
}

export default function HistoryCard({
  status,
  side,
  pair,
  date,
  time,
  orderId,
  amount,
  baseSymbol,
  price,
  currency,
}: HistoryCardProps) {
  const isMobile = useIsMobile();
  const statusMeta = HISTORY_STATUS_META[status];
  const sideMeta = SIDE_META[side];
  const rightTopLabel = status === 'complete' ? 'Matched' : 'Amount';
  const shortenedOrderId = shortenId(orderId);
  const hasDateInfo = Boolean(date || time);

  if (isMobile) {
    return (
      <article className="flex w-full flex-col gap-4 rounded-xl border border-[#474747] bg-[#16171D] p-4">
        <header className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-2 rounded-full"
              style={{ backgroundColor: statusMeta.dotColor }}
            />
            <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
              {statusMeta.label}
            </span>
          </div>
          {hasDateInfo && (
            <div className="flex items-center gap-2 whitespace-nowrap text-xs text-[#A4A4A4]">
              {date ? <span>{date}</span> : null}
              {time ? <span>{time}</span> : null}
            </div>
          )}
        </header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-lg px-3 text-xs font-normal leading-none text-white"
              style={{ backgroundColor: sideMeta.badgeColor }}
            >
              {sideMeta.label}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight text-white">{pair}</span>
              <span className="text-xs text-[#A4A4A4]">Order ID : {shortenedOrderId}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-2 text-xs text-[#A4A4A4] sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1F2029] px-3 py-2">
            <span>{rightTopLabel}</span>
            <div className="flex items-baseline gap-2 text-white">
              <span className="font-normal leading-tight">{amount}</span>
              <span className="font-normal leading-tight">{baseSymbol}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1F2029] px-3 py-2">
            <span>Price</span>
            <div className="flex items-baseline gap-2 text-white">
              <span className="font-normal leading-tight">{price}</span>
              {currency ? <span className="font-normal leading-tight">{currency}</span> : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className="w-[840px] h-[68px] p-3 bg-[#16171D] rounded-lg outline outline-offset-[-1px] flex items-center"
      style={{ outlineColor: '#474747' }}
    >
      <div className="w-full grid md:grid-cols-[104px_176px_76px_1fr_256px] grid-cols-[104px_176px_76px_1fr_256px] items-center gap-3">
        <div className="w-[104px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusMeta.dotColor }} />
          <span
            className={`text-xs font-normal font-[Alexandria] leading-none ${
              status === 'complete' ? 'text-[#4ED7B0]' : 'text-[#A4A4A4]'
            }`}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="w-[176px] flex items-center gap-1.5 text-white text-xs font-medium font-[Alexandria] leading-none whitespace-nowrap">
          <span>{date}</span>
          <span>{time}</span>
        </div>

        <div className="w-[76px] flex items-center justify-center">
          <div
            className={`w-[47px] h-7 px-3 rounded-lg inline-flex -ml-12 justify-center items-center ${
              side === 'buy' ? 'bg-[#217871]' : 'bg-[#D84C4C]'
            }`}
          >
            <span className="text-white text-xs font-normal font-[Alexandria] leading-none">
              {sideMeta.label}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex flex-col justify-center items-start gap-1">
          <div className="text-white text-sm font-medium font-[Alexandria] leading-tight truncate">
            {pair}
          </div>
          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            <span className="text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">
              Order ID :
            </span>
            <span className="text-[#E9E9E9] text-xs font-normal font-[Alexandria] leading-none">
              {shortenedOrderId}
            </span>
          </div>
        </div>

        <div className="w-[256px] self-stretch inline-flex flex-col justify-center items-start gap-1">
          <div className="self-stretch px-2 rounded-xl inline-flex justify-end items-center gap-2">
            <div className="w-14 text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">
              {rightTopLabel}
            </div>
            <div className="w-36 text-right text-white text-sm font-normal font-[Alexandria] leading-tight">
              {amount}
            </div>
            <div className="w-8 text-center text-white text-sm font-normal font-[Alexandria] leading-tight">
              {baseSymbol}
            </div>
          </div>
          <div className="self-stretch px-2 rounded-xl inline-flex justify-end items-center gap-2">
            <div className="w-12 text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">
              Price
            </div>
            <div className="w-40 text-right text-white text-sm font-normal font-[Alexandria] leading-tight">
              {price}
            </div>
            <div className="w-8 text-center text-white text-sm font-normal font-[Alexandria] leading-tight">
              {currency}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

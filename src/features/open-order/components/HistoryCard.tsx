import React from 'react';

type HistoryStatus = 'closed' | 'complete';
type HistorySide = 'buy' | 'sell';

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
  const isBuy = side === 'buy';
  const dotColor = status === 'complete' ? '#4ED7B0' : '#A4A4A4';
  const statusText = status === 'complete' ? 'Complete' : 'Closed';
  const rightTopLabel = status === 'complete' ? 'Matched' : 'Amount';

  return (
    <div
      className="w-[840px] h-[68px] p-3 bg-[#16171D] rounded-lg outline outline-offset-[-1px] flex items-center"
      style={{ outlineColor: '#474747' }}
    >
      <div className="w-full grid md:grid-cols-[104px_176px_76px_1fr_256px] grid-cols-[104px_176px_76px_1fr_256px] items-center gap-3">
        <div className="w-[104px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
          <span
            className={`text-xs font-normal font-[Alexandria] leading-none ${status === 'complete' ? 'text-[#4ED7B0]' : 'text-[#A4A4A4]'}`}
          >
            {statusText}
          </span>
        </div>

        <div className="w-[176px] flex items-center gap-1.5 text-white text-xs font-medium font-[Alexandria] leading-none whitespace-nowrap">
          <span>{date}</span>
          <span>{time}</span>
        </div>

        <div className="w-[76px] flex items-center justify-center">
          <div
            className={`w-[47px] h-7 px-3 rounded-lg inline-flex -ml-12 justify-center items-center ${isBuy ? 'bg-[#217871]' : 'bg-[#C22727]'}`}
          >
            <span className="text-white text-xs font-normal font-[Alexandria] leading-none">
              {isBuy ? 'Buy' : 'Sell'}
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
              {shortenId(orderId)}
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

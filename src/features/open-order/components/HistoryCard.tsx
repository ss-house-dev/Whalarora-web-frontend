import React from 'react';

type HistoryStatus = 'closed' | 'complete';
type HistorySide = 'buy' | 'sell';

export interface HistoryCardProps {
  status: HistoryStatus;
  side: HistorySide;
  pair: string; // e.g. BTC/USDT
  date: string; // e.g. 13-08-2025
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
      className="w-[840px] p-3 bg-[#16171D] rounded-lg outline outline-offset-[-1px]"
      style={{ outlineColor: '#474747' }}
    >
      <div className="w-full inline-flex justify-center items-center gap-10">
        {/* Left: status + datetime */}
        <div className="self-stretch inline-flex flex-col justify-center items-start gap-6">
          <div className="self-stretch inline-flex justify-start items-center gap-6">
            <div className="w-24 self-stretch p-2 rounded-lg flex justify-start items-center gap-2.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
              <span
                className={`text-xs font-normal font-[Alexandria] leading-none ${status === 'complete' ? 'text-[#4ED7B0]' : 'text-[#A4A4A4]'}`}
              >
                {statusText}
              </span>
            </div>
            <div className="self-stretch flex justify-start items-center gap-2 whitespace-nowrap">
              <span className="text-white text-xs font-medium font-[Alexandria] leading-none">
                {date}
              </span>
              <span className="text-white text-xs font-medium font-[Alexandria] leading-none">
                {time}
              </span>
            </div>
          </div>
        </div>

        {/* Side pill */}
        <div className="w-12 inline-flex flex-col justify-start items-start gap-2.5">
          <div
            className={`self-stretch h-7 px-3 rounded-lg inline-flex justify-center items-center ${isBuy ? 'bg-[#217871]' : 'bg-[#C22727]'}`}
          >
            <span className="text-white text-xs font-normal font-[Alexandria] leading-none">
              {isBuy ? 'Buy' : 'Sell'}
            </span>
          </div>
        </div>

        {/* Pair + order id */}
        <div className="flex-1 h-10 inline-flex flex-col justify-center items-start gap-1">
          <div className="w-20 text-white text-sm font-medium font-[Alexandria] leading-tight">
            {pair}
          </div>
          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            <span className="text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">Order ID :</span>
            <span className="text-[#E9E9E9] text-xs font-normal font-[Alexandria] leading-none">{shortenId(orderId)}</span>
          </div>
        </div>

        {/* Amount/Matched + Price */}
        <div className="w-64 self-stretch inline-flex flex-col justify-center items-start gap-1">
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

'use client';

import Image from 'next/image';

type PreviewRow = {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  unit: string;
  currentPrice: string;
  averageCost: string;
  value: string;
  pnl: string;
  pnlColor: string;
  icon: string;
};

const PREVIEW_ROWS: PreviewRow[] = [
  {
    id: 'btc-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: '0.500000000',
    unit: 'BTC',
    currentPrice: '115,200.00',
    averageCost: '115,200.00',
    value: '14,285.63',
    pnl: '14,285.63 (+2.00%)',
    pnlColor: '#D84C4C',
    icon: '/currency-icons/bitcoin-icon.svg',
  },
  {
    id: 'btc-2',
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: '0.500000000',
    unit: 'BTC',
    currentPrice: '115,200.00',
    averageCost: '115,200.00',
    value: '14,285.63',
    pnl: '14,285.63 (+2.00%)',
    pnlColor: '#D84C4C',
    icon: '/currency-icons/bitcoin-icon.svg',
  },
];

export function HoldingAssetsFigmaPreview() {
  return (
    <div className="flex h-[460px] w-[1304px] flex-col gap-3 overflow-hidden rounded-xl bg-[#16171D] px-5 py-3 text-white">
      <header className="flex w-full justify-start">
        <div className="rounded-lg px-2 py-2">
          <h2 className="text-base font-normal leading-6 text-[#F7F7F7] whitespace-nowrap">
            My holding assets
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-[288px_128px_128px_144px_144px_160px] items-center gap-10 px-2 text-xs uppercase tracking-[0.08em] text-[#A4A4A4]">
        <span className="text-left font-medium">Symbol</span>
        <span className="justify-self-center text-center font-medium">Current price (USDT)</span>
        <span className="justify-self-center text-center font-normal">Average cost (USDT)</span>
        <span className="justify-self-center text-center font-normal">Value (USDT)</span>
        <span className="justify-self-center text-center font-normal">Unrealized PnL (USDT)</span>
        <span aria-hidden className="block" />
      </div>

      <div className="flex flex-1 gap-2 overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {PREVIEW_ROWS.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[288px_128px_128px_144px_144px_160px] items-center gap-10 rounded-xl border border-[#3C3F4A] bg-[#191B24] px-2 py-4"
            >
              <div className="flex h-full items-center gap-4 border-r border-[#2D3039] pr-10">
                <div className="flex h-10 w-10 items-center justify-center">
                  <Image
                    alt={row.symbol}
                    src={row.icon}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-normal leading-tight text-white">
                    {row.symbol} ({row.name})
                  </span>
                  <span className="inline-flex items-center gap-2.5 rounded-xl bg-[#1F2029] px-2 py-1">
                    <span className="min-w-[120px] text-base leading-normal text-white">
                      {row.amount}
                    </span>
                    <span className="text-base leading-normal text-white">{row.unit}</span>
                  </span>
                </div>
              </div>

              <div className="justify-self-center text-base leading-normal text-white text-center">
                {row.currentPrice}
              </div>
              <div className="justify-self-center text-base leading-normal text-white text-center">
                {row.averageCost}
              </div>
              <div className="justify-self-center text-base leading-normal text-white text-center">
                {row.value}
              </div>
              <div
                className="justify-self-center text-base leading-normal text-center"
                style={{ color: row.pnlColor }}
              >
                {row.pnl}
              </div>
              <div className="justify-self-center">
                <button className="flex h-8 w-[144px] items-center justify-center rounded-lg bg-[#215EEC] text-sm font-normal leading-tight text-neutral-100">
                  Buy/Sell
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-2 self-stretch rounded-xl bg-[#4F5160]" aria-hidden />
      </div>

      <footer className="mt-4 flex w-full items-start justify-between text-xs text-[#A4A4A4]">
        <span className="font-medium">Total : 12 Assets</span>
        <div className="flex items-center gap-[5px]">
          <button
            className="flex h-8 w-8 -rotate-180 items-center justify-center rounded-lg bg-[#4F5160]"
            disabled
          >
            <span className="h-2 w-1.5 bg-[#A4A4A4]" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#225FED] text-xs font-semibold text-white">
            1
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-[#A4A4A4]">
            2
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-[#A4A4A4]">
            3
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F5160]"
            disabled
          >
            <span className="h-2 w-1.5 bg-[#A4A4A4]" />
          </button>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React from 'react';
import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';
import OrderBookWidget from '@/features/open-order/components/OrderBookWidget';
import OpenOrderandTradeHistoryResponsive from '@/features/open-order/components/OrdersResponsive';
import { CoinProvider, useCoinContext } from '@/features/trading/contexts/CoinContext';
import {
  HoldingResponsive,
  type HoldingItem,
} from '@/features/assets/components/HoldingResponsive';

const SAMPLE_HOLDINGS: HoldingItem[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: 0.025,
    unit: 'BTC',
    averageCost: 14285.63,
    value: 14571.34,
    pnlAbs: 285.71,
    pnlPct: 0.02,
    iconSrc: '/currency-icons/bitcoin-icon.svg',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 1.56,
    unit: 'ETH',
    averageCost: 3120.12,
    value: 3366.45,
    pnlAbs: 246.33,
    pnlPct: 0.079,
    iconSrc: '/currency-icons/ethereum-icon.svg',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    amount: 12.48,
    unit: 'SOL',
    averageCost: 156.4,
    value: 143.72,
    pnlAbs: -12.68,
    pnlPct: -0.0811,
    iconSrc: '/currency-icons/solana-icon.svg',
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    amount: 3.9,
    unit: 'BNB',
    averageCost: 412.15,
    value: 468.21,
    pnlAbs: 56.06,
    pnlPct: 0.136,
    iconSrc: '/currency-icons/bnb-coin.svg',
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    amount: 850,
    unit: 'ADA',
    averageCost: 0.38,
    value: 279.5,
    pnlAbs: -42.5,
    pnlPct: -0.1321,
    iconSrc: '/currency-icons/ada-coin.svg',
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP',
    amount: 1200,
    unit: 'XRP',
    averageCost: 0.57,
    value: 684,
    pnlAbs: 0,
    pnlPct: 0,
    iconSrc: '/currency-icons/xrp-coin.svg',
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    amount: 5000,
    unit: 'DOGE',
    averageCost: 0.082,
    value: 362.5,
    pnlAbs: -47.5,
    pnlPct: -0.1157,
    iconSrc: '/currency-icons/doge-coin.svg',
  },
  {
    id: 'matic',
    symbol: 'MATIC',
    name: 'Polygon',
    amount: 780,
    unit: 'MATIC',
    averageCost: 0.71,
    value: 608.4,
    pnlAbs: 55.2,
    pnlPct: 0.0993,
  },
  {
    id: 'dot',
    symbol: 'DOT',
    name: 'Polkadot',
    amount: 120,
    unit: 'DOT',
    averageCost: 5.63,
    value: 672.4,
    pnlAbs: -4.96,
    pnlPct: -0.0073,
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    amount: 48,
    unit: 'AVAX',
    averageCost: 32.4,
    value: 1587.36,
    pnlAbs: 35.52,
    pnlPct: 0.0227,
  },
  {
    id: 'uni',
    symbol: 'UNI',
    name: 'Uniswap',
    amount: 94,
    unit: 'UNI',
    averageCost: 8.41,
    value: 892.46,
    pnlAbs: 102.3,
    pnlPct: 0.129,
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    amount: 210,
    unit: 'LINK',
    averageCost: 17.12,
    value: 3361.2,
    pnlAbs: 54.6,
    pnlPct: 0.0165,
  },
  {
    id: 'atom',
    symbol: 'ATOM',
    name: 'Cosmos',
    amount: 140,
    unit: 'ATOM',
    averageCost: 9.84,
    value: 1206,
    pnlAbs: -166,
    pnlPct: -0.1216,
  },
  {
    id: 'ltc',
    symbol: 'LTC',
    name: 'Litecoin',
    amount: 6.5,
    unit: 'LTC',
    averageCost: 96.2,
    value: 503.36,
    pnlAbs: -120.04,
    pnlPct: -0.1929,
  },
  {
    id: 'shib',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    amount: 1250000,
    unit: 'SHIB',
    averageCost: 0.0000096,
    value: 11.5,
    pnlAbs: 2.3,
    pnlPct: 0.2501,
  },
];

const ORDER_BOOK_SCENARIOS = [
  {
    id: 'ac6',
    label: 'AC6 - Amount < 1,000',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '987.654321',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '123.456789',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac7',
    label: 'AC7 - Amount in thousands',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '12345.6789',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654.321',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac8',
    label: 'AC8 - Amount in millions',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '1234567.89',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654321.12',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac9',
    label: 'AC9 - Amount in billions',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '1234567890.12',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654321234.56',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'ac10',
    label: 'AC10 - Amount in trillions',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (BTC)',
      price: '$ 114,800.00',
      amount: '1234567890123.45',
      amountSymbol: 'BTC',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (BTC)',
      price: '$ 115,000.00',
      amount: '987654321012.34',
      amountSymbol: 'BTC',
    },
  },
  {
    id: 'long',
    label: 'Long token symbol wrap',
    bid: {
      label: 'Bid',
      amountLabel: 'Amount (CATBABY)',
      price: '$ 50,000.00',
      amount: '1234.56',
      amountSymbol: 'CATBABY',
    },
    ask: {
      label: 'Ask',
      amountLabel: 'Amount (CATBABY)',
      price: '$ 50,500.00',
      amount: '98765.43',
      amountSymbol: 'CATBABY',
    },
  },
] as const;

function OrderBookTestContent() {
  const { selectedCoin } = useCoinContext();

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-12 bg-[#0F0F0F] py-10">
      <section className="flex w-full justify-center px-4">
        <div className="w-full max-w-6xl">
          <OpenOrderandTradeHistoryResponsive />
        </div>
      </section>
      <section className="flex w-full justify-center px-4">
        <HoldingResponsive holdings={SAMPLE_HOLDINGS} pageSize={6} />
      </section>

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Live OrderBook (websocket)</h2>
        <p className="text-sm text-[#A4A4A4]">
          Symbol from CoinContext:{' '}
          <span className="font-semibold text-white">{selectedCoin.label}</span>
        </p>
        <OrderBookLiveContainer />
      </section>

      <section className="flex w-full max-w-3xl flex-col items-center gap-4">
        <h3 className="text-lg font-semibold text-white">Snapshot scenarios</h3>
        <p className="text-sm text-[#A4A4A4]">
          Reference states used during design to validate formatting across different values.
        </p>
        <div className="flex flex-col items-center gap-4">
          {ORDER_BOOK_SCENARIOS.map(({ id, label, bid, ask }) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-[#A4A4A4]">
                {label}
              </span>
              <OrderBookWidget bid={bid} ask={ask} />
            </div>
          ))}

          <OrderBookWidget
            bid={{ amountLabel: 'Amount (BTC)' }}
            ask={{ amountLabel: 'Amount (BTC)' }}
            disabled
          />
        </div>
      </section>
    </div>
  );
}

export default function TestPage() {
  return (
    <CoinProvider>
      <OrderBookTestContent />
    </CoinProvider>
  );
}

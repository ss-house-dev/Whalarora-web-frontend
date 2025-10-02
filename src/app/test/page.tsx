'use client';

import React, { useMemo, useState } from 'react';

import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';

import OrderBookWidget from '@/features/open-order/components/OrderBookWidget';

import OrderTableContainer from '@/features/open-order/components/OrderTableContainer';

import { CoinProvider, useCoinContext } from '@/features/trading/contexts/CoinContext';

import { HoldingAssetsFigmaPreview } from '@/features/assets/components/HoldingAssetsFigmaPreview';

import {
  HoldingResponsive,
  type HoldingItem,
} from '@/features/assets/components/HoldingResponsive';

import MyAssetsWidget, {
  type MyAssetsWidgetItem,
} from '@/features/assets/components/MyAssetsWidget';

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

const SAMPLE_MY_ASSETS_ITEMS: MyAssetsWidgetItem[] = [
  {
    id: 'btc-demo',

    symbol: 'BTC',

    name: 'Bitcoin',

    amount: 0.5,

    unit: 'BTC',

    avgPrice: 42000,

    total: 21000,

    currentPrice: 58500,

    value: 29250,

    pnlValue: 8250,

    pnlPercent: 0.392857,

    iconSrc: '/currency-icons/bitcoin-icon.svg',
  },

  {
    id: 'eth-demo',

    symbol: 'ETH',

    name: 'Ethereum',

    amount: 3.2,

    unit: 'ETH',

    avgPrice: 2500,

    total: 8000,

    currentPrice: 2800,

    value: 8960,

    pnlValue: 960,

    pnlPercent: 0.12,

    iconSrc: '/currency-icons/ethereum-icon.svg',
  },

  {
    id: 'sol-demo',

    symbol: 'SOL',

    name: 'Solana',

    amount: 22,

    unit: 'SOL',

    avgPrice: 95,

    total: 2090,

    currentPrice: 140,

    value: 3080,

    pnlValue: 990,

    pnlPercent: 0.473684,

    iconSrc: '/currency-icons/solana-icon.svg',
  },

  {
    id: 'bnb-demo',

    symbol: 'BNB',

    name: 'BNB',

    amount: 4.5,

    unit: 'BNB',

    avgPrice: 300,

    total: 1350,

    currentPrice: 250,

    value: 1125,

    pnlValue: -225,

    pnlPercent: -0.166667,

    iconSrc: '/currency-icons/bnb-coin.svg',
  },

  {
    id: 'xrp-demo',

    symbol: 'XRP',

    name: 'XRP',

    amount: 1200,

    unit: 'XRP',

    avgPrice: 0.55,

    total: 660,

    currentPrice: 0.62,

    value: 744,

    pnlValue: 84,

    pnlPercent: 0.127273,

    iconSrc: '/currency-icons/xrp-coin.svg',
  },

  {
    id: 'ada-demo',

    symbol: 'ADA',

    name: 'Cardano',

    amount: 3000,

    unit: 'ADA',

    avgPrice: 0.36,

    total: 1080,

    currentPrice: 0.28,

    value: 840,

    pnlValue: -240,

    pnlPercent: -0.222222,

    iconSrc: '/currency-icons/ada-coin.svg',
  },

  {
    id: 'doge-demo',

    symbol: 'DOGE',

    name: 'Dogecoin',

    amount: 15000,

    unit: 'DOGE',

    avgPrice: 0.08,

    total: 1200,

    currentPrice: 0.09,

    value: 1350,

    pnlValue: 150,

    pnlPercent: 0.125,

    iconSrc: '/currency-icons/doge-coin.svg',
  },

  {
    id: 'dot-demo',

    symbol: 'DOT',

    name: 'Polkadot',

    amount: 400,

    unit: 'DOT',

    avgPrice: 6.5,

    total: 2600,

    currentPrice: 7.1,

    value: 2840,

    pnlValue: 240,

    pnlPercent: 0.092308,
  },

  {
    id: 'avax-demo',

    symbol: 'AVAX',

    name: 'Avalanche',

    amount: 150,

    unit: 'AVAX',

    avgPrice: 30,

    total: 4500,

    currentPrice: 24,

    value: 3600,

    pnlValue: -900,

    pnlPercent: -0.2,
  },

  {
    id: 'matic-demo',

    symbol: 'MATIC',

    name: 'Polygon',

    amount: 2200,

    unit: 'MATIC',

    avgPrice: 0.74,

    total: 1628,

    currentPrice: 0.9,

    value: 1980,

    pnlValue: 352,

    pnlPercent: 0.21636,
  },

  {
    id: 'link-demo',

    symbol: 'LINK',

    name: 'Chainlink',

    amount: 320,

    unit: 'LINK',

    avgPrice: 12,

    total: 3840,

    currentPrice: 16,

    value: 5120,

    pnlValue: 1280,

    pnlPercent: 0.333333,
  },

  {
    id: 'ltc-demo',

    symbol: 'LTC',

    name: 'Litecoin',

    amount: 85,

    unit: 'LTC',

    avgPrice: 95,

    total: 8075,

    currentPrice: 68,

    value: 5780,

    pnlValue: -2295,

    pnlPercent: -0.284211,
  },

  {
    id: 'uni-demo',

    symbol: 'UNI',

    name: 'Uniswap',

    amount: 180,

    unit: 'UNI',

    avgPrice: 7,

    total: 1260,

    currentPrice: 8.5,

    value: 1530,

    pnlValue: 270,

    pnlPercent: 0.214286,
  },

  {
    id: 'atom-demo',

    symbol: 'ATOM',

    name: 'Cosmos',

    amount: 260,

    unit: 'ATOM',

    avgPrice: 8,

    total: 2080,

    currentPrice: 9.2,

    value: 2392,

    pnlValue: 312,

    pnlPercent: 0.15,
  },

  {
    id: 'fil-demo',

    symbol: 'FIL',

    name: 'Filecoin',

    amount: 600,

    unit: 'FIL',

    avgPrice: 4.5,

    total: 2700,

    currentPrice: 6,

    value: 3600,

    pnlValue: 900,

    pnlPercent: 0.333333,
  },

  {
    id: 'near-demo',

    symbol: 'NEAR',

    name: 'NEAR',

    amount: 900,

    unit: 'NEAR',

    avgPrice: 3.2,

    total: 2880,

    currentPrice: 3.05,

    value: 2745,

    pnlValue: -135,

    pnlPercent: -0.046875,
  },

  {
    id: 'arb-demo',

    symbol: 'ARB',

    name: 'Arbitrum',

    amount: 700,

    unit: 'ARB',

    avgPrice: 1.1,

    total: 770,

    currentPrice: 1.35,

    value: 945,

    pnlValue: 175,

    pnlPercent: 0.227273,
  },

  {
    id: 'op-demo',

    symbol: 'OP',

    name: 'Optimism',

    amount: 800,

    unit: 'OP',

    avgPrice: 2,

    total: 1600,

    currentPrice: 2.25,

    value: 1800,

    pnlValue: 200,

    pnlPercent: 0.125,
  },

  {
    id: 'sui-demo',

    symbol: 'SUI',

    name: 'Sui',

    amount: 1000,

    unit: 'SUI',

    avgPrice: 0.95,

    total: 950,

    currentPrice: 1.08,

    value: 1080,

    pnlValue: 130,

    pnlPercent: 0.136842,
  },

  {
    id: 'apt-demo',

    symbol: 'APT',

    name: 'Aptos',

    amount: 210,

    unit: 'APT',

    avgPrice: 8.5,

    total: 1785,

    currentPrice: 9.8,

    value: 2058,

    pnlValue: 273,

    pnlPercent: 0.152941,
  },
];

const MY_ASSETS_FEATURES = [
  {
    id: 'realtime',

    title: 'Real-time pricing',

    detail:
      'Each asset card subscribes to Binance trade updates through useMarketPrice and recomputes valuations as ticks arrive.',
  },

  {
    id: 'pnl',

    title: 'PnL highlighting',

    detail:
      'Average cost from the API enables live PnL percentages, which the widget colors to communicate gain or loss at a glance.',
  },

  {
    id: 'states',

    title: 'Resilient states',

    detail:
      'Before any data exists, the widget surfaces explicit copy for loading, empty responses, or API errors.',
  },

  {
    id: 'sorting',

    title: 'Input preparation',

    detail:
      'MyAssetsWidgetContainer filters out non-tradable assets and sorts the remainder by total value before rendering.',
  },
] as const;

const MY_ASSETS_STATE_OPTIONS = [
  { id: 'live', label: 'Live data' },

  { id: 'loading', label: 'Loading state' },

  { id: 'empty', label: 'Empty state' },

  { id: 'error', label: 'Error state' },
] as const;

type WidgetPreviewMode = (typeof MY_ASSETS_STATE_OPTIONS)[number]['id'];

type WidgetPreviewState = {
  items: MyAssetsWidgetItem[];

  isLoading: boolean;

  error?: string;
};

function MyAssetsWidgetShowcase() {
  const [mode, setMode] = useState<WidgetPreviewMode>('live');

  const previewState = useMemo<WidgetPreviewState>(() => {
    switch (mode) {
      case 'loading':
        return { items: [], isLoading: true };

      case 'empty':
        return { items: [], isLoading: false };

      case 'error':
        return {
          items: [],

          isLoading: false,

          error: 'Simulated API error. Please try again.',
        };

      default:
        return { items: SAMPLE_MY_ASSETS_ITEMS, isLoading: false };
    }
  }, [mode]);

  return (
    <section className="flex w-full justify-center px-4">
      <div className="flex w-full max-w-6xl flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-lg font-semibold text-white">MyAssetsWidget analysis</h2>

          <p className="text-sm text-[#A4A4A4]">
            Toggle the widget states to understand how live pricing, PnL, and fallback copy come
            together.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {MY_ASSETS_STATE_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                mode === id ? 'bg-[#23242F] text-white' : 'bg-[#111218] text-[#A4A4A4]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="w-full max-w-3xl space-y-2 text-left text-sm text-[#A4A4A4]">
          {MY_ASSETS_FEATURES.map(({ id, title, detail }) => (
            <li key={id}>
              <span className="font-medium text-white">{title}:</span> {detail}
            </li>
          ))}
        </ul>

        <div className="flex w-full justify-center">
          <MyAssetsWidget
            items={previewState.items}
            isLoading={previewState.isLoading}
            error={previewState.error}
          />
        </div>

        <p className="text-xs text-[#6B6B6B]">
          Live mode opens one Binance trade stream per asset to keep valuations updated in real
          time.
        </p>
      </div>
    </section>
  );
}

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

  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-12 bg-[#0F0F0F] py-10">
      <section className="flex w-full justify-center px-4">
        <div className="w-full max-w-6xl">
          <OrderTableContainer activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </section>

      <section className="flex w-full justify-center px-4">
        <div className="w-full max-w-6xl">
          <HoldingAssetsFigmaPreview />
        </div>
      </section>

      <section className="flex w-full justify-center px-4">
        <HoldingResponsive holdings={SAMPLE_HOLDINGS} pageSize={6} />
      </section>

      <MyAssetsWidgetShowcase />

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

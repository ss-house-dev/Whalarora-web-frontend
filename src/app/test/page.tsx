'use client';

import React, { useMemo, useState } from 'react';

import OrderBookLiveContainer from '@/features/open-order/containers/OrderBookLiveContainer';

import OrderBookWidget from '@/features/open-order/components/OrderBookWidget';

import OrderTableContainer from '@/features/open-order/components/OrderTableContainer';

import { CoinProvider, useCoinContext } from '@/features/trading/contexts/CoinContext';

import { HoldingAssetsFigmaPreview } from '@/features/assets/components/HoldingAssetsFigmaPreview';
import MyAssetsWidget from '@/features/assets/components/MyAssetsWidget';
import MyAssetsWidgetContainer from '@/features/assets/containers/MyAssetsWidgetContainer';
import DonutChart from '@/features/assets/components/DonutChart';
import { useAssetsDonutData } from '@/features/assets/hooks/useAssetsDonutData';
import { Asset, DonutChartData } from '@/features/assets/types/donut-chart';
import { formatCurrency, formatPercentage } from '@/features/assets/utils/donut-chart-utils';

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

const MOCK_ASSETS_DATA: Asset[] = [
  { id: 'btc', name: 'Bitcoin', amount: 0.5, currentPrice: 70000, category: 'crypto' },
  { id: 'eth', name: 'Ethereum', amount: 3, currentPrice: 3500, category: 'crypto' },
  { id: 'ada', name: 'Cardano', amount: 1000, currentPrice: 0.45, category: 'crypto' },
  { id: 'sol', name: 'Solana', amount: 50, currentPrice: 150, category: 'crypto' },
  { id: 'bnb', name: 'Binance Coin', amount: 2, currentPrice: 600, category: 'crypto' },
  { id: 'xrp', name: 'Ripple', amount: 2000, currentPrice: 0.5, category: 'crypto' },
  { id: 'doge', name: 'Dogecoin', amount: 10000, currentPrice: 0.15, category: 'crypto' },
  { id: 'tsla', name: 'Tesla', amount: 10, currentPrice: 180, category: 'stock' },
  { id: 'goog', name: 'Google', amount: 5, currentPrice: 170, category: 'stock' },
  { id: 'amzn', name: 'Amazon', amount: 2, currentPrice: 185, category: 'stock' },
  { id: 'vmfxx', name: 'Vanguard Money Market', amount: 5000, currentPrice: 1, category: 'fund' },
];

const EXCEL_ASSETS_DATA: Asset[] = [
  { id: 'btc', name: 'Bitcoin', amount: 0.8, currentPrice: 68000, category: 'crypto' },
  { id: 'eth', name: 'Ethereum', amount: 5, currentPrice: 3400, category: 'crypto' },
  { id: 'sol', name: 'Solana', amount: 70, currentPrice: 145, category: 'crypto' },
  { id: 'bnb', name: 'Binance Coin', amount: 3, currentPrice: 590, category: 'crypto' },
  { id: 'ada', name: 'Cardano', amount: 1500, currentPrice: 0.42, category: 'crypto' },
  { id: 'xrp', name: 'Ripple', amount: 3000, currentPrice: 0.48, category: 'crypto' },
  { id: 'doge', name: 'Dogecoin', amount: 15000, currentPrice: 0.14, category: 'crypto' },
  { id: 'aapl', name: 'Apple', amount: 15, currentPrice: 190, category: 'stock' },
  { id: 'msft', name: 'Microsoft', amount: 8, currentPrice: 420, category: 'stock' },
  { id: 'spy', name: 'SPDR S&P 500 ETF', amount: 20, currentPrice: 500, category: 'fund' },
];

function MyAssetsWidgetShowcase() {
  const [mode, setMode] = useState<WidgetPreviewMode>('live');

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
          {mode === 'live' && <MyAssetsWidgetContainer />}
          {mode === 'loading' && <MyAssetsWidget items={[]} isLoading={true} />}
          {mode === 'empty' && <MyAssetsWidget items={[]} isLoading={false} />}
          {mode === 'error' && (
            <MyAssetsWidget
              items={[]}
              isLoading={false}
              error="Simulated API error. Please try again."
            />
          )}
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
  const [donutDataMode, setDonutDataMode] = useState<'mock' | 'excel'>('mock');

  const assetsToDisplay = donutDataMode === 'mock' ? MOCK_ASSETS_DATA : EXCEL_ASSETS_DATA;
  const { data: donutChartData, totalHoldingValue } = useAssetsDonutData(assetsToDisplay);

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
        <div className="flex w-full max-w-6xl flex-col items-center gap-6">
          <h2 className="text-lg font-semibold text-white">Donut Chart Analysis</h2>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setDonutDataMode('mock')}
              className={`rounded-full px-3 py-1 text-sm transition ${
                donutDataMode === 'mock' ? 'bg-[#23242F] text-white' : 'bg-[#111218] text-[#A4A4A4]'
              }`}
            >
              Mock Data
            </button>
            <button
              type="button"
              onClick={() => setDonutDataMode('excel')}
              className={`rounded-full px-3 py-1 text-sm transition ${
                donutDataMode === 'excel'
                  ? 'bg-[#23242F] text-white'
                  : 'bg-[#111218] text-[#A4A4A4]'
              }`}
            >
              Excel Data
            </button>
          </div>
          <div className="w-full max-w-xl">
            <DonutChart data={donutChartData} totalHoldingValue={totalHoldingValue} />
          </div>
          {donutChartData.length > 0 && (
            <div className="w-full max-w-xl text-white">
              <h3 className="text-md font-semibold mb-2">Top 5 Assets:</h3>
              <ul className="space-y-1">
                {donutChartData
                  .filter((item) => item.rank <= 5)
                  .map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: item.color }}
                          className="w-3 h-3 rounded-full inline-block"
                        ></span>
                        {item.label}
                      </span>
                      <span>
                        {formatCurrency(item.value)} ({formatPercentage(item.ratio)})
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
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

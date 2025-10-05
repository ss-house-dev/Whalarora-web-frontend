'use client';

import React from 'react';
import DonutChart from '@/features/assets/components/DonutChart';
import { Asset } from '@/features/assets/types/donut-chart';
import { useAssetsDonutData } from '@/features/assets/hooks/useAssetsDonutData';
import { formatCurrency, formatPercentage } from '@/features/assets/utils/donut-chart-utils';

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

export default function DonutChartTestPage() {
  const { data: donutChartData, totalHoldingValue } = useAssetsDonutData(MOCK_ASSETS_DATA);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-12 bg-[#0F0F0F] py-10">
      <h1 className="text-white text-2xl font-bold">Donut Chart Standalone Test</h1>
      <div className="flex items-start gap-8">
        {' '}
        {/* Container for chart and legend */}
        <DonutChart data={donutChartData} totalHoldingValue={totalHoldingValue} />
        {/* Custom Legend */}
        <div className="p-4">
          <ul className="space-y-1">
            {donutChartData
              .sort((a, b) => a.rank - b.rank) // Sort by rank
              .map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-white text-xs">
                  <span
                    style={{ backgroundColor: item.color }}
                    className="w-3 h-3 rounded-full inline-block"
                  ></span>
                  {item.label}: {formatCurrency(item.value)} ({formatPercentage(item.ratio)})
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

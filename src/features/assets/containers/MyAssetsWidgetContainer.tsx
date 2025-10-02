'use client';

import { useMemo } from 'react';

import MyAssetsWidget, { type MyAssetsWidgetItem } from '../components/MyAssetsWidget';

import { useGetAllAssets } from '../hooks/useGetAllAssets';

import type { Asset } from '../types';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  type SymbolPrecisionMap,
} from '@/features/trading/utils/symbolPrecision';

const FALLBACK_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',

  ETH: 'Ethereum',

  USDT: 'Tether',

  BNB: 'BNB',

  SOL: 'Solana',

  USDC: 'USD Coin',

  XRP: 'XRP',

  DOGE: 'Dogecoin',

  ADA: 'Cardano',

  SHIB: 'Shiba Inu',

  AVAX: 'Avalanche',

  DOT: 'Polkadot',

  LINK: 'Chainlink',

  MATIC: 'Polygon',

  LTC: 'Litecoin',

  UNI: 'Uniswap',

  ATOM: 'Cosmos',
};

const ICON_MAP: Record<string, string> = {
  BTC: 'bitcoin-icon.svg',

  ETH: 'ethereum-icon.svg',

  BNB: 'bnb-coin.svg',

  SOL: 'solana-icon.svg',

  XRP: 'xrp-coin.svg',

  ADA: 'ada-coin.svg',

  DOGE: 'doge-coin.svg',
};

const getIconSrc = (symbol: string) => {
  const normalized = symbol.toUpperCase();

  const iconFile = ICON_MAP[normalized] ?? 'default-coin.svg';

  return `/currency-icons/${iconFile}`;
};

const toWidgetItem = (
  asset: Asset,
  precisionMap: SymbolPrecisionMap | undefined
): MyAssetsWidgetItem => {
  const symbol = asset.symbol?.toUpperCase() ?? 'N/A';

  const amount = Number.isFinite(asset.amount) ? asset.amount : 0;

  const avgPrice = Number.isFinite(asset.avgPrice) ? asset.avgPrice : 0;

  const fallbackPrice = Number.isFinite(asset.currentPrice) ? asset.currentPrice : avgPrice;

  const currentPrice = fallbackPrice ?? 0;

  const costBasis = Number.isFinite(asset.total) ? asset.total : avgPrice * amount;

  const estimatedValue = currentPrice * amount;

  const pnlValue = estimatedValue - costBasis;

  const pnlPercent = costBasis > 0 ? pnlValue / costBasis : 0;

  return {
    id: asset._id,
    symbol,
    name: FALLBACK_NAMES[symbol] ?? symbol,
    amount,
    unit: symbol,
    avgPrice,
    total: costBasis,
    iconSrc: getIconSrc(symbol),
    currentPrice,
    value: estimatedValue,
    pnlValue,
    pnlPercent,
    precision: getSymbolPrecision(precisionMap, symbol, 'USDT'),
  };
};

const filterTradableAssets = (assets: Asset[] | undefined): Asset[] => {
  if (!assets || assets.length === 0) {
    return [];
  }

  return assets.filter((asset) => asset.symbol?.toUpperCase() !== 'CASH');
};

export default function MyAssetsWidgetContainer() {
  const {
    data: assetsData,
    isLoading: isAssetsLoading,
    error: assetsError,
    isFetching: isAssetsFetching,
  } = useGetAllAssets({
    enabled: true,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const { data: precisionMap, isLoading: isPrecisionLoading } = useSymbolPrecisions({
    enabled: true,
  });

  const tradableAssets = useMemo(() => filterTradableAssets(assetsData), [assetsData]);

  const items = useMemo(() => {
    if (!precisionMap || tradableAssets.length === 0) {
      return [] as MyAssetsWidgetItem[];
    }

    // Sort by total value (amount * avgPrice) as a proxy before real-time values are available
    const sortedAssets = [...tradableAssets].sort((a, b) => b.total - a.total);

    return sortedAssets.map((asset) => toWidgetItem(asset, precisionMap));
  }, [tradableAssets, precisionMap]);

  const showLoadingState =
    (isAssetsLoading || isAssetsFetching || isPrecisionLoading) && items.length === 0;

  return <MyAssetsWidget items={items} isLoading={showLoadingState} error={assetsError?.message} />;
}

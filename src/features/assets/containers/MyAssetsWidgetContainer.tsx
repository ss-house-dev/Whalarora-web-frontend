'use client';

import { useMemo } from 'react';
import MyAssetsWidget, { type MyAssetsWidgetItem } from '../components/MyAssetsWidget';
import { useGetAllAssets } from '../hooks/useGetAllAssets';
import type { Asset } from '../types';

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

const toWidgetItem = (asset: Asset): MyAssetsWidgetItem => {
  const symbol = asset.symbol?.toUpperCase() ?? 'N/A';

  return {
    id: asset._id,
    symbol,
    name: FALLBACK_NAMES[symbol] ?? symbol,
    amount: asset.amount,
    unit: symbol,
    // Pass down cost basis for calculation in the child component
    avgPrice: asset.avgPrice,
    total: asset.total,
    iconSrc: getIconSrc(symbol),
    // Price-dependent fields are now calculated in the child
    currentPrice: 0,
    value: 0,
    pnlValue: 0,
    pnlPercent: 0,
  };
};

const filterTradableAssets = (assets: Asset[] | undefined): Asset[] => {
  if (!assets || assets.length === 0) {
    return [];
  }

  return assets.filter((asset) => asset.symbol?.toUpperCase() !== 'CASH');
};

export default function MyAssetsWidgetContainer() {
  const { data, isLoading, error, isFetching } = useGetAllAssets({
    enabled: true,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const tradableAssets = useMemo(() => filterTradableAssets(data), [data]);

  const items = useMemo(() => {
    if (tradableAssets.length === 0) {
      return [] as MyAssetsWidgetItem[];
    }
    // Sort by total value (amount * avgPrice) as a proxy before real-time values are available
    const sortedAssets = [...tradableAssets].sort((a, b) => b.total - a.total);
    return sortedAssets.map(toWidgetItem);
  }, [tradableAssets]);

  const showLoadingState = items.length === 0 && (isLoading || isFetching);

  return <MyAssetsWidget items={items} isLoading={showLoadingState} error={error?.message} />;
}

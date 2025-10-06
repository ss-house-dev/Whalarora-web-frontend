import { useMemo } from 'react';
import { useGetAllAssets } from './useGetAllAssets';
import { useAllMarketPrices } from './useAllMarketPrices';
import { Asset as DonutAsset, DonutChartSummary } from '../types/donut-chart';
import { transformToDonut } from '../utils/donut-chart-utils';
import { Asset as BackendAsset } from '../types';

export const useDonutChartAssets = (): {
  donutData: DonutChartSummary;
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: assetsData,
    isLoading: isLoadingAssets,
    isError: isErrorAssets,
  } = useGetAllAssets();

  const assetSymbols = useMemo(() => {
    if (!assetsData) return [];
    return Array.from(new Set(assetsData.map((asset) => asset.symbol)));
  }, [assetsData]);

  const { prices, isLoading: isLoadingPrices } = useAllMarketPrices(assetSymbols);

  const transformedAssets = useMemo(() => {
    if (!assetsData || !prices) return [];

    return assetsData.map((backendAsset: BackendAsset) => {
      const currentPrice = prices[backendAsset.symbol]
        ? parseFloat(prices[backendAsset.symbol])
        : 0; // Default to 0 if price not found

      return {
        id: backendAsset._id,
        name: backendAsset.symbol, // Assuming symbol is the name for display
        amount: backendAsset.amount,
        currentPrice: currentPrice,
      } as DonutAsset;
    });
  }, [assetsData, prices]);

  const donutData = useMemo(() => {
    return transformToDonut(transformedAssets);
  }, [transformedAssets]);

  return {
    donutData,
    isLoading: isLoadingAssets || isLoadingPrices,
    isError: isErrorAssets,
  };
};

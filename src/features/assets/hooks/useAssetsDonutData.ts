import { useMemo } from 'react';
import { Asset, DonutChartSummary } from '../types/donut-chart';
import { transformToDonut } from '../utils/donut-chart-utils';

export const useAssetsDonutData = (assets: Asset[]): DonutChartSummary => {
  const donutData = useMemo(() => {
    return transformToDonut(assets);
  }, [assets]);

  return donutData;
};

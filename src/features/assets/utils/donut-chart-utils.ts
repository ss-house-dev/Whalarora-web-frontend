import { Asset, DonutChartData, DonutChartSummary } from '../types/donut-chart';

// Brand color palette for donut slices (dark to light)
const COLOR_PALETTE = [
  '#0E2864',
  '#215EEC',
  '#6930C3',
  '#715AFF',
  '#76B4FF',
  '#7FFFDB',
];
const OTHER_COLOR = '#7E7E7E';

export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const assetColorMap = new Map<string, string>();
let colorIndex = 0;

export const getAssetColor = (id: string): string => {
  if (id === 'Other') {
    return OTHER_COLOR;
  }
  if (!assetColorMap.has(id)) {
    assetColorMap.set(id, COLOR_PALETTE[colorIndex % COLOR_PALETTE.length]);
    colorIndex++;
  }
  return assetColorMap.get(id)!;
};

export const transformToDonut = (assets: Asset[]): DonutChartSummary => {
  const processedAssets = assets.reduce(
    (acc, asset) => {
      const holdingValue = asset.currentPrice * asset.amount;
      if (isNaN(holdingValue) || holdingValue <= 0) {
        return acc;
      }

      if (acc[asset.id]) {
        acc[asset.id].amount += asset.amount;
        acc[asset.id].currentPrice = asset.currentPrice;
      } else {
        acc[asset.id] = { ...asset };
      }
      return acc;
    },
    {} as Record<string, Asset>
  );

  let totalHoldingValue = 0;
  const calculatedAssets: (Asset & { holdingValue: number })[] = Object.values(processedAssets).map(
    (asset) => {
      const holdingValue = asset.currentPrice * asset.amount;
      totalHoldingValue += holdingValue;
      return { ...asset, holdingValue };
    }
  );

  if (totalHoldingValue === 0) {
    return { data: [], totalHoldingValue: 0 };
  }

  calculatedAssets.sort((a, b) => b.holdingValue - a.holdingValue);

  const donutData: DonutChartData[] = [];
  let otherHoldingValue = 0;
  const otherMembers: string[] = [];

  calculatedAssets.forEach((asset, index) => {
    if (index < 5) {
      donutData.push({
        id: asset.id,
        label: asset.name,
        value: asset.holdingValue,
        ratio: asset.holdingValue / totalHoldingValue,
        rank: index + 1,
        color: getAssetColor(asset.id),
      });
    } else {
      otherHoldingValue += asset.holdingValue;
      otherMembers.push(asset.name);
    }
  });

  if (otherHoldingValue > 0) {
    donutData.push({
      id: 'Other',
      label: 'Other',
      value: otherHoldingValue,
      ratio: otherHoldingValue / totalHoldingValue,
      rank: 6,
      color: getAssetColor('Other'),
      members: otherMembers,
    });
  }

  return {
    data: donutData,
    totalHoldingValue,
  };
};

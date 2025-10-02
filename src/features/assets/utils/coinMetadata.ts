export type CoinMetadata = {
  name: string;
  price: number;
};

const CACHE_DURATION = 5 * 60 * 1000;
const BASIC_NAME_MAP: Record<string, string> = {
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

let metadataCache: Record<string, CoinMetadata> = {};
let cacheTimestamp = 0;

interface CoinGeckoMarket {
  symbol: string;
  name: string;
  current_price: number;
}

const getUpperSymbol = (symbol: string | undefined | null) => {
  if (!symbol) return '';
  return symbol.trim().toUpperCase();
};

export const normalizeNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const getFallbackName = (symbol: string) => {
  const upper = getUpperSymbol(symbol);
  if (!upper) return '';
  return BASIC_NAME_MAP[upper] || upper;
};

export const getFallbackMetadata = (symbols: string[]): Record<string, CoinMetadata> => {
  return symbols.reduce<Record<string, CoinMetadata>>((acc, symbol) => {
    const upper = getUpperSymbol(symbol);
    if (!upper) return acc;

    acc[upper] = {
      name: getFallbackName(upper),
      price: 0,
    };

    return acc;
  }, {});
};

const shouldUseCache = (now: number) => {
  if (!cacheTimestamp) return false;
  return now - cacheTimestamp < CACHE_DURATION;
};

export const fetchCoinMetadata = async (
  symbols: string[]
): Promise<Record<string, CoinMetadata>> => {
  const normalizedSymbols = Array.from(
    new Set(
      symbols
        .map(getUpperSymbol)
        .filter((symbol): symbol is string => symbol.length > 0 && symbol !== 'CASH')
    )
  );

  if (normalizedSymbols.length === 0) {
    return {};
  }

  const now = Date.now();

  if (shouldUseCache(now)) {
    const cachedSubset = normalizedSymbols.reduce<Record<string, CoinMetadata>>(
      (acc, symbol) => {
        const cached = metadataCache[symbol];
        if (cached) {
          acc[symbol] = cached;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(cachedSubset).length === normalizedSymbols.length) {
      return cachedSubset;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const symbolList = normalizedSymbols.join(',');

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbolList}&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoMarket[] = await response.json();

    const nextMetadata = data.reduce<Record<string, CoinMetadata>>((acc, coin) => {
      const upper = getUpperSymbol(coin.symbol);
      if (!upper) return acc;

      acc[upper] = {
        name: coin.name || getFallbackName(upper),
        price: normalizeNumber(coin.current_price),
      };

      return acc;
    }, {});

    if (Object.keys(nextMetadata).length > 0) {
      metadataCache = {
        ...metadataCache,
        ...nextMetadata,
      };
      cacheTimestamp = now;
    }

    return nextMetadata;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching coin metadata from CoinGecko:', error);
    throw error;
  }
};

export const getCoinMetadataFromCache = (symbols: string[]) => {
  const normalizedSymbols = symbols.map(getUpperSymbol);

  return normalizedSymbols.reduce<Record<string, CoinMetadata>>((acc, symbol) => {
    if (!symbol) return acc;
    const cached = metadataCache[symbol];
    if (cached) {
      acc[symbol] = cached;
    }
    return acc;
  }, {});
};

export const resetCoinMetadataCache = () => {
  metadataCache = {};
  cacheTimestamp = 0;
};

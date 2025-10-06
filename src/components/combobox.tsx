'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectCoin } from './ui/select-coin';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import getVolume24h from '@/features/market-over-view/service/getVolume24h';
import { useSymbolPrecisions, getSymbolPrecision, formatAmountWithStep, formatPriceWithTick } from '@/features/trading/utils/symbolPrecision';

interface USDTPair {
  symbol: string;
  baseAsset: string;
}

interface BinanceSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

interface BinanceExchangeInfo {
  symbols: BinanceSymbol[];
}

interface CombinedComboboxProps {
  className?: string;
}

interface TickerData {
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

const BTCIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/bitcoin-icon.svg"
    alt="Bitcoin"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const ETHIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/ethereum-icon.svg"
    alt="Ethereum"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const BNBIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/bnb-coin.svg"
    alt="BNB"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const SOLIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/solana-icon.svg"
    alt="Solana"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const XRPIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/xrp-coin.svg"
    alt="XRP"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const ADAIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/ada-coin.svg"
    alt="Cardano"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const DOGEIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/doge-coin.svg"
    alt="Dogecoin"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const DefaultIcon = ({ size = 28 }: { size?: number }) => (
  <Image
    src="/currency-icons/default-coin.svg"
    alt="Default Coin"
    width={size}
    height={size}
    className="rounded-full"
  />
);

const binanceCoins = [
  {
    value: 'BINANCE:BTCUSDT',
    label: 'BTC/USDT',
    icon: <BTCIcon />,
    popoverIcon: <BTCIcon size={20} />,
  },
  {
    value: 'BINANCE:ETHUSDT',
    label: 'ETH/USDT',
    icon: <ETHIcon />,
    popoverIcon: <ETHIcon size={20} />,
  },
  {
    value: 'BINANCE:BNBUSDT',
    label: 'BNB/USDT',
    icon: <BNBIcon />,
    popoverIcon: <BNBIcon size={20} />,
  },
  {
    value: 'BINANCE:SOLUSDT',
    label: 'SOL/USDT',
    icon: <SOLIcon />,
    popoverIcon: <SOLIcon size={20} />,
  },
  {
    value: 'BINANCE:XRPUSDT',
    label: 'XRP/USDT',
    icon: <XRPIcon />,
    popoverIcon: <XRPIcon size={20} />,
  },
  {
    value: 'BINANCE:ADAUSDT',
    label: 'ADA/USDT',
    icon: <ADAIcon />,
    popoverIcon: <ADAIcon size={20} />,
  },
  {
    value: 'BINANCE:DOGEUSDT',
    label: 'DOGE/USDT',
    icon: <DOGEIcon />,
    popoverIcon: <DOGEIcon size={20} />,
  },
];

// Format helpers for consistent display
const formatPrice = (value: number): string => {
  if (value >= 1000) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (value >= 1) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  } else if (value >= 0.01) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  } else {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    });
  }
};

const formatVolume = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const SNAPSHOT_REFRESH_MS = 5000;

export function CombinedCombobox({ className = '' }: CombinedComboboxProps) {
  const { selectedCoin, setSelectedCoin } = useCoinContext();
  const [open, setOpen] = React.useState(false);
  const [pairs, setPairs] = React.useState<USDTPair[]>([]);
  const [loadingPairs, setLoadingPairs] = React.useState<boolean>(true);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const listRef = React.useRef<HTMLDivElement>(null);
  const [tickerData, setTickerData] = React.useState<TickerData | null>(null);

  const [volume24h, setVolume24h] = React.useState<{ amount: number | null; usdt: number | null }>(() => ({
    amount: null,
    usdt: null,
  }));
  const { data: symbolPrecisionMap } = useSymbolPrecisions();
  const baseAssetSymbol = React.useMemo(() => {
    const [labelBase] = selectedCoin.label.split('/');
    if (labelBase) {
      return labelBase.trim();
    }

    const valueWithoutPrefix = selectedCoin.value.replace('BINANCE:', '').toUpperCase();
    if (!valueWithoutPrefix) {
      return '';
    }

    if (valueWithoutPrefix.endsWith('USDT')) {
      return valueWithoutPrefix.slice(0, -4);
    }

    return valueWithoutPrefix;
  }, [selectedCoin.label, selectedCoin.value]);


  const fetchUSDTPairs = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const data: BinanceExchangeInfo = await response.json();
      const usdtPairs: USDTPair[] = data.symbols
        .filter((symbol) => symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING')
        .map((symbol) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
        }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));
      setPairs(usdtPairs);
      try {
        localStorage.setItem('wl_usdtPairs_v1', JSON.stringify(usdtPairs));
      } catch {}
    } catch (err) {
      console.error('Error fetching USDT pairs:', err);
    }
    setLoadingPairs(false);
  };

  React.useEffect(() => {
    try {
      const cached = localStorage.getItem('wl_usdtPairs_v1');
      if (cached) {
        const parsed = JSON.parse(cached) as USDTPair[];
        if (Array.isArray(parsed) && parsed.length) {
          setPairs(parsed);
          setLoadingPairs(false);
        }
      }
    } catch {}
    fetchUSDTPairs();
  }, []);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchValue]);
  React.useEffect(() => {
    if (!selectedCoin.value) {
      setTickerData(null);
      return;
    }

    let isActive = true;
    const cleanSymbol = selectedCoin.value.replace('BINANCE:', '');
    const lowerSymbol = cleanSymbol.toLowerCase();

    setTickerData(null);

    const applyTickerUpdate = (
      payload: {
        lastPrice?: string | number;
        highPrice?: string | number;
        lowPrice?: string | number;
        volume?: string | number;
        quoteVolume?: string | number;
        c?: string;
        h?: string;
        l?: string;
        v?: string;
        q?: string;
      },
      options: { includeVolumes?: boolean } = {}
    ) => {
      const { includeVolumes = true } = options;

      const lastPrice = Number(payload.lastPrice ?? payload.c);
      const highPrice = Number(payload.highPrice ?? payload.h);
      const lowPrice = Number(payload.lowPrice ?? payload.l);

      if (
        !Number.isFinite(lastPrice) ||
        !Number.isFinite(highPrice) ||
        !Number.isFinite(lowPrice)
      ) {
        return;
      }

      const volumeRaw = Number(payload.volume ?? payload.v);
      const quoteVolumeRaw = Number(payload.quoteVolume ?? payload.q);
      const formattedVolume = Number.isFinite(volumeRaw) ? formatVolume(volumeRaw) : null;
      const formattedQuoteVolume = Number.isFinite(quoteVolumeRaw)
        ? formatVolume(quoteVolumeRaw)
        : null;

      if (includeVolumes && formattedVolume && formattedQuoteVolume) {
        const next: TickerData = {
          lastPrice: formatPrice(lastPrice),
          highPrice: formatPrice(highPrice),
          lowPrice: formatPrice(lowPrice),
          volume: formattedVolume,
          quoteVolume: formattedQuoteVolume,
        };

        setTickerData((prev) => {
          if (
            prev &&
            prev.lastPrice === next.lastPrice &&
            prev.highPrice === next.highPrice &&
            prev.lowPrice === next.lowPrice &&
            prev.volume === next.volume &&
            prev.quoteVolume === next.quoteVolume
          ) {
            return prev;
          }

          return next;
        });

        return;
      }

      setTickerData((prev) => {
        const next: TickerData = {
          lastPrice: formatPrice(lastPrice),
          highPrice: formatPrice(highPrice),
          lowPrice: formatPrice(lowPrice),
          volume: prev?.volume ?? '--',
          quoteVolume: prev?.quoteVolume ?? '--',
        };

        if (
          prev &&
          prev.lastPrice === next.lastPrice &&
          prev.highPrice === next.highPrice &&
          prev.lowPrice === next.lowPrice &&
          prev.volume === next.volume &&
          prev.quoteVolume === next.quoteVolume
        ) {
          return prev;
        }

        return next;
      });
    };

    const fetchTickerSnapshot = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`,
          {
            cache: 'no-store',
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch ticker: ${response.status}`);
        }
        const data = await response.json();
        if (!isActive) return;
        applyTickerUpdate(data);
      } catch (error) {
        console.error('Error fetching ticker snapshot:', error);
      }
    };

    fetchTickerSnapshot();

    const snapshotInterval = window.setInterval(() => {
      if (!isActive) return;
      fetchTickerSnapshot();
    }, SNAPSHOT_REFRESH_MS);

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${lowerSymbol}@ticker`);

    ws.onopen = () => {
      console.log('WebSocket connected for', lowerSymbol);
    };

    ws.onmessage = (event) => {
      if (!isActive) {
        return;
      }
      const data = JSON.parse(event.data);
      applyTickerUpdate(data, { includeVolumes: false });
    };

    return () => {
      isActive = false;
      window.clearInterval(snapshotInterval);
      ws.close();
    };
  }, [selectedCoin.value]);

  React.useEffect(() => {
    if (!baseAssetSymbol) {
      setVolume24h((prev) => {
        if (prev.amount === null && prev.usdt === null) {
          return prev;
        }
        return { amount: null, usdt: null };
      });
      return;
    }

    let isActive = true;

    const fetchVolume = async () => {
      try {
        const data = await getVolume24h(baseAssetSymbol);
        if (!isActive) {
          return;
        }

        const amountValueRaw = Number(data.volumeAmount);
        const usdtValueRaw = Number(data.volumeUSDT);

        const amountValue = Number.isFinite(amountValueRaw) ? amountValueRaw : null;
        const usdtValue = Number.isFinite(usdtValueRaw) ? usdtValueRaw : null;

        setVolume24h((prev) => {
          if (prev.amount === amountValue && prev.usdt === usdtValue) {
            return prev;
          }

          return {
            amount: amountValue,
            usdt: usdtValue,
          };
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Error fetching 24h volume:', error);

        setVolume24h((prev) => {
          if (prev.amount === null && prev.usdt === null) {
            return prev;
          }

          return { amount: null, usdt: null };
        });
      }
    };

    void fetchVolume();

    const intervalId = window.setInterval(fetchVolume, SNAPSHOT_REFRESH_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [baseAssetSymbol]);

  const allCoins = pairs.map((pair) => {
    const matchedCoin = binanceCoins.find((coin) => coin.value === `BINANCE:${pair.symbol}`);
    return {
      value: `BINANCE:${pair.symbol}`,
      label: `${pair.baseAsset}/USDT`,
      icon: matchedCoin ? matchedCoin.icon : <DefaultIcon />,
      popoverIcon: matchedCoin ? matchedCoin.popoverIcon : <DefaultIcon size={20} />,
    };
  });

  const priorityCoins = [
    'BINANCE:ADAUSDT',
    'BINANCE:BNBUSDT',
    'BINANCE:BTCUSDT',
    'BINANCE:DOGEUSDT',
    'BINANCE:ETHUSDT',
    'BINANCE:SOLUSDT',
    'BINANCE:XRPUSDT',
  ];

  const coins = searchValue
    ? allCoins.filter((coin) => coin.label.toLowerCase().startsWith(searchValue.toLowerCase()))
    : (() => {
        const priority = allCoins.filter((coin) => priorityCoins.includes(coin.value));
        const others = allCoins.filter((coin) => !priorityCoins.includes(coin.value));
        const sortedPriority = priorityCoins
          .map((value) => priority.find((coin) => coin.value === value))
          .filter((coin): coin is NonNullable<typeof coin> => coin !== undefined);
        return [...sortedPriority, ...others.slice(0, 13)];
      })();

  const selectedCoinData =
    allCoins.find((coin) => coin.value === selectedCoin.value) || selectedCoin;

  const symbolPrecision = React.useMemo(() => {
    if (!symbolPrecisionMap || !baseAssetSymbol) {
      return undefined;
    }
    return getSymbolPrecision(symbolPrecisionMap, baseAssetSymbol, 'USDT');
  }, [symbolPrecisionMap, baseAssetSymbol]);

  const formattedVolumeAmount = React.useMemo(() => {
    if (volume24h.amount === null) {
      return '--';
    }
    const formatted = formatAmountWithStep(volume24h.amount, symbolPrecision, {
      fallbackDecimals: 6,
    });
    return formatted || volume24h.amount.toString();
  }, [volume24h.amount, symbolPrecision]);

  const formattedVolumeUsdt = React.useMemo(() => {
    if (volume24h.usdt === null) {
      return '--';
    }
    const formatted = formatPriceWithTick(volume24h.usdt, symbolPrecision, {
      fallbackDecimals: 2,
    });
    return formatted || volume24h.usdt.toString();
  }, [volume24h.usdt, symbolPrecision]);

  const volumeSymbolLabel = baseAssetSymbol || selectedCoinData.label.split('/')[0] || '--';

  return (
    <div
      className={cn(
        'bg-[#16171D] h-[60px] w-full max-w-[900px] flex items-center rounded-[12px]',
        className
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SelectCoin
            role="combobox"
            aria-expanded={open}
            className="h-[60px] py-[12px] px-[12px] justify-between text-[18px] sm:text-[16px] md:text-[18px] font-[500] bg-transparent cursor-pointer border-0 min-w-fit flex-1 sm:flex-initial"
          >
            <div className="flex items-center gap-2">
              <div className="w-[28px] h-[28px] sm:w-[24px] sm:h-[24px] md:w-[28px] md:h-[28px]">
                {selectedCoinData.icon}
              </div>
              <span className="whitespace-nowrap">{selectedCoinData.label}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              className="ml-2 flex-shrink-0"
            >
              <path
                d="M5.00002 7.23207L0.150879 2.38407L1.76802 0.768066L5.00002 4.00007L8.23202 0.768066L9.84916 2.38407L5.00002 7.23207Z"
                fill="white"
              />
            </svg>
          </SelectCoin>
        </PopoverTrigger>
        <PopoverContent
          className="w-[174px] p-0 border-0 bg-transparent"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command>
            <CommandInput value={searchValue} onValueChange={setSearchValue} />
            <CommandList ref={listRef} className="max-h-[280px]">
              <CommandEmpty>{loadingPairs ? 'Loading coins...' : 'Coin not found'}</CommandEmpty>
              <CommandGroup>
                {coins.map((coin) => (
                  <CommandItem
                    key={coin.value}
                    value={coin.value}
                    onSelect={() => {
                      setSelectedCoin({
                        value: coin.value,
                        label: coin.label,
                        icon: coin.icon,
                        popoverIcon: coin.popoverIcon,
                      });
                      setSearchValue('');
                      setOpen(false);
                    }}
                    className={cn(
                      'flex items-center justify-between rounded-[8px] w-[180px] h-[40px] mx-[4px]',
                      selectedCoin.value === coin.value && 'bg-[#323338]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {coin.popoverIcon}
                      <span>{coin.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="3"
        height="36"
        viewBox="0 0 3 36"
        fill="none"
        className="flex-shrink-0"
      >
        <path d="M1.69824 1V35" stroke="#474747" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="flex items-center flex-1 min-w-0 sm:justify-start justify-end">
        <div className="text-[#2FACA2] text-xl whitespace-nowrap flex-shrink-0 min-w-[150px] text-center">
          {tickerData ? tickerData.lastPrice : '--'}
        </div>
        <div className="flex flex-row gap-6">
          <div className="hidden sm:flex flex-col items-start flex-shrink-0 min-w-0">
            <span className="text-[#7E7E7E] text-xs whitespace-nowrap">24h High</span>
            <span className="text-white text-sm font-medium whitespace-nowrap">
              {tickerData ? tickerData.highPrice : '--'}
            </span>
          </div>

          <div className="hidden sm:flex flex-col items-start flex-shrink-0 min-w-0">
            <span className="text-[#7E7E7E] text-xs whitespace-nowrap">24h Low</span>
            <span className="text-white text-sm font-medium whitespace-nowrap ">
              {tickerData ? tickerData.lowPrice : '--'}
            </span>
          </div>

          <div className="hidden xl:flex flex-col items-start flex-shrink-0 min-w-0">
            <span className="text-[#7E7E7E] text-xs whitespace-nowrap">
              24h Vol ({volumeSymbolLabel})
            </span>
            <span className="text-white text-sm">{formattedVolumeAmount}</span>
          </div>

          <div className="hidden xl:flex flex-col items-start flex-shrink-0 min-w-0">
            <span className="text-[#8B8E93] text-xs whitespace-nowrap">24h Vol (USDT)</span>
            <span className="text-white text-sm">{formattedVolumeUsdt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

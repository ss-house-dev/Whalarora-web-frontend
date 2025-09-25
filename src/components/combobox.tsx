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

export function CombinedCombobox({ className = '' }: CombinedComboboxProps) {
  const { selectedCoin, setSelectedCoin, marketPrice, isPriceLoading } = useCoinContext();
  const [open, setOpen] = React.useState(false);
  const [pairs, setPairs] = React.useState<USDTPair[]>([]);
  const [loadingPairs, setLoadingPairs] = React.useState<boolean>(true);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const listRef = React.useRef<HTMLDivElement>(null);

  const fetchUSDTPairs = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const data = (await response.json()) as BinanceExchangeInfo;
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
      console.error('Error:', err);
    }
    setLoadingPairs(false);
  };

  React.useEffect(() => {
    // hydrate from cache for instant list
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
    // fetch latest in background
    fetchUSDTPairs();
  }, []);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchValue]);

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

  const displayPrice = React.useMemo(() => {
    if (isPriceLoading) return '--';
    return marketPrice && marketPrice.trim().length > 0 ? marketPrice : '--';
  }, [isPriceLoading, marketPrice]);

  return (
    <div
      className={cn(
        'bg-[#16171D] w-full rounded-[12px] px-4 py-4 flex flex-col gap-4 lg:h-[60px] lg:flex-row lg:items-center lg:justify-between lg:px-0 lg:py-0',
        className
      )}
    >
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-0">
        <div className="flex w-full flex-col gap-3 px-0 lg:w-auto lg:flex-none lg:flex-row lg:items-center lg:gap-0 lg:px-[12px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <SelectCoin
                role="combobox"
                aria-expanded={open}
                className="h-[56px] w-full justify-between rounded-[12px] border-0 bg-transparent px-[12px] py-[12px] text-[18px] font-[500] lg:h-[60px] lg:w-[260px]"
              >
                <div className="flex items-center gap-2">
                  {selectedCoinData.icon}
                  <span>{selectedCoinData.label}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M5.00002 7.23207L0.150879 2.38407L1.76802 0.768066L5.00002 4.00007L8.23202 0.768066L9.84916 2.38407L5.00002 7.23207Z"
                    fill="white"
                  />
                </svg>
              </SelectCoin>
            </PopoverTrigger>
            <PopoverContent
              className="w-[240px] max-w-[90vw] p-0 border-0 bg-transparent"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <Command>
                <CommandInput value={searchValue} onValueChange={setSearchValue} />
                <CommandList ref={listRef} className="max-h-[280px]">
                  <CommandEmpty>{loadingPairs ? 'Loading coins…' : 'Coin not found'}</CommandEmpty>
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
                          'mx-[4px] flex h-[40px] w-full items-center justify-between rounded-[8px] px-2',
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

          <div className="flex w-full items-center justify-between px-1 lg:hidden">
            <span className="text-xs text-[#8B8E93]">Last price</span>
            <span className="text-lg font-semibold text-[#00D4AA]">{displayPrice}</span>
          </div>
        </div>

        <div className="hidden items-center lg:flex lg:flex-1 lg:border-l lg:border-[#474747] lg:px-6">
          <div className="mr-6 text-[20px] font-[400] text-[#00D4AA]">{displayPrice}</div>
          <div className="mr-6 flex flex-col items-start">
            <span className="text-xs text-[#8B8E93]">24h High</span>
            <span className="text-sm font-medium text-white">--</span>
          </div>
          <div className="mr-6 flex flex-col items-start">
            <span className="text-xs text-[#8B8E93]">24h Low</span>
            <span className="text-sm font-medium text-white">--</span>
          </div>
          <div className="mr-6 flex flex-col items-start">
            <span className="text-xs text-[#8B8E93]">24h Volume (BTC)</span>
            <span className="text-sm font-medium text-white">--</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-[#8B8E93]">24h Volume (USDT)</span>
            <span className="text-sm font-medium text-white">--</span>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 px-1 text-xs text-[#8B8E93] lg:hidden">
        <div className="flex flex-col">
          <span>24h High</span>
          <span className="text-sm font-medium text-white">--</span>
        </div>
        <div className="flex flex-col text-right">
          <span>24h Low</span>
          <span className="text-sm font-medium text-white">--</span>
        </div>
        <div className="flex flex-col">
          <span>Volume (BTC)</span>
          <span className="text-sm font-medium text-white">--</span>
        </div>
        <div className="flex flex-col text-right">
          <span>Volume (USDT)</span>
          <span className="text-sm font-medium text-white">--</span>
        </div>
      </div>
    </div>
  );
}

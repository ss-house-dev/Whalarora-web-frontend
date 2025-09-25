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
        'flex h-[56px] w-full items-center gap-3 rounded-[12px] bg-[#16171D] px-3 sm:h-[60px] sm:gap-4 sm:px-4',
        className
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SelectCoin
            role="combobox"
            aria-expanded={open}
            variant="ghost"
            className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-[12px] border-0 bg-transparent px-0 text-[16px] font-semibold text-white hover:bg-transparent focus-visible:ring-0 sm:text-[18px]"
          >
            <div className="flex min-w-0 items-center gap-2">
              {selectedCoinData.icon}
              <span className="truncate">{selectedCoinData.label}</span>
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
          className="w-[260px] max-w-[90vw] border-0 bg-transparent p-0"
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
                      'mx-[4px] flex h-[40px] w-full items-center justify-between rounded-[8px] px-2',
                      selectedCoin.value === coin.value && 'bg-[#323338]'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {coin.popoverIcon}
                      <span className="truncate">{coin.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="h-6 w-px flex-shrink-0 bg-[#2B2C33] sm:h-8" />
      <div className="flex-shrink-0 text-[16px] font-semibold text-[#00D4AA] sm:text-[20px]">
        --
      </div>
    </div>
  );
}

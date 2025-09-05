"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectCoin } from "./select-coin";
import { useCoinContext } from "@/features/trading/contexts/CoinContext";

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
    value: "BINANCE:BTCUSDT",
    label: "BTC/USDT",
    icon: <BTCIcon />,
    popoverIcon: <BTCIcon size={20} />,
  },
  {
    value: "BINANCE:ETHUSDT",
    label: "ETH/USDT",
    icon: <ETHIcon />,
    popoverIcon: <ETHIcon size={20} />,
  },
  {
    value: "BINANCE:BNBUSDT",
    label: "BNB/USDT",
    icon: <BNBIcon />,
    popoverIcon: <BNBIcon size={20} />,
  },
  {
    value: "BINANCE:SOLUSDT",
    label: "SOL/USDT",
    icon: <SOLIcon />,
    popoverIcon: <SOLIcon size={20} />,
  },
  {
    value: "BINANCE:XRPUSDT",
    label: "XRP/USDT",
    icon: <XRPIcon />,
    popoverIcon: <XRPIcon size={20} />,
  },
  {
    value: "BINANCE:ADAUSDT",
    label: "ADA/USDT",
    icon: <ADAIcon />,
    popoverIcon: <ADAIcon size={20} />,
  },
  {
    value: "BINANCE:DOGEUSDT",
    label: "DOGE/USDT",
    icon: <DOGEIcon />,
    popoverIcon: <DOGEIcon size={20} />,
  },
];

export function CombinedCombobox({ className = "" }: CombinedComboboxProps) {
  const { selectedCoin, setSelectedCoin } = useCoinContext();
  const [open, setOpen] = React.useState(false);
  const [pairs, setPairs] = React.useState<USDTPair[]>([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const fetchUSDTPairs = async () => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/exchangeInfo"
      );
      const data = (await response.json()) as BinanceExchangeInfo;
      const usdtPairs: USDTPair[] = data.symbols
        .filter(
          (symbol) =>
            symbol.quoteAsset === "USDT" && symbol.status === "TRADING"
        )
        .map((symbol) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
        }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));
      setPairs(usdtPairs);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  React.useEffect(() => {
    fetchUSDTPairs();
  }, []);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchValue]);

  const allCoins = pairs.map((pair) => {
    const matchedCoin = binanceCoins.find(
      (coin) => coin.value === `BINANCE:${pair.symbol}`
    );
    return {
      value: `BINANCE:${pair.symbol}`,
      label: `${pair.baseAsset}/USDT`,
      icon: matchedCoin ? matchedCoin.icon : <DefaultIcon />,
      popoverIcon: matchedCoin ? (
        matchedCoin.popoverIcon
      ) : (
        <DefaultIcon size={20} />
      ),
    };
  });

  const priorityCoins = [
    "BINANCE:ADAUSDT",
    "BINANCE:BNBUSDT",
    "BINANCE:BTCUSDT",
    "BINANCE:DOGEUSDT",
    "BINANCE:ETHUSDT",
    "BINANCE:SOLUSDT",
    "BINANCE:XRPUSDT",
  ];

  const coins = searchValue
    ? allCoins.filter((coin) =>
        coin.label.toLowerCase().startsWith(searchValue.toLowerCase())
      )
    : (() => {
        const priority = allCoins.filter((coin) =>
          priorityCoins.includes(coin.value)
        );
        const others = allCoins.filter(
          (coin) => !priorityCoins.includes(coin.value)
        );
        const sortedPriority = priorityCoins
          .map((value) => priority.find((coin) => coin.value === value))
          .filter(
            (coin): coin is NonNullable<typeof coin> => coin !== undefined
          );
        return [...sortedPriority, ...others.slice(0, 13)];
      })();

  const selectedCoinData =
    allCoins.find((coin) => coin.value === selectedCoin.value) || selectedCoin;

  return (
    <div
      className={`bg-[#16171D] h-[60px] w-[900px] flex items-center rounded-[12px] ${className}`}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SelectCoin
            role="combobox"
            aria-expanded={open}
            className="h-[60px] py-[12px] px-[12px] justify-between text-[18px] font-[500] bg-transparent cursor-pointer border-0"
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
          className="w-[174px] p-0 border-0 bg-transparent"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command>
            <CommandInput value={searchValue} onValueChange={setSearchValue} />
            <CommandList ref={listRef} className="max-h-[280px]">
              <CommandEmpty>Coin not found</CommandEmpty>
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
                      setSearchValue("");
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-[8px] w-[180px] h-[40px] mx-[4px]",
                      selectedCoin.value === coin.value && "bg-[#323338]"
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
      >
        <path
          d="M1.69824 1V35"
          stroke="#474747"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex items-center px-4 flex-1">
        <div className="text-[#00D4AA] font-[400] text-[20px] mr-6">
          --
        </div>
        <div className="flex flex-col items-start mr-6">
          <span className="text-[#8B8E93] text-xs">24h High</span>
          <span className="text-white text-sm font-medium">--</span>
        </div>
        <div className="flex flex-col items-start mr-6">
          <span className="text-[#8B8E93] text-xs">24h Low</span>
          <span className="text-white text-sm font-medium">--</span>
        </div>
        <div className="flex flex-col items-start mr-6">
          <span className="text-[#8B8E93] text-xs">24h Volume (BTC)</span>
          <span className="text-white text-sm font-medium">--</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[#8B8E93] text-xs">24h Volume (USDT)</span>
          <span className="text-white text-sm font-medium">--</span>
        </div>
      </div>
    </div>
  );
}

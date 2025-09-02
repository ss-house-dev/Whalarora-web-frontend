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

interface USDTPair {
  symbol: string;
  baseAsset: string;
}

interface ExampleComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

const BTCIcon = () => (
  <Image
    src="/currency-icons/bitcoin-icon.svg"
    alt="Bitcoin"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const ETHIcon = () => (
  <Image
    src="/currency-icons/ethereum-icon.svg"
    alt="Ethereum"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const BNBIcon = () => (
  <Image
    src="/currency-icons/bnb-coin.svg"
    alt="BNB"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const SOLIcon = () => (
  <Image
    src="/currency-icons/solana-icon.svg"
    alt="Solana"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const XRPIcon = () => (
  <Image
    src="/currency-icons/xrp-coin.svg"
    alt="XRP"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const ADAIcon = () => (
  <Image
    src="/currency-icons/ada-coin.svg"
    alt="Cardano"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const DOGEIcon = () => (
  <Image
    src="/currency-icons/doge-coin.svg"
    alt="Dogecoin"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const DefaultIcon = () => (
  <Image
    src="/currency-icons/default-coin.svg"
    alt="Default Coin"
    width={28}
    height={28}
    className="rounded-full"
  />
);

const binanceCoins = [
  {
    value: "BINANCE:BTCUSDT",
    label: "BTC/USDT",
    icon: <BTCIcon />,
  },
  {
    value: "BINANCE:ETHUSDT",
    label: "ETH/USDT",
    icon: <ETHIcon />,
  },
  {
    value: "BINANCE:BNBUSDT",
    label: "BNB/USDT",
    icon: <BNBIcon />,
  },
  {
    value: "BINANCE:SOLUSDT",
    label: "SOL/USDT",
    icon: <SOLIcon />,
  },
  {
    value: "BINANCE:XRPUSDT",
    label: "XRP/USDT",
    icon: <XRPIcon />,
  },
  {
    value: "BINANCE:ADAUSDT",
    label: "ADA/USDT",
    icon: <ADAIcon />,
  },
   {
    value: "BINANCE:DOGEUSDT",
    label: "DOGE/USDT",
    icon: <DOGEIcon />,
  },
];

export function ExampleCombobox({
  value,
  onValueChange,
}: ExampleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [pairs, setPairs] = React.useState<USDTPair[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  // Fetch USDT pairs from Binance
  const fetchUSDTPairs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/exchangeInfo"
      );
      const data = await response.json();
      const usdtPairs: USDTPair[] = (data.symbols as any[])
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
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUSDTPairs();
  }, []);

  const coins = pairs.map((pair) => {
    const matchedCoin = binanceCoins.find(
      (coin) => coin.value === `BINANCE:${pair.symbol}`
    );
    return {
      value: `BINANCE:${pair.symbol}`,
      label: `${pair.baseAsset}/USDT`,
      icon: matchedCoin ? matchedCoin.icon : <DefaultIcon />,
    };
  });

  const selectedCoin = coins.find((coin) => coin.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SelectCoin
          role="combobox"
          aria-expanded={open}
          className="w-[174px] h-[48px] py-[12px] px-[12px] justify-between text-[16px] font-[600] bg-[#16171D] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {selectedCoin && selectedCoin.icon}
            <span>{selectedCoin ? selectedCoin.label : "Select Coin"}</span>
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
          <CommandInput placeholder="Search coin..." />
          <CommandList>
            <CommandEmpty>No coin found.</CommandEmpty>
            <CommandGroup>
              {coins.map((coin) => (
                <CommandItem
                  key={coin.value}
                  value={coin.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    onValueChange(newValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-[8px]",
                    value === coin.value && "bg-[#323338]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {coin.icon}
                    <span>{coin.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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

/**
 * Represents a trading pair with USDT as the quote asset.
 */
interface USDTPair {
  symbol: string;
  baseAsset: string;
}

/**
 * Props for the example combobox component.
 */
interface ExampleComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Bitcoin icon component.
 * @param param0 - The props for the component.
 * @returns The Bitcoin icon.
 */
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

/**
 * Represents a trading pair on Binance.
 */
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

/**
 * Example combobox component.
 * @param param0 - The props for the component.
 * @returns The example combobox.
 */
export function ExampleCombobox({
  value,
  onValueChange,
}: ExampleComboboxProps) {
  /**
   * Combobox open state.
   * Controls the visibility of the combobox.
   */
  const [open, setOpen] = React.useState(false);
  /**
   * Combobox options.
   * Represents the available trading pairs for the combobox.
   */
  const [pairs, setPairs] = React.useState<USDTPair[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const listRef = React.useRef<HTMLDivElement>(null);

  /**
   * Fetch USDT pairs from Binance API.
   * This function retrieves the trading pairs for USDT from the Binance API
   * and updates the component state with the fetched pairs.
   */
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

  /**
   * Fetch USDT pairs from Binance API.
   */
  React.useEffect(() => {
    fetchUSDTPairs();
  }, []);

  /**
   * Reset scroll position when search value changes
   */
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchValue]);

  /**
   * Map USDT pairs to coin objects.
   * This function takes the USDT pairs and maps them to the corresponding coin objects
   * defined in the binanceCoins array.
   */
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

  // Filter coins based on search value, if no search show first 20
  const coins = searchValue 
    ? allCoins
        .filter(coin => 
          coin.label.toLowerCase().startsWith(searchValue.toLowerCase())
        )
        .sort((a, b) => a.label.localeCompare(b.label))
    : allCoins.slice(0, 20);

  /**
   * Find the selected coin based on the current value.
   */
  const selectedCoin = allCoins.find((coin) => coin.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SelectCoin
          role="combobox"
          aria-expanded={open}
          className="w-[174px] h-[60px] py-[12px] px-[12px] justify-between text-[18px] font-[500] bg-[#16171D] cursor-pointer"
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
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList ref={listRef} className="max-h-[280px]">
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
                    "flex items-center justify-between rounded-[8px] w-[180px] h-[40px] mx-[4px]",
                    value === coin.value && "bg-[#323338]"
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
  );
}
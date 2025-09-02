"use client";

import * as React from "react";
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

const binanceCoins = [
  {
    value: "BINANCE:BTCUSDT",
    label: "BTC/USDT",
  },
  {
    value: "BINANCE:ETHUSDT",
    label: "ETH/USDT",
  },
  {
    value: "BINANCE:BNBUSDT",
    label: "BNB/USDT",
  },
  {
    value: "BINANCE:ADAUSDT",
    label: "ADA/USDT",
  },
  {
    value: "BINANCE:XRPUSDT",
    label: "XRP/USDT",
  },
];

interface ExampleComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ExampleCombobox({
  value,
  onValueChange,
}: ExampleComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SelectCoin
          role="combobox"
          aria-expanded={open}
          className="w-[174px] h-[48px] py-[12px] px-[12px] justify-between text-[16px] font-[600] bg-[#16171D] cursor-pointer"
        >
          {value
            ? binanceCoins.find((coin) => coin.value === value)?.label
            : "Select Coin"}
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
          <CommandInput />
          <CommandList>
            <CommandEmpty>No coin found.</CommandEmpty>
            <CommandGroup>
              {binanceCoins.map((coin) => (
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
                  <span>{coin.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

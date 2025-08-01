"use client";
import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between h-15 bg-[#3A8AF7] text-white font-semibold text-md border-[#3A8AF7] hover:bg-[rgba(58,138,247,0.9)] hover:text-white cursor-pointer"
          style={{ borderRadius: "12px 12px 0 12px" }}
        >
          {value
            ? binanceCoins.find((coin) => coin.value === value)?.label
            : "Select Coin"}
          <ChevronsUpDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No coin found.</CommandEmpty>
            <CommandGroup>
              {binanceCoins.map((coin) => (
                <CommandItem
                  key={coin.value}
                  value={coin.value}
                  className="cursor-pointer transition-colors duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1F4293";
                    e.currentTarget.style.color = "white";
                    // เปลี่ยนสี CheckIcon เป็นสีขาว
                    const checkIcon = e.currentTarget.querySelector("svg");
                    if (checkIcon) {
                      checkIcon.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                    // เปลี่ยนสี CheckIcon กลับเป็นสีเดิม
                    const checkIcon = e.currentTarget.querySelector("svg");
                    if (checkIcon) {
                      checkIcon.style.color = "";
                    }
                  }}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    onValueChange(newValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === coin.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {coin.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

  );
}

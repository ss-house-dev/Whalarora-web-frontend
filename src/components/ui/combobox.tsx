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

// Bitcoin Icon
const BTCIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <g clipPath="url(#clip0_4101_19459)">
      <path d="M28 14C28 16.7689 27.1789 19.4757 25.6406 21.778C24.1022 24.0803 21.9157 25.8747 19.3576 26.9343C16.7994 27.9939 13.9845 28.2712 11.2687 27.731C8.55301 27.1908 6.05845 25.8574 4.10051 23.8995C2.14258 21.9416 0.809205 19.447 0.269012 16.7313C-0.271181 14.0155 0.00606592 11.2006 1.06569 8.64243C2.12532 6.08427 3.91973 3.89777 6.22202 2.35943C8.52431 0.821086 11.2311 0 14 0C17.713 0 21.274 1.475 23.8995 4.1005C26.525 6.72601 28 10.287 28 14Z" fill="#F7931A"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M9.95034 6.39295L13.1678 7.25458L13.8869 4.57422L15.4956 5.01076L14.8045 7.5804L16.1167 7.93295L16.8091 5.33531L18.4458 5.77313L17.7407 8.38476C17.7407 8.38476 20.4134 8.97658 21.0422 11.1504C21.6709 13.3242 19.66 14.4659 19.0389 14.5091C19.0389 14.5091 21.3807 15.7933 20.5763 18.3197C19.772 20.846 17.3029 21.2979 14.7053 20.7188L14.0002 23.4271L12.3634 22.9893L13.0825 20.3229L11.7843 19.9691L11.0653 22.6546L9.44125 22.218L10.1616 19.5453L6.85889 18.6544L7.69125 16.8064C7.69125 16.8064 8.62289 17.0609 8.97543 17.1449C9.32798 17.2289 9.55452 16.8624 9.6538 16.4959C9.75307 16.1293 11.2485 10.0546 11.3898 9.5544C11.5311 9.05422 11.4738 8.66349 10.8807 8.50949C10.2876 8.35549 9.4807 8.11495 9.4807 8.11495L9.95034 6.39295ZM13.1958 14.4379L12.3049 17.9799C12.3049 17.9799 16.7225 19.5746 17.2876 17.3308C17.8527 15.0869 13.1958 14.4379 13.1958 14.4379ZM13.6056 12.7579L14.48 9.5124C14.48 9.5124 18.2625 10.1895 17.7967 11.9955C17.3309 13.8015 15.1011 13.1091 13.6056 12.7579Z" fill="white"/>
    </g>
    <defs>
      <clipPath id="clip0_4101_19459">
        <rect width="28" height="28" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Ethereum Icon
const ETHIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#627EEA"/>
    <path d="M14.3733 3.5L14.2167 4.02833V18.0933L14.3733 18.25L21 14.3267L14.3733 3.5Z" fill="white" fillOpacity="0.602"/>
    <path d="M14.3733 3.5L7.75 14.3267L14.3733 18.25V11.375V3.5Z" fill="white"/>
    <path d="M14.3733 19.3417L14.2867 19.4467V24.3233L14.3733 24.5L21.0033 15.4183L14.3733 19.3417Z" fill="white" fillOpacity="0.602"/>
    <path d="M14.3733 24.5V19.3417L7.75 15.4183L14.3733 24.5Z" fill="white"/>
    <path d="M14.3733 18.25L21 14.3267L14.3733 11.375V18.25Z" fill="white" fillOpacity="0.2"/>
    <path d="M7.75 14.3267L14.3733 18.25V11.375L7.75 14.3267Z" fill="white" fillOpacity="0.602"/>
  </svg>
);

// BNB Icon
const BNBIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#F3BA2F"/>
    <path d="M8.75 14L11.375 11.375L14 14L16.625 11.375L19.25 14L16.625 16.625L14 14L11.375 16.625L8.75 14Z" fill="white"/>
    <path d="M6.125 14L8.75 11.375V16.625L6.125 14Z" fill="white"/>
    <path d="M21.875 14L19.25 11.375V16.625L21.875 14Z" fill="white"/>
    <path d="M14 6.125L16.625 8.75L14 11.375L11.375 8.75L14 6.125Z" fill="white"/>
    <path d="M14 16.625L16.625 19.25L14 21.875L11.375 19.25L14 16.625Z" fill="white"/>
  </svg>
);

// Cardano Icon
const ADAIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#0033AD"/>
    <path d="M14 5.25C14.6904 5.25 15.25 5.80964 15.25 6.5C15.25 7.19036 14.6904 7.75 14 7.75C13.3096 7.75 12.75 7.19036 12.75 6.5C12.75 5.80964 13.3096 5.25 14 5.25Z" fill="white"/>
    <path d="M9.625 9.625C10.3154 9.625 10.875 10.1846 10.875 10.875C10.875 11.5654 10.3154 12.125 9.625 12.125C8.93464 12.125 8.375 11.5654 8.375 10.875C8.375 10.1846 8.93464 9.625 9.625 9.625Z" fill="white"/>
    <path d="M18.375 9.625C19.0654 9.625 19.625 10.1846 19.625 10.875C19.625 11.5654 19.0654 12.125 18.375 12.125C17.6846 12.125 17.125 11.5654 17.125 10.875C17.125 10.1846 17.6846 9.625 18.375 9.625Z" fill="white"/>
    <path d="M14 15.75C16.3472 15.75 18.25 13.8472 18.25 11.5C18.25 9.15279 16.3472 7.25 14 7.25C11.6528 7.25 9.75 9.15279 9.75 11.5C9.75 13.8472 11.6528 15.75 14 15.75Z" fill="white"/>
    <path d="M14 20.75C14.6904 20.75 15.25 21.3096 15.25 22C15.25 22.6904 14.6904 23.25 14 23.25C13.3096 23.25 12.75 22.6904 12.75 22C12.75 21.3096 13.3096 20.75 14 20.75Z" fill="white"/>
    <path d="M6.125 15.75C6.81536 15.75 7.375 16.3096 7.375 17C7.375 17.6904 6.81536 18.25 6.125 18.25C5.43464 18.25 4.875 17.6904 4.875 17C4.875 16.3096 5.43464 15.75 6.125 15.75Z" fill="white"/>
    <path d="M21.875 15.75C22.5654 15.75 23.125 16.3096 23.125 17C23.125 17.6904 22.5654 18.25 21.875 18.25C21.1846 18.25 20.625 17.6904 20.625 17C20.625 16.3096 21.1846 15.75 21.875 15.75Z" fill="white"/>
  </svg>
);

// XRP Icon
const XRPIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="14" fill="#000000"/>
    <path d="M7 7H10.5L14 10.5L17.5 7H21L16.25 11.75C15.5596 12.4404 14.5596 12.8333 13.5 12.8333C12.4404 12.8333 11.4404 12.4404 10.75 11.75L7 7Z" fill="white"/>
    <path d="M21 21H17.5L14 17.5L10.5 21H7L11.75 16.25C12.4404 15.5596 13.4404 15.1667 14.5 15.1667C15.5596 15.1667 16.5596 15.5596 17.25 16.25L21 21Z" fill="white"/>
  </svg>
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
    value: "BINANCE:ADAUSDT",
    label: "ADA/USDT",
    icon: <ADAIcon />,
  },
  {
    value: "BINANCE:XRPUSDT",
    label: "XRP/USDT",
    icon: <XRPIcon />,
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
  
  const selectedCoin = binanceCoins.find((coin) => coin.value === value);

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
            <span>
              {selectedCoin ? selectedCoin.label : "Select Coin"}
            </span>
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
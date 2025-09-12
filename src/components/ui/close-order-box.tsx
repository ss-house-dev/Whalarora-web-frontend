'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog-close-order';
import { Trash2 } from 'lucide-react';

type CloseOrderBoxProps = {
  triggerLabel?: string;
  side: 'Buy' | 'Sell';
  amount: string;
  token: string;
  price: string;
  currency: string;
};

export function CloseOrderBox({
  triggerLabel = 'Open Close Order Box',
  side,
  amount,
  token,
  price,
  currency,
}: CloseOrderBoxProps) {
  return (
    <AlertDialog>
      {/* ปุ่ม trigger */}
      <AlertDialogTrigger className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        {triggerLabel}
      </AlertDialogTrigger>

      {/* กล่องเนื้อหา */}
      <AlertDialogContent>
        {/* Header */}
        <div className="w-full pb-3 border-b border-[#A4A4A4]/10 flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center text-[#C22727]">
            <Trash2 size={20} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <div className="text-white text-base font-normal font-[Alexandria] leading-normal">
              Close order
            </div>
            <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
              Do you want to close this order ?
            </div>
          </div>
        </div>

        {/* Grid 2 คอลัมน์: ซ้าย 1fr / ขวา 8rem (ตรงกับปุ่ม w-32) */}
        <div className="w-full grid grid-cols-2 gap-y-4 gap-x-4">
          {/* Row 1 - ซ้าย */}
          <div className="flex items-center gap-3">
            <div
              className={`text-sm font-normal font-[Alexandria] leading-tight ${
                side === 'Buy' ? 'text-[#2FACA2]' : 'text-[#C22727]'
              }`}
            >
              {side}
            </div>
            <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
              {amount} {token}
            </div>
          </div>

          {/* Row 1 - ขวา: at Price + value → เริ่มตรงกับขอบซ้ายปุ่ม Confirm */}
          <div className="flex items-center justify-start gap-2">
            <div className="text-[#A4A4A4] text-sm font-normal font-[Alexandria] leading-tight">
              at
            </div>
            <div className="text-[#A4A4A4] text-sm font-normal font-[Alexandria] leading-tight">
              Price
            </div>
            <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
              {price}
            </div>
            <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
              {currency}
            </div>
          </div>

          {/* Row 2 - ซ้าย: Keep Open */}
          <div className="flex items-center justify-start">
            <AlertDialogCancel className="w-32 h-8 rounded-lg border border-[#A4A4A4] flex items-center justify-center text-white text-sm font-normal font-[Alexandria] leading-tight hover:bg-gray-700 transition">
              Keep Open
            </AlertDialogCancel>
          </div>

          {/* Row 2 - ขวา: Confirm */}
          <div className="flex items-center justify-start">
            <AlertDialogAction className="w-32 h-8 rounded-lg bg-[#C22727] hover:bg-[#D84C4C] flex items-center justify-center text-neutral-100 text-sm font-normal font-[Alexandria] leading-tight transition">
              Confirm
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { Trash2 } from 'lucide-react';
import ProgressBar from './ProgressBar';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog-close-order';

export interface Order {
  id: string;
  side: 'buy' | 'sell';
  pair: string;
  datetime: string;
  price: string;
  amount: string;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  filledAmount?: string;
  filledPercent?: number;
  _id?: string;
  symbol?: string;
  createdAt?: string;
}

interface Props {
  order: Order;
  onDelete?: () => void;
}

export default function OrderCard({ order, onDelete }: Props) {
  const isBuy = order.side === 'buy';

  // ฟังก์ชันสำหรับจัดรูปแบบราคาเป็น USD
  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    const formattedNumber = numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${formattedNumber} USD`;
  };

  // ฟังก์ชันจัดรูปแบบจำนวนสำหรับป๊อปอัป Close Order ตามกติกา AC3–AC7
  const formatCloseAmount = (amount: string): string => {
    const n = parseFloat(amount);
    if (!isFinite(n)) return amount;

    // ปัดทิ้ง (truncate) ให้ 2 ตำแหน่ง เพื่อไม่ให้ข้ามขอบบน (เช่น 999.999k -> 1000.00k)
    const truncate2 = (value: number) => Math.trunc(value * 100) / 100;

    if (n < 1000) {
      // 0 – 999
      return n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (n < 1_000_000) {
      // 1,000 – 999,999 => K
      const v = truncate2(n / 1_000);
      return v.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'K';
    } else if (n < 1_000_000_000) {
      // 1,000,000 – 999,999,999 => M
      const v = truncate2(n / 1_000_000);
      return v.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'M';
    } else if (n < 1_000_000_000_000) {
      // 1,000,000,000 – 999,999,999,999 => B
      const v = truncate2(n / 1_000_000_000);
      return v.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'B';
    } else if (n < 1_000_000_000_000_000) {
      // 1,000,000,000,000 – 999,999,999,999,999 => T
      const v = truncate2(n / 1_000_000_000_000);
      return v.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'T';
    }

    // เกินช่วงที่กำหนด: แสดงเป็นตัวเลขเต็ม 2 ตำแหน่งเพื่อความปลอดภัย
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ฟังก์ชันสำหรับจัดรูปแบบจำนวนพร้อมหน่วยตาม pair (รวมได้สูงสุด 10 หลัก รวมทศนิยม)
  const formatAmount = (amount: string, pair: string): string => {
    const n = parseFloat(amount);
    const baseCurrency = pair.split('/')[0] || pair.split('-')[0] || '';
    if (!isFinite(n)) return `${amount} ${baseCurrency}`;

    const maxDigits = 10;
    const negative = n < 0;
    const abs = Math.abs(n);
    const intStr = Math.floor(abs).toString();
    const intDigits = Math.max(1, intStr.length);

    let out: string;
    if (intDigits >= maxDigits) {
      // ส่วนจำนวนเต็มยาวแล้ว ไม่แสดงทศนิยม
      out = Number(intStr).toLocaleString('en-US');
    } else {
      const fracDigits = maxDigits - intDigits; // อนุญาตปัดเศษ
      const fixed = abs.toFixed(fracDigits);
      const [i, f] = fixed.split('.');
      const iWithComma = Number(i).toLocaleString('en-US');
      out = f && fracDigits > 0 ? `${iWithComma}.${f}` : iWithComma;
    }

    return `${negative ? '-' : ''}${out} ${baseCurrency}`;
  };

  // ฟังก์ชันสำหรับจัดรูปแบบจำนวน Filled ให้แสดงแค่ 10 หลักแรก (ไม่ปัดเศษ)
  const formatFilledAmount = (amount: string | undefined, pair: string): string => {
    if (!amount) return '0';

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;

    // ดึงหน่วยจาก pair
    const baseCurrency = pair.split('/')[0] || pair.split('-')[0] || '';

    // แปลงเลขเป็น string แล้วนับจำนวนหลักทั้งหมด
    const numStr = numAmount.toString();
    let formattedNumber: string;

    // นับจำนวนหลักทั้งหมด (รวมหน้าหลังจุดทศนิยม ไม่นับจุด)
    const totalDigits = numStr.replace('.', '').length;

    if (totalDigits >= 10) {
      // ถ้ามีครบ 10 หลักแล้ว ให้ตัดเอาแค่ 10 หลักแรก
      const digitsOnly = numStr.replace('.', '');
      const decimalIndex = numStr.indexOf('.');

      if (decimalIndex === -1) {
        formattedNumber = digitsOnly.substring(0, 10);
      } else {
        const beforeDecimal = numStr.substring(0, decimalIndex);
        const afterDecimal = numStr.substring(decimalIndex + 1);
        const remainingDigits = 10 - beforeDecimal.length;

        if (remainingDigits > 0) {
          formattedNumber = beforeDecimal + '.' + afterDecimal.substring(0, remainingDigits);
        } else {
          formattedNumber = beforeDecimal.substring(0, 10);
        }
      }
    } else {
      const digitsNeeded = 10 - totalDigits;

      if (numStr.includes('.')) {
        formattedNumber = numStr + '0'.repeat(digitsNeeded);
      } else {
        formattedNumber = numStr + '.' + '0'.repeat(digitsNeeded);
      }
    }

    return `${formattedNumber} ${baseCurrency}`;
  };

  // ปุ่มลบ (มีกรอบ)
  const DeleteButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label="Delete order"
      className="
        grid place-items-center
        h-8 w-8 shrink-0
        rounded-md border border-[#3A3B44]
        bg-[#1F2029] text-slate-300
        transition-colors
        hover:bg-[#24252F] hover:border-[#7E7E7E] hover:text-white
        focus:outline-none focus:ring-2 focus:ring-[#2E3039]
      "
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  const baseCurrency = order.pair.split('/')[0] || order.pair.split('-')[0] || '';
  const quoteCurrency = order.pair.split('/')[1] || order.pair.split('-')[1] || '';

  const ConfirmCloseDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* Trigger with existing delete button styling */}
        <span>
          <DeleteButton onClick={() => {}} />
        </span>
      </AlertDialogTrigger>

      <AlertDialogContent>
        {/* Required accessible title/description for Radix */}
        <AlertDialogTitle className="sr-only">Close order</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          Confirm closing the selected order
        </AlertDialogDescription>
        {/* Header */}
        <div className="w-full pb-3 border-b border-[#A4A4A4]/10 flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center text-[#C22727]">
            <Trash2 size={20} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <div className="text-white text-base font-normal leading-normal">Close order</div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">
              Do you want to close this order ?
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="w-full grid grid-cols-2 gap-y-4 gap-x-4">
          <div className="flex items-center gap-3">
            <div
              className={`text-sm font-normal leading-tight ${
                isBuy ? 'text-[#2FACA2]' : 'text-[#C22727]'
              }`}
            >
              {isBuy ? 'Buy' : 'Sell'}
            </div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">
              {formatCloseAmount(order.amount)} {baseCurrency}
            </div>
          </div>

          <div className="flex items-center justify-start gap-2">
            <div className="text-[#A4A4A4] text-sm font-normal leading-tight">at</div>
            <div className="text-[#A4A4A4] text-sm font-normal leading-tight">Price</div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">{order.price}</div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">{quoteCurrency}</div>
          </div>

          <div className="flex items-center justify-start">
            <AlertDialogCancel className="w-32 h-8 rounded-lg border border-[#A4A4A4] flex items-center justify-center text-white text-sm leading-tight hover:bg-gray-700 transition">
              Keep Open
            </AlertDialogCancel>
          </div>

          <div className="flex items-center justify-start">
            <AlertDialogAction
              onClick={() => onDelete?.()}
              className="w-32 h-8 rounded-lg bg-[#C22727] hover:bg-[#D84C4C] flex items-center justify-center text-neutral-100 text-sm leading-tight transition"
            >
              Confirm
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );

  const MetaLeft = () => (
    <div className="flex items-center gap-3 ">
      <div
        className={`w-12 h-7 px-2 rounded-lg inline-flex justify-center items-center 
        ${isBuy ? 'bg-[#217871]' : 'bg-[#D32F2F]'}`}
      >
        <span className="text-white text-xs font-normal leading-none ">
          {isBuy ? 'Buy' : 'Sell'}
        </span>
      </div>
      <span className="text-white text-sm font-medium mt-1 ml-5.5 mb-0.5">{order.pair}</span>
    </div>
  );

  // ใช้กับสถานะที่ไม่ใช่ partial
  const TopRight = () => (
    <div className="row-span-2 grid grid-cols-[1fr_auto] items-center gap-x-4">
      <div className="flex items-center gap-x-4 justify-end flex-wrap w-full min-w-0">
        <span className="text-slate-400 text-xs whitespace-nowrap">{order.datetime}</span>
        <div className="flex items-center justify-between w-[213px] gap-2 bg-[#1F2029] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Price</span>
          <span className="text-[12px] font-medium text-white">{formatPrice(order.price)}</span>
        </div>
        <div className="flex items-center w-[213px] justify-between gap-2 bg-[#1F2029] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Amount</span>
          <span className="text-[12px] font-medium text-white">
            {formatAmount(order.amount, order.pair)}
          </span>
        </div>
      </div>
      {onDelete ? <ConfirmCloseDialog /> : <div />}
    </div>
  );

  return (
    <div className="w-full rounded-xl border border-[#666] bg-[#16171D] px-4 py-3 mb-3">
      <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 items-start">
        {/* แถวบน-ซ้าย */}
        <MetaLeft />

        {/* แถวบน-ขวา */}
        {order.status === 'partial' ? (
          <div className="row-span-2 grid grid-cols-[1fr_auto] items-center gap-x-4">
            <div className="flex items-center gap-4 justify-end flex-wrap w-full min-w-0">
              <span className="text-slate-400 text-xs whitespace-nowrap">{order.datetime}</span>
              <div className="flex items-center justify-between w-[213px] gap-12 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Price</span>
                <span className="text-[12px] font-medium text-white">
                  {formatPrice(order.price)}
                </span>
              </div>
              <div className="flex items-center w-[213px] justify-between gap-12 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Amount</span>
                <span className="text-[12px] font-medium text-white">
                  {formatAmount(order.amount, order.pair)}
                </span>
              </div>
            </div>

            {onDelete ? <ConfirmCloseDialog /> : <div />}

            {/* progress bar - แสดงเฉพาะ partial */}
            <div className="col-start-1 mt-3 flex-1 ml-[32px]">
              <ProgressBar
                filledAmount={formatFilledAmount(order.filledAmount, order.pair)}
                filledPercent={order.filledPercent ?? 0}
              />
            </div>
            <div />
          </div>
        ) : (
          <TopRight />
        )}

        {/* แถวล่าง (สถานะ) */}
        {order.status === 'partial' && (
          <div className="flex items-center text-yellow-400 text-xs mt-1 ml-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
            Partially Filled
          </div>
        )}

        {order.status !== 'partial' && (
          <div className="col-span-2 flex justify-center items-center gap-2 text-blue-400 text-xs -translate-y-[2px]">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 translate-y-[0px]" />
            <span className="leading-none">Pending</span>
          </div>
        )}
      </div>
    </div>
  );
}

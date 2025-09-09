import { Trash2 } from 'lucide-react';
import ProgressBar from './ProgressBar';

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
  onDelete?: (id: string) => void;
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

  // ฟังก์ชันสำหรับจัดรูปแบบจำนวนพร้อมหน่วยตาม pair
  const formatAmount = (amount: string, pair: string): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;

    // ดึงหน่วยจาก pair (ส่วนแรกของ pair เช่น BTC จาก BTC/USD)
    const baseCurrency = pair.split('/')[0] || pair.split('-')[0] || '';

    const formattedNumber = numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8, // สำหรับ crypto ที่อาจมีทศนิยมเยอะ
    });

    return `${formattedNumber} ${baseCurrency}`;
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
        // ไม่มีทศนิยม ให้เอาแค่ 10 หลักแรก
        formattedNumber = digitsOnly.substring(0, 10);
      } else {
        // มีทศนิยม ให้จัดรูปแบบใหม่
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
      // ถ้ายังไม่ครب 10 หลัก ให้เติม 0 ข้างหลัง
      const digitsNeeded = 10 - totalDigits;

      if (numStr.includes('.')) {
        // มีทศนิยมอยู่แล้ว ให้เติม 0 ข้างหลัง
        formattedNumber = numStr + '0'.repeat(digitsNeeded);
      } else {
        // ไม่มีทศนิยม ให้เติมจุดทศนิยมและ 0
        formattedNumber = numStr + '.' + '0'.repeat(digitsNeeded);
      }
    }

    return `${formattedNumber} ${baseCurrency}`;
  };
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
        <div className="flex items-center justify-between w-[213px] gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Price</span>
          <span className="text-[12px] font-medium text-white">{formatPrice(order.price)}</span>
        </div>
        <div className="flex items-center w-[213px] justify-between gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Amount</span>
          <span className="text-[12px] font-medium text-white">
            {formatAmount(order.amount, order.pair)}
          </span>
        </div>
      </div>
      {onDelete ? (
        <button
          onClick={() => onDelete(order.id)}
          className="p-1.5 rounded-md justify-self-end transition-colors 
               bg-transparent text-slate-400
               hover:bg-[#2A2A2A] hover:text-blue-500"
          aria-label="Delete order"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <div />
      )}
    </div>
  );

  return (
    <div className="w-full rounded-xl border border-[#2A2A2A] bg-[#0D0F1A] px-4 py-3 mb-3">
      <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 items-start">
        {/* แถวบน-ซ้าย */}
        <MetaLeft />

        {/* แถวบน-ขวา */}
        {order.status === 'partial' ? (
          // เฉพาะ partial เท่านั้นที่จะมี progress bar
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

            {onDelete ? (
              <button
                onClick={() => onDelete(order.id)}
                className="p-1.5 rounded-md justify-self-end transition-colors 
               bg-transparent text-slate-400
               hover:bg-[#2A2A2A] hover:text-blue-500"
                aria-label="Delete order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div />
            )}

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
          // สถานะอื่นๆ ใช้ TopRight ปกติ
          <TopRight />
        )}

        {/* แถวล่าง (สถานะ) - แสดงเฉพาะ Partially Filled และ Pending */}
        {order.status === 'partial' && (
          <div className="flex items-center text-yellow-400 text-xs mt-1 ml-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
            Partially Filled
          </div>
        )}

        {/* แสดง Pending สำหรับทุกสถานะที่ไม่ใช่ partial */}
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

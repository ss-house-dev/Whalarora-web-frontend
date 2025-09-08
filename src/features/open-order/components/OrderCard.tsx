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
        <div className="flex items-center justify-between w-[220px] gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Price</span>
          <span className="text-[12px] font-medium text-white">{order.price}</span>
        </div>
        <div className="flex items-center w-[220px] justify-between gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Amount</span>
          <span className="text-[12px] font-medium text-white">{order.amount}</span>
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
              <div className="flex items-center justify-between w-[220px] gap-12 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Price</span>
                <span className="text-[12px] font-medium text-white">{order.price}</span>
              </div>
              <div className="flex items-center w-[220px] justify-between gap-12 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Amount</span>
                <span className="text-[12px] font-medium text-white">{order.amount}</span>
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
                filledAmount={order.filledAmount}
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
import { Trash2 } from "lucide-react";
import ProgressBar from "./ProgressBar";

export interface Order {
  id: string;
  side: "buy" | "sell";
  pair: string;
  datetime: string;
  price: string;
  amount: string;
  status: "pending" | "partial" | "filled" | "cancelled";
  filledAmount?: string;
  filledPercent?: number;
}

interface Props {
  order: Order;
  onDelete?: (id: string) => void;
}

export default function OrderCard({ order, onDelete }: Props) {
  const isBuy = order.side === "buy";

  const MetaLeft = () => (
    <div className="flex items-center gap-3 self-center">{/* ⭐ self-center */}
      <span
        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
          isBuy ? "bg-green-700 text-white" : "bg-red-700 text-white"
        }`}
      >
        {isBuy ? "Buy" : "Sell"}
      </span>
      <span className="text-white text-sm font-medium">{order.pair}</span>
    </div>
  );

  // ใช้กับสถานะที่ไม่ใช่ partial (ไม่ span 2 แถว)
  const TopRight = () => (
    <div className="self-center grid grid-cols-[1fr_auto] items-center gap-x-3">{/* ⭐ self-center */}
      <div className="flex items-center gap-3 justify-end flex-wrap">
        <span className="text-slate-400 text-xs whitespace-nowrap">{order.datetime}</span>
        <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Price</span>
          <span className="text-[15px] font-medium text-white">{order.price}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Amount</span>
          <span className="text-[15px] font-medium text-white">{order.amount}</span>
        </div>
      </div>
      {onDelete ? (
        <button
          onClick={() => onDelete(order.id)}
          className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors justify-self-end"
          aria-label="Delete order"
        >
          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
        </button>
      ) : (
        <div />
      )}
    </div>
  );

  return (
    <div className="w-full rounded-xl border border-[#2A2A2A] bg-[#0D0F1A] px-4 py-3 mb-3">
      {/* กริดหลัก 2 คอลัมน์ */}
      <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 items-start">
        {/* แถวบน */}
        <MetaLeft />

        {order.status === "partial" ? (
          /* partial: ขวา span 2 แถว เพื่อให้ความกว้าง progress เท่ากับกลุ่มขวา */
          <div className="row-span-2 grid grid-cols-[1fr_auto] items-center gap-x-3">
            <div className="flex items-center gap-3 justify-end flex-wrap">
              <span className="text-slate-400 text-xs whitespace-nowrap">{order.datetime}</span>
              <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Price</span>
                <span className="text-[15px] font-medium text-white">{order.price}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Amount</span>
                <span className="text-[15px] font-medium text-white">{order.amount}</span>
              </div>
            </div>
            {onDelete ? (
              <button
                onClick={() => onDelete(order.id)}
                className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors justify-self-end"
                aria-label="Delete order"
              >
                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
              </button>
            ) : (
              <div />
            )}
            <div className="col-start-1 mt-3">
              <ProgressBar
                filledAmount={order.filledAmount}
                filledPercent={order.filledPercent ?? 0}
              />
            </div>
            <div />
          </div>
        ) : (
          <TopRight />
        )}

        {/* แถวล่าง (สถานะ) */}
        {order.status === "partial" && (
          <div className="flex items-center text-yellow-400 text-xs mt-3">
            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
            Partially Filled
          </div>
        )}

        {order.status === "pending" && (
          <div className="col-span-2 flex justify-center items-center gap-2 mt-4 text-blue-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Pending</span>
          </div>
        )}

        {order.status === "filled" && (
          <div className="col-span-2 flex justify-center items-center gap-2 mt-4 text-green-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span>Completed</span>
          </div>
        )}

        {order.status === "cancelled" && (
          <div className="col-span-2 flex justify-center items-center gap-2 mt-4 text-red-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Cancelled</span>
          </div>
        )}
      </div>
    </div>
  );
}

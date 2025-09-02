import Image from "next/image";
import { Trash2 } from "lucide-react";

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

interface OrderCardProps {
  order: Order;
  onDelete?: (id: string) => void;
}

export default function OrderCard({ order, onDelete }: OrderCardProps) {
  const isBuy = order.side === "buy";

  return (
    <div className="w-full rounded-lg border border-[#2A2A2A] p-4 mt-4 mb-3 bg-[#0D0F1A]">
      <div className="flex justify-between items-center">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              isBuy ? "bg-green-700 text-white" : "bg-red-700 text-white"
            }`}
          >
            {isBuy ? "Buy" : "Sell"}
          </span>

          <span className="text-white font-medium">{order.pair}</span>
          <span className="text-slate-400 text-sm">{order.datetime}</span>
        </div>

        {/* Right info */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex gap-1 items-center">
            <span className="text-slate-400">Price</span>
            <span className="bg-[#1A1A1A] px-2 py-1 rounded-md text-white">
              {order.price}
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-slate-400">Amount</span>
            <span className="bg-[#1A1A1A] px-2 py-1 rounded-md text-white">
              {order.amount}
            </span>
          </div>

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={() => onDelete(order.id)}
              className="p-2 rounded-md hover:bg-[#2A2A2A] transition-colors"
            >
              <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 pl-2">
        {order.status === "partial" && (
          <>
            <div className="flex items-center text-yellow-400 text-sm mb-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
              Partially Filled
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mb-1">
              <div
                className="bg-blue-500 h-1 rounded-full"
                style={{ width: `${order.filledPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Filled : {order.filledAmount}</span>
              <span>{order.filledPercent?.toFixed(2)} %</span>
            </div>
          </>
        )}

        {order.status === "pending" && (
          <div className="flex items-center text-blue-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            Pending
          </div>
        )}

        {order.status === "filled" && (
          <div className="flex items-center text-green-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            Completed
          </div>
        )}

        {order.status === "cancelled" && (
          <div className="flex items-center text-red-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
            Cancelled
          </div>
        )}
      </div>
    </div>
  );
}
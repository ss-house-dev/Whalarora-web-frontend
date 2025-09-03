"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OpenOrderContainer from "./OpenOrderContainer";
import TradeHistoryContainer from "./TradeHistoryContainer";

export default function OrderTableContainer() {
  const [tab, setTab] = useState<"open" | "history">("open");
  const [page, setPage] = useState(1);
  const totalPages = 10;

  const getVisiblePages = () => {
    if (page === 1) return [1, 2, 3];
    if (page === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  };

  return (
    <div className="w-[800px] h-[540px] bg-[#081125] rounded-xl px-5 pt-3 pb-3 flex flex-col">
      {/* Tabs */}
      <div
        className="flex border-b-2 pb-3 gap-3 pl-4"
        style={{ borderColor: "#13285A" }}
      >
        <button
          onClick={() => setTab("open")}
          className={`px-3 h-8 min-w-[96px] rounded-lg text-sm flex items-center justify-center leading-[28px] ${
            tab === "open" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
          style={{ backgroundColor: tab === "open" ? "#1F4293" : "transparent" }}
        >
          Open order
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-3 h-8 min-w-[96px] rounded-lg text-sm flex items-center justify-center leading-[28px] ${
            tab === "history" ? "text-white" : "text-slate-300 hover:text-white"
          }`}
          style={{
            backgroundColor: tab === "history" ? "#1F4293" : "transparent",
          }}
        >
          Trade history
        </button>
      </div>

      {/* Content (fixed frame + scroll inside) */}
      <div className="flex-1 overflow-hidden">
        {tab === "open" ? <OpenOrderContainer /> : <TradeHistoryContainer />}
      </div>
      
    </div>
  );
}

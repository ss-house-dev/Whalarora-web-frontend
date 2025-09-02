"use client";

import { useState } from "react";
import Image from "next/image";
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
      <div className="flex border-b-2 pb-3 gap-3 pl-4" style={{ borderColor: "#13285A" }}>
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
          style={{ backgroundColor: tab === "history" ? "#1F4293" : "transparent" }}
        >
          Trade history
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        {tab === "open" ? <OpenOrderContainer /> : <TradeHistoryContainer />}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-4">
        <span>Total : 0 Items</span>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === 1 ? "text-slate-500 cursor-not-allowed" : "text-slate-300 hover:text-white"
            }`}
            style={{ backgroundColor: "#212121" }}
          >
            {page === 1 ? (
              <Image src="/PrevIcon.svg" alt="Prev disabled" width={15} height={15} />
            ) : (
              <Image
                src="/NextIcon.svg"
                alt="Prev"
                width={15}
                height={15}
                className="rotate-180"
              />
            )}
          </button>

          {/* Visible pages */}
          {getVisiblePages().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                page === p ? "text-white" : "text-slate-400 hover:text-white"
              }`}
              style={{ backgroundColor: page === p ? "#1F4293" : "transparent" }}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === totalPages
                ? "text-slate-500 cursor-not-allowed"
                : "text-slate-300 hover:text-white"
            }`}
            style={{ backgroundColor: "#212121" }}
          >
            {page === totalPages ? (
              <Image
                src="/PrevIcon.svg"
                alt="Next disabled"
                width={15}
                height={15}
                className="rotate-180"
              />
            ) : (
              <Image src="/NextIcon.svg" alt="Next" width={15} height={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

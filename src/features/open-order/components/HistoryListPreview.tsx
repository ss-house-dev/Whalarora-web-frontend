"use client";
import React from "react";
import { useGetTradeHistory } from "../hooks/useGetTradeHistory";
import HistoryCard from "./HistoryCard";
import PaginationFooter from "@/components/ui/PaginationFooter";

type FilterKey = "all" | "today" | "month" | "year";

export default function HistoryListPreview() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [range, setRange] = React.useState<FilterKey>("all");

  const { data, isLoading } = useGetTradeHistory({ page, limit, range, mock: true });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "", time: "" };
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    return { date, time };
  };

  return (
    <div className="flex flex-col gap-3">
      {/* simple filter row to switch query param */}
      <div className="w-72 py-1 rounded-xl inline-flex justify-start items-start gap-2.5">
        {([
          { key: "all", label: "All" },
          { key: "today", label: "Today" },
          { key: "month", label: "Month" },
          { key: "year", label: "Year" },
        ] as { key: FilterKey; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setRange(key);
              setPage(1);
            }}
            className={`${
              range === key ? "outline outline-1 outline-offset-[-1px] outline-[#474747]" : ""
            } w-16 h-6 px-2 py-1 rounded-3xl flex justify-center items-center`}
          >
            <span className={`${range === key ? "text-white" : "text-[#A4A4A4]"} text-sm`}>{label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-slate-300 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-sm">No trade history</div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((it) => {
            const { date, time } = formatDate(it.createdAt);
            return (
              <HistoryCard
                key={it.id}
                status={it.status === "COMPLETE" ? "complete" : "closed"}
                side={it.side.toLowerCase() as "buy" | "sell"}
                pair={`${it.symbol}/USDT`}
                date={date}
                time={time}
                orderId={it.orderRef}
                amount={Number(it.matchedAmount).toFixed(9)}
                baseSymbol={it.baseSymbol ?? it.symbol}
                price={Number(it.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                currency={it.currency ?? "USD"}
              />
            );
          })}
        </div>
      )}

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalCount={total}
        label="Items"
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}


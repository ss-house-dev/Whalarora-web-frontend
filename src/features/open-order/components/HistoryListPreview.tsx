"use client";
import React from "react";
import { useGetTradeHistory } from "../hooks/useGetTradeHistory";
import HistoryCard from "./HistoryCard";
import PaginationFooter from "@/components/ui/PaginationFooter";
import type { TradeHistoryRange } from "../types/history";

type FilterKey = TradeHistoryRange;

export default function HistoryListPreview() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [range, setRange] = React.useState<FilterKey>("all");

  const { data, isLoading, isFetching } = useGetTradeHistory({ page, limit, range });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const itemsKey = React.useMemo(() => items.map((item) => item.id).join("|"), [items]);
  const [pageMounted, setPageMounted] = React.useState(false);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setPageMounted(false);
  }, [page, range]);

  React.useEffect(() => {
    if (isFetching) {
      setPageMounted(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (items.length === 0) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setPageMounted(true);
      animationFrameRef.current = null;
    });
  }, [isFetching, itemsKey, items.length, page, range]);

  const isInitialLoading = isLoading && items.length === 0;
  const isRefetching = isFetching && !isInitialLoading;

  const toCardDate = (input?: string) => {
    if (!input) return { date: "", time: "" };
    if (/^\d{2}-\d{2}-\d{4}/.test(input)) {
      const [datePart, timePart = ""] = input.split(" ");
      return { date: datePart, time: timePart };
    }
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return { date: "", time: "" };
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    };
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "day", label: "Day" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* simple filter row to switch query param */}
      <div className="w-72 py-1 rounded-xl inline-flex justify-start items-start gap-2.5">
        {filters.map(({ key, label }) => (
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

      <div className="relative min-h-[120px]">
        {isInitialLoading || (isRefetching && items.length === 0) ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-sm">No trade history</div>
        ) : (
          <div className={`transition-opacity duration-300 ${isRefetching ? "opacity-60" : "opacity-100"}`}>
            <div
              className={`flex flex-col gap-2 transition-opacity duration-300 ease-out ${
                pageMounted ? "opacity-100" : "opacity-0"
              }`}
            >
              {items.map((it, idx) => {
                const { date, time } = toCardDate(it.matchedAt ?? it.createdAt ?? "");
                const status = typeof it.status === "string" ? it.status.toUpperCase() : "";
                const cardStatus = status === "MATCHED" ? "complete" : "closed";
                return (
                  <div
                    key={it.id}
                    className={`transform transition-all duration-300 ease-out ${
                      pageMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                    style={{ transitionDelay: pageMounted ? `${idx * 40}ms` : "0ms" }}
                  >
                    <HistoryCard
                      status={cardStatus}
                      side={it.side.toLowerCase() as "buy" | "sell"}
                      pair={`${it.symbol}/${it.quoteSymbol}`}
                      date={date}
                      time={time}
                      orderId={it.tradeRef}
                      amount={it.amount.toFixed(9)}
                      baseSymbol={it.baseSymbol}
                      price={it.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      currency={it.currency}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isRefetching && items.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
      </div>

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



